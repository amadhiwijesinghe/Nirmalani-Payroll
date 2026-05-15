import { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  MenuItem,
  Grid,
  Typography,
  Box
} from "@mui/material";
const API = "https://nirmalani-payroll-production.up.railway.app";

function Payroll() {
  const [data, setData] = useState([]);
  const [month, setMonth] = useState("");

  const fetchPayroll = async () => {
    if (month) {
      const res = await axios.get(`${API}/payroll/${month}`)
      setData(res.data);
    } else {
      const res = await axios.get(`${API}/payroll`)
      setData(res.data);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [month]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchPayroll();
    }, 3000);

    return () => clearInterval(interval);
  }, [month]);

  const formatMemberId = (id) => {
    return String(id).padStart(6, "0");
  };

  // 🔥 SELECT STYLE (FIXED + DARK)
  const selectStyle = {
    '& .MuiOutlinedInput-root': {
      height: 56,
      paddingRight: '14px',
      color: '#fff'
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      padding: '16.5px 14px',
      color: '#fff'
    },
    '& .MuiInputLabel-root': {
      color: '#aaa'
    },
    '& .MuiSvgIcon-root': {
      color: '#fff'
    },
    '& .MuiOutlinedInput-root.Mui-focused fieldset': {
      borderColor: '#6366f1'
    }
  };

  return (
    <Box sx={{
      p: 3,
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>

      <Typography variant="h4" sx={{
        mb: 3,
        color: "#fff",
        fontWeight: 800
      }}>
        💰 Payroll Dashboard
      </Typography>

      {/* FILTER */}
      <Paper sx={{
        p: 3,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }
      }}>
        <Grid container spacing={2}>

          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Select Month"
              fullWidth
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': {
                height: 56,
                width: 250,
                paddingRight: '14px',
                color: '#fff' // text color inside input
              },
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                boxSizing: 'border-box',
                padding: '16.5px 14px',
                color: '#fff' // select text color
              },
              '& .MuiInputLabel-root': {
                color: '#aaa' // label color
              },
              '& .MuiSvgIcon-root': {
                color: '#fff' // dropdown arrow color
              }
            }}
            >
              <MenuItem value="">All Months</MenuItem>
              {[
                "January","February","March","April","May","June",
                "July","August","September","October","November","December"
              ].map(m => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>
          </Grid>

        </Grid>
      </Paper>

      {/* TABLE */}
      <Paper sx={{
        p: 2,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        mt: 3
      }}>

        <Typography variant="h6" sx={{ color: "#fff", mb: 2 }}>
          Payroll Records
        </Typography>

        <Table>
          <TableHead>
            <TableRow sx={{ background: "rgba(255,255,255,0.05)" }}>
              <TableCell sx={{ color: "#aaa" }}>Month</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Name</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Member ID</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Days</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Allowance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Net Salary</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {Array.isArray(data) && data.length > 0 ? (
              data.map((row, i) => (
                <TableRow key={i} sx={{
                  '&:hover': {
                    background: "rgba(255,255,255,0.08)"
                  }
                }}>
                  <TableCell sx={{ color: "#fff" }}>{row.month}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {formatMemberId(row.memberid)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.days_worked}</TableCell>
                  <TableCell sx={{ color: "#f59e0b" }}>
                    Rs. {Number(row.total_allowance || 0).toLocaleString()}
                  </TableCell>
                  <TableCell sx={{
                    color: "#22c55e",
                    fontWeight: 700
                  }}>
                    Rs. {Number(row.net_salary || 0).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ color: "#aaa" }}>
                  No payroll data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

      </Paper>
    </Box>
  );
}

export default Payroll;