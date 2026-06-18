import { useState, useEffect } from "react";
import axios from "axios";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";

const API =
  "https://nirmalani-payroll-production.up.railway.app";

export default function RubberDispatch({
  plantation
}) {

  const [data, setData] = useState([]);

  const [liters, setLiters] = useState("");
  const [date, setDate] = useState("");

  const [filterMonth, setFilterMonth] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  const [rubberData, setRubberData] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editLiters, setEditLiters] = useState("");

  const [collectionData, setCollectionData] = useState([]);

  const [collectedLiters, setCollectedLiters] = useState("");
  const [collectionDate, setCollectionDate] = useState("");

  const [ottapaluQty, setOttapaluQty] = useState("");
  const [ottapaluDate, setOttapaluDate] = useState("");
  const [ottapaluData, setOttapaluData] = useState([]);

  useEffect(() => {

    fetchDispatch();
    fetchRubber();
    fetchCollection();
    fetchOttapalu();

  }, [plantation]);

  // FETCH COLLECTION
    const fetchCollection = async () => {

    const res = await axios.get(
        `${API}/rubber-collection?plantation=${plantation}`
    );

    setCollectionData(res.data);
    };

  // FETCH DISPATCH
  const fetchDispatch = async () => {

    const res = await axios.get(
      `${API}/rubber-dispatch?plantation=${plantation}`
    );

    setData(res.data);
  };

  // FETCH RUBBER COLLECTION
  const fetchRubber = async () => {

    const res = await axios.get(
      `${API}/rubber-tappers-data?plantation=${plantation}`
    );

    setRubberData(res.data);
  };

  // FETCH OTTAPALU
  const fetchOttapalu = async () => {

    const res = await axios.get(
      `${API}/ottapalu?plantation=${plantation}`
    );

    setOttapaluData(res.data);
  };

  // SAVE
  const saveDispatch = async () => {

    if (!liters || !date) {
      alert("Fill all fields");
      return;
    }

    try {

      await axios.post(
        `${API}/rubber-dispatch`,
        {
          liters_sent: liters,
          date
        }
      );

      alert("✅ Dispatch Saved");

      setLiters("");
      setDate("");

      fetchDispatch();

    } catch (err) {

      console.error(err);

      alert("Error");
    }
  };

  // DELETE
  const deleteDispatch = async (id) => {

    if (!window.confirm("Delete?")) {
      return;
    }

    try {

      await axios.delete(
        `${API}/rubber-dispatch/${id}`
      );

      alert("Deleted");

      fetchDispatch();

    } catch (err) {

      console.error(err);
    }
  };

  // UPDATE
  const updateDispatch = async (id) => {

    try {

      await axios.put(
        `${API}/rubber-dispatch/${id}`,
        {
          liters_sent: editLiters
        }
      );

      alert("Updated");

      setEditingId(null);

      fetchDispatch();

    } catch (err) {

      console.error(err);
    }
  };

// TOTAL COLLECTED
const totalCollected = collectionData
  .filter(
    row =>
      !filterMonth ||
      row.date.substring(0, 7)
        === filterMonth
  )
  .reduce(
    (acc, row) =>
      acc + Number(row.liters_collected || 0),
    0
  );

  // TOTAL SENT
  const totalSent = data
    .filter(
      row =>
        !filterMonth ||
        row.date.substring(0, 7)
          === filterMonth
    )
    .reduce(
      (acc, row) =>
        acc + Number(row.liters_sent || 0),
      0
    );

  // BALANCE
  const balance =
    totalCollected - totalSent;

  //SAVE OTTAPALU
  const saveOttapalu = async () => {

    if (!ottapaluQty || !ottapaluDate) {

      alert("Fill all fields");

      return;
    }

    try {

      await axios.post(
        `${API}/ottapalu`,
        {
          quantity: ottapaluQty,
          collection_date: ottapaluDate,
          plantation
        }
      );

      alert("✅ Ottapalu Saved");

      setOttapaluQty("");
      setOttapaluDate("");

      fetchOttapalu();

    } catch (err) {

      console.error(err);
    }
  };

  // PRINT MONTHLY AND WEEKLY REPORTS
  const printMonthlyReport = () => {

    const rows = data.filter(
      row =>
        !filterMonth ||
        row.date.substring(0, 7)
          === filterMonth
    );

    const tableRows = rows.map(row => `
      <tr>
        <td>
          ${new Date(row.date)
            .toISOString()
            .split("T")[0]}
        </td>

        <td>
          ${row.liters_sent}
        </td>
      </tr>
    `).join("");

    const html = `
      <html>

        <head>

          <title>
            Nirmalani Plantation Rubber Dispatch Report
          </title>

          <style>

            body {
              font-family: Arial;
              padding: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th, td {
              border: 1px solid black;
              padding: 10px;
              text-align: center;
            }

          </style>

        </head>

        <body>

          <h2>
            Nirmalani Plantation
          </h2>

          <h3>
            Rubber Dispatch Report
          </h3>

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
                <th>Date</th>
                <th>Liters Sent</th>
              </tr>

            </thead>

            <tbody>

              ${tableRows}

              <tr>
                <td>
                  <b>Total Sent</b>
                </td>

                <td>
                  <b>${totalSent.toFixed(2)}</b>
                </td>
              </tr>

              <tr>
                <td>
                  <b>Remaining Stock</b>
                </td>

                <td>
                  <b>${balance.toFixed(2)}</b>
                </td>
              </tr>

            </tbody>

          </table>

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

  const rows = data.filter((row) => {

    const current =
      new Date(row.date);

    return (
      current >= new Date(weekStart) &&
      current <= new Date(weekEnd)
    );
  });

  if (rows.length === 0) {

    alert("No records found");

    return;
  }

  let total = 0;

  const tableRows = rows.map((row) => {

    total += Number(row.liters_sent);

    return `
      <tr>

        <td>
          ${new Date(row.date)
            .toISOString()
            .split("T")[0]}
        </td>

        <td>
          ${row.liters_sent}
        </td>

      </tr>
    `;
  }).join("");

  const html = `
    <html>

      <head>

        <title>
          Nirmalani Plantation Weekly Dispatch Report
        </title>

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
            border:1px solid black;
            padding:10px;
            text-align:center;
          }

          th{
            background:#eee;
          }

        </style>

      </head>

      <body>

        <h2>
          Nirmalani Plantation
        </h2>

        <h3>
          Weekly Rubber Dispatch Report
        </h3>

        <p>
          From: ${weekStart}
          <br/>
          To: ${weekEnd}
        </p>

        <table>

          <thead>

            <tr>
              <th>Date</th>
              <th>Liters Sent</th>
            </tr>

          </thead>

          <tbody>

            ${tableRows}

            <tr>

              <td>
                <b>Total Sent</b>
              </td>

              <td>
                <b>${total.toFixed(2)}</b>
              </td>

            </tr>

          </tbody>

        </table>

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

  // SAVE COLLECTION
const saveCollection = async () => {

  if (!collectedLiters || !collectionDate) {
    alert("Fill all fields");
    return;
  }

  try {

    await axios.post(
      `${API}/rubber-collection`,
      {
        liters_collected: collectedLiters,
        date: collectionDate
      }
    );

    alert("✅ Collection Saved");

    setCollectedLiters("");
    setCollectionDate("");

    fetchCollection();

  } catch (err) {

    console.error(err);

    alert("Error");
  }
};

  return (

    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a, #1e293b)"
      }}
    >

      {/* HEADER */}
      <Typography
        variant="h4"
        sx={{
          color: "#fff",
          fontWeight: 800,
          mb: 3
        }}
      >
        🛻 Rubber Dispatch to DPL

        {/* COLLECTION ENTRY */}
        <Paper
        sx={{
            p: 3,
            mb: 4,
            borderRadius: 5,
            background:
            "rgba(255,255,255,0.05)"
        }}
        >

        <Typography
            sx={{
            color: "#fff",
            mb: 2
            }}
        >
            🛢️ Rubber Collection
        </Typography>

        <Grid container spacing={2}>

            <Grid item xs={12} md={4}>

            <TextField
                label="Collected Liters"
                type="number"
                fullWidth
                value={collectedLiters}
                onChange={(e) =>
                setCollectedLiters(e.target.value)
                }
                sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" }
                }}
            />

            </Grid>

            <Grid item xs={12} md={4}>

            <TextField
                type="date"
                fullWidth
                value={collectionDate}
                onChange={(e) =>
                setCollectionDate(e.target.value)
                }
                sx={{
                input: { color: "#fff" }
                }}
            />

            </Grid>

            <Grid item xs={12} md={4}>

            <Button
                fullWidth
                onClick={saveCollection}
                sx={{
                height: "100%",
                background:
                    "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                fontWeight: "bold"
                }}
            >
                Save Collection
            </Button>

            </Grid>

        </Grid>

        </Paper>

      </Typography>

      {/* FORM */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          background:
            "rgba(255,255,255,0.05)"
        }}
      >

        <Grid container spacing={2}>

          <Grid item xs={12} md={4}>

            <TextField
              label="Liters Sent"
              type="number"
              fullWidth
              value={liters}
              onChange={(e) =>
                setLiters(e.target.value)
              }
              sx={{
                input: { color: "#fff" },
                label: { color: "#aaa" }
              }}
            />

          </Grid>

          <Grid item xs={12} md={4}>

            <TextField
              type="date"
              fullWidth
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              sx={{
                input: { color: "#fff" }
              }}
            />

          </Grid>

          <Grid item xs={12} md={4}>

            <Button
              fullWidth
              onClick={saveDispatch}
              sx={{
                height: "100%",
                background:
                  "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                fontWeight: "bold"
              }}
            >
              Save Dispatch
            </Button>

          </Grid>

        </Grid>

      </Paper>

      {plantation === "ingurupaththala" && (

        <Paper
          sx={{
            p:3,
            mb:4,
            borderRadius:5,
            background:"rgba(255,255,255,0.05)"
          }}
        >

          <Typography
            sx={{
              color:"#fff",
              mb:2
            }}
          >
            💰 Ottapalu Collection
          </Typography>

          <Grid container spacing={2}>

            <Grid item xs={12} md={4}>
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                value={ottapaluQty}
                onChange={(e)=>
                  setOttapaluQty(e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                type="date"
                fullWidth
                value={ottapaluDate}
                onChange={(e)=>
                  setOttapaluDate(e.target.value)
                }
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <Button
                fullWidth
                onClick={saveOttapalu}
              >
                Save Ottapalu
              </Button>
            </Grid>

          </Grid>

        </Paper>

      )}

      
      {/* SUMMARY */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background:
            "rgba(255,255,255,0.05)"
        }}
      >

        <Typography sx={{ color: "#fff" }}>
          Total Collected:
          {" "}
          {totalCollected.toFixed(2)} L
        </Typography>

        <Typography sx={{ color: "#fff" }}>
          Total Sent to DPL:
          {" "}
          {totalSent.toFixed(2)} L
        </Typography>

        <Typography
          sx={{
            color: "#22c55e",
            fontWeight: "bold"
          }}
        >
          Remaining Stock:
          {" "}
          {balance.toFixed(2)} L
        </Typography>

      </Paper>

      {/* FILTER */}
      <Box sx={{ mb: 2 }}>

       <TextField
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            InputLabelProps={{
              shrink: true
            }}
            helperText="Filter By Month"
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
        onClick={printWeeklyReport}
        sx={{
          ml: 2,
          background: "#0ea5e9",
          color: "#fff",
          height: "56px",
          fontWeight: "bold"
        }}
      >
        Weekly Report
      </Button>

      <Button
        onClick={printMonthlyReport}
        sx={{
          ml: 2,
          background: "#22c55e",
          color: "#000",
          height: "56px",
          fontWeight: "bold"
        }}
      >
        Monthly Report
      </Button>

      </Box>

      {/* TABLE */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 5,
          background:
            "rgba(255,255,255,0.05)"
        }}
      >

        <Table>

          <TableHead>

            <TableRow>

              <TableCell sx={{ color: "#aaa" }}>
                Date
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                Liters Sent
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                Actions
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {data
              .filter(
                row =>
                  !filterMonth ||
                  row.date.substring(0, 7)
                    === filterMonth
              )
              .map((row) => (

                <TableRow key={row.id}>

                  <TableCell sx={{ color: "#fff" }}>
                    {new Date(row.date)
                      .toISOString()
                      .split("T")[0]}
                  </TableCell>

                  <TableCell
                    sx={{ color: "#22c55e" }}
                  >

                    {editingId === row.id ? (

                      <Box
                        sx={{
                          display: "flex",
                          gap: 1
                        }}
                      >

                        <TextField
                          size="small"
                          type="number"
                          value={editLiters}
                          onChange={(e) =>
                            setEditLiters(
                              e.target.value
                            )
                          }
                          sx={{
                            width: 100,
                            input: {
                              color: "#fff"
                            }
                          }}
                        />

                        <Button
                          onClick={() =>
                            updateDispatch(row.id)
                          }
                          sx={{
                            background: "#22c55e",
                            color: "#000"
                          }}
                        >
                          Save
                        </Button>

                      </Box>

                    ) : (

                      row.liters_sent

                    )}

                  </TableCell>

                  <TableCell>

                    <Button
                      onClick={() => {

                        setEditingId(row.id);

                        setEditLiters(
                          row.liters_sent
                        );
                      }}
                      sx={{
                        background: "#facc15",
                        color: "#000",
                        mr: 1
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() =>
                        deleteDispatch(row.id)
                      }
                      sx={{
                        background: "#ef4444",
                        color: "#fff"
                      }}
                    >
                      Delete
                    </Button>

                  </TableCell>

                </TableRow>
              ))}

          </TableBody>

        </Table>

      </Paper>

    </Box>
  );
}