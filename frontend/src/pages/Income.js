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

export default function Income() {

  const [data, setData] = useState([]);

  const [category, setCategory] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  const [date, setDate] =
    useState("");

  const categories = [

    "Rubber Sales",

    "Tea Sales",

    "Transport Income",

    "Other Income"
  ];

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      const res =
        await axios.get(
          `${API}/income`
        );

      setData(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const addIncome = async () => {

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
        `${API}/income`,
        {
          category,
          amount,
          note,
          date
        }
      );

      alert("Income Added");

      setCategory("");
      setAmount("");
      setNote("");
      setDate("");

      fetchData();

    } catch (err) {

      console.error(err);

      alert("Server Error");
    }
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

        <Grid container spacing={2}>

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
              onClick={addIncome}
              sx={{
                height:"100%",
                background:
                  "linear-gradient(135deg,#22c55e,#4ade80)",
                color:"#000",
                fontWeight:"bold"
              }}
            >
              Add
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

        <Table>

          <TableHead>

            <TableRow>

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

            </TableRow>

          </TableHead>

          <TableBody>

            {data.map((row)=>(

              <TableRow key={row.id}>

                <TableCell sx={{color:"#fff"}}>
                  {row.category}
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