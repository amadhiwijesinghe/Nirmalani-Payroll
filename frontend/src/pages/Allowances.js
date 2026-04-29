import { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
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

function Allowance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [month, setMonth] = useState("");
  const [amount, setAmount] = "";

  const [data, setData] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/employees")
      .then(res => setEmployees(res.data));

    fetchAllowance();
  }, []);

  useEffect(() => {
    fetchAllowance();
  }, [filterMonth]);

  const fetchAllowance = async () => {
    let url = "http://localhost:5000/allowance-summary";
    if (filterMonth) url += `?month=${filterMonth}`;

    const res = await axios.get(url);
    setData(res.data);
  };

  const handleSave = () => {
    if (!selectedEmployee || !month || !amount) {
      alert("Fill all fields");
      return;
    }

    axios.post("http://localhost:5000/allowance", {
      memberid: selectedEmployee.memberid,
      month,
      amount
    }).then(() => {
      setAmount("");
      setMonth("");
      setSelectedEmployee(null);
      fetchAllowance();
    });
  };

  const formatMemberId = (id) => {
    return String(id).padStart(6, "0");
  };

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
    }
  };

  const inputStyle = {
    '& .MuiOutlinedInput-root': {
      height: 56,
      color: '#fff'
    },
    '& .MuiInputLabel-root': {
      color: '#aaa'
    }
  };

  return (
    <Box sx={{
      p: 3,
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>

      <Typography variant="h4" sx={{ color: "#fff", mb: 3 }}>
        💸 Allowance Management
      </Typography>

      {/* FORM */}
      <Paper sx={{
        p: 3,
        mb: 4,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)"
      }}>
        <Grid container spacing={2}>

          {/* Employee */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Employee"
              fullWidth
              value={selectedEmployee ? selectedEmployee.memberid : ""}
              onChange={(e) => {
                const emp = employees.find(emp => emp.memberid == e.target.value);
                setSelectedEmployee(emp);
              }}
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
              <MenuItem value="">Select Employee</MenuItem>
              {employees.map(emp => (
                <MenuItem key={emp.memberid} value={emp.memberid}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Month */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Month"
              fullWidth
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': {
                height: 56,
                width: 160,
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
              <MenuItem value="">Select Month</MenuItem>
              {["January","February","March","April","May","June",
                "July","August","September","October","November","December"]
                .map(m => <MenuItem key={m}>{m}</MenuItem>)}
            </TextField>
          </Grid>

          {/* Amount */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Allowance Amount"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={inputStyle}
            />
          </Grid>

          {/* Save Button */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={handleSave}
              sx={{
                height: "100%",
                borderRadius: 3,
                fontWeight: 700,
                background: "linear-gradient(135deg,#f59e0b,#f97316)",
                color: "#000",
                boxShadow: "0 5px 20px rgba(245,158,11,0.4)",
                transition: "0.2s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 10px 25px rgba(99,102,241,0.5)"
                }
              }}
            >
              Save
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {/* 🔥 ALLOWANCE SUMMARY BACK */}
      <Paper sx={{
        p: 2,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)"
      }}>

        <Typography variant="h6" sx={{ color: "#fff" }}>
          Allowance Summary
        </Typography>

        {/* Filter */}
        <TextField
          select
          label="Filter Month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          sx={{ ...selectStyle, mt: 2, width: 220 }}
        >
          <MenuItem value="">All Months</MenuItem>
          {["January","February","March","April","May","June",
            "July","August","September","October","November","December"]
            .map(m => <MenuItem key={m}>{m}</MenuItem>)}
        </TextField>

        {/* Table */}
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow sx={{ background: "rgba(255,255,255,0.05)" }}>
              <TableCell sx={{ color: "#aaa" }}>Month</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Name</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Member ID</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Allowance</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length > 0 ? (
              data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell sx={{ color: "#fff" }}>{row.month}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{formatMemberId(row.memberid)}</TableCell>
                  <TableCell sx={{ color: "#f59e0b", fontWeight: 600 }}>
                    Rs. {row.amount}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} sx={{ color: "#aaa" }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

      </Paper>

    </Box>
  );
}

export default Allowance;