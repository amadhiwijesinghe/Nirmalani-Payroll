import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Paper, Typography } from '@mui/material';
import StaffRegister from './StaffRegister';

const API =
  process.env.REACT_APP_API_URL ||
  'https://nirmalani-payroll-production.up.railway.app';

export default function Login({ setIsLoggedIn, setPage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [resetUsername, setResetUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, {
        username: username.trim(),
        password,
      });

      if (res.data.success && res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        setPage('dashboard');
        setIsLoggedIn(true);
      } else {
        alert(res.data.message || 'Invalid credentials.');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(
        error.response?.data?.message ||
          'Unable to log in. Please try again.'
      );
    }
  };

  const submitPasswordReset = async () => {
    if (!resetUsername.trim()) {
      alert('Please enter your username.');
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 128) {
      alert('Password must be between 8 and 128 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
      setResetLoading(true);

      const response = await axios.post(
        `${API}/reset-staff-password`,
        {
          username: resetUsername.trim(),
          password: newPassword,
          confirmPassword,
        }
      );

      alert(response.data.message || 'Password updated successfully.');

      setShowForgotPassword(false);
      setResetUsername('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      alert(
        error.response?.data?.message ||
          'Unable to reset the password. Please try again.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  if (showRegister) {
    return (
      <StaffRegister
        onBackToLogin={() => setShowRegister(false)}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: 100,
        }}
      >
        <Paper style={{ padding: 30, width: 300 }}>
          <Typography variant="h5">
            Forgot Password?
          </Typography>

          <Typography sx={{ mt: 1, color: 'text.secondary' }}>
            Enter your staff username and choose a new password.
          </Typography>

          <TextField
            label="Staff Username"
            fullWidth
            margin="normal"
            autoComplete="username"
            value={resetUsername}
            onChange={(e) => setResetUsername(e.target.value)}
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            margin="normal"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <TextField
            label="Confirm New Password"
            type="password"
            fullWidth
            margin="normal"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            disabled={resetLoading}
            onClick={submitPasswordReset}
            sx={{ mt: 1 }}
          >
            {resetLoading ? 'Updating...' : 'Reset Password'}
          </Button>

          <Button
            fullWidth
            sx={{ mt: 1 }}
            disabled={resetLoading}
            onClick={() => {
              setShowForgotPassword(false);
              setResetUsername('');
              setNewPassword('');
              setConfirmPassword('');
            }}
          >
            Back to Login
          </Button>
        </Paper>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: 100,
      }}
    >
      <Paper style={{ padding: 30, width: 300 }}>
        <Typography variant="h5">Admin Login</Typography>

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          onClick={login}
        >
          Login
        </Button>

        <Button
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot Password?
        </Button>

        <Button
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => setShowRegister(true)}
        >
          Register as Staff
        </Button>
      </Paper>
    </div>
  );
}