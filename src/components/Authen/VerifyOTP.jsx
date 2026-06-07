import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import './VerifyOTP.css';
const VerifyOTP = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email || '';
    
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(300); // 5 minutes in seconds
    const [verificationToken, setVerificationToken] = useState('');

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
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
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8000/api/verify-reset-otp/', {
                email: email,
                otp: otpString
            });

            setMessage(response.data.message);
            setVerificationToken(response.data.verification_token);
            
            // Navigate to reset password page
            navigate('/reset-password', {
                state: {
                    email: email,
                    verification_token: response.data.verification_token
                }
            });

        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
            // Reset OTP on error
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0').focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await axios.post('http://localhost:8000/api/send-reset-otp/', {
                email: email
            });

            setMessage('New OTP sent successfully');
            setCountdown(300); // Reset countdown
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0').focus();

        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        navigate('/forgot-password');
        return null;
    }

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
                                disabled={loading}
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
                            disabled={loading || countdown > 240} // Can resend after 1 minute
                        >
                            Resend OTP
                        </button>
                    </div>

                    <div className="auth-links">
                        <a href="/forgot-password" className="auth-link">Change Email</a>
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

export default VerifyOTP;