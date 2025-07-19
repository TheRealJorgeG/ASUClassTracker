import React, { useState, useEffect } from 'react'
import AsuLogo from '../assets/asulogo.png'

const Analytics = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const element = document.getElementById('analytics-section');
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, []);

    return (
        <div id="analytics-section" className='relative w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 py-24 px-4 overflow-hidden'>
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-20 left-10 w-32 h-32 bg-[#A23A56]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#ffcb25]/5 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-[#A23A56]/5 to-[#ffcb25]/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className={`relative max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 items-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* Image Section */}
                <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#A23A56] to-[#ffcb25] rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                    <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                        <img 
                            src={AsuLogo} 
                            alt="ASU Logo" 
                            className="w-full h-auto max-w-md mx-auto filter drop-shadow-lg hover:drop-shadow-2xl transition-all duration-300"
                        />
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-[#ffcb25] to-[#ffd700] rounded-full flex items-center justify-center shadow-lg">
                            <svg className="w-12 h-12 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className='flex flex-col justify-center space-y-8'>
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#A23A56] to-[#B8456E] text-white px-6 py-3 rounded-full text-sm font-bold tracking-wide shadow-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            CLASS TRACKING APPLICATION
                        </div>
                        
                        <h1 className='text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#1a1a1a] to-[#4a4a4a] leading-tight'>
                            About the Application
                        </h1>
                    </div>
                    
                    <div className="space-y-6">
                        <p className='text-lg text-gray-700 leading-relaxed font-medium'>
                            Class Tracker is a revolutionary web application designed to eliminate the stress of class enrollment. 
                            Built specifically for ASU students, it monitors your desired classes in real-time and delivers instant notifications 
                            the moment a spot becomes available.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#ffcb25] to-[#ffd700] rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-[#1a1a1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-gray-800">Real-Time Monitoring</h3>
                                </div>
                                <p className="text-gray-600 text-sm">Continuous tracking of class availability with instant updates</p>
                            </div>
                            
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#A23A56] to-[#B8456E] rounded-lg flex items-center justify-center">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.021 5.979a9.987 9.987 0 016.626-2.998c5.522 0 9.998 4.477 9.998 9.999 0 2.44-.882 4.668-2.344 6.385l-7.655-7.655V5.979z" />
                                        </svg>
                                    </div>
                                    <h3 className="font-bold text-gray-800">Multi-Platform Alerts</h3>
                                </div>
                                <p className="text-gray-600 text-sm">Get notified via email and Discord instantly when spots open</p>
                            </div>
                        </div>
                        
                        <div className="bg-gradient-to-r from-[#A23A56]/10 to-[#ffcb25]/10 rounded-2xl p-6 border border-[#A23A56]/20">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#A23A56] to-[#ffcb25] rounded-full flex items-center justify-center flex-shrink-0">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-2">Our Mission</h3>
                                    <p className="text-gray-700">
                                        To make class enrollment efficient, reliable, and stress-free for every ASU student. 
                                        No more refreshing pages or missing out on essential courses.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Analytics