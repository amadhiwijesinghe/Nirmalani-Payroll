import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
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
  InputLabel,
  Card,
  CardContent,
} from "@mui/material";

const API = "https://nirmalani-payroll-production.up.railway.app";

export default function PlantationWorkers({
  setPage,
  plantation
}) {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [name, setName] = useState("");

  const [month, setMonth] = useState("");
  const [allowance, setAllowance] = useState("");

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
  const [tableSearch, setTableSearch] = useState("");
  
  const [selectedWorkerName, setSelectedWorkerName] = useState("");

  const [dailyRate, setDailyRate] = useState(1550);
  const [editingRate, setEditingRate] = useState(false);

  const [allowanceWorker, setAllowanceWorker] = useState("");
  const [allowanceMonth, setAllowanceMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [allowanceAmount, setAllowanceAmount] = useState("");
  useEffect(() => {

      fetchWorkers();

      fetchData();

      fetchDailyRate();

  }, [plantation]);


  const fetchWorkers = async () => {
    const res = await axios.get(`${API}/plantation-workers?plantation=${plantation}`);
    setWorkers(res.data);
  };

const fetchData = async () => {
  try {
    const res = await axios.get(`${API}/plantation-data?plantation=${plantation}`);
    console.log("NEW DATA:", res.data);
    setData(res.data);
  } catch (err) {
    console.error(err);
  }
};

// Load the Rate
const fetchDailyRate = async () => {

  try {

    const res = await axios.get(
      `${API}/payroll-settings?plantation=${plantation}`
    );

    setDailyRate(res.data.daily_rate);

  } catch (err) {

    console.log(err);

  }

};

  const addWorker = async () => {
    if (!name || !epf) return alert("Enter name and EPF Number");

    await axios.post(`${API}/plantation-workers`, {
      name,
      epf_no: epf,
      plantation
    });

    alert("✅ Worker Added Successfully!");

    setName("");
    setEpf("");
    fetchWorkers();
  };


const viewAttendance = async (workerId, month, name) => {

  console.log("CLICKED →", workerId, month); 

  if (!workerId) {
    alert("Worker ID is missing!");
    return;
  }

  try {
    const res = await axios.get(`${API}/attendance-register/worker`, {
      params: {
        worker_id: workerId,
        month: month,
      },
    });

    console.log("DATA:", res.data);

    setSelectedWorkerName(name);
    setAttendanceDates(res.data);
    setOpen(true);

  } catch (err) {
    console.error(err);
    alert("Server error");
  }

  const workedDays = attendanceDates.reduce(
    (sum, d) => sum + Number(d.attendance_value),
    0
  );
};

// Save the Rate
const saveDailyRate = async () => {

  try {

    await axios.put(`${API}/payroll-settings`, {

      plantation,

      daily_rate: dailyRate

    });

    Swal.fire({

      icon: "success",

      title: "Success",

      text: "Daily Rate Updated"

    });

    setEditingRate(false);

    fetchDailyRate();

    fetchData();

  } catch (err) {

    console.log(err);

  }

};

// Save Allowance 
const saveAllowance = async () => {
  if (!allowanceWorker) {
    return alert("Select a worker");
  }

  try {
    await axios.post(`${API}/plantation-allowance`, {
      worker_id: allowanceWorker,
      month: allowanceMonth,
      allowance: allowanceAmount || 0
    });

    Swal.fire({
      icon: "success",
      title: "Saved",
      text: "Allowance Saved"
    });

    setAllowanceAmount("");

    fetchData();

  } catch (err) {
    console.log(err);
    alert("Error saving allowance");
  }
};

// 🔥 CALCULATE
const calculate = (amount, allowance = 0) => {

  const gross =
    Number(amount || 0) +
    Number(allowance || 0);

  const epf_8 = gross * 0.08;
  const epf_12 = gross * 0.12;
  const epf_20 = epf_8 + epf_12;
  const etf = gross * 0.03;

  const total_deduction = epf_8;

  const balance =
    gross - total_deduction;

  return {
    amount: gross,
    epf_8,
    epf_12,
    epf_20,
    etf,
    allowance,
    total_deduction,
    balance
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


const currentMonth = new Date()
  .toISOString()
  .slice(0, 7);

const selectedMonth =
  filterMonth || currentMonth;

const totals = groupedData
  .filter(
    (row) =>
      row.days_worked > 0 &&
      row.month === selectedMonth
  )
  .reduce(
    (acc, row) => {
      const c = calculate(
        row.amount,
        row.allowance
      );

      acc.amount += Number(row.amount || 0);
      acc.epf_8 += c.epf_8;
      acc.epf_12 += c.epf_12;
      acc.epf_20 += c.epf_20;
      acc.etf += c.etf;
      acc.total_deduction += c.total_deduction;
      acc.balance += c.balance;
      acc.allowance += Number(
        row.allowance || 0
      );

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
      allowance: 0,
    }
  );

  const totalRequired =
    totals.balance +
    totals.epf_20 +
    totals.etf;

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
      const c = calculate(
        row.amount || 0,
        row.allowance || 0
      );
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

const printWeeklyReport = async () => {

  if (!weekStart || !weekEnd) {
    alert("Select week range");
    return;
  }

  try {

    const res = await axios.get(
      `${API}/plantation-weekly-report`,
      {
        params: {
          weekStart,
          weekEnd
        }
      }
    );

    const weeklyRows = res.data;

    if (weeklyRows.length === 0) {
      alert("No attendance found");
      return;
    }

    let total = 0;

    const rowsHTML = weeklyRows.map((d) => {

      total += Number(
        d.rate_per_day || 0
      );

      return `
        <tr>

          <td>${d.name}</td>

          <td>${d.epf_no}</td>

          <td>
            ${d.date.split("T")[0]}
          </td>

          <td>
            Rs.${Number(
              d.rate_per_day
            ).toFixed(2)}
          </td>

        </tr>
      `;

    }).join("");

    const html = `
      <html>

      <head>

      <title>
        Weekly Report
      </title>

      <style>

      body{
        font-family:Arial;
        padding:20px;
      }

      table{
        width:100%;
        border-collapse:collapse;
      }

      th,td{
        border:1px solid black;
        padding:8px;
      }

      </style>

      </head>

      <body>

      <h2>
        Nirmalani Plantation Weekly Report
      </h2>

      <p>
        Week:
        ${weekStart}
        to
        ${weekEnd}
      </p>

      <table>

      <tr>

        <th>Name</th>
        <th>EPF</th>
        <th>Date</th>
        <th>Rate</th>

      </tr>

      ${rowsHTML}

      </table>

      <h3>
        Weekly Total:
        Rs.${total.toFixed(2)}
      </h3>

      <script>
        window.print();
      </script>

      </body>

      </html>
    `;

    const win =
      window.open("", "_blank");

    win.document.write(html);

    win.document.close();

  } catch (err) {

    console.error(err);

    alert("Error generating report");
  }
};

const printMonthlyReport = () => {

  if (!filterMonth) {
    alert("Select month");
    return;
  }

  const rows = groupedData
    .filter(
      (row) => row.month === filterMonth
    )
    .sort(
      (a, b) =>
        Number(a.epf_no || 0) -
        Number(b.epf_no || 0)
    );

  let grandTotal = 0;

const rowsHTML = rows.map((row) => {

  const c = calculate(
    row.amount || 0,
    row.allowance || 0
  );

  grandTotal +=
    c.balance +
    c.epf_20 +
    c.etf;

  return `
    <tr>

      <td>${row.name}</td>

      <td>${row.month}</td>

      <td>${row.days_worked}</td>

      <td>${row.rate_per_day}</td>

      <td>${c.amount.toFixed(2)}</td>

      <td>${c.epf_8.toFixed(2)}</td>

      <td>${c.total_deduction.toFixed(2)}</td>

      <td>${c.epf_12.toFixed(2)}</td>

      <td>${c.epf_20.toFixed(2)}</td>

      <td>${c.etf.toFixed(2)}</td>

      <td>${row.allowance || 0}</td>

      <td>${c.balance.toFixed(2)}</td>

    </tr>
  `;
}).join("");

  const html = `
    <html>

      <head>

        <title>Nirmalani Plantation Monthly Report</title>

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
          Month:
         ${new Date(filterMonth + "-01")
          .toLocaleString("default", {
            month: "long",
            year: "numeric"
          })}
        </h3>

        <table>

          <thead>
            <tr>
              <th>Name</th>
              <th>Month</th>
              <th>Days</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>EPF 8%</th>
              <th>Deduction</th>
              <th>EPF 12%</th>
              <th>EPF 20%</th>
              <th>ETF</th>
              <th>Allowance</th>
              <th>Net Salary</th>
            </tr>
          </thead>

          <tbody>
            ${rowsHTML}
            <tr style="font-weight:bold;background:#f1f5f9;">
              <td colspan="4">TOTAL</td>

              <td>${totals.amount.toFixed(2)}</td>
              <td>${totals.epf_8.toFixed(2)}</td>
              <td>${totals.total_deduction.toFixed(2)}</td>
              <td>${totals.epf_12.toFixed(2)}</td>
              <td>${totals.epf_20.toFixed(2)}</td>
              <td>${totals.etf.toFixed(2)}</td>
              <td>-</td>
              <td>${totals.balance.toFixed(2)}</td>
            </tr>
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

const workedDays = attendanceDates.reduce(
  (sum, d) => {
    const day = new Date(d.date).getDay();

    return sum + (day === 0 ? 1.5 : 1);
  },
  0
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

      <Card sx={{ mb: 3 }}>
        <CardContent>

          <Typography variant="h6" gutterBottom>
            Payroll Settings
          </Typography>

          <Grid container spacing={2} alignItems="center">

            <Grid item xs={12} md={4}>
              <TextField
                label="Daily Rate"
                fullWidth
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                disabled={!editingRate}
              />
            </Grid>

            <Grid item>

              {!editingRate ? (

                <Button
                  variant="contained"
                  onClick={() => setEditingRate(true)}
                >
                  Edit Rate
                </Button>

              ) : (

                <Button
                  variant="contained"
                  color="success"
                  onClick={saveDailyRate}
                >
                  Save
                </Button>

              )}

            </Grid>

            {editingRate && (

              <Grid item>

                <Button
                  color="inherit"
                  onClick={() => {
                    setEditingRate(false);
                    fetchDailyRate();
                  }}
                >
                  Cancel
                </Button>

              </Grid>

            )}

          </Grid>

        </CardContent>
      </Card>

      {/* DAILY ATTENDANCE */}
        {/* <Paper
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

          <Grid container spacing={2}> */}

            {/* Worker */}
            {/* <Grid item xs={12} md={3}>
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
            </Grid> */}

            {/* Daily Rate */}
            {/* <Grid item xs={12} md={3}>
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
            </Grid> */}

            {/* Allowance */}
            {/* <Grid item xs={12} md={3}>
              <TextField
                label="Enter the Allowance"
                type="number"
                fullWidth
                value={allowance}
                onChange={(e) => setAllowance(e.target.value)}
                sx={{ input: { color: "#fff" } }}
              />
            </Grid> */}

              {/* Date */}
            {/* <Grid item xs={12} md={3}>
              <TextField
                type="date"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                sx={{ input: { color: "#fff" } }}
              />
            </Grid> */}

            {/* Button */}
            {/* <Grid item xs={12} md={3}>
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
        </Paper> */}


        <Card sx={{ mb: 3 }}>
          <CardContent>

            <Typography variant="h6" gutterBottom>
              Allowance
            </Typography>

            <Grid container spacing={2}>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>

                  <InputLabel>
                    Worker
                  </InputLabel>

                  <Select
                    value={allowanceWorker}
                    label="Worker"
                    onChange={(e) =>
                      setAllowanceWorker(e.target.value)
                    }
                  >

                    {workers.map((w) => (

                      <MenuItem
                        key={w.id}
                        value={w.id}
                      >
                        {w.name}
                      </MenuItem>

                    ))}

                  </Select>

                </FormControl>
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  type="month"
                  label="Month"
                  fullWidth
                  value={allowanceMonth}
                  onChange={(e) =>
                    setAllowanceMonth(e.target.value)
                  }
                  InputLabelProps={{
                    shrink: true
                  }}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <TextField
                  label="Allowance"
                  type="number"
                  fullWidth
                  value={allowanceAmount}
                  onChange={(e) =>
                    setAllowanceAmount(e.target.value)
                  }
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  onClick={saveAllowance}
                >
                  Save
                </Button>
              </Grid>

            </Grid>

          </CardContent>
        </Card>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(250px,1fr))",
              gap: 3,
              mb: 3
            }}
          >

            <Paper
              sx={{
                p: 3,
                background: "#1e3a8a",
                color: "#fff",
                borderRadius: 4
              }}
            >
              <Typography variant="h6">
                💵 Net Salary
              </Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                Rs. {totals.balance.toFixed(2)}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                background: "#166534",
                color: "#fff",
                borderRadius: 4
              }}
            >
              <Typography variant="h6">
                🏦 EPF 20%
              </Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                Rs. {totals.epf_20.toFixed(2)}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                background: "#92400e",
                color: "#fff",
                borderRadius: 4
              }}
            >
              <Typography variant="h6">
                📄 ETF
              </Typography>

              <Typography
                variant="h4"
                fontWeight="bold"
              >
                Rs. {totals.etf.toFixed(2)}
              </Typography>
            </Paper>

            <Paper
              sx={{
                p: 3,
                background: "#14532d",
                color: "#fff",
                borderRadius: 4
              }}
            >
              <Typography variant="h6">
                💰 Total Required
              </Typography>

              <Typography
                variant="h3"
                fontWeight="bold"
              >
                Rs. {totalRequired.toFixed(2)}
              </Typography>
            </Paper>

          </Box>
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

            <TextField
              label="Search Worker in Table"
              value={tableSearch}
              onChange={(e) =>
                setTableSearch(e.target.value)
              }
              sx={{
                ml: 2,
                mb: 2,
                width: 300,

                input: {
                  color: "#fff"
                },

                label: {
                  color: "#aaa"
                }
              }}
            />
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
              .filter((row) => {
                const searchText = tableSearch.toLowerCase();

                const currentMonth = new Date()
                  .toISOString()
                  .slice(0, 7);

                return (
                  row.days_worked > 0 &&
                  row.month === (filterMonth || currentMonth) &&
                  (
                    row.name.toLowerCase().includes(searchText) ||
                    String(row.epf_no).includes(searchText)
                  )
                );
              })
              .sort(
                (a, b) =>
                  Number(a.epf_no) - Number(b.epf_no)
              )
              .map((row) => {
              const c = calculate(
                row.amount || 0,
                row.allowance || 0
              );

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.month}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.days_worked}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.rate_per_day}</TableCell>
                  <TableCell>
                    {Number(row.amount || 0).toFixed(2)}
                  </TableCell>
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
                          viewAttendance(row.worker_id, row.month, row.name)
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
    <Typography
      variant="h6"
      sx={{
        color: "#22c55e",
        fontWeight: "bold",
        mb: 1
      }}
    >
      👤 {selectedWorkerName}
    </Typography>

    <Typography
      sx={{
        color: "#22c55e",
        mb: 2,
        fontWeight: "bold"
      }}
    >
      Total Days Worked:
      {" "}
      {workedDays.toFixed(2)}
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
            justifyContent: "space-between",
            alignItems: "center",
            p: 1,
            mb: 1,
            borderRadius: 1,
            background: "rgba(255,255,255,0.05)"
          }}
        >

          <Typography sx={{ color: "#fff" }}>

            {new Date(d.date).toLocaleDateString("en-CA")}

            {" | "}

            {new Date(d.date).toLocaleDateString(
              "en-US",
              {
                weekday: "long"
              }
            )}

            Attendance :
            {
              d.attendance_value === 1.5
                ? "Sunday (1.5)"
                : d.attendance_value === 1
                ? "Present"
                : d.attendance_value === 0.5
                ? "Half Day"
                : "Absent"
            }

          </Typography>

          <Button
            size="small"
            onClick={() => deleteAttendance(d.id)}
            sx={{
              background: "#ef4444",
              color: "#fff"
            }}
          >
            DELETE
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