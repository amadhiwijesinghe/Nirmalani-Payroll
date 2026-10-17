
import { useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button
} from "@mui/material";

const API =
  process.env.REACT_APP_API_URL ||
  "https://nirmalani-payroll-production.up.railway.app";

export default function StaffRegister({ onBackToLogin }) {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

const register = async () => {
  try {
    const response = await axios.post(`${API}/register`, {
      fullName,
      username: username.trim(),
      password,
    });

    alert(response.data.message);

    setFullName("");
    setUsername("");
    setPassword("");
    onBackToLogin();
  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Unable to register. Please try again."
    );
  }
};

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        mt: 10,
        px: 2
      }}
    >
      <Paper sx={{ p: 4, width: "100%", maxWidth: 380 }}>
        <Typography variant="h5" gutterBottom>
          Staff Registration
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Create your account. The administrator must approve it
          before you can log in.
        </Typography>

        <TextField
          label="Full Name"
          fullWidth
          margin="normal"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <TextField
          label="Username"
          fullWidth
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={!fullName.trim() || !username.trim() || password.length < 8}
            onClick={register}
            >
            Register
            </Button>

        <Button
          fullWidth
          sx={{ mt: 1 }}
          onClick={onBackToLogin}
        >
          Back to Login
        </Button>
      </Paper>
    </Box>
  );
}
