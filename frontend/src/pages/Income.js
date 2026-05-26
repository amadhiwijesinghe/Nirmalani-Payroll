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

  const [category, setCategory] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const [date, setDate] = useState("");

  const [editingId, setEditingId] = useState(null);

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

            await axios.put(
            `${API}/income/${id}`,
            {
                category,
                amount,
                note,
                date
            }
            );

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

              <TableCell sx={{color:"#aaa"}}>
                Actions
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