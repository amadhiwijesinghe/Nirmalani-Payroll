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

export default function RubberTappers() {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [liter, setLiter] = useState("");

  const [workerId, setWorkerId] = useState("");
  const [allowance, setAllowance] = useState("");

  const [date, setDate] = useState("");

  const [filterMonth, setFilterMonth] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  const [attendanceDates, setAttendanceDates] = useState([]);
  const [open, setOpen] = useState(false);

  const [brc, setBrc] = useState("");
  const [kg, setKg] = useState("");

  useEffect(() => {
    fetchWorkers();
    fetchData();
    
  }, []);

  const fetchWorkers = async () => {
    const res = await axios.get(`${API}/rubber-tappers`);
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

const addWorker = async () => {

  if (!name) {
    return alert("Enter worker name");
  }

  try {

    await axios.post(`${API}/rubber-tappers`, {
      name
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

  try {

    const filtered = data.filter(
      (row) =>
        row.worker_id === workerId &&
        row.month === month
    );

    setAttendanceDates(filtered);
    setOpen(true);

  } catch (err) {

    console.error(err);
    alert("Server error");
  }
};

const addDailyAttendance = async () => {

  if (!workerId || !liter || !rate || !date) {
    alert("Fill all fields");
    return;
  }

  try {

    const total =
      (Number(kg) * Number(rate)) +
      Number(allowance || 0);

      await axios.post(
        `${API}/rubber-tappers-attendance`,
        {
          worker_id: workerId,
          liter,
          brc,
          kg,
          rate,
          allowance,
          total_earning: total,
          date,
          status: "present"
        }
      );

    alert("✅ Attendance Added");

    setLiter("");
    setRate("");
    setAllowance("");
    setDate("");

    fetchData();

  } catch (err) {
    console.error(err);

    alert(
      err.response?.data?.message ||
      "Server Error"
    );
  }
};


  // 🔥 CALCULATE
const calculate = (
  kg,
  rate,
  allowance = 0
) => {

  const amount =
    (Number(kg || 0) *
    Number(rate || 0)) +
    Number(allowance || 0);

  return {
    amount,
    balance: amount,
  };
};

const calculateKG = (
  literValue,
  brcValue
) => {

  const result =
    (Number(literValue || 0) *
    Number(brcValue || 0));

  setKg(result.toFixed(2));
};

  // 🔥 GRAND TOTAL

const groupedData = Object.values(

  data.reduce((acc, row) => {
    const key =
      `${row.worker_id}-${row.month}`;
    if (!acc[key]) {
      acc[key] = {
        worker_id: row.worker_id,
        name: row.name,
        month: row.month,
        rate: Number(row.rate || 0),
        kg: 0,
        allowance: 0,
        worked_days: 0,
        calculated_total: 0
      };
    }
    acc[key].kg +=
      Number(row.kg || 0);
    acc[key].allowance +=
      Number(row.allowance || 0);
    acc[key].worked_days += 1;
    acc[key].calculated_total +=
      (Number(row.kg || 0) *
      Number(row.rate || 0))
      +
      Number(row.allowance || 0);
    return acc;
  }, {})

);


const totals = groupedData
  .filter(
    (row) =>
      !filterMonth ||
      row.month === filterMonth
  )
  .reduce(
    (acc, row) => {
      acc.kg += Number(row.kg || 0);
      acc.amount +=
        Number(row.calculated_total || 0);
      return acc;
    },
    {
      kg: 0,
      amount: 0
    }
  );

  const totalRequired = totals.amount;

  const generateSlipHTML = (row, c) => {
  return `
    <div class="slip">
      <h3 style="text-align:center; margin-bottom:5px;">
        NIRMALANI PLANTATION
      </h3>

      <p><b>Name:</b> ${row.name}</p>
      <p><b>EPF No:</b> ${row.epf_no || "-"}</p>
      <p><b>Month:</b> ${row.month}</p>
      <p>
        <b>Worked Days:</b>
        ${row.worked_days}
      </p>

      <hr/>

      <table style="width:100%; font-size:12px;">
        <tr>
          <td>Total KG</td>
          <td style="text-align:right;">${row.kg.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Rate per Day</td>
          <td style="text-align:right;">${row.rate}</td>
        </tr>
        <tr>
          <td>Allowance</td>
          <td style="text-align:right;">${row.allowance.toFixed(2)}</td>
        </tr>
      </table>

      <hr/>

      <table style="width:100%; font-size:12px;">
        <tr>
          <td><b>Total Earnings</b></td>
          <td style="text-align:right;"><b>${c.calculated_total.toFixed(2)}</b></td>
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
      const c = calculate(row.kg,row.rate, row.allowance || 0);
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

  const weeklyRows = data.filter((row) => {

    const current =
      new Date(row.date);

    return (
      current >= new Date(weekStart) &&
      current <= new Date(weekEnd)
    );
  });

  if (weeklyRows.length === 0) {

    alert("No data found");

    return;
  }

  let totalKG = 0;
  let totalEarnings = 0;

  const rowsHTML = weeklyRows.map((row) => {

    const total =
      (Number(row.kg || 0) *
      Number(row.rate || 0)) +
      Number(row.allowance || 0);

    totalKG += Number(row.kg || 0);

    totalEarnings += total;

    return `
      <tr>

        <td>${row.name}</td>

        <td>
          ${new Date(row.date)
            .toLocaleDateString("en-CA")}
        </td>

        <td>${row.kg}</td>

        <td>${row.rate}</td>

        <td>${row.allowance || 0}</td>

        <td>${total.toFixed(2)}</td>

      </tr>
    `;
  }).join("");

  const html = `
    <html>

      <head>

        <title>Nirmalani Plantation Weekly Report</title>

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
          Nirmalani Plantation Rubber Tappers Weekly Report
        </h2>

        <p>
          <b>From:</b> ${weekStart}
          <br/>
          <b>To:</b> ${weekEnd}
        </p>

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>KG</th>
              <th>Rate</th>
              <th>Allowance</th>
              <th>Total</th>
            </tr>

          </thead>

          <tbody>
            ${rowsHTML}
          </tbody>

        </table>

        <h3>
          Total KG:
          ${totalKG.toFixed(2)}
        </h3>

        <h3>
          Total Earnings:
          ${totalEarnings.toFixed(2)}
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
    (row) =>
      row.month === filterMonth
  );

  let totalKG = 0;
  let totalEarnings = 0;

  const rowsHTML = rows.map((row) => {

    totalKG += Number(row.kg || 0);

    totalEarnings +=
      Number(row.calculated_total || 0);

    return `
      <tr>

        <td>${row.name}</td>

        <td>${row.month}</td>

        <td>${row.kg}</td>

        <td>${row.rate}</td>

        <td>${row.allowance || 0}</td>

        <td>
          ${row.calculated_total.toFixed(2)}
        </td>

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
          Nirmalani Plantation Rubber Tappers Monthly Report
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
              <th>Month</th>
              <th>KG</th>
              <th>Rate</th>
              <th>Allowance</th>
              <th>Total Earnings</th>
            </tr>

          </thead>

          <tbody>
            ${rowsHTML}
          </tbody>

        </table>

        <h3>
          Total KG:
          ${totalKG.toFixed(2)}
        </h3>

        <h3>
          Total Earnings:
          ${totalEarnings.toFixed(2)}
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
      `${API}/rubber-tappers-attendance/${id}`
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

const editAttendance = async (row) => {

  const newKg = prompt(
    "Enter Kg",
    row.kg
  );

  if (!newKg) return;

  const newRate = prompt(
    "Enter Rate",
    row.rate
  );

  if (!newRate) return;

  const newAllowance = prompt(
    "Enter Allowance",
    row.allowance || 0
  );

  const total =
    (Number(row.kg || 0) *
    Number(newRate)) +
    Number(newAllowance || 0);

  try {

    await axios.put(
      `${API}/rubber-tappers-attendance/${row.id}`,
      {
        liter: newKg,
        rate: newRate,
        allowance: newAllowance,
        total_earning: total
      }
    );

    alert("✅ Row Updated");

    fetchData();

  } catch (err) {

    console.error(err);

    alert("❌ Update failed");
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

      {/* BRC CONVERSION */}
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
        <Typography
          sx={{
            color: "#fff",
            mb: 2,
            fontWeight: "bold"
          }}
        >
          🧪 Rubber Latex Conversion
        </Typography>

        <Grid container spacing={2}>

          {/* Liter */}
          <Grid item xs={12} md={3}>
            <TextField
              label="Collected Liter"
              type="number"
              fullWidth
              value={liter}
              onChange={(e) => {

                setLiter(e.target.value);

                calculateKG(
                  e.target.value,
                  brc
                );
              }}
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
              }}
            />
          </Grid>

          {/* DRC */}
          <Grid item xs={12} md={3}>
            <TextField
              label="DRC"
              type="number"
              fullWidth
              value={brc}
              onChange={(e) => {

                setBrc(e.target.value);

                calculateKG(
                  liter,
                  e.target.value
                );
              }}
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
              }}
            />
          </Grid>

          {/* KG RESULT */}
          <Grid item xs={12} md={3}>
            <TextField
              label="KG Result"
              fullWidth
              value={kg}
              InputProps={{
                readOnly: true
              }}
              sx={{
                input: {
                  color: "#22c55e",
                  fontWeight: "bold"
                },
                label: { color: "#aaa" },
              }}
            />
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

          {/* Worker Select */}
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#aaa" }}>
                Select Worker
              </InputLabel>

              <Select
                value={workerId}
                onChange={(e) => setWorkerId(e.target.value)}
                sx={{
                  width: 250,
                  color: "#fff",
                }}
              >
                {workers.map((worker) => (
                  <MenuItem key={worker.id} value={worker.id}>
                    {worker.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

         {/* KG */}
        <Grid item xs={12} md={2}>
          <TextField
            label="KG"
            type="number"
            fullWidth
            value={kg}
            InputProps={{
              readOnly: true
            }}
            sx={{
              input: {
                color: "#22c55e",
                fontWeight: "bold"
              },
              label: { color: "#aaa" },
            }}
          />
        </Grid>

          {/* Rate */}
          <Grid item xs={12} md={2}>
            <TextField
              label="Rate"
              type="number"
              fullWidth
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
              }}
            />
          </Grid>

          {/* Allowance */}
          <Grid item xs={12} md={2}>
            <TextField
              label="Allowance"
              type="number"
              fullWidth
              value={allowance}
              onChange={(e) => setAllowance(e.target.value)}
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" },
              }}
            />
          </Grid>

          {/* Date */}
          <Grid item xs={12} md={2}>
            <TextField
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={{
                input: { color: "#fff" },
              }}
            />
          </Grid>

          {/* Button */}
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              onClick={addDailyAttendance}
              sx={{
                height: "100%",
                borderRadius: 3,
                background: "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                fontWeight: "bold"
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
            onChange={(e) =>
              setWeekStart(e.target.value)
            }
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
            onChange={(e) =>
              setWeekEnd(e.target.value)
            }
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
                  p: 2,
                  minHeight: 90,
                  background: "#1e3a8a",
                  color: "#fff",
                  borderRadius: 4
                }}
              >
                <Typography variant="subtitle1">
                  ⚖️ Total KG
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight="bold"
                >
                  {totals.kg.toFixed(2)}
                </Typography>
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  minHeight: 90,
                  background: "#166534",
                  color: "#fff",
                  borderRadius: 4
                }}
              >
                <Typography variant="subtitle1">
                  💰 Total Earnings
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight="bold"
                >
                  Rs. {totals.amount.toFixed(2)}
                </Typography>
              </Paper>

              <Paper
                sx={{
                  p: 2,
                  minHeight: 90,
                  background: "#92400e",
                  color: "#fff",
                  borderRadius: 4
                }}
              >
                <Typography variant="subtitle1">
                  👥 Workers Paid
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight="bold"
                >
                  {
                    groupedData.filter(
                      row =>
                        !filterMonth ||
                        row.month === filterMonth
                    ).length
                  }
                </Typography>
              </Paper>

              <Paper
                sx={{
                  p: 2,
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
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#aaa" }}>Name</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Month</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Date</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Rate</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Allowance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Kg Amount</TableCell>
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
              const c = calculate(row.kg,row.rate, row.allowance);

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.month}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{new Date(row.date) .toLocaleDateString( "en-CA")}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.rate}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.allowance || 0}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.kg}</TableCell>

                  <TableCell sx={{ color: "#22c55e" }}>
                    {c.amount.toFixed(2)}
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

                  {/* EDIT */}
                  <Button
                    onClick={() => editAttendance(row)}
                    sx={{
                      background: "#facc15",
                      color: "#000",
                      ml: 1
                    }}
                  >
                    Edit
                  </Button>

                  {/* DELETE */}
                  <Button
                    onClick={() => deleteAttendance(row.id)}
                    sx={{
                      background: "#ef4444",
                      color: "#fff",
                      ml: 1
                    }}
                  >
                    Delete
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

              {/* Liter Total */}
              <TableCell
                sx={{
                  color: "#38bdf8",
                  fontWeight: "bold"
                }}
              >
                {groupedData.reduce(
                  (sum, row) => sum + Number(row.kg || 0),
                  0
                )}
              </TableCell>

              {/* Earnings Total */}
              <TableCell
                sx={{
                  color: "#22c55e",
                  fontWeight: "bold"
                }}
              >
                {totals.amount.toFixed(2)}
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