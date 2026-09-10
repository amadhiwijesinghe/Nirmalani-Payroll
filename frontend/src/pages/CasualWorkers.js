import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import MobilePage from "../components/mobile/MobilePage";
import MobileHeader from "../components/mobile/MobileHeader";
import ResponsiveCard from "../components/mobile/ResponsiveCard";
import ResponsiveTable from "../components/mobile/ResponsiveTable";
import MobileInput from "../components/mobile/MobileInput";
import MobileButton from "../components/mobile/MobileButton";
import MobileSearch from "../components/mobile/MobileSearch";
import DashboardStatCard from "../components/mobile/DashboardStatCard";
import ActionButtons from "../components/mobile/ActionButtons";
import {
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

const API = "https://nirmalani-payroll-production.up.railway.app";

export default function CasualWorkers({plantation
  }) {
  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);
  const [selectedWorkerName, setSelectedWorkerName] = useState("");

  const [name, setName] = useState("");
  const [tableSearch, setTableSearch] = useState("");

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
  const [cashNoteWorker, setCashNoteWorker] = useState(null);
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
    return Swal.fire({
      icon: "warning",
      title: "Worker Required",
      text: "Please enter a worker name.",
    });
  }

  try {

    await axios.post(`${API}/casual-workers`, {
      name,
      plantation
    });

    setName("");

    fetchWorkers();

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Worker added successfully",
    });

  } catch (err) {

    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to add worker",
    });
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
    return Swal.fire({
      icon: "warning",
      title: "Worker Required",
      text: "Please select a worker",
    });
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
    Swal.fire({
      icon: "warning",
      title: "Allowance Error",
      text: "Allowance Saving Failed",
    });
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

// ================= CASH NOTE BREAKDOWN =================

const calculateNotes = (amount) => {

  let remaining = Math.floor(Number(amount || 0));

  const notes = {
    5000: Math.floor(remaining / 5000)
  };

  remaining = remaining % 5000;

  notes[1000] = Math.floor(remaining / 1000);
  remaining = remaining % 1000;

  notes[500] = Math.floor(remaining / 500);
  remaining = remaining % 500;

  notes[100] = Math.floor(remaining / 100);
  remaining = remaining % 100;

  notes[50] = Math.floor(remaining / 50);
  remaining = remaining % 50;

  notes[20] = Math.floor(remaining / 20);
  remaining = remaining % 20;

  notes[10] = Math.floor(remaining / 10);
  remaining = remaining % 10;

  return {
    ...notes,
    remainder: remaining
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

  const overallCashNotes = calculateNotes(totalRequired);

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
    <MobilePage>
      {/* HEADER */}
      <MobileHeader
        title="👷 Casual Workers"
        subtitle="Manage casual worker payroll"
      />

      {/* ADD WORKER */}
      <ResponsiveCard>
        <Typography
          sx={{
              color:"#fff",
              fontWeight:700,
              mb:2
          }}
        >
          👷 Add Casual Worker
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <MobileInput
              label="Worker Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <MobileButton
              onClick={addWorker}
            >
              Add Worker
            </MobileButton>
          </Grid>
        </Grid>
      </ResponsiveCard>

      <ResponsiveCard>
        <Typography
            sx={{
                color:"#fff",
                fontWeight:700,
                mb:2
            }}
        >
            💰 Worker Allowance
        </Typography>
      
          <Grid container spacing={2}>
      
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
      
                <InputLabel
                  sx={{
                    color: "#94a3b8",

                    "&.Mui-focused": {
                      color: "#22c55e",
                    },
                  }}
                >
                  Worker
                </InputLabel>
      
                  <Select
                    value={allowanceWorker}
                    label="Worker"
                    onChange={(e) =>
                      setAllowanceWorker(e.target.value)
                    }
                    sx={{
                        color: "#fff",
                        "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#475569",
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#64748b",
                        },
                        "& .MuiSvgIcon-root": {
                            color: "#fff",
                        },
                    }}
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
              <MobileInput
                type="month"
                label="Month"
                value={allowanceMonth}
                onChange={(e)=>setAllowanceMonth(e.target.value)}
              />
            </Grid>
      
            <Grid item xs={12} md={3}>
              <MobileInput
                label="Allowance Amount"
                type="number"
                value={allowanceAmount}
                onChange={(e)=>setAllowanceAmount(e.target.value)}
              />
            </Grid>
      
            <Grid item xs={12} md={2}>
              <MobileButton
                onClick={saveAllowance}
              >
                Save Allowance
              </MobileButton>
            </Grid>
      
          </Grid>
      
        </ResponsiveCard>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(250px,1fr))",
          gap: 1,
          mb: 1
        }}
      >

        <DashboardStatCard
          title="🏦 Total Required"
          value={`Rs. ${totalRequired.toFixed(2)}`}
          color="#8b5cf6"
        />

      </Box>

      {/* ================= OVERALL CASH NOTES SUMMARY ================= */}

      <ResponsiveCard>

        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: 18,
            mb: 2
          }}
        >
          💵 Cash Notes Summary
        </Typography>

        <Typography
          sx={{
            color: "#22c55e",
            fontWeight: 800,
            fontSize: 20,
            mb: 2
          }}
        >
          Total Cash: Rs. {Number(totalRequired).toFixed(2)}
        </Typography>

        {[
          5000,
          1000,
          500,
          100,
          50,
          20,
          10
        ].map((denomination) => {

          const count = overallCashNotes[denomination];

          if (count === 0) return null;

          return (
            <Box
              key={denomination}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 1.2,
                mb: 1,
                borderRadius: 2,
                background: "rgba(255,255,255,0.06)"
              }}
            >

              <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                Rs. {denomination}
              </Typography>

              <Typography
                sx={{
                  fontWeight: 800,
                  color: "#fbbf24"
                }}
              >
                × {count}
              </Typography>

              <Typography sx={{ color: "#fff", fontWeight: 600 }}>
                Rs. {(denomination * count).toFixed(2)}
              </Typography>

            </Box>
          );
        })}

        {overallCashNotes.remainder > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 2,
              p: 1.2,
              borderRadius: 2,
              background: "rgba(239,68,68,0.12)"
            }}
          >

            <Typography sx={{ color: "#fff", fontWeight: 700 }}>
              Remaining Amount
            </Typography>

            <Typography
              sx={{
                fontWeight: 800,
                color: "#f87171"
              }}
            >
              Rs. {overallCashNotes.remainder.toFixed(2)}
            </Typography>

          </Box>
        )}

      </ResponsiveCard>

      {/* TABLE */}
      <ResponsiveCard>
        <Typography
          sx={{
            color: "#fff",
            fontWeight: 700,
            mb: 2,
          }}
        >
          📄 Casual Worker Reports
        </Typography>
        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6} md={3}>
                            <MobileInput
                                type="month"
                                value={filterMonth}
                                onChange={(e)=>setFilterMonth(e.target.value)}
                                helperText="Month"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <MobileInput
                                type="date"
                                value={weekStart}
                                onChange={(e)=>setWeekStart(e.target.value)}
                                helperText="Week Start"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6} md={3}>
                            <MobileInput
                                type="date"
                                value={weekEnd}
                                onChange={(e)=>setWeekEnd(e.target.value)}
                                helperText="Week End"
                            />
                          </Grid>
                
                            {/* Clear Button */}
                            <Grid item xs={6} md={3}>
                              <MobileButton
                                  color="secondary"
                                  onClick={() => setFilterMonth("")}
                              >
                                  Clear
                              </MobileButton>
                            </Grid>
                
                            <Grid item xs={6} md={3}>
                              <MobileButton
                                  onClick={printSlip}
                              >
                                Print Payslips
                              </MobileButton>
                            </Grid>
                
                            <Grid item xs={6} md={3}>
                              <MobileButton
                              color="warning"
                              fullWidth={false}
                              onClick={printWeeklyReport}
                            >
                              Weekly Report
                            </MobileButton>
                            </Grid>
                
                            <Grid item xs={6} md={3}>
                              <MobileButton
                              color="danger"
                              fullWidth={false}
                              onClick={printMonthlyReport}
                            >
                              Monthly Report
                            </MobileButton>
                            </Grid>
                
                            
                
                            
                
                            <Grid item xs={12} md={3}>
                              <MobileSearch
                                  value={tableSearch}
                                  onChange={(e) => setTableSearch(e.target.value)}
                                  placeholder="Search worker..."
                              />
                            </Grid>
                        </Grid>
        <ResponsiveTable>
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
              .filter(row => !filterMonth || row.month === filterMonth)
              .filter(row =>
                row.name
                  .toLowerCase()
                  .includes(tableSearch.toLowerCase())
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
                  <MobileButton
                    color="secondary"
                    fullWidth={false}
                    onClick={() =>
                        viewAttendance(
                            row.worker_id,
                            row.month
                        )
                    }
                  >
                    View
                  </MobileButton>

                  <MobileButton
                    color="warning"
                    fullWidth={false}
                    onClick={() =>
                      setCashNoteWorker({
                        name: row.name,
                        amount: row.netSalary
                      })
                    }
                  >
                    💵 Cash
                  </MobileButton>

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
        </ResponsiveTable>
      </ResponsiveCard>
      {open && (
  <ResponsiveCard>
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

          <MobileButton
            color="danger"
            fullWidth={false}
            onClick={() =>
                deleteAttendance(d.id)
            }
          >
            Delete
          </MobileButton>

        </Box>
      ))
    )}

    <MobileButton
      color="secondary"
      fullWidth={false}
      onClick={() => setOpen(false)}
    >
      Close
    </MobileButton>
  </ResponsiveCard>
)}

    {/* ================= CASH NOTE BREAKDOWN DIALOG ================= */}

    <Dialog
      open={Boolean(cashNoteWorker)}
      onClose={() => setCashNoteWorker(null)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>
        💵 Cash Breakdown
      </DialogTitle>

      <DialogContent>

        {cashNoteWorker && (() => {

          const notes = calculateNotes(cashNoteWorker.amount);

          const denominations = [
            5000,
            1000,
            500,
            100,
            50,
            20,
            10
          ];

          return (
            <Box>

              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: 18,
                  mb: 1
                }}
              >
                {cashNoteWorker.name}
              </Typography>

              <Typography
                sx={{
                  color: "#22c55e",
                  fontWeight: 800,
                  fontSize: 20,
                  mb: 2
                }}
              >
                Rs. {Number(cashNoteWorker.amount).toFixed(2)}
              </Typography>

              {denominations.map((denomination) => {

                const count = notes[denomination];

                if (count === 0) return null;

                return (
                  <Box
                    key={denomination}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.2,
                      mb: 1,
                      borderRadius: 2,
                      background: "rgba(255,255,255,0.06)"
                    }}
                  >

                    <Typography sx={{ fontWeight: 600 }}>
                      Rs. {denomination}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#fbbf24"
                      }}
                    >
                      × {count}
                    </Typography>

                    <Typography sx={{ fontWeight: 600 }}>
                      Rs. {(denomination * count).toFixed(2)}
                    </Typography>

                  </Box>
                );
              })}

              {notes.remainder > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mt: 2,
                    p: 1.2,
                    borderRadius: 2,
                    background: "rgba(239,68,68,0.12)"
                  }}
                >

                  <Typography sx={{ fontWeight: 700 }}>
                    Remaining Amount
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: "#f87171"
                    }}
                  >
                    Rs. {notes.remainder.toFixed(2)}
                  </Typography>

                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid rgba(255,255,255,0.2)"
                }}
              >

                <Typography sx={{ fontWeight: 800 }}>
                  Cash Notes Total
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#22c55e"
                  }}
                >
                  Rs.{" "}
                  {(
                    Number(cashNoteWorker.amount) -
                    notes.remainder
                  ).toFixed(2)}
                </Typography>

              </Box>

            </Box>
          );

        })()}

      </DialogContent>

      <DialogActions>

        <MobileButton
          color="secondary"
          fullWidth={false}
          onClick={() => setCashNoteWorker(null)}
        >
          Close
        </MobileButton>

      </DialogActions>

    </Dialog>
    </MobilePage>
  );
}