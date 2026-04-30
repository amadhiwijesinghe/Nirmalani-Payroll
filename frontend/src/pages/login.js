import { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Paper, Typography } from '@mui/material';
const API = "https://nirmalani-payroll-production.up.railway.app";

export default function Login({ setIsLoggedIn }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = () => {
    axios.post(`${API}/login`, {
      username,
      password
    }).then(res => {
      if (res.data.success) {
        setIsLoggedIn(true);
      } else {
        alert("Invalid credentials ❌");
      }
    });
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
      </Paper>
    </div>
  );
}