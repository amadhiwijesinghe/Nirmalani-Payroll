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
  CardContent
} from "@mui/material";

const API = "https://nirmalani-payroll-production.up.railway.app";

export default function CasualWorkers({plantation
  }) {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);
  const [selectedWorkerName, setSelectedWorkerName] = useState("");

  const [name, setName] = useState("");

  const [filterMonth, setFilterMonth] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  const [attendanceDates, setAttendanceDates] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState(0);

  const [allowanceWorker, setAllowanceWorker] = useState("");
  const [allowanceMonth, setAllowanceMonth] = useState(
      new Date().toISOString().slice(0, 7)
    );
  const [allowanceAmount, setAllowanceAmount] = useState("");
    useEffect(() => {
  
        fetchWorkers();
        fetchData();
  
    }, [plantation]);

  const fetchWorkers = async () => {
    const res = await axios.get(`${API}/casual-workers?plantation=${plantation}`);
    setWorkers(res.data);
  };

const fetchData = async () => {
    try {
        const res = await axios.get(
            `${API}/casual-payroll-data?plantation=${plantation}`
        );
        console.log(res.data);
        setData(res.data);
    } catch (err) {

        console.log(err);
    }
};

const addWorker = async () => {

  if (!name) {
    return alert("Enter worker name");
  }

  try {

    await axios.post(`${API}/casual-workers`, {
      name,
      plantation
    });

    setName("");

    fetchWorkers();

    alert("Worker Added");

  } catch (err) {

    console.error(err);

    alert("Failed to add worker");
  }
};

const viewAttendance = async (workerId, month) => {

  const worker = groupedData.find(
    w => w.worker_id === workerId &&
         w.month === month
  );

  setSelectedWorkerName(worker?.name || "");
  try {

    const res = await axios.get(
    `${API}/casual-attendance-register`,
    {
        params:{
            worker_id:workerId,
            month,
            plantation
        }
    }
    );

    setAttendanceDates(res.data);

    setOpen(true);

  } catch (err) {

    console.error(err);

    alert("Server Error");
  }
};

// const addDailyAttendance = async () => {

//   if (!workerId || !date || !dailyRate) {

//     alert("Enter worker, date and rate");

//     return;
//   }

//   try {

//     const selectedMonth =
//       date.substring(0, 7);

//     // SAVE DAILY ATTENDANCE
//     await axios.post(
//       `${API}/casual-workers-attendance`,
//       {
//         worker_id: workerId,

//         daily_rate: dailyRate,

//         allowance,

//         total_earning:
//           Number(dailyRate) +
//           Number(allowance || 0),

//         date,

//         month: selectedMonth,

//         status: "present"
//       }
//     );

//     alert("✅ Attendance marked!");

//     setDate("");
//     setAllowance("");
//     setDailyRate("");

//     fetchData();

//   } catch (err) {

//     console.error(err);

//     alert("Server Error");
//   }
// };

// Save Allowance 
const saveAllowance = async () => {
  if (!allowanceWorker) {
    return alert("Select a worker");
  }

  try {
    await axios.post(`${API}/casual-allowance`, {
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
const groupedData = data.map(worker => {

    const gross =
        Number(worker.worked_days) *
        Number(worker.daily_rate);

    const netSalary =
        gross +
        Number(worker.allowance);

    return {
      ...worker,
      days_worked: worker.worked_days,
      gross,
      netSalary
  };
});

const calculate = (daysWorked, dailyRate, allowance = 0) => {

    const amount =
        Number(daysWorked) * Number(dailyRate);

    const balance =
        amount + Number(allowance);

    return {

        amount,

        balance

    };

};

  // 🔥 GRAND TOTAL

//   const groupedData = Object.values(
//   data.reduce((acc, row) => {
//     const key = `${row.worker_id}-${row.month}`;
//     acc[key] = row;
//     return acc;
//   }, {})
// );


const totals = groupedData
  .filter((row) =>
  row.month &&
  (!filterMonth || row.month === filterMonth)
)
  .reduce(
    (acc, row) => {
      const c = calculate( row.worked_days, row.daily_rate, row.allowance );

      acc.amount += c.amount;
      acc.balance += c.balance;

      return acc;
    },
    {
      amount: 0,
      balance: 0,
    }
  );

  const totalRequired = totals.balance;

  const generateSlipHTML = (row, c) => {
  return `
    <div class="slip">
      <h3 style="text-align:center; margin-bottom:5px;">
        NIRMALANI PLANTATION
      </h3>

      <p><b>Name:</b> ${row.name}</p>
      <p><b>Month:</b> ${row.month}</p>

      <hr/>

      <table style="width:100%; font-size:12px;">
        <tr>
          <td>Days Worked</td>
          <td style="text-align:right;">${row.worked_days}</td>
        </tr>
        <tr>
          <td>Rate per Day</td>
          <td style="text-align:right;">${row.daily_rate}</td>
        </tr>
        <tr>
          <td>Allowance</td>
          <td style="text-align:right;">${row.allowance || 0}</td>
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
    .filter(row => (!filterMonth || row.month === filterMonth));

  let pagesHTML = "";

  for (let i = 0; i < rows.length; i += 2) {
    const chunk = rows.slice(i, i + 2);

    const slips = chunk.map(row => {
      const c = calculate(
        row.worked_days,
        row.daily_rate,
        row.allowance
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

  const workerName = selectedWorkerName;

  const rowsHTML = weeklyRows.map((d) => {

    total +=
      Number(d.attendance_value) *
      Number(selectedRate);

    return `
      <tr>

        <td>${workerName}</td>

        <td>
          ${new Date(d.date).toLocaleDateString(
            "en-CA"
          )}
        </td>

        <td>
          Rs.${Number(selectedRate).toFixed(2)}
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
          Nirmalani Plantation Casual Workers Weekly Report
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
      row.worked_days,
      row.daily_rate,
      row.allowance
    );

    grandTotal += c.balance;

    return `
      <tr>

        <td>${row.name}</td>

        <td>${row.worked_days}</td>

        <td>${row.daily_rate}</td>

        <td>${row.allowance || 0}</td>

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
          Nirmalani Plantation Casual Workers Monthly Report
        </h2>

       <h3>
          Month:
          ${
            filterMonth
          }
          ${
            new Date(filterMonth + "-01")
              .toLocaleString(
                "default",
                {
                  month:"long"
                }
              )
          }
        </h3>

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>Days Worked</th>
              <th>Daily Rate</th>
              <th>Allowance</th>
              <th>Total Salary</th>
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

const deleteAttendance = async (id) => {

  if (!window.confirm("Delete attendance?")) return;

  try {

    await axios.delete(
      `${API}/casual-attendance-register/${id}`
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
        👷 Casual Workers Dashboard
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
          gap: 1,
          mb: 1
        }}
      >

        <Paper
          sx={{
            p: 2,
            width: 300,
            minHeight: 90,
            background: "#14532d",
            color: "#fff",
            borderRadius: 4
          }}
        >
          <Typography variant="subtitle1">
            🏦 Total Required
          </Typography>

          <Typography
            variant="h5"
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
            label="Filter by Month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            sx={{
              input: { color: "#fff" },
              label: { color: "#aaa" },
              width: 200
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
              <TableCell sx={{ color: "#aaa" }}>Daily Rate</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Allowance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Days Worked</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Total Earnings</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Actions</TableCell>
              
            </TableRow>
          </TableHead>

          <TableBody>
            {groupedData
              .filter((row) =>
                (!filterMonth || row.month === filterMonth)
              )
              .map((row) => {
              const c = calculate( row.days_worked, row.daily_rate, row.allowance);

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.month}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.daily_rate}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.allowance || 0}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.days_worked}</TableCell>

                  <TableCell sx={{ color: "#22c55e" }}>
                    {c.balance.toFixed(2)}
                  </TableCell>
                  <TableCell>

                  {/* VIEW */}
                  <Button
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

                </TableCell>

                </TableRow>
              );
            })}

            {/* 🔥 GRAND TOTAL */}
            <TableRow sx={{ background: "rgba(255,255,255,0.08)" }}>
              <TableCell
                colSpan={5}
                sx={{
                  color: "#fff",
                  fontWeight: "bold"
                }}
              >
                TOTAL
              </TableCell>

              {/* Earnings Total */}
              <TableCell
                sx={{
                  color: "#22c55e",
                  fontWeight: "bold"
                }}
              >
                {totals.balance.toFixed(2)}
              </TableCell>

              {/* Empty Actions */}
              <TableCell></TableCell>

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

                {" - Rs."}

                {
                Number(d.attendance_value) === 1.5
                ? "Sunday"

                : Number(d.attendance_value) === 1
                ? "Present"

                : Number(d.attendance_value) === 0.5
                ? "Half Day"

                : "Absent"
                }
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