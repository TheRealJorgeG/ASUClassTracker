import React from 'react'
import AsuLogo from '../assets/asulogo.png'

const Analytics = () => {
    return (
        <div className='w-full bg-white py-16 px-4'>
            <div className='max-w-[1240px] mx-auto grid md:grid-cols-2'>
                <img src={AsuLogo} alt="/" />
                <div className='flex flex-col justify-center'>
                    <p className='text-[#A23A56] font-bold'>CLASS TRACKING APPLICATION</p>
                    <h1 className='md:text-4xl sm:text-3xl text-2xl font-bold py-2'>About the Application</h1>
                    <p className='font-medium'>
                        Class Tracker is a web application built to help students register for classes they may have missed during the initial enrollment period. 
                        Instead of constantly refreshing course pages or manually checking availability, students can simply enter the class they want to track. 
                        The system monitors that class in real time and sends instant alerts via email or Discord the moment a spot opens up. 
                        This ensures students have the best chance of enrolling in high-demand or previously full classes. 
                        The goal of the project is to reduce registration stress and make class enrollment more efficient, reliable, and student-friendly.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Analytics