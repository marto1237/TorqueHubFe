import React from 'react';
import { useLocation } from 'react-router-dom';
import AccessDeniedPage from '../common/AccessDeniedPage';

/**
 * RoleProtectedRoute - Protects routes based on user roles
 * Shows AccessDeniedPage for unauthorized access attempts
 */
const RoleProtectedRoute = ({ roles, userDetails, children }) => {
    const location = useLocation();

    // Check if user has access to this route
    const hasAccess = userDetails && roles.includes(userDetails.role);

    // If no access, show the AccessDeniedPage instead of null
    if (!hasAccess) {
        return (
            <AccessDeniedPage 
                requiredRole={roles}
                userRole={userDetails?.role || 'Not logged in'}
            />
        );
    }

    // User has access, render the protected content
    return children;
};

export default RoleProtectedRoute;
