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

  const [date, setDate] = useState("");

  const [filterMonth, setFilterMonth] = useState("");

  const [attendanceDates, setAttendanceDates] = useState([]);
  const [open, setOpen] = useState(false);
  
  const [selectedEpf, setSelectedEpf] = useState("");
  const [epf, setEpf] = useState("");

  useEffect(() => {
    fetchWorkers();
    fetchData();
    
  }, []);

  useEffect(() => {
  if (workerId && month) {
    fetchDaysWorked(workerId, month);
  }
}, [workerId, month]);

  const fetchWorkers = async () => {
    const res = await axios.get(`${API}/plantation-workers`);
    setWorkers(res.data);
  };

const fetchData = async () => {
  try {
    const res = await axios.get(`${API}/plantation-data`);
    console.log("NEW DATA:", res.data); // 👈 ADD THIS
    setData(res.data);
  } catch (err) {
    console.error(err);
  }
};
  const fetchDaysWorked = async (worker, monthVal) => {
  if (!worker || !monthVal) return;

  try {
    const res = await axios.get(
      `${API}/plantation-attendance-days`,
      {
        params: {
          worker_id: worker,
          month: monthVal,
        },
      }
    );

    setDays(res.data.days);
  } catch (err) {
    console.error(err);
  }
};

  const addWorker = async () => {
    if (!name || !rate) return alert("Enter name and rate");

    await axios.post(`${API}/plantation-workers`, {
      name,
      rate_per_day: rate,
      epf_no: epf
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

const viewAttendance = async (workerId, month) => {

  console.log("CLICKED →", workerId, month); // 👈 ADD THIS

  if (!workerId) {
    alert("Worker ID is missing!");
    return;
  }

  try {
    const res = await axios.get(`${API}/plantation-attendance-dates`, {
      params: {
        worker_id: workerId,
        month: month,
      },
    });

    console.log("DATA:", res.data); // 👈 ADD THIS

    setAttendanceDates(res.data);
    setOpen(true);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

const addDailyAttendance = async () => {
  if (!workerId || !date) {
    alert("Select worker and date");
    return;
  }

  try {
    // 1. Save daily attendance
    await axios.post(`${API}/plantation-daily-attendance`, {
      worker_id: workerId,
      date,
      status: "present"
    });

    // 2. Extract month from date
    const selectedMonth = date.substring(0, 7); // "2026-05"

    // 3. Get total days for that month
    const res = await axios.get(`${API}/plantation-attendance-days`, {
      params: {
        worker_id: workerId,
        month: selectedMonth
      }
    });

    const daysWorked = res.data.days;

 // 4. SAVE / UPDATE monthly attendance automatically
    await axios.post(`${API}/plantation-attendance`, {
      worker_id: workerId,
      days_worked: daysWorked,
      month: selectedMonth
    });

   // 🔥 Refresh table ONLY ONCE (clean way)
    await fetchData();

    alert("✅ Attendance marked & updated!");

  } catch (err) {
    if (err.response?.data === "Already marked for this date") {
      alert("⚠️ Already marked for this date");
    } else {
      console.error(err);
    }
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

  // 🔥 GRAND TOTAL

  const groupedData = Object.values(
  data.reduce((acc, row) => {
    const key = `${row.worker_id}-${row.month}`;
    acc[key] = row;
    return acc;
  }, {})
);


const totals = groupedData
  .filter((row) =>
    row.days_worked > 0 &&
    row.month && 
    (!filterMonth || row.month === filterMonth)
  )
  .reduce(
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

  const generateSlipHTML = (row, c) => {
  return `
    <div class="slip">
      <h3 style="text-align:center; margin-bottom:5px;">
        NIRMALANI PLANTATION
      </h3>

      <p><b>Name:</b> ${row.name}</p>
      <p><b>EPF No:</b> ${row.epf_no || "-"}</p>
      <p><b>Month:</b> ${row.month}</p>

      <hr/>

      <table style="width:100%; font-size:12px;">
        <tr>
          <td>Days Worked</td>
          <td style="text-align:right;">${row.days_worked}</td>
        </tr>
        <tr>
          <td>Rate per Day</td>
          <td style="text-align:right;">${row.rate_per_day}</td>
        </tr>
        <tr>
          <td><b>Total Pay</b></td>
          <td style="text-align:right;">${c.amount.toFixed(2)}</td>
        </tr>
      </table>

      <hr/>

      <table style="width:100%; font-size:12px;">
        <tr>
          <td>EPF 8%</td>
          <td style="text-align:right;">${c.epf_8.toFixed(2)}</td>
        </tr>
        <tr>
          <td>EPF 12%</td>
          <td style="text-align:right;">${c.epf_12.toFixed(2)}</td>
        </tr>
        <tr>
          <td>ETF 3%</td>
          <td style="text-align:right;">${c.etf.toFixed(2)}</td>
        </tr>
        <tr>
          <td><b>Balance Pay</b></td>
          <td style="text-align:right;"><b>${c.balance.toFixed(2)}</b></td>
        </tr>
      </table>

      <hr/>

      <div style="
        border: 1px solid black;
        height: 30px;
        display: flex;
        align-items: flex-end;
        justify-content: left;
        font-size: 11px;
        margin-top: auto;
      ">
        Signature
      </div>
    </div>
  `;
};


const printSlip = () => {

  const rowsToPrint = groupedData
    .filter(row => row.days_worked > 0 && (!filterMonth || row.month === filterMonth))
    .slice(0, 4); // 👈 first 4 workers

  const slips = rowsToPrint.map(row => {
    const c = calculate(row.days_worked || 0, row.rate_per_day);
    return generateSlipHTML(row, c);
  }).join("");

  const html = `
    <html>
      <head>
        <title>Payslip</title>
        <style>
          body {
            font-family: Arial;
            padding: 10px;
          }

          .page {
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 10px;
          }

          .slip {
            border: 2px solid black;
            padding: 10px;
            font-size: 12px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
        </style>
      </head>

      <body>
        <div class="page">
          ${slips}
        </div>

        <script>
          window.print();
        </script>
      </body>
    </html>
  `;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
};

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

          <Grid item xs={12} md={5}>
            <TextField
              label="EPF Number"
              fullWidth
              value={epf}
              onChange={(e) => setEpf(e.target.value)}
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

      {/* DAILY ATTENDANCE */}
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
          <Typography sx={{ color: "#fff", mb: 2 }}>
            📅 Daily Attendance
          </Typography>

          <Grid container spacing={2}>

            {/* Worker */}
            <Grid item xs={12} md={3}>
              <FormControl sx={{ width: 250 }}>
                <InputLabel sx={{ color: "#aaa" }}>Worker</InputLabel>
                <Select
                  value={workerId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setWorkerId(id);

                    const selectedWorker = workers.find(w => w.id === id);
                    setSelectedEpf(selectedWorker?.epf_no || "");
                  }}
                  sx={{ width: 250, color: "#fff" }}
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
                label="EPF Number"
                value={selectedEpf}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
              />
            </Grid>

            {/* Date */}
            <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{ input: { color: "#fff" } }}
              />
            </Grid>

            {/* Button */}
            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                onClick={addDailyAttendance}
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  background: "linear-gradient(135deg,#22c55e,#4ade80)",
                  color: "#000",
                }}
              >
                Mark Present
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
        <Box sx={{ mb: 2 }}>
          <TextField
            type="month"
            label="Filter by Month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            sx={{
              input: { color: "#fff" },
              label: { color: "#aaa" },
              width: 200
            }}
          />

            {/* Clear Button */}
            <Button
              onClick={() => setFilterMonth("")}
              sx={{
                ml: 2,
                background: "#475569",
                color: "#fff",
                height: "56px"
              }}
            >
              Clear
            </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#aaa" }}>Name</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Month</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Days</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Rate</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Amount</TableCell>
              <TableCell sx={{ color: "#aaa" }}>EPF 8%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Deduction</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Balance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>EPF 12%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>EPF 20%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>ETF</TableCell>
              <TableCell>View</TableCell> 
            </TableRow>
          </TableHead>

          <TableBody>
            {groupedData
              .filter((row) =>
                row.days_worked > 0 &&
                (!filterMonth || row.month === filterMonth)
              )
              .map((row) => {
              const c = calculate(row.days_worked || 0, row.rate_per_day);

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.month}</TableCell>
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
                  <TableCell>
                    <Button
                      onClick={() => viewAttendance(row.id, row.month)}
                      sx={{ background: "#38bdf8", color: "#000" }}
                    >
                      View
                    </Button>
                    <Button
                      onClick={printSlip}
                      sx={{ background: "#22c55e", color: "#000" }}
                    >
                      Print
                    </Button>
                  </TableCell>

                </TableRow>
              );
            })}

            {/* 🔥 GRAND TOTAL */}
            <TableRow sx={{ background: "rgba(255,255,255,0.08)" }}>
              <TableCell colSpan={4} sx={{ color: "#fff", fontWeight: "bold" }}>
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
      {open && (
  <Paper sx={{ p: 2, mt: 2, background: "#0f172a" }}>
    <Typography sx={{ color: "#fff", mb: 1 }}>
      Worked Days:
    </Typography>

    {attendanceDates.length === 0 ? (
      <Typography sx={{ color: "#aaa" }}>
        No attendance found
      </Typography>
    ) : (
      attendanceDates.map((d, i) => (
        <Typography key={i} sx={{ color: "#38bdf8" }}>
          {d.date}
        </Typography>
      ))
    )}

    <Button
      onClick={() => setOpen(false)}
      sx={{ mt: 1, background: "#475569", color: "#fff" }}
    >
      Close
    </Button>
  </Paper>
)}
    </Box>
  );
}