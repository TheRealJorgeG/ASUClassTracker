// Fixed notificationService.js
const nodemailer = require('nodemailer');
const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const mongoose = require('mongoose');

// Import models with error handling
let Class, User;
try {
  Class = require('../models/classModel');
  User = require('../models/userModel');
} catch (error) {
  console.error('Error importing models:', error);
}

// Create notification schema for tracking
const notificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  class_number: { type: String, required: true },
  last_status: { type: String, enum: ['Open', 'Closed'], default: 'Closed' },
  last_checked: { type: Date, default: Date.now },
  notification_sent: { type: Date },
  notification_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

let Notification;
try {
  Notification = mongoose.model('Notification', notificationSchema);
} catch (error) {
  // Model might already exist
  Notification = mongoose.model('Notification');
}

class NotificationService {
  constructor() {
    this.execAsync = util.promisify(exec);
    this.isRunning = false;
    this.batchSize = 10;
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.maxRetries = 3;
    this.emailTransporter = null;
    
    // Rate limiting
    this.scriptCallQueue = [];
    this.isProcessingQueue = false;
    this.maxConcurrentScripts = 3;
    this.currentScriptCount = 0;
    
    // Initialize email transporter only if environment variables are set
    this.initializeEmailTransporter();
  }

  initializeEmailTransporter() {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        this.emailTransporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: process.env.SMTP_PORT || 587,
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          pool: true,
          maxConnections: 5,
          maxMessages: 100,
          rateDelta: 1000,
          rateLimit: 5
        });
        console.log('Email transporter initialized');
      } catch (error) {
        console.error('Error initializing email transporter:', error);
        this.emailTransporter = null;
      }
    } else {
      console.warn('Email credentials not provided - email notifications disabled');
    }
  }

  async start() {
    if (this.isRunning) {
      console.log('Notification service already running');
      return;
    }

    if (!Class || !User || !Notification) {
      console.error('Models not available - cannot start notification service');
      return;
    }

    this.isRunning = true;
    console.log('Starting notification service...');
    
    try {
      // Initialize notification tracking for existing classes
      await this.initializeNotificationTracking();
      
      // Start the main monitoring loop
      this.monitorClasses();
      
      // Start queue processor
      this.processScriptQueue();
      
      console.log('Notification service started successfully');
    } catch (error) {
      console.error('Error starting notification service:', error);
      this.isRunning = false;
      throw error;
    }
  }

  async stop() {
    this.isRunning = false;
    console.log('Stopping notification service...');
    
    if (this.monitoringTimer) {
      clearTimeout(this.monitoringTimer);
    }
    
    if (this.emailTransporter) {
      try {
        await this.emailTransporter.close();
      } catch (error) {
        console.error('Error closing email transporter:', error);
      }
    }
  }

  async initializeNotificationTracking() {
    try {
      // Get all classes that don't have notification tracking
      const classes = await Class.find({}).populate('user_id');
      
      for (const classItem of classes) {
        if (!classItem.user_id) continue;
        
        const existingNotification = await Notification.findOne({
          user_id: classItem.user_id._id,
          class_id: classItem._id
        });

        if (!existingNotification) {
          await Notification.create({
            user_id: classItem.user_id._id,
            class_id: classItem._id,
            class_number: classItem.number,
            last_status: 'Closed',
            is_active: true
          });
        }
      }
      
      console.log('Notification tracking initialized');
    } catch (error) {
      console.error('Error initializing notification tracking:', error);
    }
  }

  async monitorClasses() {
    if (!this.isRunning) return;

    console.log('Starting class monitoring cycle...');
    
    try {
      // Get all active notifications, batch by batch
      const totalNotifications = await Notification.countDocuments({ is_active: true });
      const totalBatches = Math.ceil(totalNotifications / this.batchSize);
      
      if (totalNotifications > 0) {
        console.log(`Processing ${totalNotifications} notifications in ${totalBatches} batches`);
        
        for (let batch = 0; batch < totalBatches; batch++) {
          if (!this.isRunning) break;
          
          const notifications = await Notification.find({ is_active: true })
            .populate('user_id')
            .populate('class_id')
            .skip(batch * this.batchSize)
            .limit(this.batchSize);
          
          // Process batch concurrently but with controlled concurrency
          const batchPromises = notifications.map(notification => 
            this.processNotification(notification)
          );
          
          await Promise.allSettled(batchPromises);
          
          // Small delay between batches
          await this.sleep(1000);
        }
      }
      
    } catch (error) {
      console.error('Error in monitoring cycle:', error);
    }
    
    // Schedule next check
    this.monitoringTimer = setTimeout(() => {
      this.monitorClasses();
    }, this.checkInterval);
  }

  async processNotification(notification) {
    try {
      if (!notification.user_id || !notification.class_id) {
        console.warn(`Invalid notification data: ${notification._id}`);
        return;
      }

      const classStatus = await this.getClassStatus(notification.class_number);
      
      if (!classStatus) {
        console.warn(`Could not get status for class: ${notification.class_number}`);
        return;
      }

      // Update notification record
      await Notification.findByIdAndUpdate(notification._id, {
        last_checked: new Date(),
        last_status: classStatus.seatStatus
      });

      // Check if status changed from Closed to Open
      if (notification.last_status === 'Closed' && classStatus.seatStatus === 'Open') {
        await this.sendNotificationEmail(notification, classStatus);
        
        // Update notification sent info
        await Notification.findByIdAndUpdate(notification._id, {
          notification_sent: new Date(),
          notification_count: notification.notification_count + 1
        });
      }

    } catch (error) {
      console.error(`Error processing notification ${notification._id}:`, error);
    }
  }

  async getClassStatus(classNumber) {
    return new Promise((resolve) => {
      // Add to queue for rate limiting
      this.scriptCallQueue.push({
        classNumber,
        resolve,
        retries: 0
      });
    });
  }

  async processScriptQueue() {
    while (this.isRunning) {
      if (this.scriptCallQueue.length > 0 && this.currentScriptCount < this.maxConcurrentScripts) {
        const { classNumber, resolve, retries } = this.scriptCallQueue.shift();
        this.currentScriptCount++;
        
        this.executeClassScript(classNumber, resolve, retries);
      }
      
      await this.sleep(100);
    }
  }

  async executeClassScript(classNumber, resolve, retries) {
    try {
      // Use absolute path for Python script
      const scriptPath = path.join(__dirname, '..', 'scripts', 'get_class_info.py');
      const command = `python "${scriptPath}" "${classNumber}"`;
      
      const { stdout } = await this.execAsync(command, { timeout: 15000 });
      
      const classData = JSON.parse(stdout);
      
      if (classData.error) {
        resolve(null);
      } else {
        resolve(classData);
      }
      
    } catch (error) {
      console.error(`Error checking class ${classNumber}:`, error);
      
      if (retries < this.maxRetries) {
        // Retry with exponential backoff
        setTimeout(() => {
          this.scriptCallQueue.push({
            classNumber,
            resolve,
            retries: retries + 1
          });
        }, Math.pow(2, retries) * 1000);
      } else {
        resolve(null);
      }
    } finally {
      this.currentScriptCount--;
    }
  }

  async sendNotificationEmail(notification, classStatus) {
    if (!this.emailTransporter) {
      console.log('Email transporter not available - skipping email notification');
      return;
    }

    try {
      const user = notification.user_id;
      const classInfo = notification.class_id;
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@classnotifier.com',
        to: user.email,
        subject: `🎉 Class Seat Available: ${classInfo.course} - ${classInfo.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2c3e50;">Great News! A Seat Opened Up!</h2>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #27ae60; margin-top: 0;">Class Information</h3>
              <p><strong>Course:</strong> ${classInfo.course}</p>
              <p><strong>Title:</strong> ${classInfo.title}</p>
              <p><strong>Class Number:</strong> ${classInfo.number}</p>
              <p><strong>Instructor(s):</strong> ${classInfo.instructors.join(', ')}</p>
              ${classStatus.days ? `<p><strong>Days:</strong> ${classStatus.days}</p>` : ''}
              ${classStatus.startTime && classStatus.endTime ? `<p><strong>Time:</strong> ${classStatus.startTime} - ${classStatus.endTime}</p>` : ''}
              ${classStatus.location ? `<p><strong>Location:</strong> ${classStatus.location}</p>` : ''}
            </div>
            
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="color: #27ae60; font-weight: bold; margin: 0;">
                ✅ Status: SEATS AVAILABLE
              </p>
            </div>
            
            <p style="color: #e74c3c; font-weight: bold;">
              Act fast! Seats can fill up quickly.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
              <p style="color: #7f8c8d; font-size: 12px;">
                This notification was sent because you're tracking this class. 
                You can manage your tracked classes in your account dashboard.
              </p>
            </div>
          </div>
        `
      };
      
      await this.emailTransporter.sendMail(mailOptions);
      console.log(`Notification sent to ${user.email} for class ${classInfo.number}`);
      
    } catch (error) {
      console.error('Error sending notification email:', error);
    }
  }

  async handleClassAdded(userId, classId) {
    try {
      if (!Class || !Notification) {
        console.warn('Models not available - cannot handle class addition');
        return;
      }

      const classItem = await Class.findById(classId);
      if (!classItem) return;

      // Create notification tracking
      await Notification.create({
        user_id: userId,
        class_id: classId,
        class_number: classItem.number,
        last_status: 'Closed',
        is_active: true
      });

      console.log(`Notification tracking added for class ${classItem.number}`);
    } catch (error) {
      console.error('Error handling class addition:', error);
    }
  }

  async handleClassRemoved(userId, classId) {
    try {
      if (!Notification) {
        console.warn('Notification model not available - cannot handle class removal');
        return;
      }

      await Notification.findOneAndUpdate(
        { user_id: userId, class_id: classId },
        { is_active: false }
      );

      console.log(`Notification tracking deactivated for class ${classId}`);
    } catch (error) {
      console.error('Error handling class removal:', error);
    }
  }

  async getNotificationStats() {
    try {
      if (!Notification) {
        return { totalActive: 0, totalNotificationsSent: 0, lastChecked: null };
      }

      const stats = await Notification.aggregate([
        { $match: { is_active: true } },
        {
          $group: {
            _id: null,
            totalActive: { $sum: 1 },
            totalNotificationsSent: { $sum: '$notification_count' },
            lastChecked: { $max: '$last_checked' }
          }
        }
      ]);

      return stats[0] || { totalActive: 0, totalNotificationsSent: 0, lastChecked: null };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return { totalActive: 0, totalNotificationsSent: 0, lastChecked: null };
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
const notificationService = new NotificationService();

module.exports = { notificationService, Notification };