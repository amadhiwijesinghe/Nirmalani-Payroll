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

const API = "https://nirmalani-payroll-production.up.railway.app";

function Allowance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState("");

  const [data, setData] = useState([]);
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    axios.get(`${API}/employees`)
      .then(res => setEmployees(res.data));

    fetchAllowance();
  }, []);

  useEffect(() => {
    fetchAllowance();
  }, [filterMonth]);

  const fetchAllowance = async () => {
    let url = `${API}/allowance-summary`;
    if (filterMonth) url += `?month=${filterMonth}`;

    const res = await axios.get(url);
    setData(res.data);
  };

  // ✅ FIXED HANDLE SAVE
  const handleSave = () => {

    console.log("SENDING:", {
      memberid: selectedEmployee?.memberid,
      month,
      amount
    });

    if (!selectedEmployee || !month || !amount) {
      alert("Fill all fields");
      return;
    }

    axios.post(`${API}/allowance`, {
      memberid: selectedEmployee.memberid,
      month,
      amount
    }).then(() => {
      alert("Saved successfully ✅");
      setAmount("");
      setMonth("");
      setSelectedEmployee(null);
      fetchAllowance();
    });
  };

  const formatMemberId = (id) => {
    return String(id).padStart(6, "0");
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

          {/* Month (🔥 FIXED) */}
          <Grid item xs={12} md={3}>
            <TextField
              select
              label="Month"
              fullWidth
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': {
                height: 56,
                width: 120,
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
              {[
                "January","February","March","April","May","June",
                "July","August","September","October","November","December"
              ].map(m => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Amount */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Allowance Amount"
              fullWidth
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>

          {/* Save Button */}
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={handleSave}
              variant="contained"
            >
              Save
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {/* SUMMARY */}
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
          sx={{ mt: 2, width: 220 }}
        >
          <MenuItem value="">All Months</MenuItem>
          {[
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
          ].map(m => (
            <MenuItem key={m} value={m}>
              {m}
            </MenuItem>
          ))}
        </TextField>

        {/* Table */}
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Month</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Member ID</TableCell>
              <TableCell>Allowance</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length > 0 ? (
              data.map((row, i) => (
                <TableRow key={i}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{formatMemberId(row.memberid)}</TableCell>
                  <TableCell>Rs. {row.amount}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4}>
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