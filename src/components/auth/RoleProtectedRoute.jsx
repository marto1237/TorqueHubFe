import React from 'react';
import { Navigate } from 'react-router-dom';

const RoleProtectedRoute = ({ roles, userDetails, children }) => {
    if (!userDetails) {
        return <Navigate to="/login" replace />; // Redirect non-logged-in users
    }

    if (!roles.includes(userDetails.role)) {
        return <Navigate to="/" replace />; // Redirect users without required roles
    }

    return children; // Render component for authorized users
};

export default RoleProtectedRoute;
