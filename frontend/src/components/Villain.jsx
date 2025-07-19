import React from 'react';
import { ReactTyped } from "react-typed";
import { useNavigate } from "react-router-dom";

const Villain = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/auth");
    };

    return (
        <div className='relative text-white overflow-hidden'>
            <div className='relative max-w-[1200px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center px-4'>
                <div className="transform transition-all duration-1000 translate-y-0 opacity-100">
                    <p className='md:text-6xl sm:text-4xl text-2xl font-black p-2 tracking-tight drop-shadow-lg' style={{ color: '#ffcb25' }}>
                        GET CLASSES ASAP
                    </p>
                    <h1 className='md:text-8xl sm:text-5xl text-3xl font-black md:py-6 py-4 text-white drop-shadow-2xl leading-tight'>
                        Be the first to know.
                    </h1>
                </div>

                <div className='flex justify-center items-center flex-wrap gap-2 md:gap-4 transform transition-all duration-1000 delay-500 translate-y-0 opacity-100'>
                    <p className='md:text-5xl sm:text-3xl text-xl font-bold py-4 text-white/90'>
                        For ASU students in
                    </p>
                    <ReactTyped
                        className='md:text-5xl sm:text-3xl text-xl font-bold drop-shadow-lg'
                        style={{ color: '#ffcb25' }}
                        strings={['Tempe', 'West Valley', 'Polytechnic', 'Downtown']}
                        typeSpeed={120}
                        backSpeed={140}
                        loop
                    />
                </div>

                <p className='md:text-2xl sm:text-xl text-lg font-medium text-white/80 max-w-3xl mx-auto leading-relaxed transform transition-all duration-1000 delay-1000 translate-y-0 opacity-100'>
                    Monitor your classes in real-time and get instant notifications the moment a spot opens up. Never miss enrollment again.
                </p>

                <div className="transform transition-all duration-1000 delay-1500 translate-y-0 opacity-100">
                    <button
                        onClick={handleGetStarted}
                        className='group relative rounded-2xl font-bold my-8 mx-auto py-4 px-8 text-xl md:py-5 md:px-10 md:text-2xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 overflow-hidden'
                        style={{
                            background: 'linear-gradient(135deg, #ffcb25 0%, #ffd700 100%)',
                            color: '#1a1a1a',
                            boxShadow: '0 10px 30px rgba(255, 203, 37, 0.3)'
                        }}
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Get Started
                            <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </span>
                        <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ffcb25 100%)' }}></div>
                    </button>
                </div>

                {/* Floating arrow */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
                    <svg className="w-8 h-8 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default Villain;