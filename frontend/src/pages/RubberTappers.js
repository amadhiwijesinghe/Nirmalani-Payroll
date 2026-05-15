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

const API = "http://localhost:5000";

export default function PlantationPayroll() {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [liter, setLiter] = useState("");

  const [workerId, setWorkerId] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("");
  const [allowance, setAllowance] = useState("");

  const [date, setDate] = useState("");

  const [filterMonth, setFilterMonth] = useState("");

  const [attendanceDates, setAttendanceDates] = useState([]);
  const [open, setOpen] = useState(false);

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
    const res = await axios.get(`${API}/rubber-tappers-data`);
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
    if (!name) return alert("Enter name and rate");

    await axios.post(`${API}/rubber-tappers`, {
      name,
      liter: liter,
      rate_per_day: rate,
      allowance
    });

    setName("");
    setLiter("");
    setRate("");
    setAllowance("");
    fetchWorkers();
  };

  const addAttendance = async () => {
    if (!workerId || !days || !month)
      return alert("Fill all fields");

    await axios.post(`${API}/plantation-attendance`, {
      worker_id: workerId,
      days_worked: days,
      month,
      allowance
    });

    setDays("");
    setMonth("");
    fetchData();
    setAllowance("");
  };

const viewAttendance = async (workerId, month) => {

  console.log("CLICKED →", workerId, month); 

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
  const calculate = (liter, rate, allowance = 0) => {
    const amount = (Number(liter || 0) * Number(rate || 0)) +
    Number(allowance || 0);
    const balance = amount;

    return {
      amount,
      balance: amount,
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
      acc.balance += c.balance;

      return acc;
    },
    {
      amount: 0,
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
        🌿 Rubber Tappers Dashboard
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

            <Grid item xs={12} md={5}>
                <TextField
                label="Enter the amount of liter"
                fullWidth
                value={liter}
                onChange={(e) => setLiter(e.target.value)}
                sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
                />
            </Grid>

             <Grid item xs={12} md={5}>
                <TextField
                label="Rate Per Day"
                fullWidth
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
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
              <TableCell sx={{ color: "#aaa" }}>Allowance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Liter Amount</TableCell>
              
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
              const c = calculate(row.days_worked || 0, row.rate_per_day, row.allowance || 0);

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>{row.liter}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.rate}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.allowance || 0}</TableCell>

                  <TableCell sx={{ color: "#22c55e" }}>
                    {c.amount.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#38bdf8" }}>
                    {c.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => viewAttendance(row.worker_id, row.month)}
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