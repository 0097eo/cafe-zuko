import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import LoginImage from "../assets/coffee.jpg";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {

    const {login} = useAuth();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    })
    const [errors, setErrors] = useState(null)
    const [loading, showLoading] = useState(false)
    const navigate = useNavigate();


    const handleLoginSuccess = () => {
        navigate('/shop');
    }


    const handleInputChange = (e) => {
        const {name, value} = e.target
        setFormData(prev=> ({
            ...prev,
            [name]: value
        }))
    }

    const validateForm = () => {

        // Password validation (example: minimum 8 characters)
        if (formData.password.length < 8) {
            setErrors('Password must be at least 8 characters long');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors(null);  
        if (!validateForm()) {
            return;
        }
        showLoading(true);
        try {
            const success = await login(formData.username, formData.password);
            if (success) {
                setFormData({ username: '', password: '' });
                handleLoginSuccess();
            } else {
                setErrors('Login failed, check your credentials.');
            }
        } catch (e) {
            setErrors(e + 'An unexpected error occurred. Please try again.');
        }
        showLoading(false);
    };
    


    return (
        <div className="min-h-screen flex bg-black">
            <div className="w-1/2">
                <img 
                    src={LoginImage} 
                    alt="coffee" 
                    className="w-full h-full object-cover" 
                />
            </div>
            <div className="w-1/2 flex justify-center items-center">
                <div className='max-w-md w-full px-6'>
                    <h2 className="text-white text-3xl font-extrabold text-center mb-6">
                        Sign in to your account
                    </h2>
                    {errors && (
                        <div 
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
                            role="alert"
                        >
                            {errors}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <input 
                                type="text" 
                                name="username" 
                                id="username" 
                                placeholder="Enter you username"
                                value={formData.username}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            />
                        </div>
                        <div>
                            <input 
                                type="password" 
                                name="password" 
                                id="password"
                                placeholder="Enter you password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                            />
                        </div>
                        <div>
                            <button 
                                type="submit" 
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-500 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {loading ? 'Loading...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

        </div>
    )

}

export default LoginPage;