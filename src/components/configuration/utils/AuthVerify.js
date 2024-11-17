import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const parseJwt = (token) => {
    try {
        return JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
        return null;
    }
};

const AuthVerify = ({ logOut }) => {
    const location = useLocation();

    useEffect(() => {
        const checkTokenExpiration = () => {
            const token = sessionStorage.getItem("jwtToken");
            if (token) {
                const decodedToken = parseJwt(token);
                if (decodedToken?.exp * 1000 < Date.now()) {
                    logOut(); // Logout if token is expired
                }
            }
        };

        checkTokenExpiration();

        // Set interval to check token expiration every 5 minutes
        const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);

        return () => clearInterval(interval); // Clean up interval on unmount
    }, [location, logOut]);

    return null;
};

export default AuthVerify;
