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
  Select,
  MenuItem,
  FormControl,
  InputLabel
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
    const res = await axios.get(`${API}/plantation-workers`);
    setWorkers(res.data);
  };

  const fetchData = async () => {
    const res = await axios.get(`${API}/plantation-data`);
    setData(res.data);
  };

  const addWorker = async () => {
    if (!name || !rate) return alert("Enter name and rate");

    await axios.post(`${API}/plantation-workers`, {
      name,
      rate_per_day: rate,
    });

    setName("");
    setRate("");
    fetchWorkers();
  };

  const addAttendance = async () => {
    if (!workerId || !days || !month)
      return alert("Fill all fields");

    await axios.post(`${API}/plantation-attendance`, {
      worker_id: workerId,
      days_worked: days,
      month,
    });

    setDays("");
    setMonth("");
    fetchData();
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

  // 🔥 GRAND TOTAL
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
    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
      }}
    >
      {/* HEADER */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 800,
          color: "#fff",
        }}
      >
        🌿 Plantation Payroll Dashboard
      </Typography>

      {/* ADD WORKER */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              label="Worker Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <TextField
              label="Rate per Day"
              fullWidth
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={addWorker}
              sx={{
                height: "100%",
                borderRadius: 3,
                fontWeight: 700,
                background: "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
              }}
            >
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* ATTENDANCE */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          backdropFilter: "blur(20px)",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#aaa" }}>Worker</InputLabel>
              <Select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                sx={{ color: "#fff" }}
              >
                <MenuItem value="">Select Worker</MenuItem>
                {workers.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Days"
              fullWidth
              value={days}
              onChange={(e) => setDays(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Month"
              fullWidth
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              onClick={addAttendance}
              sx={{
                height: "100%",
                borderRadius: 3,
                fontWeight: 700,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff",
              }}
            >
              Save
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* TABLE */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#aaa" }}>Name</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Days</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Rate</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Amount</TableCell>
              <TableCell sx={{ color: "#aaa" }}>EPF 8%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Deduction</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Balance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>EPF 12%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>EPF 20%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>ETF</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => {
              const c = calculate(row.days_worked || 0, row.rate_per_day);

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.days_worked}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.rate_per_day}</TableCell>

                  <TableCell sx={{ color: "#22c55e" }}>
                    {c.amount.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#facc15" }}>
                    {c.epf_8.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#f87171" }}>
                    {c.total_deduction.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#38bdf8" }}>
                    {c.balance.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#a78bfa" }}>
                    {c.epf_12.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#fb7185" }}>
                    {c.epf_20.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#34d399" }}>
                    {c.etf.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* 🔥 GRAND TOTAL */}
            <TableRow sx={{ background: "rgba(255,255,255,0.08)" }}>
              <TableCell colSpan={3} sx={{ color: "#fff", fontWeight: "bold" }}>
                TOTAL
              </TableCell>

              <TableCell sx={{ color: "#22c55e", fontWeight: "bold" }}>
                {totals.amount.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#facc15", fontWeight: "bold" }}>
                {totals.epf_8.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#f87171", fontWeight: "bold" }}>
                {totals.total_deduction.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                {totals.balance.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#a78bfa", fontWeight: "bold" }}>
                {totals.epf_12.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#fb7185", fontWeight: "bold" }}>
                {totals.epf_20.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#34d399", fontWeight: "bold" }}>
                {totals.etf.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}