// src/components/auth/ForgotPassword.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import './ForgotPasswordPage.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate email
        if (!email) {
            setError('Please enter your email address');
            return;
        }
        
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${API_BASE}send-reset-otp/`, {
                email: email
            });

            setSuccess('OTP sent successfully! Please check your email.');
            
            // Navigate to OTP verification page after short delay
            setTimeout(() => {
                navigate('/verify-otp', { 
                    state: { 
                        email: email
                    }
                });
            }, 1500);

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Failed to send OTP. Please try again.';
            setError(errorMsg);
            console.error('Send OTP error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Reset Password</h2>
                <p className="auth-subtitle">Enter your email to receive a reset OTP</p>
                
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            required
                            className="form-input"
                            disabled={loading}
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button primary"
                        disabled={loading}
                    >
                        {loading ? 'Sending...' : 'Send OTP'}
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

export default ForgotPassword;