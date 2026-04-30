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
  Box
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
    if (!workerId || !days || !month) return alert("Fill all fields");

    await axios.post(`${API}/plantation-attendance`, {
      worker_id: workerId,
      days_worked: days,
      month,
    });

    setDays("");
    setMonth("");
    fetchData();
  };

  // 🔥 CALCULATION
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
        sx={{ mb: 3, fontWeight: 800, color: "#fff" }}
      >
        🌿 Plantation Payroll Dashboard
      </Typography>

      {/* ADD WORKER */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Typography sx={{ color: "#fff", mb: 2 }}>
          Add Worker
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': {
                height: 56,
                width: 300,
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
                background: "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                fontWeight: 700,
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
          background: "rgba(255,255,255,0.05)",
        }}
      >
        <Typography sx={{ color: "#fff", mb: 2 }}>
          Add Attendance
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Worker"
              SelectProps={{ native: true }}
              onChange={(e) => setWorkerId(e.target.value)}
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
              <option>Select Worker</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Days Worked"
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
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff",
                fontWeight: 700,
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
        }}
      >
        <Table>
          <TableHead>
            <TableRow>
              {[
                "Name",
                "Days",
                "Rate",
                "Amount",
                "EPF 8%",
                "Deduction",
                "Balance",
                "EPF 12%",
                "EPF 20%",
                "ETF",
              ].map((h) => (
                <TableCell key={h} sx={{ color: "#aaa" }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row) => {
              const c = calculate(
                row.days_worked || 0,
                row.rate_per_day
              );

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>
                    {row.name}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {row.days_worked}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {row.rate_per_day}
                  </TableCell>

                  <TableCell sx={{ color: "#22c55e" }}>
                    {c.amount.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {c.epf_8.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {c.total_deduction.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#22c55e" }}>
                    {c.balance.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {c.epf_12.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {c.epf_20.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {c.etf.toFixed(2)}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* TOTAL ROW */}
            <TableRow
              sx={{
                background: "rgba(255,255,255,0.1)",
                fontWeight: "bold",
              }}
            >
              <TableCell colSpan={3} sx={{ color: "#fff" }}>
                GRAND TOTAL
              </TableCell>
              <TableCell sx={{ color: "#22c55e" }}>
                {totals.amount.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#fff" }}>
                {totals.epf_8.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#fff" }}>
                {totals.total_deduction.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#22c55e" }}>
                {totals.balance.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#fff" }}>
                {totals.epf_12.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#fff" }}>
                {totals.epf_20.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#fff" }}>
                {totals.etf.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}