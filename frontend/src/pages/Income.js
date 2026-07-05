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

export default function Income({
  plantation
}) {

  const [data, setData] = useState([]);

  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const [date, setDate] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [filterMonth, setFilterMonth] = useState("");

  const [weekStart, setWeekStart] = useState("");

  const [weekEnd, setWeekEnd] = useState("");
  const [incomeType, setIncomeType] = useState("Income");

  const categories = [

    "Tea Leaf Sales",

    "Rubber Latex Sales",

    "Cinnamon Sticks Income",

    "Cinnamon Income"
  ];

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      const res =
        await axios.get(
          `${API}/income?plantation=${plantation}`
        );

      setData(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const addIncome = async () => {

    if (
      (!category && !customCategory) ||
      !amount ||
      !date
    ) {
      alert("Fill all fields");

      return;
    }

    try {

      await axios.post(`${API}/income`, {
        income_type: incomeType,
        category: customCategory || category,
        amount,
        note,
        date,
        plantation
    });

      alert("Income Added");

      setCategory("");
      setCustomCategory("");
      setAmount("");
      setNote("");
      setDate("");

      fetchData();

    } catch (err) {

      console.error(err);

      alert("Server Error");
    }
  };

  const deleteIncome = async (id) => {

    if (!window.confirm(
        "Delete this income?"
    )) return;

    try {

        await axios.delete(
        `${API}/income/${id}`
        );

        fetchData();

    } catch (err) {

        console.error(err);

        alert("Delete Failed");
    }
    };

    const updateIncome = async (id) => {

        try {

            await axios.put(`${API}/income/${id}`, {
              income_type: incomeType,
              category,
              amount,
              note,
              date,
              plantation
          });

            alert("Updated");

            setEditingId(null);

            setCategory("");
            setAmount("");
            setNote("");
            setDate("");

            fetchData();

        } catch (err) {

            console.error(err);

            alert("Update Failed");
        }
        };

    const printMonthlyReport = () => {

  if (!filterMonth) {

    alert("Select month");

    return;
  }

  const rows = data
    .filter(
      row => row.date.startsWith(filterMonth)
    )
    .sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

  let total = 0;

  const rowsHTML = rows.map((row)=>{

    total += Number(row.amount);

    return `
      <tr>

        <td>${row.category}</td>

        <td>${row.amount}</td>

        <td>${row.note || "-"}</td>

        <td>${row.date.split("T")[0]}</td>

      </tr>
    `;
  }).join("");

  const html = `
    <html>

      <head>

       <title>
          ${plantation} Plantation Monthly Income Report
        </title>

        <style>

          body{
            font-family: "Noto Sans Sinhala","Iskoola Pota","Arial",sans-serif;
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
          ${plantation} Plantation Monthly Income Report
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

              <th>Category</th>

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
          Total Income:
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

  const rows = data
    .filter((row) => {

      const current = new Date(row.date);

      return (
        current >= new Date(weekStart) &&
        current <= new Date(weekEnd)
      );

    })
    .sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

  let total = 0;

  const rowsHTML = rows.map((row)=>{

    total += Number(row.amount);

    return `
      <tr>

        <td>${row.category}</td>

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
          ${plantation} Plantation Monthly Income Report
        </title>

        <style>

          body{
            font-family: "Noto Sans Sinhala","Iskoola Pota","Arial",sans-serif;
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
          ${plantation} Plantation Monthly Income Report
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
          Total Income:
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

  const totalIncome =
    data.reduce(
      (sum, row) =>
        sum + Number(row.amount || 0),
      0
    );

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
        💰 Income Dashboard
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

        <Grid item xs={12} md={3}>
          <TextField
              select
              sx={{ mb: 3, width: 250}}
              label="Income Type"
              value={incomeType}
              onChange={(e) => setIncomeType(e.target.value)}
          >
              <MenuItem value="Opening Balance">
                  Opening Balance
              </MenuItem>

              <MenuItem value="Money Received">
                  Money Received
              </MenuItem>

              <MenuItem value="Income">
                  Income
              </MenuItem>
          </TextField>
        </Grid>

        {incomeType === "Income" && (
          <>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e)=>
                setCategory(
                  e.target.value
                )
              }
              sx={{
                mb: 3,
                width: 250,
                input:{color:"#fff"},
                label:{color:"#aaa"}
              }}
            >
              {categories.map((c)=>(
                <MenuItem
                  key={c}
                  value={c}
                >
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>

        <TextField
            fullWidth
            label="Custom Category"
            value={customCategory}
            onChange={(e)=>
            setCustomCategory(
                e.target.value
            )
            }
            sx={{
              width: 250,
              mb: 3,
              input:{color:"#fff"},
              label:{color:"#aaa"}
            }}
        />

        </Grid>
          </>
        )}
        <Grid container spacing={2}>

          

          <Grid item xs={12} md={2}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(e)=>
                setAmount(
                  e.target.value
                )
              }
              sx={{
                input:{color:"#fff"},
                label:{color:"#aaa"}
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="Note"
              fullWidth
              value={note}
              onChange={(e)=>
                setNote(
                  e.target.value
                )
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
                setDate(
                  e.target.value
                )
              }
              sx={{
                input:{color:"#fff"}
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={() => {
                if (editingId) {
                    updateIncome(editingId);
                } else {
                    addIncome();
                }
                }}
              sx={{
                height:"100%",
                background:
                  "linear-gradient(135deg,#22c55e,#4ade80)",
                color:"#000",
                fontWeight:"bold"
              }}
            >
              {editingId ? "Update" : "Add"}
            </Button>
          </Grid>

        </Grid>

      </Paper>

      <Paper
        sx={{
          p:2,
          borderRadius:5,
          background:
            "rgba(255,255,255,0.05)"
        }}
      >
        <Box
            sx={{
                display:"flex",
                gap:2,
                flexWrap:"wrap",
                mb:3
            }}
            >

            <TextField
                type="month"
                value={filterMonth}
                onChange={(e)=>
                setFilterMonth(
                    e.target.value
                )
                }
                sx={{
                input:{color:"#fff"}
                }}
            />

            <TextField
                type="date"
                value={weekStart}
                onChange={(e)=>
                setWeekStart(
                    e.target.value
                )
                }
                sx={{
                input:{color:"#fff"}
                }}
            />

            <TextField
                type="date"
                value={weekEnd}
                onChange={(e)=>
                setWeekEnd(
                    e.target.value
                )
                }
                sx={{
                input:{color:"#fff"}
                }}
            />

            <Button
                onClick={printWeeklyReport}
                sx={{
                background:"#0ea5e9",
                color:"#fff",
                fontWeight: "bold"
                }}
            >
                Weekly Report
            </Button>

            <Button
                onClick={printMonthlyReport}
                sx={{
                background:"#8b5cf6",
                color:"#fff",
                fontWeight: "bold"
                }}
            >
                Monthly Report
            </Button>

            </Box>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell sx={{color:"#aaa"}}>
                  Type
              </TableCell>

              <TableCell sx={{color:"#aaa"}}>
                  Category
              </TableCell>

              <TableCell sx={{color:"#aaa"}}>
                  Amount
              </TableCell>

              <TableCell sx={{color:"#aaa"}}>
                  Note
              </TableCell>

              <TableCell sx={{color:"#aaa"}}>
                  Date
              </TableCell>

              <TableCell sx={{color:"#aaa"}}>
                  Actions
              </TableCell>

          </TableRow>

          </TableHead>

          <TableBody>

            {data.map((row)=>(

              <TableRow key={row.id}>

                <TableCell sx={{color:"#fff"}}>
                    {row.income_type}
                </TableCell>

                <TableCell sx={{color:"#fff"}}>
                    {row.category || "-"}
                </TableCell>

                <TableCell sx={{color:"#22c55e"}}>
                  {row.amount}
                </TableCell>

                <TableCell sx={{color:"#fff"}}>
                  {row.note}
                </TableCell>

                <TableCell sx={{color:"#fff"}}>
                  {new Date(row.date)
                    .toLocaleDateString("en-CA")}
                </TableCell>

                <TableCell>

                    <Button
                        size="small"
                        sx={{
                        mr:1,
                        background:"#eab308",
                        color:"#000"
                        }}
                        onClick={() => {
                        setEditingId(row.id);
                        setCategory(row.category);
                        setAmount(row.amount);
                        setNote(row.note || "");
                        setDate(
                            row.date.split("T")[0]
                        );
                        }}
                    >
                        Edit
                    </Button>

                    <Button
                        size="small"
                        sx={{
                        background:"#ef4444",
                        color:"#fff"
                        }}
                        onClick={() =>
                        deleteIncome(row.id)
                        }
                    >
                        Delete
                    </Button>

                    </TableCell>

              </TableRow>
            ))}

            <TableRow>

              <TableCell
                sx={{
                  color:"#fff",
                  fontWeight:"bold"
                }}
              >
                TOTAL
              </TableCell>

              <TableCell
                sx={{
                  color:"#22c55e",
                  fontWeight:"bold"
                }}
              >
                {totalIncome.toFixed(2)}
              </TableCell>

            </TableRow>

          </TableBody>

        </Table>

      </Paper>

    </Box>
  );
}