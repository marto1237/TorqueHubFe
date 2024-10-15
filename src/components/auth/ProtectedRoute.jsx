import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ loggedIn, children }) => {
    // If user is already logged in, redirect them to the homepage (or any other page)
    if (loggedIn) {
        return <Navigate to="/" replace />;
    }
    // If user is not logged in, render the component (e.g., Login or SignUp)
    return children;
};

export default ProtectedRoute;