import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import SignupImage from '../assets/coffee.jpg';
import { Eye, EyeOff } from 'lucide-react';

const SignupPage = () => {
    const [userType, setUserType] = useState('CUSTOMER');
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirm_password: '',
        phone_number: '',
        business_name: '',
        business_description: '',
        business_address: '',
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        // Validate password and confirm password match
        if (formData.password.length < 8) {
            setErrors(prev => ({
                ...prev,
                password: 'Password must be at least 8 characters long.',
            }));
            return;
        }

        if (formData.password !== formData.confirm_password) {
            setErrors(prev => ({
                ...prev,
                confirm_password: 'Passwords do not match.',
            }));
            return;
        }

        const payload = { ...formData, user_type: userType };
        delete payload.confirm_password; // Remove confirm_password before sending to backend

        try {
            const response = await axios.post(`/api/accounts/signup/`, payload);
            if (response.status === 201) {
                navigate('/login');
            }
        } catch (error) {
            if (error.response?.data) {
                const apiErrors = error.response.data;
                const formattedErrors = {};
                Object.entries(apiErrors).forEach(([key, value]) => {
                    formattedErrors[key] = Array.isArray(value) ? value[0] : value;
                });
                setErrors(formattedErrors);
            } else {
                setErrors({
                    general: 'An unexpected error occurred. Please try again later.',
                });
            }
        }
    };

    const getInputClassName = (fieldName) => {
        return `w-full p-2 border rounded ${
            errors[fieldName] ? 'border-red-500' : 'border-gray-300'
        }`;
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Left Section with Image */}
            <div className="w-full md:w-1/2 bg-gray-200 flex items-center justify-center">
                <img 
                    src={SignupImage} 
                    alt="Signup" 
                    className="w-full h-64 md:h-full object-cover" 
                />
            </div>
    
            {/* Right Section with Form */}
            <div className="w-full md:w-1/2 bg-black flex items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-6 text-white">Sign Up</h1>
                    
                    {/* General error message */}
                    {errors.general && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {errors.general}
                        </div>
                    )}
    
                    <div className="flex justify-center mb-4 md:mb-6">
                        <button 
                            className={`px-3 py-1 md:px-4 md:py-2 mx-1 md:mx-2 rounded ${userType === 'CUSTOMER' ? 'bg-brown-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => setUserType('CUSTOMER')}
                            type="button"
                        >
                            Customer
                        </button>
                        <button 
                            className={`px-3 py-1 md:px-4 md:py-2 mx-1 md:mx-2 rounded ${userType === 'VENDOR' ? 'bg-brown-600 text-white' : 'bg-gray-200'}`}
                            onClick={() => setUserType('VENDOR')}
                            type="button"
                        >
                            Vendor
                        </button>
                    </div>
    
                    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
                        <div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                className={getInputClassName('email')}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                            )}
                        </div>
    
                        <div>
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                className={getInputClassName('username')}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.username && (
                                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                            )}
                        </div>
    
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password (min. 8 characters)"
                                className={`${getInputClassName('password')} pr-10`}
                                onChange={handleInputChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('password')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                            )}
                        </div>
    
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirm_password"
                                placeholder="Confirm Password"
                                className={`${getInputClassName('confirm_password')} pr-10`}
                                onChange={handleInputChange}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                            {errors.confirm_password && (
                                <p className="text-red-500 text-sm mt-1">{errors.confirm_password}</p>
                            )}
                        </div>
    
                        <div>
                            <input
                                type="tel"
                                name="phone_number"
                                placeholder="Phone Number"
                                className={getInputClassName('phone_number')}
                                onChange={handleInputChange}
                                required
                            />
                            {errors.phone_number && (
                                <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>
                            )}
                        </div>
    
                        {userType === 'VENDOR' && (
                            <>
                                <div>
                                    <input
                                        type="text"
                                        name="business_name"
                                        placeholder="Business Name"
                                        className={getInputClassName('business_name')}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.business_name && (
                                        <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>
                                    )}
                                </div>
    
                                <div>
                                    <textarea
                                        name="business_description"
                                        placeholder="Business Description"
                                        className={getInputClassName('business_description')}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.business_description && (
                                        <p className="text-red-500 text-sm mt-1">{errors.business_description}</p>
                                    )}
                                </div>
    
                                <div>
                                    <textarea
                                        name="business_address"
                                        placeholder="Business Address"
                                        className={getInputClassName('business_address')}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    {errors.business_address && (
                                        <p className="text-red-500 text-sm mt-1">{errors.business_address}</p>
                                    )}
                                </div>
                            </>
                        )}
    
                        <button 
                            type="submit"
                            className="w-full bg-amber-600 text-white py-2 rounded-md hover:bg-amber-500 mt-4"
                        >
                            Sign Up
                        </button>
                        <div className="mt-4 text-center text-sm text-white">
                        Already have an account?{' '}
                        <Link 
                            to="/login" 
                            className="font-medium text-amber-500 hover:text-amber-700"
                        >
                            Sign In
                        </Link>
                    </div>
                    </form>
                </div>
            </div>
        </div>
    );
    
};

export default SignupPage;
