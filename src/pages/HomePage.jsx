import React from 'react';
import Navbar from '../components/common/Navbar';
import { useTypewriter, Cursor } from 'react-simple-typewriter';

import '../styles/HomePage.css';


const HomePage = () => {
    const [text] = useTypewriter({
        words: ['Welcome to Torque Hub'],
        loop: 0, // Infinite loop
        typeSpeed: 200,
        deleteSpeed: 0,
        delaySpeed: 1200,
    });



    return (
        <div className="background" >
            <div className="navbar">

            </div>
            {/* Wrap the Typewriter text in a span and apply inline styles */}
            <span className="typewriter-text">
                {text}
                {/* Apply cursor style */}
                <Cursor cursorStyle="|" className="cursor" />
            </span>
        </div>
    );
};

export default HomePage;
