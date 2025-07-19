import sys
import gc
import os
import psutil
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class MemoryOptimizedScraper:
    def __init__(self, max_memory_mb=400):
        self.max_memory_mb = max_memory_mb
        self.driver = None
        
    def get_memory_usage(self):
        """Get current memory usage in MB"""
        process = psutil.Process(os.getpid())
        memory_mb = process.memory_info().rss / 1024 / 1024
        return memory_mb
    
    def create_driver(self):
        """Create memory-optimized Chrome driver"""
        options = Options()
        
        # Essential memory optimizations
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-features=TranslateUI')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-plugins')
        options.add_argument('--disable-images')  # Don't load images
        options.add_argument('--disable-javascript')  # Only if your target doesn't need JS
        
        # Memory limits
        options.add_argument('--memory-pressure-off')
        options.add_argument('--max_old_space_size=384')  # Limit V8 heap
        
        # Additional optimizations
        options.add_argument('--disable-background-networking')
        options.add_argument('--disable-background-timer-throttling')
        options.add_argument('--disable-renderer-backgrounding')
        options.add_argument('--disable-backgrounding-occluded-windows')
        
        try:
            driver = webdriver.Chrome(options=options)
            driver.implicitly_wait(10)  # 10 second timeout
            return driver
        except Exception as e:
            print(f"Failed to create driver: {e}")
            return None
    
    def cleanup_driver(self):
        """Clean up driver and force garbage collection"""
        if self.driver:
            try:
                self.driver.quit()
            except:
                pass
            self.driver = None
        
        # Force garbage collection
        gc.collect()
        
        print(f"Memory after cleanup: {self.get_memory_usage():.2f} MB")
    
    def check_memory_and_restart(self):
        """Check memory and restart driver if needed"""
        current_memory = self.get_memory_usage()
        print(f"Current memory usage: {current_memory:.2f} MB")
        
        if current_memory > self.max_memory_mb:
            print(f"Memory usage ({current_memory:.2f} MB) exceeds limit ({self.max_memory_mb} MB). Restarting driver...")
            self.cleanup_driver()
            self.driver = self.create_driver()
            return True
        return False
    
    def scrape_class_info(self, class_id):
        """Scrape class information with memory management"""
        print(f"Starting script for class {class_id}")
        print(f"Initial memory usage: {self.get_memory_usage():.2f} MB")
        
        try:
            # Create driver if needed
            if not self.driver:
                print("Initializing Chrome driver")
                self.driver = self.create_driver()
                if not self.driver:
                    return {"error": "Failed to initialize driver"}
            
            # Check memory before processing
            self.check_memory_and_restart()
            
            # Your actual scraping logic goes here
            # Replace this with your actual URL and scraping code
            url = f"https://your-target-site.com/class/{class_id}"
            
            print(f"Navigating to: {url}")
            self.driver.get(url)
            
            # Example: Wait for page to load and extract data
            wait = WebDriverWait(self.driver, 10)
            
            # Replace with your actual selectors
            try:
                # Example selectors - replace with your actual ones
                title_element = wait.until(EC.presence_of_element_located((By.CLASS_NAME, "class-title")))
                title = title_element.text
                
                # Extract other information as needed
                class_info = {
                    "class_id": class_id,
                    "title": title,
                    # Add other fields as needed
                }
                
                print(f"Successfully scraped class {class_id}")
                return class_info
                
            except Exception as e:
                print(f"Error extracting data: {e}")
                return {"error": f"Failed to extract data: {e}"}
        
        except Exception as e:
            print(f"Error during scraping: {e}")
            return {"error": str(e)}
        
        finally:
            # Always cleanup
            self.cleanup_driver()

def main():
    if len(sys.argv) != 2:
        print("Usage: python get_class_info.py <class_id>")
        sys.exit(1)
    
    class_id = sys.argv[1]
    
    # Create scraper with memory limit (adjust based on your Render plan)
    scraper = MemoryOptimizedScraper(max_memory_mb=400)  # 400MB limit for free tier
    
    try:
        result = scraper.scrape_class_info(class_id)
        
        if "error" in result:
            print(f"Error: {result['error']}", file=sys.stderr)
            sys.exit(1)
        else:
            # Output the result (modify format as needed)
            import json
            print(json.dumps(result))
    
    except KeyboardInterrupt:
        print("Script interrupted")
        scraper.cleanup_driver()
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        scraper.cleanup_driver()
        sys.exit(1)

if __name__ == "__main__":
    main()