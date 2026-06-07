import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post('http://localhost:8000/api/send-reset-otp/', {
                email: email
            });

            setMessage(response.data.message);
            
            // Navigate to OTP verification page
            navigate('/verify-otp', { 
                state: { 
                    email: email,
                    message: 'OTP sent to your email'
                }
            });

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
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

                {message && (
                    <div className="alert alert-success">
                        {message}
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