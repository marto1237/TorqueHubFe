import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ roles, children }) => {
    const userDetails = JSON.parse(sessionStorage.getItem('userDetails')); // Retrieve stored details
    console.log(userDetails)
    const userRole = userDetails?.role; // Extract role

    if (!userRole) {
        return <Navigate to="/login" replace />; // Redirect if not logged in
    }

    if (!roles.includes(userRole)) {
        return <Navigate to="/" replace />; // Redirect if unauthorized
    }

    return children; // Render component if authorized
};

export default RoleProtectedRoute;
