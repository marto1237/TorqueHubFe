import React from 'react';
import { useLocation } from 'react-router-dom';

const RoleProtectedRoute = ({ roles, userDetails, children }) => {
    const location = useLocation();

    const hasAccess = userDetails && roles.includes(userDetails.role);

    if (!hasAccess) {
        return null; 
    }

    return children;
};

export default RoleProtectedRoute;
