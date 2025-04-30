import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthService from '../configuration/Services/AuthService';
import BannedUserModal from './BannedUserModal';

/**
 * AuthGuard component to protect routes and check if user is banned
 * @param {Object} props Component props
 * @param {boolean} props.isLoggedIn Whether user is logged in
 * @param {React.ReactNode} props.children Child components
 * @param {boolean} props.requireAuth Whether authentication is required
 * @param {string[]} props.requiredRoles Array of roles allowed to access the route
 * @returns {React.ReactNode} Protected route or redirect
 */
export default function AuthGuard({ isLoggedIn, children, requireAuth = true, requiredRoles = [] }) {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isBanned, setIsBanned] = useState(false);
    const [banDetails, setBanDetails] = useState(null);
    const [banModalOpen, setBanModalOpen] = useState(false);
    
    useEffect(() => {
        const checkBanStatus = async () => {
            if (!isLoggedIn) {
                setIsChecking(false);
                return;
            }
            
            try {
                // Get user details from session storage
                const userDetailsStr = sessionStorage.getItem('userDetails');
                if (!userDetailsStr) {
                    setIsChecking(false);
                    return;
                }
                
                const userDetails = JSON.parse(userDetailsStr);
                const userId = userDetails?.id;
                
                if (!userId) {
                    setIsChecking(false);
                    return;
                }
                
                // Check if user is banned
                const banStatus = await AuthService.checkUserBanStatus(userId);
                
                if (banStatus && banStatus.isActive) {
                    setIsBanned(true);
                    setBanDetails({
                        reason: banStatus.banReason,
                        duration: banStatus.duration,
                        expiration: banStatus.banEnd
                    });
                    setBanModalOpen(true);
                    
                    // Clear user session since they're banned
                    sessionStorage.removeItem('jwtToken');
                    sessionStorage.removeItem('userDetails');
                    sessionStorage.removeItem('loginSuccess');
                }
            } catch (error) {
                console.error('Error checking ban status:', error);
            } finally {
                setIsChecking(false);
            }
        };
        
        checkBanStatus();
    }, [isLoggedIn, location.pathname]);
    
    // If still checking ban status, show nothing to avoid flashing content
    if (isChecking) {
        return null;
    }
    
    // If user is banned, show the ban modal
    if (isBanned) {
        return (
            <>
                <Navigate to="/login" replace />
                <BannedUserModal 
                    open={banModalOpen}
                    onClose={() => setBanModalOpen(false)}
                    banDetails={banDetails}
                />
            </>
        );
    }
    
    // Authentication logic
    if (requireAuth && !isLoggedIn) {
        // Redirect to login if authentication is required but user is not logged in
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Role-based access control
    if (requiredRoles.length > 0 && isLoggedIn) {
        const userDetailsStr = sessionStorage.getItem('userDetails');
        if (userDetailsStr) {
            const userDetails = JSON.parse(userDetailsStr);
            const userRole = userDetails?.role;
            
            if (userRole && !requiredRoles.includes(userRole)) {
                // User doesn't have the required role
                return <Navigate to="/unauthorized" replace />;
            }
        }
    }
    
    // User is authenticated and has the required role, render children
    return children;
} 