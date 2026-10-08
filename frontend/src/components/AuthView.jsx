import React, { useState } from 'react';

export default function AuthView({ apiBaseUrl, onLoginSuccess }) {
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [userName, setUserName] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [devOtp, setDevOtp] = useState('');

  // Step 1: Send OTP via Minimoth API
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setDevOtp('');

    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: trimmedPhone })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send OTP.');
      }

      setInfo(data.message || 'OTP sent successfully!');
      if (data.devOtp) {
        setDevOtp(data.devOtp);
      }
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Network error while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!otpCode || otpCode.trim().length !== 6) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone.trim(),
          code: otpCode.trim(),
          name: userName.trim()
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }

      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">
            <span>⚡ WhatsApp / SMS OTP by Minimoth</span>
          </div>
          <h2>Welcome Traveler</h2>
          <p className="auth-subtitle">
            {step === 'phone'
              ? 'Enter your mobile number to sign in or register'
              : `Enter the 6-digit code sent to ${phone}`}
          </p>
        </div>

        {error && <div className="alert-box alert-error">⚠️ {error}</div>}
        {info && <div className="alert-box alert-success">✅ {info}</div>}

        {step === 'phone' ? (
          <form className="auth-form" onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label" htmlFor="phone-input">Mobile Number</label>
              <div className="phone-input-row">
                <span className="phone-prefix">+91</span>
                <input
                  id="phone-input"
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  autoFocus
                  required
                />
              </div>
            </div>

            <button
              id="send-otp-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Send OTP via Minimoth →'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label className="form-label" htmlFor="name-input">Your Name (Optional)</label>
              <input
                id="name-input"
                type="text"
                placeholder="e.g. Alex"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="otp-input">6-Digit Verification Code</label>
              <input
                id="otp-input"
                type="text"
                className="code-input"
                maxLength={6}
                placeholder="••••••"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                disabled={loading}
                autoFocus
                required
              />
            </div>

            <button
              id="verify-otp-btn"
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Continue →'}
            </button>

            <button
              type="button"
              className="btn-ghost"
              style={{ marginTop: '4px' }}
              onClick={() => {
                setStep('phone');
                setOtpCode('');
                setError('');
              }}
              disabled={loading}
            >
              ← Change Phone Number
            </button>
          </form>
        )}

        {devOtp && (
          <div className="dev-hint-card">
            <strong>Workshop Dev Hint:</strong> Minimoth dev mode is active. Use code{' '}
            <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 4, fontWeight: 'bold' }}>
              {devOtp}
            </code>{' '}
            to sign in immediately.
          </div>
        )}
      </div>
    </div>
  );
}
