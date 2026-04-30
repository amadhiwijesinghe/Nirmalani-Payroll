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
  Typography,
  Grid,
  Box,
  MenuItem
} from "@mui/material";

const API = "https://nirmalani-payroll-production.up.railway.app";

export default function PlantationPayroll() {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [name, setName] = useState("");
  const [rate, setRate] = useState("");

  const [workerId, setWorkerId] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("");

  useEffect(() => {
    fetchWorkers();
    fetchData();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(`${API}/plantation-workers`);
      console.log("workers:", res.data);
      setWorkers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API}/plantation-data`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addWorker = async () => {
    if (!name || !rate) return alert("Enter name and rate");

    try {
      await axios.post(`${API}/plantation-workers`, {
        name,
        rate_per_day: rate,
      });

      setName("");
      setRate("");
      fetchWorkers();
    } catch (err) {
      console.error(err);
      alert("Error adding worker");
    }
  };

  const addAttendance = async () => {
    if (!workerId || !days || !month)
      return alert("Fill all fields");

    try {
      await axios.post(`${API}/plantation-attendance`, {
        worker_id: workerId,
        days_worked: days,
        month,
      });

      setDays("");
      setMonth("");
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Error saving attendance");
    }
  };

  // 🔥 CALCULATE
  const calculate = (days, rate) => {
    const amount = days * rate;

    const epf_8 = amount * 0.08;
    const epf_12 = amount * 0.12;
    const epf_20 = epf_8 + epf_12;
    const etf = amount * 0.03;

    const total_deduction = epf_8;
    const balance = amount - total_deduction;

    return {
      amount,
      epf_8,
      epf_12,
      epf_20,
      etf,
      total_deduction,
      balance,
    };
  };

  // 🔥 TOTALS
  const totals = data.reduce(
    (acc, row) => {
      const c = calculate(row.days_worked || 0, row.rate_per_day);

      acc.amount += c.amount;
      acc.epf_8 += c.epf_8;
      acc.epf_12 += c.epf_12;
      acc.epf_20 += c.epf_20;
      acc.etf += c.etf;
      acc.total_deduction += c.total_deduction;
      acc.balance += c.balance;

      return acc;
    },
    {
      amount: 0,
      epf_8: 0,
      epf_12: 0,
      epf_20: 0,
      etf: 0,
      total_deduction: 0,
      balance: 0,
    }
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        🌿 Plantation Payroll
      </Typography>

      {/* ADD WORKER */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ mb: 2 }}>Add Worker</Typography>

        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          <Grid item xs={4}>
            <TextField
              label="Rate per Day"
              fullWidth
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
          </Grid>

          <Grid item xs={4}>
            <Button fullWidth onClick={addWorker} variant="contained">
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ATTENDANCE */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography sx={{ mb: 2 }}>Add Attendance</Typography>

        <Grid container spacing={2}>
          <Grid item xs={3}>
            <TextField
              select
              fullWidth
              label="Worker"
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
            >
              <MenuItem value="">Select Worker</MenuItem>

              {workers.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={3}>
            <TextField
              label="Days"
              fullWidth
              value={days}
              onChange={(e) => setDays(e.target.value)}
            />
          </Grid>

          <Grid item xs={3}>
            <TextField
              label="Month"
              fullWidth
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </Grid>

          <Grid item xs={3}>
            <Button fullWidth onClick={addAttendance} variant="contained">
              Save
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Rate</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>EPF 8%</TableCell>
              <TableCell>Deduction</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell>EPF 12%</TableCell>
              <TableCell>EPF 20%</TableCell>
              <TableCell>ETF</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => {
              const c = calculate(row.days_worked || 0, row.rate_per_day);

              return (
                <TableRow key={row.id}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.days_worked}</TableCell>
                  <TableCell>{row.rate_per_day}</TableCell>
                  <TableCell>{c.amount.toFixed(2)}</TableCell>
                  <TableCell>{c.epf_8.toFixed(2)}</TableCell>
                  <TableCell>{c.total_deduction.toFixed(2)}</TableCell>
                  <TableCell>{c.balance.toFixed(2)}</TableCell>
                  <TableCell>{c.epf_12.toFixed(2)}</TableCell>
                  <TableCell>{c.epf_20.toFixed(2)}</TableCell>
                  <TableCell>{c.etf.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}

            <TableRow>
              <TableCell colSpan={3}>TOTAL</TableCell>
              <TableCell>{totals.amount.toFixed(2)}</TableCell>
              <TableCell>{totals.epf_8.toFixed(2)}</TableCell>
              <TableCell>{totals.total_deduction.toFixed(2)}</TableCell>
              <TableCell>{totals.balance.toFixed(2)}</TableCell>
              <TableCell>{totals.epf_12.toFixed(2)}</TableCell>
              <TableCell>{totals.epf_20.toFixed(2)}</TableCell>
              <TableCell>{totals.etf.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}