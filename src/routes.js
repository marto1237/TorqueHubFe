import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage'; // Assuming HomePage component is already created

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
