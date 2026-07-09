import { useState, useEffect } from "react";

import axios from "axios";
import { Chip } from "@mui/material";

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
  const [tableSearch, setTableSearch] = useState("");

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

    <MobilePage>

      <MobileHeader
        title="💰 Income"
        subtitle="Manage plantation income records"
      />

      <ResponsiveCard>

        <Typography
          sx={{
              color:"#fff",
              fontWeight:700,
              mb:2
          }}
        >
          💵 Add Income
        </Typography>
        <Grid container spacing={2}>

        <Grid item xs={12} sm={6} md={3}>
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
          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ maxWidth: 250, mb: 3}}>
              <MobileInput
                label="Custom Category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </Box>
          </Grid>
          </>
        )}
        <Grid container spacing={2}>

          

          <Grid item xs={12} md={2}>
            <MobileInput
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MobileInput
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <MobileInput
              type="date"
              label="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <MobileButton
              onClick={() => {
                  if (editingId) {
                      updateIncome(editingId);
                  } else {
                      addIncome();
                  }
              }}
            >
              {editingId ? "Update Income" : "Add Income"}
            </MobileButton>
          </Grid>

        </Grid>
        </Grid>

      </ResponsiveCard>

      <ResponsiveCard>
        <Typography
          sx={{
              color: "#fff",
              fontWeight: 700,
              mb: 2,
          }}
        >
          📄 Income Reports
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
              placeholder="Search income..."
            />
          </Grid>
        </Grid>

        <Box
          sx={{
              display: "grid",
              gridTemplateColumns:
                  "repeat(auto-fit,minmax(250px,1fr))",
              gap: 3,
              mb: 3,
          }}
      >

      <DashboardStatCard
          title="💰 Total Income"
          value={`Rs. ${totalIncome.toFixed(2)}`}
          color="#22c55e"
      />

      </Box>

      <ResponsiveTable>
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

            {data
              .filter((row) =>
                row.category?.toLowerCase().includes(tableSearch.toLowerCase()) ||
                row.income_type?.toLowerCase().includes(tableSearch.toLowerCase()) ||
                (row.note || "").toLowerCase().includes(tableSearch.toLowerCase())
              )
              .map((row) => (

              <TableRow key={row.id}>

                <TableCell>
                  <Chip
                    label={row.income_type}
                    color={
                      row.income_type === "Income"
                        ? "success"
                        : row.income_type === "Money Received"
                        ? "info"
                        : "secondary"
                    }
                    size="small"
                  />
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

                    <MobileButton
                      color="warning"
                      fullWidth={false}
                      onClick={() => {
                          setEditingId(row.id);
                          setCategory(row.category);
                          setAmount(row.amount);
                          setNote(row.note || "");
                          setDate(row.date.split("T")[0]);
                      }}
                    >
                      Edit
                    </MobileButton>

                    <MobileButton
                      color="danger"
                      fullWidth={false}
                      onClick={() => deleteIncome(row.id)}
                    >
                      Delete
                    </MobileButton>

                    </TableCell>

              </TableRow>
            ))}


          </TableBody>

        </Table>
        </ResponsiveTable>

      </ResponsiveCard>

    </MobilePage>
  );
}