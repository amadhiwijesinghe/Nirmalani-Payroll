import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Paper, Typography } from '@mui/material';
import StaffRegister from './StaffRegister';
const API =
  process.env.REACT_APP_API_URL ||
  "https://nirmalani-payroll-production.up.railway.app";

export default function Login({ setIsLoggedIn, setPage }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);

  if (showRegister) {
  return (
    <StaffRegister
      onBackToLogin={() => setShowRegister(false)}
    />
  );
}


const login = async () => {
  try {
    const res = await axios.post(`${API}/login`, {
      username: username.trim(),
      password,
    });

    if (res.data.success && res.data.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setPage("dashboard");
      setIsLoggedIn(true);
    } else {
      alert(res.data.message || "Invalid credentials.");
    }
  } catch (error) {
    console.error("Login error:", error);

    alert(
      error.response?.data?.message ||
        "Unable to log in. Please try again."
    );
  }
};



  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
      <Paper style={{ padding: 30, width: 300 }}>
        <Typography variant="h5">Admin Login</Typography>

        <TextField label="Username" fullWidth margin="normal"
          onChange={e => setUsername(e.target.value)} />

        <TextField label="Password" type="password" fullWidth margin="normal"
          onChange={e => setPassword(e.target.value)} />

        <Button variant="contained" fullWidth onClick={login}>
          Login
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