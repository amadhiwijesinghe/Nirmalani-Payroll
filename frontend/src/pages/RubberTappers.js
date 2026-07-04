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
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider
} from "@mui/material";

const API = "https://nirmalani-payroll-production.up.railway.app";

export default function RubberTappers({
  plantation
}) {
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

  const [selectedWorkerName, setSelectedWorkerName] = useState("");

  const [dispatchData, setDispatchData] = useState([]);
  const [collectionData, setCollectionData] = useState([]);
  const [ottapaluData, setOttapaluData] = useState([]);

  const [workerCategory, setWorkerCategory] = useState("Temporary");
  const [epfNo, setEpfNo] = useState("");
  const [openPayroll, setOpenPayroll] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);

  useEffect(() => {

    fetchWorkers();
    fetchData();

    fetchDispatchData();
    fetchCollectionData();

    if (plantation === "ingurupaththala") {
      fetchOttapaluData();
    }

  }, [plantation]);

  const fetchWorkers = async () => {
    const res = await axios.get(`${API}/rubber-tappers?plantation=${plantation}`);
    setWorkers(res.data);
  };

const fetchData = async () => {
  try {
    const res = await axios.get(`${API}/rubber-tappers-data?plantation=${plantation}`);
    console.log("NEW DATA:", res.data); 
    setData(res.data);
  } catch (err) {
    console.error(err);
  }
};

const fetchDispatchData = async () => {
  const res = await axios.get(
    `${API}/rubber-dispatch?plantation=${plantation}`
  );
  setDispatchData(res.data);
};

const fetchCollectionData = async () => {
  const res = await axios.get(
    `${API}/rubber-collection?plantation=${plantation}`
  );
  setCollectionData(res.data);
};

const fetchOttapaluData = async () => {
  const res = await axios.get(
    `${API}/ottapalu?plantation=${plantation}`
  );
  setOttapaluData(res.data);
};

const addWorker = async () => {

  if (!name) {
    return alert("Enter worker name");
  }

  try {

    await axios.post(`${API}/rubber-tappers`, {

      name,

      plantation,

      worker_category: workerCategory,

      epf_no: epfNo,

      epf_enabled:
          workerCategory === "Permanent" ? 1 : 0

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

          worker_category: row.worker_category,

          epf_no: row.epf_no,

          epf_enabled: Number(row.epf_enabled),

          kg: 0,

          allowance: 0,

          worked_days: 0,

          calculated_total: 0,

          averageKg: 0,

          bonus: 0,

          epf8: 0,

          epf12: 0,

          epf20: 0,

          etf: 0,

          netSalary: 0

      };

  }
    acc[key].kg +=
      Number(row.kg || 0);
    acc[key].allowance +=
      Number(row.allowance || 0);
    acc[key].worked_days += 1;
    return acc;
  }, {})

);

  groupedData.forEach(worker => {

      let gross = 0;

      // Permanent Worker
      if (worker.worker_category === "Permanent") {

          const averageKg =
              worker.worked_days > 0
              ? worker.kg / worker.worked_days
              : 0;

          worker.averageKg = averageKg;

          if (averageKg < 2.5) {

              gross = 0;

          }
          else if (averageKg <= 7) {

              gross =
                  worker.worked_days * 1550;

          }
          else {

              const bonus =
                  (averageKg - 7) * 250;

              worker.bonus = bonus;

              gross =
                  (worker.worked_days * 1550)
                  + bonus;

          }

      }

      // Temporary Worker
      else {

          gross =
              worker.kg * worker.rate;

      }

      worker.calculated_total = gross;
    
      if (worker.epf_enabled === 1) {

        worker.epf8 = gross * 0.08;
        worker.epf12 = gross * 0.12;
        worker.epf20 = gross * 0.20;
        worker.etf = gross * 0.03;

        worker.netSalary =
            gross +
            worker.allowance -
            worker.epf8;

    } else {

        worker.epf8 = 0;
        worker.epf12 = 0;
        worker.epf20 = 0;
        worker.etf = 0;

        worker.netSalary =
            gross +
            worker.allowance;

    }
  });

const currentMonth = new Date()
  .toISOString()
  .slice(0, 7);

const selectedMonth =
  filterMonth || currentMonth;

const totals = groupedData
  .filter(
    (row) =>
      row.month === selectedMonth
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

  const totalRequired = groupedData
    .filter(row => row.month === selectedMonth)
    .reduce(
        (sum, row) => sum + Number(row.netSalary || 0),
        0
    );

  const gross = Number(selectedPayroll?.calculated_total || 0);

  const allowanceValue = Number(selectedPayroll?.allowance || 0);

  const isPermanent = selectedPayroll?.epf_enabled === 1;

  const epf8 = isPermanent ? gross * 0.08 : 0;
  const epf12 = isPermanent ? gross * 0.12 : 0;
  const epf20 = epf8 + epf12;
  const etf = isPermanent ? gross * 0.03 : 0;

  const netSalary = isPermanent
      ? gross + allowanceValue - epf8
      : gross + allowanceValue;

  const generateSlipHTML = (row) => {

      const gross = Number(row.calculated_total);

      const allowance = Number(row.allowance);

      const epf8 = row.epf_enabled ? gross * 0.08 : 0;

      const epf12 = row.epf_enabled ? gross * 0.12 : 0;

      const epf20 = row.epf_enabled ? gross * 0.20 : 0;

      const etf = row.epf_enabled ? gross * 0.03 : 0;

      const netSalary = row.epf_enabled
          ? gross + allowance - epf8
          : gross + allowance;

      return `

  <div class="slip">

  <h2 style="text-align:center">
  NIRMALANI PLANTATION
  </h2>

  <hr>

  <p><b>Name :</b> ${row.name}</p>

  <p><b>Category :</b> ${row.worker_category}</p>

  <p><b>Month :</b> ${row.month}</p>

  <p><b>Worked Days :</b> ${row.worked_days}</p>

  <table>

  <tr>
  <td>Gross Salary</td>
  <td>${gross.toFixed(2)}</td>
  </tr>

  <tr>
  <td>Allowance</td>
  <td>${allowance.toFixed(2)}</td>
  </tr>

  ${row.epf_enabled ? `

  <tr>
  <td>EPF 8%</td>
  <td>${epf8.toFixed(2)}</td>
  </tr>

  <tr>
  <td>EPF 12%</td>
  <td>${epf12.toFixed(2)}</td>
  </tr>

  <tr>
  <td>Total EPF</td>
  <td>${epf20.toFixed(2)}</td>
  </tr>

  <tr>
  <td>ETF</td>
  <td>${etf.toFixed(2)}</td>
  </tr>

  ` : ""}

  <tr>

  <td><b>NET SALARY</b></td>

  <td><b>${netSalary.toFixed(2)}</b></td>

  </tr>

  </table>

  </div>

  `;

  };


const printSlip = () => {

  const rows = groupedData
    .filter(row => (!filterMonth || row.month === filterMonth));

  let pagesHTML = "";

  for (let i = 0; i < rows.length; i += 2) {

      const chunk = rows.slice(i, i + 2);

      const slips = chunk
          .map(row => generateSlipHTML(row))
          .join("");

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

  const weeklyCollection =
    collectionData.filter(row => {

      const d = new Date(row.date);

      return (
        d >= new Date(weekStart) &&
        d <= new Date(weekEnd)
      );

    });

  const weeklyDispatch =
    dispatchData.filter(row => {

      const d = new Date(row.date);

      return (
        d >= new Date(weekStart) &&
        d <= new Date(weekEnd)
      );

    });

  const totalCollected =
    weeklyCollection.reduce(
      (sum,row) =>
        sum + Number(row.liters || 0),
      0
    );
  const totalSent =
    weeklyDispatch.reduce(
      (sum,row) =>
        sum + Number(row.liters_sent || 0),
      0
    );

  const balance =
    totalCollected - totalSent;

 const weeklyOttapalu =
  ottapaluData.filter(row => {

    const d =
      new Date(row.collection_date);

    return (
      d >= new Date(weekStart) &&
      d <= new Date(weekEnd)
    );

  });

  const totalOttapalu =
    weeklyOttapalu.reduce(
      (sum,row) =>
        sum + Number(row.quantity || 0),
      0
    );

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

        <hr>

        <h2>Rubber Dispatch Summary</h2>

        <p>
          Total Collected:
          ${totalCollected.toFixed(2)} L
        </p>

        <p>
          Total Sent to DPL:
          ${totalSent.toFixed(2)} L
        </p>

        <p>
          Remaining Stock:
          ${balance.toFixed(2)} L
        </p>

        ${
        plantation === "ingurupaththala"
        ? `
        <hr>

        <h2>Ottapalu Collection</h2>

        <table>

        <thead>
        <tr>
          <th>Date</th>
          <th>Quantity</th>
        </tr>
        </thead>

        <tbody>

        ${weeklyOttapalu.map(row => `
        <tr>
          <td>${row.collection_date}</td>
          <td>${row.quantity}</td>
        </tr>
        `).join("")}

        </tbody>

        </table>

        <h3>
        Total Ottapalu:
        ${totalOttapalu.toFixed(2)} KG
        </h3>
        `
        : ""
        }

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
          ${Number(row.calculated_total || 0).toFixed(2)}
        </td>

      </tr>
    `;
  }).join("");

  const monthlyCollection =
    collectionData.filter(
      row =>
        row.date?.substring(0,7) === filterMonth
    );

  const totalCollected =
    monthlyCollection.reduce(
      (sum,row) =>
        sum + Number(row.liters || 0),
      0
    );

  const monthlyDispatch =
    dispatchData.filter(
      row =>
        row.date?.substring(0,7) === filterMonth
    );

  const totalSent =
    monthlyDispatch.reduce(
      (sum,row) =>
        sum + Number(row.liters_sent || 0),
      0
    );  

  const balance =
    totalCollected - totalSent;

  const monthlyOttapalu =
    ottapaluData.filter(
      row =>
        row.collection_date?.substring(0,7)
        === filterMonth
    );

  const totalOttapalu =
    monthlyOttapalu.reduce(
      (sum,row) =>
        sum + Number(row.quantity || 0),
      0
    );
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

        <hr>

        <h2>Rubber Dispatch Summary</h2>

        <p>
          Total Collected:
          ${totalCollected.toFixed(2)} L
        </p>

        <p>
          Total Sent to DPL:
          ${totalSent.toFixed(2)} L
        </p>

        <p>
          Remaining Stock:
          ${balance.toFixed(2)} L
        </p>

        ${
        plantation === "ingurupaththala"
        ? `
        <hr>

        <h2>Ottapalu Collection</h2>

        <table>

        <thead>
        <tr>
          <th>Date</th>
          <th>Quantity</th>
        </tr>
        </thead>

        <tbody>

        ${monthlyOttapalu.map(row => `
        <tr>
          <td>${new Date(row.collection_date)
            .toISOString()
            .split("T")[0]}</td>
          <td>${row.quantity}</td>
        </tr>
        `).join("")}

        </tbody>

        </table>

        <h3>
        Total Ottapalu:
        ${totalOttapalu.toFixed(2)} KG
        </h3>
        `
        : ""
        }

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
        kg: newKg,
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

          <Grid item xs={12} md={4}>
              <TextField
                  label="Worker Name"
                  fullWidth
                  value={name}
                  onChange={(e)=>setName(e.target.value)}
                  sx={{
                      input:{color:"#fff"},
                      label:{color:"#aaa"}
                  }}
              />
          </Grid>

          <Grid item xs={12} md={3}>
              <FormControl fullWidth>

                  <InputLabel sx={{color:"#aaa"}}>
                      Category
                  </InputLabel>

                  <Select
                      value={workerCategory}
                      label="Category"
                      onChange={(e)=>setWorkerCategory(e.target.value)}
                      sx={{color:"#fff"}}
                  >
                      <MenuItem value="Temporary">
                          Temporary
                      </MenuItem>

                      <MenuItem value="Permanent">
                          Permanent
                      </MenuItem>

                  </Select>

              </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>

              {workerCategory==="Permanent" && (

                  <TextField
                      label="EPF Number"
                      fullWidth
                      value={epfNo}
                      onChange={(e)=>setEpfNo(e.target.value)}
                      sx={{
                          input:{color:"#fff"},
                          label:{color:"#aaa"}
                      }}
                  />

              )}

          </Grid>

          <Grid item xs={12} md={2}>
              <Button
                  fullWidth
                  onClick={addWorker}
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
                        row.month === selectedMonth
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
              <TableCell sx={{ color: "#aaa" }}>Category</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Days</TableCell>
              <TableCell sx={{ color: "#aaa" }}>KG</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Avg KG</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Bonus</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Gross</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Allowance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>EPF 8%</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Net Salary</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Actions</TableCell>
              
            </TableRow>
          </TableHead>

          <TableBody>
            {groupedData
              .filter((row) =>
                row.month === selectedMonth
              )
              .map((row) => {
              const c = {
                amount: Number(row.calculated_total || 0)};

              return (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.worker_category}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{row.worked_days}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                      {row.kg.toFixed(2)}
                  </TableCell>

                  <TableCell sx={{ color: "#fff" }}>
                      {row.averageKg.toFixed(2)}
                  </TableCell>

                  <TableCell sx={{ color: "#fff" }}>
                      {row.bonus.toFixed(2)}
                  </TableCell>

                  <TableCell sx={{ color: "#fff" }}>
                      {row.calculated_total.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                      {row.allowance.toFixed(2)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                      {row.epf8.toFixed(2)}
                  </TableCell>
                  <TableCell
                      sx={{
                          color:"#22c55e",
                          fontWeight:"bold"
                      }}
                  >
                      {row.netSalary.toFixed(2)}
                  </TableCell>
                  <TableCell>

                  {/* VIEW */}
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => {

                        setSelectedPayroll(row);

                        setOpenPayroll(true);

                    }}
                >
                    VIEW
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

              <TableCell colSpan={3}>
                  TOTAL
              </TableCell>

              <TableCell>
                  {groupedData
                      .filter(r => r.month === selectedMonth)
                      .reduce((s,r)=>s+Number(r.kg||0),0)
                      .toFixed(2)}
              </TableCell>

              <TableCell></TableCell>
              <TableCell></TableCell>

              <TableCell>
                  {groupedData
                      .filter(r => r.month === selectedMonth)
                      .reduce((s,r)=>s+Number(r.calculated_total||0),0)
                      .toFixed(2)}
              </TableCell>

              <TableCell>
                  {groupedData
                      .filter(r => r.month === selectedMonth)
                      .reduce((s,r)=>s+Number(r.allowance||0),0)
                      .toFixed(2)}
              </TableCell>

              <TableCell>
                  {groupedData
                      .filter(r => r.month === selectedMonth)
                      .reduce((s,r)=>s+Number(r.epf8||0),0)
                      .toFixed(2)}
              </TableCell>

              <TableCell>
                  {groupedData
                      .filter(r => r.month === selectedMonth)
                      .reduce((s,r)=>s+Number(r.netSalary||0),0)
                      .toFixed(2)}
              </TableCell>

              <TableCell></TableCell>

          </TableRow>
          </TableBody>
        </Table>

        <Dialog
          open={openPayroll}
          onClose={() => setOpenPayroll(false)}
          maxWidth="sm"
          fullWidth
      >

          <DialogTitle>

              Rubber Tapper Payroll

          </DialogTitle>

          <DialogContent>

            <Typography><b>Name:</b> {selectedPayroll?.name}</Typography>

            <Typography><b>Month:</b> {selectedPayroll?.month}</Typography>

            <Typography><b>Category:</b> {selectedPayroll?.worker_category}</Typography>

            <Typography><b>Worked Days:</b> {selectedPayroll?.worked_days}</Typography>

            <Typography><b>Total KG:</b> {selectedPayroll?.kg?.toFixed(2)}</Typography>

            <Typography><b>Gross Salary:</b> Rs. {gross.toFixed(2)}</Typography>

            <Typography><b>Allowance:</b> Rs. {allowanceValue.toFixed(2)}</Typography>

            <Divider sx={{my:2}}/>

            {selectedPayroll?.worker_category === "Permanent" && (

            <>

            <Typography>Employee EPF (8%): Rs. {epf8.toFixed(2)}</Typography>

            <Typography>Employer EPF (12%): Rs. {epf12.toFixed(2)}</Typography>

            <Typography>Total EPF (20%): Rs. {epf20.toFixed(2)}</Typography>

            <Typography>ETF (3%): Rs. {etf.toFixed(2)}</Typography>

            <Divider sx={{my:2}}/>

            <Typography
                variant="h6"
                color="success.main"
            >
                Net Salary : Rs. {netSalary.toFixed(2)}
            </Typography>

            </>

            )}

            </DialogContent>

      </Dialog>
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
          }}
        >
          Total Days Worked: {attendanceDates.length}
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
            KG: {d.kg}
            {" | "}
            Rate: {d.rate}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>

            <Button
              size="small"
              onClick={() => editAttendance(d)}
              sx={{
                background: "#facc15",
                color: "#000",
                minWidth: "80px"
              }}
            >
              EDIT
            </Button>

            <Button
              size="small"
              onClick={() => deleteAttendance(d.id)}
              sx={{
                background: "#ef4444",
                color: "#fff",
                minWidth: "80px"
              }}
            >
              DELETE
            </Button>

          </Box>

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