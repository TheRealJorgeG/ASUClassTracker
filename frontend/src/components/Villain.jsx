import React from 'react'
import { ReactTyped } from "react-typed";
import { useNavigate } from "react-router-dom";

const Villain = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        navigate("/auth");
    };

    return (
        <div className='text-white bg-[#92223D]'>
            <div className='max-w-[1000px] mt-[-96px] w-full h-screen mx-auto text-center flex flex-col justify-center'>
                <p className='text-[#ffcb25] md:text-5xl sm:text-3xl text-xl font-bold p-2'>
                    GET CLASSES ASAP
                </p>
                <h1 className='md:text-7xl sm:text-4xl text-2xl font-bold md:py-6 text-black -mt-5'>
                    Be the first to know.
                </h1>
                <div className='flex justify-center items-center -mt-6'>
                    <p className='md:text-6xl sm:text-4xl text-2xl font-bold py-4'>
                        For ASU students in
                    </p>
                    <ReactTyped 
                    className='md:text-6xl sm:text-4xl text-2xl font-bold md:pl-4 pl-2 text-[#ffcb25]' 
                        strings={['Tempe', 'West Valley', 'Polytechnic', 'Downtown']} 
                        typeSpeed={120} 
                        backSpeed={140} 
                        loop 
                    />
                </div>
                <p className='md:text-2xl text-xl font-bold text-white'>Monitor your classes to be the first in line to sign up for them</p>
                <button onClick={handleGetStarted} className='bg-black rounded-md font-bold my-6 mx-auto py-2 px-4 text-base text-white sm:py-3 sm:px-6 sm:text-lg md:py-4 md:px-8 md:text-xl'> 
                    Get Started
                </button>

            </div>
        </div>
    )
}

export default Villain