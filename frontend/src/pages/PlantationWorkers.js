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

export default function PlantationWorkers({ setPage }) {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [name, setName] = useState("");

  const [workerId, setWorkerId] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("");
  const [allowance, setAllowance] = useState("");
  const [dailyRate, setDailyRate] = useState("");

  const [date, setDate] = useState("");

  const [filterMonth, setFilterMonth] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  const [attendanceDates, setAttendanceDates] = useState([]);
  const [open, setOpen] = useState(false);
  
  const [selectedEpf, setSelectedEpf] = useState("");
  const [epf, setEpf] = useState("");

  const [search, setSearch] = useState("");
  const [editingWorker, setEditingWorker] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEpf, setEditEpf] = useState("");

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
    console.log("NEW DATA:", res.data);
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
    if (!name || !epf) return alert("Enter name and EPF Number");

    await axios.post(`${API}/plantation-workers`, {
      name,
      epf_no: epf
    });

    alert("✅ Worker Added Successfully!");

    setName("");
    setEpf("");
    fetchWorkers();
  };

  const addAttendance = async () => {
    if (!workerId || !days || !month)
      return alert("Fill all fields");

    await axios.post(`${API}/plantation-attendance`, {
      worker_id: workerId,
      days_worked: days,
      month,
      allowance,
      rate_per_day: dailyRate
    });

    alert("✅ Worker Attendance Added Successfully!");

    setDays("");
    setMonth("");
    fetchData();
    setAllowance("");
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

    console.log("DATA:", res.data);

    setAttendanceDates(res.data);
    setOpen(true);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }
};

const addDailyAttendance = async () => {
  if (!workerId || !date || !dailyRate) {
    alert("Enter worker, date and rate");
    return;
  }

  try {

    // CHECK IF SUNDAY
    const dayName = new Date(date).getDay();

    console.log("dailyRate =", dailyRate);
    // Sunday = 0
    const finalRate =
      dayName === 0
        ? Number(dailyRate) * 1.5
        : Number(dailyRate);
    // Save daily attendance
    await axios.post(`${API}/plantation-daily-attendance`, {
      worker_id: workerId,
      date,
      status: "present",
      rate_per_day: finalRate
    });

    // Extract month from date
    const selectedMonth = date.substring(0, 7);

    // Get total days for that month
    const res = await axios.get(`${API}/plantation-attendance-days`, {
      params: {
        worker_id: workerId,
        month: selectedMonth
      }
    });

    const daysWorked = res.data.days;

    console.log("dailyRate =", dailyRate);
    console.log("finalRate =", finalRate);

 // SAVE / UPDATE monthly attendance automatically
   await axios.post(`${API}/plantation-attendance`, {
      worker_id: workerId,
      days_worked: daysWorked,
      month: selectedMonth,
      rate_per_day: finalRate,
      allowance
    });

   // 🔥 Refresh table ONLY ONCE (clean way)
    await fetchData();

    if (dayName === 0) {

      alert(
        `✅ Sunday attendance marked!\nSunday Rate Applied: Rs.${finalRate}`
      );

    } else {

      alert("✅ Attendance marked & updated!");
    }

  } catch (err) {
    if (err.response?.data === "Already marked for this date") {
      alert("⚠️ Already marked for this date");
    } else {
      console.error(err);
    }
  }
};


  // 🔥 CALCULATE
  const calculate = (days, rate, allowance = 0) => {
    const amount = (days * rate) + Number(allowance || 0);
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
      allowance,
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
      const c = calculate(row.days_worked || 0, row.rate_per_day, row.allowance || 0);

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

  const rows = groupedData
    .filter(row => row.days_worked > 0 && (!filterMonth || row.month === filterMonth));

  let pagesHTML = "";

  for (let i = 0; i < rows.length; i += 2) {
    const chunk = rows.slice(i, i + 2);

    const slips = chunk.map(row => {
      const c = calculate(row.days_worked || 0, row.rate_per_day, row.allowance || 0);
      return generateSlipHTML(row, c);
    }).join("");

    pagesHTML += `
      <div class="page">
        ${slips}
      </div>
    `;
  }

  const html = `
    <html>
      <head>
        <title>Payslip</title>
        <style>
          body {
            font-family: Arial;
            padding: 10px;
          }

          @page {
            size: A4 portrait;
            margin: 5mm;
          }

          body {
            font-family: Arial;
            margin: 0;
            padding: 0;
          }

          .page {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5mm;
            page-break-after: always;
            padding-top: 5mm;
          }

          .slip {
            width: 180mm;
            height: 120mm;
            border: 2px solid black;
            padding: 8mm;
            box-sizing: border-box;
            font-size: 12px;

            display: flex;
            flex-direction: column;
            justify-content: space-between;

            overflow: hidden;
          }
        </style>
      </head>

      <body>
        ${pagesHTML}

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

const deleteAttendance = async (id) => {

  if (!window.confirm("Delete attendance?")) return;

  try {

    await axios.delete(
      `${API}/plantation-daily-attendance/${id}`
    );

    alert("✅ Attendance Deleted");

    setAttendanceDates(
      attendanceDates.filter(d => d.id !== id)
    );

    fetchData();

  } catch (err) {

    console.error(err);

    alert("❌ Error deleting attendance");
  }
};

const deletePayroll = async (workerId, month) => {

  if (!window.confirm("Delete this payroll record?")) {
    return;
  }

  try {

    await axios.delete(
      `${API}/plantation-attendance`,
      {
        params: {
          worker_id: workerId,
          month: month
        }
      }
    );

    alert("✅ Payroll Deleted");

    fetchData();

  } catch (err) {

    console.error(err);

    alert("❌ Delete failed");
  }
};

const editPayroll = async (row) => {

  const newRate = prompt(
    "Enter new rate",
    row.rate_per_day
  );

  if (!newRate) return;

  try {

    await axios.put(
      `${API}/plantation-attendance`,
      {
        worker_id: row.worker_id,
        month: row.month,
        rate_per_day: newRate
      }
    );

    alert("✅ Payroll Updated");

    fetchData();

  } catch (err) {

    console.error(err);

    alert("❌ Update failed");
  }
};

const updateWorker = async () => {

  if (!editName || !editEpf) {
    return alert("Enter worker name and EPF");
  }

  try {

    await axios.put(
      `${API}/plantation-workers/${editingWorker.id}`,
      {
        name: editName,
        epf_no: editEpf
      }
    );

    alert("✅ Worker Updated");

    setEditingWorker(null);

    fetchWorkers();

  } catch (err) {

    console.error(err);

    alert("❌ Update failed");
  }
};

const printWeeklyReport = () => {

  if (!weekStart || !weekEnd) {
    alert("Select week range");
    return;
  }

  const weeklyRows = attendanceDates.filter((d) => {

    const current = new Date(d.date);

    return (
      current >= new Date(weekStart) &&
      current <= new Date(weekEnd)
    );
  });

  if (weeklyRows.length === 0) {
    alert("No attendance found");
    return;
  }

  let total = 0;

  const workerName =
    workers.find(w => w.id === workerId)?.name || "";

  const rowsHTML = weeklyRows.map((d) => {

    total += Number(d.rate_per_day || 0);

    return `
      <tr>
        <td>${workerName}</td>

        <td>
          ${new Date(d.date).toLocaleDateString(
            "en-CA"
          )}
        </td>

        <td>
          Rs.${Number(d.rate_per_day).toFixed(2)}
        </td>
      </tr>
    `;
  }).join("");

  const html = `
    <html>

      <head>

        <title>Weekly Report</title>

        <style>

          body{
            font-family: Arial;
            padding:20px;
          }

          h2{
            text-align:center;
          }

          table{
            width:100%;
            border-collapse: collapse;
            margin-top:20px;
          }

          th,td{
            border:1px solid #000;
            padding:10px;
            text-align:left;
          }

          th{
            background:#f1f5f9;
          }

        </style>

      </head>

      <body>

        <h2>
          Nirmalani Plantation Weekly Report
        </h2>

        <p>
          <b>From:</b> ${weekStart}
          <br/>
          <b>To:</b> ${weekEnd}
        </p>

        <table>

          <thead>

            <tr>
              <th>Worker Name</th>
              <th>Date Worked</th>
              <th>Rate</th>
            </tr>

          </thead>

          <tbody>
            ${rowsHTML}
          </tbody>

        </table>

        <h3 style="margin-top:20px;">
          Weekly Total:
          Rs.${total.toFixed(2)}
        </h3>

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

const printMonthlyReport = () => {

  if (!filterMonth) {
    alert("Select month");
    return;
  }

  const rows = groupedData.filter(
    (row) => row.month === filterMonth
  );

  let grandTotal = 0;

  const rowsHTML = rows.map((row) => {

    const c = calculate(
      row.days_worked,
      row.rate_per_day,
      row.allowance
    );

    grandTotal += c.balance;

    return `
      <tr>
        <td>${row.name}</td>
        <td>${row.days_worked}</td>
        <td>${row.rate_per_day}</td>
        <td>${c.balance.toFixed(2)}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <html>

      <head>

        <title>Monthly Report</title>

        <style>

          body{
            font-family: Arial;
            padding:20px;
          }

          table{
            width:100%;
            border-collapse: collapse;
          }

          th,td{
            border:1px solid #000;
            padding:8px;
          }

        </style>

      </head>

      <body>

        <h2>
          Monthly Payroll Report
        </h2>

        <h3>
          Month: ${filterMonth}
        </h3>

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Days</th>
              <th>Rate</th>
              <th>Net Salary</th>
            </tr>
          </thead>

          <tbody>
            ${rowsHTML}
          </tbody>

        </table>

        <h3>
          Grand Total:
          Rs.${grandTotal.toFixed(2)}
        </h3>

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
        <Grid
          container
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
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
          <Grid
            item
            xs={12}
            sm={6}
            md="auto"
            sx={{
              ml: {
                md: "auto"
              }
            }}
          >
                      <Button
              fullWidth
              onClick={() =>
                setPage("casualworkers")
              }
              sx={{
                height: "100%",

                borderRadius: 3,

                fontWeight: 700,

                background:
                  "linear-gradient(135deg,#f59e0b,#f97316)",

                color: "#fff",

                '&:hover': {
                  background:
                    "linear-gradient(135deg,#d97706,#ea580c)"
                }
              }}
            >
              Casual Workers
            </Button>

          </Grid>
        </Grid>
      </Paper>

      {/* SEARCH & EDIT WORKERS */}
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
          🔍 Search Plantation Workers
        </Typography>

        <TextField
          fullWidth
          label="Search Worker"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 3,
            input: { color: "#fff" },
            label: { color: "#aaa" }
          }}
        />

        {search.trim() !== "" &&
        workers
          .filter((w) => {

            const searchText = search.toLowerCase();

            return (
              w.name.toLowerCase().includes(searchText) ||
              String(w.epf_no).includes(searchText)
            );
          })
          .map((w) => (

            <Box
              key={w.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                p: 2,
                borderRadius: 2,
                background: "rgba(255,255,255,0.05)"
              }}
            >

              <Box>
                <Typography sx={{ color: "#fff" }}>
                  {w.name}
                </Typography>

                <Typography sx={{ color: "#94a3b8" }}>
                  EPF: {w.epf_no}
                </Typography>
              </Box>

              <Button
                onClick={() => {

                  setEditingWorker(w);

                  setEditName(w.name);

                  setEditEpf(w.epf_no);
                }}
                sx={{
                  background: "#facc15",
                  color: "#000"
                }}
              >
                Edit
              </Button>

            </Box>
          ))}

        </Paper>

        {/* EDIT WORKER */}
        {editingWorker && (

          <Paper
            sx={{
              p: 3,
              mt: 3,
              mb: 4,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 5,
              backdropFilter: "blur(20px)"
            }}
          >

            <Typography sx={{ color: "#fff", mb: 2 }}>
              ✏️ Edit Worker
            </Typography>

            <Grid container spacing={2}>

              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="Worker Name"
                  value={editName}
                  onChange={(e) =>
                    setEditName(e.target.value)
                  }
                  sx={{
                    input: { color: "#fff" },
                    label: { color: "#aaa" }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  label="EPF Number"
                  value={editEpf}
                  onChange={(e) =>
                    setEditEpf(e.target.value)
                  }
                  sx={{
                    input: { color: "#fff" },
                    label: { color: "#aaa" }
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  onClick={updateWorker}
                  sx={{
                    height: "100%",
                    background: "#22c55e",
                    color: "#000"
                  }}
                >
                  Save
                </Button>
              </Grid>

            </Grid>
          </Paper>
        )}

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

            {/* Daily Rate */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Rate per Day"
                type="number"
                fullWidth
                value={dailyRate || ""}
                onChange={(e) => setDailyRate(e.target.value)}
                sx={{
                  input: { color: "#fff" },
                  label: { color: "#aaa" }
                }}
              />
            </Grid>

            {/* Allowance */}
            <Grid item xs={12} md={3}>
              <TextField
                label="Enter the Allowance"
                type="number"
                fullWidth
                value={allowance}
                onChange={(e) => setAllowance(e.target.value)}
                sx={{ input: { color: "#fff" } }}
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
                  fontWeight: "bold",
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
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            InputLabelProps={{
              shrink: true
            }}
            helperText="Filter By Month"
            sx={{
              ml: 2,
              width: 180,

              input: {
                color: "#fff"
              },

              '& .MuiFormHelperText-root': {
                color: '#aaa'
              },

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)'
              }
            }}
          />
          <TextField
            type="date"
            value={weekStart}
            onChange={(e) => setWeekStart(e.target.value)}
            InputLabelProps={{
              shrink: true
            }}
            helperText="Week Start"
            sx={{
              ml: 2,
              width: 180,

              input: {
                color: "#fff"
              },

              '& .MuiFormHelperText-root': {
                color: '#aaa'
              },

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)'
              }
            }}
          />

          <TextField
            type="date"
            value={weekEnd}
            onChange={(e) => setWeekEnd(e.target.value)}
            InputLabelProps={{
              shrink: true
            }}
            helperText="Week End"
            sx={{
              ml: 2,
              width: 180,

              input: {
                color: "#fff"
              },

              '& .MuiFormHelperText-root': {
                color: '#aaa'
              },

              '& input::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)'
              }
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

            <Button
              onClick={printSlip}
              sx={{
                ml: 2,
                background: "#22c55e",
                color: "#000",
                height: "56px",
                fontWeight: "bold"
              }}
            >
              PRINT PAYSLIPS
            </Button>

            <Button
              onClick={printWeeklyReport}
              sx={{
                ml: 2,
                background: "#0ea5e9",
                color: "#fff",
                height: "56px",
                fontWeight: "bold"
              }}
            >
              WEEKLY REPORT
            </Button>

            <Button
              onClick={printMonthlyReport}
              sx={{
                ml: 2,
                background: "#a855f7",
                color: "#fff",
                height: "56px",
                fontWeight: "bold"
              }}
            >
              MONTHLY REPORT
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
              <TableCell sx={{ color: "#aaa" }}>EPF 12%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>EPF 20%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>ETF</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Allowance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Net Salary</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Actions</TableCell> 
            </TableRow>
          </TableHead>

          <TableBody>
            {groupedData
              .filter((row) =>
                row.days_worked > 0 &&
                (!filterMonth || row.month === filterMonth)
              )

              .sort(
                (a, b) =>
                  Number(a.epf_no) - Number(b.epf_no)
              )
              .map((row) => {
              const c = calculate(row.days_worked || 0, row.rate_per_day, row.allowance || 0);

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.month}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.days_worked}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.rate_per_day}</TableCell>
                  <TableCell sx={{ color: "#22c55e" }}>{c.amount.toFixed(2)}</TableCell>
                  <TableCell sx={{ color: "#facc15" }}>
                    {c.epf_8.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#f87171" }}>
                    {c.total_deduction.toFixed(2)}
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
                  <TableCell sx={{ color: "#14b8a6" }}>
                    {row.allowance || 0}
                  </TableCell>
                  <TableCell sx={{ color: "#38bdf8" }}>
                    {c.balance.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap"
                      }}
                    >

                      {/* VIEW */}
                      <Button
                        size="small"
                        onClick={() =>
                          viewAttendance(row.worker_id, row.month)
                        }
                        sx={{
                          background: "#38bdf8",
                          color: "#000"
                        }}
                      >
                        View
                      </Button>

                      {/* EDIT */}
                      <Button
                        size="small"
                        onClick={() => editPayroll(row)}
                        sx={{
                          background: "#facc15",
                          color: "#000"
                        }}
                      >
                        Edit
                      </Button>

                      {/* DELETE */}
                      <Button
                        size="small"
                        onClick={() =>
                          deletePayroll(row.worker_id, row.month)
                        }
                        sx={{
                          background: "#ef4444",
                          color: "#fff"
                        }}
                      >
                        Delete
                      </Button>
                    </Box>
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
              <TableCell sx={{ color: "#a78bfa", fontWeight: "bold" }}>
                {totals.epf_12.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#fb7185", fontWeight: "bold" }}>
                {totals.epf_20.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#34d399", fontWeight: "bold" }}>
                {totals.etf.toFixed(2)}
              </TableCell>
              <TableCell sx={{ color: "#14b8a6", fontWeight: "bold" }}>
                {totals.allowance || 0}
              </TableCell>
              <TableCell sx={{ color: "#38bdf8", fontWeight: "bold" }}>
                {totals.balance.toFixed(2)}
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
      attendanceDates.map((d) => (

        <Box
          key={d.id}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 1
          }}
        >

          <Typography sx={{ color: "#38bdf8" }}>
            {new Date(d.date).toLocaleDateString(
              "en-CA",
              {
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
              }
            )}

            {" - "}

            {new Date(d.date).toLocaleDateString(
              "en-US",
              {
                weekday: "long"
              }
            )}

            {" - Rs."}

            {d.rate_per_day ?? 0}

          </Typography>

          <Button
            size="small"
            onClick={() =>
              deleteAttendance(d.id)
            }
            sx={{
              background: "#ef4444",
              color: "#fff"
            }}
          >
            Delete
          </Button>

        </Box>
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