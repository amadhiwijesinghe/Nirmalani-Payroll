import { useState, useEffect } from "react";

import axios from "axios";

import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";

const API =
"https://nirmalani-payroll-production.up.railway.app";

export default function Expenditure() {

  const [data, setData] = useState([]);

  const [category, setCategory] =
    useState("");

  const [subCategory, setSubCategory] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  const [date, setDate] =
    useState("");

  const [filterMonth, setFilterMonth] =
    useState("");

  const [weekStart, setWeekStart] =
    useState("");

  const [weekEnd, setWeekEnd] =
    useState("");

const categories = {

  Salaries: {
    hasSub: true,

    subs: [
      "Permanent Workers",
      "Casual Workers",
      "Rubber Tappers"
    ]
  },

  Maintenance: {
    hasSub: true,

    subs: [
      "Vehicle Repair",
      "Machine Repair",
      "Building Repair"
    ]
  },

  Utilities: {
    hasSub: false,

    subs: []
  },

  Fuel: {
    hasSub: false,

    subs: []
  },

  Electricity: {
    hasSub: false,

    subs: []
  },

  Water: {
    hasSub: false,

    subs: []
  },

  Other: {
    hasSub: false,

    subs: []
  }
};

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      const res =
        await axios.get(
          `${API}/expenditure`
        );

      setData(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const addExpense = async () => {

    if (
      !category ||
      !amount ||
      !date
    ) {
      alert("Fill all fields");

      return;
    }

    try {

      await axios.post(
        `${API}/expenditure`,
        {
          category,
          sub_category:
            categories[category]?.hasSub
                ? (subCategory || "")
                : "",
          amount,
          note,
          date
        }
      );

      alert("Expense Added");

      setCategory("");
      setSubCategory("");
      setAmount("");
      setNote("");
      setDate("");

      fetchData();

    } catch (err) {

      console.error(err);

      alert("Server Error");
    }
  };

  const totalExpense =
    data.reduce(
      (sum,row)=>
        sum + Number(row.amount || 0),
      0
    );

  const printMonthlyReport = () => {

    if (!filterMonth) {

      alert("Select month");

      return;
    }

    const rows = data.filter(
      (row)=>
        row.date.startsWith(filterMonth)
    );

    let total = 0;

    const rowsHTML = rows.map((row)=>{

      total += Number(row.amount);

      return `
        <tr>

          <td>${row.category}</td>

          <td>${row.sub_category || "-"}</td>

          <td>${row.amount}</td>

          <td>${row.note || "-"}</td>

          <td>${row.date}</td>

        </tr>
      `;
    }).join("");

    const html = `
      <html>

        <head>

          <title>
            Monthly Expenditure Report
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
              border:1px solid #000;
              padding:8px;
            }

          </style>

        </head>

        <body>

          <h2>
            Monthly Expenditure Report
          </h2>

          <h3>
            Month: ${filterMonth}
          </h3>

          <table>

            <thead>

              <tr>

                <th>Category</th>

                <th>Sub Category</th>

                <th>Amount</th>

                <th>Note</th>

                <th>Date</th>

              </tr>

            </thead>

            <tbody>

              ${rowsHTML}

            </tbody>

          </table>

          <h3>
            Total Expense:
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
  };

  const printWeeklyReport = () => {

    if (!weekStart || !weekEnd) {

      alert("Select week");

      return;
    }

    const rows = data.filter((row)=>{

      const current =
        new Date(row.date);

      return (
        current >= new Date(weekStart) &&
        current <= new Date(weekEnd)
      );
    });

    let total = 0;

    const rowsHTML = rows.map((row)=>{

      total += Number(row.amount);

      return `
        <tr>

          <td>${row.category}</td>

          <td>${row.sub_category || "-"}</td>

          <td>${row.amount}</td>

          <td>${row.note || "-"}</td>

          <td>${row.date}</td>

        </tr>
      `;
    }).join("");

    const html = `
      <html>

        <head>

          <title>
            Weekly Expenditure Report
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
              border:1px solid #000;
              padding:8px;
            }

          </style>

        </head>

        <body>

          <h2>
            Weekly Expenditure Report
          </h2>

          <p>
            ${weekStart}
            to
            ${weekEnd}
          </p>

          <table>

            <thead>

              <tr>

                <th>Category</th>

                <th>Sub Category</th>

                <th>Amount</th>

                <th>Note</th>

                <th>Date</th>

              </tr>

            </thead>

            <tbody>

              ${rowsHTML}

            </tbody>

          </table>

          <h3>
            Total Expense:
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
  };

  return (

    <Box
      sx={{
        p:3,
        minHeight:"100vh",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b)"
      }}
    >

      <Typography
        variant="h4"
        sx={{
          color:"#fff",
          mb:3,
          fontWeight:"bold"
        }}
      >
        💸 Expenditure Dashboard
      </Typography>

      <Paper
        sx={{
          p:3,
          mb:4,
          borderRadius:5,
          background:
            "rgba(255,255,255,0.05)"
        }}
      >

        <Grid container spacing={2}>

          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e)=>{
                setCategory(e.target.value);
                setSubCategory("");
              }}
              sx={{
                width: 250,
                input:{color:"#fff"},
                label:{color:"#aaa"}
              }}
            >
              {Object.keys(categories)
                .map((c)=>(
                <MenuItem
                  key={c}
                  value={c}
                >
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

            {categories[category]?.hasSub && (

            <Grid item xs={12} md={2}>

                <TextField
                select
                fullWidth
                label="Sub Category"
                value={subCategory}
                onChange={(e)=>
                    setSubCategory(
                    e.target.value
                    )
                }
                sx={{
                    input:{color:"#fff"},
                    label:{color:"#aaa"}
                }}
                >

                {(categories[category]?.subs || [])
                    .map((sub)=>(
                    <MenuItem
                    key={sub}
                    value={sub}
                    >
                    {sub}
                    </MenuItem>
                ))}

                </TextField>

            </Grid>

            )}

          <Grid item xs={12} md={2}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(e)=>
                setAmount(e.target.value)
              }
              sx={{
                input:{color:"#fff"},
                label:{color:"#aaa"}
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Note"
              fullWidth
              value={note}
              onChange={(e)=>
                setNote(e.target.value)
              }
              sx={{
                input:{color:"#fff"},
                label:{color:"#aaa"}
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              type="date"
              fullWidth
              value={date}
              onChange={(e)=>
                setDate(e.target.value)
              }
              sx={{
                input:{color:"#fff"}
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={addExpense}
              sx={{
                height:"100%",
                background:
                  "linear-gradient(135deg,#ef4444,#f87171)",
                color:"#fff",
                fontWeight:"bold"
              }}
            >
              Add
            </Button>
          </Grid>

        </Grid>

      </Paper>

    </Box>
  );
}