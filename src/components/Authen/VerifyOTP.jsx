// src/components/auth/VerifyOTP.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE } from '../../config/api';
import './VerifyOTP.css';

const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/forgot-password');
        }
    }, [email, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [countdown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOtpChange = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            
            // Auto-focus next input
            if (value && index < 5) {
                document.getElementById(`otp-${index + 1}`).focus();
            }
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        
        const otpString = otp.join('');
        
        if (otpString.length !== 6) {
            setError('Please enter the complete 6-digit OTP');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await axios.post(`${API_BASE}verify-reset-otp/`, {
                email: email,
                otp: otpString
            });

            setSuccess('OTP verified successfully!');
            
            // Navigate to reset password page
            setTimeout(() => {
                navigate('/reset-password', {
                    state: {
                        email: email,
                        verification_token: response.data.verification_token
                    }
                });
            }, 1000);

        } catch (err) {
            const errorMsg = err.response?.data?.error || 'Invalid OTP. Please try again.';
            setError(errorMsg);
            // Reset OTP on error
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0').focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (!canResend) return;
        
        setLoading(true);
        setError('');
        setSuccess('');
        setCanResend(false);

        try {
            const response = await axios.post(`${API_BASE}send-reset-otp/`, {
                email: email
            });

            setSuccess('New OTP sent successfully!');
            setCountdown(300); // Reset countdown
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0').focus();

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Verify OTP</h2>
                <p className="auth-subtitle">
                    Enter the 6-digit code sent to<br />
                    <strong>{email}</strong>
                </p>
                
                <div className="timer">
                    <span>Code expires in: </span>
                    <span className={countdown < 60 ? 'text-danger' : 'text-primary'}>
                        {formatTime(countdown)}
                    </span>
                </div>

                <form onSubmit={handleVerify} className="auth-form">
                    <div className="otp-container">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                id={`otp-${index}`}
                                type="text"
                                maxLength="1"
                                value={digit}
                                onChange={(e) => handleOtpChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="otp-input"
                                required
                                disabled={loading || countdown === 0}
                            />
                        ))}
                    </div>

                    <button 
                        type="submit" 
                        className="auth-button primary"
                        disabled={loading || countdown === 0}
                    >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>

                    <div className="resend-otp">
                        <button 
                            type="button" 
                            className="auth-button secondary"
                            onClick={handleResendOTP}
                            disabled={loading || !canResend}
                        >
                            {canResend ? 'Resend OTP' : `Resend in ${formatTime(countdown)}`}
                        </button>
                    </div>

                    <div className="auth-links">
                        <a href="/forgot-password" className="auth-link">Change Email</a>
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

export default VerifyOTP;