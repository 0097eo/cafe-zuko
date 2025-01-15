import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from 'prop-types';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const refresh = localStorage.getItem("refresh");
        const access = localStorage.getItem("access");
        const userData = JSON.parse(localStorage.getItem("user"));

        if (refresh && access && userData) {
            setUser({ refresh, access, ...userData });
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await fetch('/api/accounts/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
    
            if (response.ok) {
                const { refresh, access, user } = data;
                localStorage.setItem("refresh", refresh);
                localStorage.setItem("access", access);
                localStorage.setItem("user", JSON.stringify(user));
                setUser({ refresh, access, ...user });
                return true; 
            } else {
                return false;
            }
        } catch (error) {
            console.error(error);
            return false;
        }
    };
    

    const logout = () => {
        localStorage.removeItem("refresh");
        localStorage.removeItem("access");
        localStorage.removeItem("user");
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
