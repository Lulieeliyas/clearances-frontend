// src/components/auth/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '../../utils/api';
import './ResetPassword.css';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { email, verification_token } = location.state || {};
    
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
        showPassword: false,
        showConfirmPassword: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');

    useEffect(() => {
        if (!email || !verification_token) {
            navigate('/forgot-password');
        }
    }, [email, verification_token, navigate]);

    const checkPasswordStrength = (password) => {
        if (!password) return '';
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
        
        if (strength <= 2) return 'Weak';
        if (strength <= 4) return 'Medium';
        return 'Strong';
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'newPassword') {
            setPasswordStrength(checkPasswordStrength(value));
            // Clear error when user types
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validation
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE}reset-password/`, {
                email: email,
                verification_token: verification_token,
                new_password: formData.newPassword,
                confirm_password: formData.confirmPassword
            });

            setSuccess('Password reset successfully! Redirecting to login...');
            
            // Auto-redirect to login after success
            setTimeout(() => {
                navigate('/login', { 
                    state: { 
                        message: 'Password reset successful! Please login with your new password.'
                    }
                });
            }, 3000);

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to reset password. Please try again.';
            setError(errorMsg);
            console.error('Reset password error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Set New Password</h2>
                <p className="auth-subtitle">Create a new password for your account</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="newPassword">
                            New Password
                            {passwordStrength && (
                                <span className={`password-strength ${passwordStrength.toLowerCase()}`}>
                                    ({passwordStrength})
                                </span>
                            )}
                        </label>
                        <div className="password-input-group">
                            <input
                                type={formData.showPassword ? "text" : "password"}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder="Enter new password"
                                required
                                className="form-input"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setFormData(prev => ({...prev, showPassword: !prev.showPassword}))}
                                disabled={loading}
                            >
                                {formData.showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        <div className="password-requirements">
                            <p>Password must contain:</p>
                            <ul>
                                <li className={formData.newPassword.length >= 6 ? 'valid' : ''}>
                                    At least 6 characters
                                </li>
                                <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                                    One uppercase letter
                                </li>
                                <li className={/\d/.test(formData.newPassword) ? 'valid' : ''}>
                                    One number
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="password-input-group">
                            <input
                                type={formData.showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm new password"
                                required
                                className="form-input"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setFormData(prev => ({...prev, showConfirmPassword: !prev.showConfirmPassword}))}
                                disabled={loading}
                            >
                                {formData.showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button primary"
                        disabled={loading}
                    >
                        {loading ? 'Resetting Password...' : 'Reset Password'}
                    </button>

                    <div className="auth-links">
                        <a href="/login" className="auth-link">Back to Login</a>
                    </div>
                </form>

                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}
                
                {error && (
                    <div className="alert alert-error">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResetPassword;