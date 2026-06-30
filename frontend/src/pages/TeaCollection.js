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
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

const API =
  "https://nirmalani-payroll-production.up.railway.app";

export default function TeaCollection({
  plantation
}) {

  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [workerId, setWorkerId] = useState("");
  const [selectedEpf, setSelectedEpf] = useState("");

  const [date, setDate] = useState("");
  const [kg, setKg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editKg, setEditKg] = useState("");

  const [filterMonth, setFilterMonth] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [distributionData, setDistributionData] = useState([]);
  const [distributionDate, setDistributionDate] = useState("");
  const [company, setCompany] = useState("");
  const [distributionKg, setDistributionKg] = useState("");

  useEffect(() => {

    fetchWorkers();
    fetchData();
    fetchDistribution();

  }, [plantation]);

  // FETCH WORKERS
  const fetchWorkers = async () => {

    const res = await axios.get(
      `${API}/plantation-workers?plantation=${plantation}`
    );

    setWorkers(res.data);
  };

  // FETCH DATA
  const fetchData = async () => {

    const res = await axios.get(
      `${API}/tea-collection?plantation=${plantation}`
    );

    setData(res.data);
  };

  //FETCH DISTRIBUTION
  const fetchDistribution = async () => {

    try {

      const res = await axios.get(
        `${API}/tea-distribution?plantation=${plantation}`
      );

      setDistributionData(res.data);

    } catch (err) {

      console.error(err);

    }
  };

  // SAVE TEA COLLECTION
  const saveTeaCollection = async () => {

    if (!workerId || !date || !kg) {

      alert("Fill all fields");

      return;
    }

    try {

      await axios.post(
        `${API}/tea-collection`,
        {
          worker_id: workerId,
          date,
          kg,
          plantation
        }
      );

      alert("✅ Tea Collection Saved");

      setDate("");
      setKg("");

      fetchData();

    } catch (err) {

      console.error(err);

      alert("Error saving");
    }
  };

  const saveDistribution = async () => {

    if (
      !distributionDate ||
      !company ||
      !distributionKg
    ) {
      alert("Fill all fields");
      return;
    }

    try {

      await axios.post(
        `${API}/tea-distribution`,
        {
          distribution_date: distributionDate,
          company,
          kg: distributionKg,
          plantation
        }
      );

      alert("✅ Distribution Saved");

      setDistributionDate("");
      setCompany("");
      setDistributionKg("");

      fetchDistribution();

    } catch (err) {

      console.error(err);

      alert("Error saving distribution");
    }
  };

  // DELETE
  const deleteCollection = async (id) => {

    if (!window.confirm("Delete entry?")) {
      return;
    }

    try {

      await axios.delete(
        `${API}/tea-collection/${id}`
      );

      alert("Deleted");

      fetchData();

    } catch (err) {

      console.error(err);
    }
  };

  // UPDATE KG
    const updateKg = async (id) => {

    if (!editKg) {
        alert("Enter KG");
        return;
    }

    try {

        await axios.put(
        `${API}/tea-collection/${id}`,
        {
            kg: editKg
        }
        );

        alert("✅ Updated");

        setEditingId(null);
        setEditKg("");

        fetchData();

    } catch (err) {

        console.error(err);

        alert("Update failed");
    }
    };

// TOTAL KG
  const totalKg = data
    .filter(
      row =>
        !filterMonth ||
        row.date.substring(0, 7) === filterMonth
    )
    .reduce(
      (acc, row) => acc + Number(row.kg),
      0
    );
// Tea Distribution Summary
    const sawKg = distributionData
      .filter(row => row.company === "SAW")
      .reduce(
        (sum, row) =>
          sum + Number(row.kg || 0),
        0
      );

    const nildiyaKg = distributionData
      .filter(row => row.company === "Nildiya")
      .reduce(
        (sum, row) =>
          sum + Number(row.kg || 0),
        0
      );

    const totalDistributed =
      sawKg + nildiyaKg;

    const remainingStock =
      totalKg - totalDistributed;
        // PRINT MONTLY AND WEEKLY REPORTS
    const printMonthlyReport = () => {

    const rows = data.filter(
        row =>
        !filterMonth ||
        row.date.substring(0, 7) === filterMonth
    );

    let total = 0;

    const tableRows = rows.map(row => {

        total += Number(row.kg);

        return `
        <tr>
            <td>${row.name}</td>
            <td>${row.epf_no}</td>
            <td>${row.date.split("T")[0]}</td>
            <td>${row.kg}</td>
        </tr>
        `;
    }).join("");

    const monthlyDistribution =
      distributionData.filter(
        row =>
          !filterMonth ||
          row.distribution_date?.substring(0,7) === filterMonth
      );

    const distributionRows =
      monthlyDistribution.map(row => `
        <tr>
          <td>${row.distribution_date}</td>
          <td>${row.company}</td>
          <td>${row.kg}</td>
        </tr>
      `).join("");

    const html = `
        <html>

        <head>

            <title>
            Tea Collection Report
            </title>

            <style>

            body {
                font-family: Arial;
                padding: 20px;
            }

            h2 {
                text-align: center;
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

            th {
                background: #eee;
            }

            </style>

        </head>

        <body>

            <h2>
            Nirmalani Plantation
            </h2>

            <h3>
            Tea Collection Report
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
                <th>Name</th>
                <th>EPF</th>
                <th>Date</th>
                <th>KG</th>
                </tr>

            </thead>

            <tbody>

                ${tableRows}

                <tr>
                <td colspan="3">
                    <b>TOTAL KG</b>
                </td>

                <td>
                    <b>${total.toFixed(2)}</b>
                </td>
                </tr>

                <tr>
                  <td colspan="3">
                    <b>SAW Distribution</b>
                  </td>
                  <td>
                    <b>${sawKg.toFixed(2)}</b>
                  </td>
                </tr>

                <tr>
                  <td colspan="3">
                    <b>Nildiya Distribution</b>
                  </td>
                  <td>
                    <b>${nildiyaKg.toFixed(2)}</b>
                  </td>
                </tr>

                <tr>
                  <td colspan="3">
                    <b>Total Distributed</b>
                  </td>
                  <td>
                    <b>${totalDistributed.toFixed(2)}</b>
                  </td>
                </tr>

                <tr>
                  <td colspan="3">
                    <b>Remaining Stock</b>
                  </td>
                  <td>
                    <b>${remainingStock.toFixed(2)}</b>
                  </td>
                </tr>

            </tbody>

            </table>

            <h3>Tea Distribution Details</h3>

              <table>

                <thead>

                  <tr>
                    <th>Date</th>
                    <th>Company</th>
                    <th>KG</th>
                  </tr>

                </thead>

                <tbody>

                  ${distributionRows}

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

    total += Number(row.kg);

    return `
      <tr>
        <td>${row.name}</td>
        <td>${row.epf_no}</td>
        <td>
          ${new Date(row.date)
            .toISOString()
            .split("T")[0]}
        </td>
        <td>${row.kg}</td>
      </tr>
    `;
  }).join("");

  const weeklyDistribution =
    distributionData.filter(row => {

      const d =
        new Date(row.distribution_date);

      return (
        d >= new Date(weekStart) &&
        d <= new Date(weekEnd)
      );
    });

  const distributionRows =
    weeklyDistribution.map(row => `
      <tr>
        <td>${row.distribution_date}</td>
        <td>${row.company}</td>
        <td>${row.kg}</td>
      </tr>
    `).join("");

  const html = `
    <html>

      <head>

        <title>
          Weekly Tea Report
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
          Weekly Tea Collection Report
        </h3>

        <p>
          From: ${weekStart}
          <br/>
          To: ${weekEnd}
        </p>

        <table>

          <thead>

            <tr>
              <th>Name</th>
              <th>EPF No</th>
              <th>Date</th>
              <th>KG Plucked</th>
            </tr>

          </thead>

          <tbody>

            ${tableRows}

            <tr>

              <td colspan="3">
                <b>Total KG</b>
              </td>

              <td>
                <b>${total.toFixed(2)}</b>
              </td>

            </tr>
            <tr>
              <td colspan="3">
                <b>SAW Distribution</b>
              </td>
              <td>
                <b>${sawKg.toFixed(2)}</b>
              </td>
            </tr>

            <tr>
              <td colspan="3">
                <b>Nildiya Distribution</b>
              </td>
              <td>
                <b>${nildiyaKg.toFixed(2)}</b>
              </td>
            </tr>

            <tr>
              <td colspan="3">
                <b>Total Distributed</b>
              </td>
              <td>
                <b>${totalDistributed.toFixed(2)}</b>
              </td>
            </tr>

            <tr>
              <td colspan="3">
                <b>Remaining Stock</b>
              </td>
              <td>
                <b>${remainingStock.toFixed(2)}</b>
              </td>
            </tr>

          </tbody>

        </table>

        <h3>Tea Distribution Details</h3>

          <table>

            <thead>

              <tr>
                <th>Date</th>
                <th>Company</th>
                <th>KG</th>
              </tr>

            </thead>

            <tbody>

              ${distributionRows}

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
        🍃 Tea Collection
      </Typography>

      {/* FORM */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)"
        }}
      >

        <Grid container spacing={2}>

          {/* WORKER */}
          <Grid item xs={12} md={3}>

            <FormControl fullWidth>

              <InputLabel
                sx={{ color: "#aaa" }}
              >
                Worker
              </InputLabel>

              <Select
                value={workerId}
                onChange={(e) => {

                  const id = e.target.value;

                  setWorkerId(id);

                  const selected =
                    workers.find(
                      w => w.id === id
                    );

                  setSelectedEpf(
                    selected?.epf_no || ""
                  );
                }}
                sx={{
                  color: "#fff",
                  width: 250
                }}
              >

                <MenuItem value="">
                  Select Worker
                </MenuItem>

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

          {/* EPF */}
          <Grid item xs={12} md={2}>

            <TextField
              label="EPF"
              fullWidth
              value={selectedEpf}
              InputProps={{
                readOnly: true
              }}
              sx={{
                input: {
                  color: "#fff"
                },
                label: {
                  color: "#aaa"
                }
              }}
            />

          </Grid>

          {/* DATE */}
          <Grid item xs={12} md={2}>

            <TextField
              type="date"
              fullWidth
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              sx={{
                input: {
                  color: "#fff"
                }
              }}
            />

          </Grid>

          {/* KG */}
          <Grid item xs={12} md={2}>

            <TextField
              label="KG"
              type="number"
              fullWidth
              value={kg}
              onChange={(e) =>
                setKg(e.target.value)
              }
              sx={{
                input: {
                  color: "#fff"
                },
                label: {
                  color: "#aaa"
                }
              }}
            />

          </Grid>

          {/* BUTTON */}
          <Grid item xs={12} md={3}>

            <Button
              fullWidth
              onClick={saveTeaCollection}
              sx={{
                height: "100%",
                background:
                  "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                borderRadius: 3,
                fontWeight: "bold"
              }}
            >
              Save
            </Button>

          </Grid>

        </Grid>

      </Paper>

      {plantation === "ingurupaththala" && (
        <>

      <Paper sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)"
        }}
      >

        <Typography variant="h5"
        sx={{ mb: 2, fontWeight: "bold"}}>
          Tea Distribution
        </Typography>

        <Grid container spacing={2}>

          <Grid item xs={4}>
            <TextField
              type="date"
              fullWidth
            />
          </Grid>

          <Grid item xs={4}>
            <Select sx={{width: 200}}>
              <MenuItem value="SAW">
                SAW
              </MenuItem>

              <MenuItem value="Nildiya">
                Nildiya
              </MenuItem>
            </Select>
          </Grid>

          <Grid item xs={4}>
            <TextField
              label="KG"
              type="number"
              fullWidth
            />
          </Grid>

          <Grid item xs={3}>
            <Button
              fullWidth
              onClick={saveDistribution}
              sx={{
                height: "56px",
                background:
                  "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                fontWeight: "bold"
              }}
            >
              Save
            </Button>
          </Grid>

        </Grid>

      </Paper>

      <Paper
        sx={{
          p: 3,
          mt: 2,
          mb: 2,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)"
        }}
      >

        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            mb: 2,
            fontWeight: "bold"
          }}
        >
          Tea Distribution Summary
        </Typography>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell sx={{ color:"#aaa" }}>
                Company
              </TableCell>

              <TableCell sx={{ color:"#aaa" }}>
                KG
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            <TableRow>

              <TableCell sx={{ color:"#fff" }}>
                SAW
              </TableCell>

              <TableCell sx={{ color:"#22c55e" }}>
                {sawKg.toFixed(2)}
              </TableCell>

            </TableRow>

            <TableRow>

              <TableCell sx={{ color:"#fff" }}>
                Nildiya
              </TableCell>

              <TableCell sx={{ color:"#22c55e" }}>
                {nildiyaKg.toFixed(2)}
              </TableCell>

            </TableRow>

            <TableRow>

              <TableCell
                sx={{
                  color:"#fff",
                  fontWeight:"bold"
                }}
              >
                Total Distributed
              </TableCell>

              <TableCell
                sx={{
                  color:"#0ea5e9",
                  fontWeight:"bold"
                }}
              >
                {totalDistributed.toFixed(2)}
              </TableCell>

            </TableRow>

            <TableRow>

              <TableCell
                sx={{
                  color:"#fff",
                  fontWeight:"bold"
                }}
              >
                Remaining Stock
              </TableCell>

              <TableCell
                sx={{
                  color:"#facc15",
                  fontWeight:"bold"
                }}
              >
                {remainingStock.toFixed(2)}
              </TableCell>

            </TableRow>

          </TableBody>

        </Table>

      </Paper>
      </>
    )}

      {/* TABLE */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)"
        }}
      >

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

        </Box>

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

        <Table>

          <TableHead>

            <TableRow>

              <TableCell sx={{ color: "#aaa" }}>
                Name
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                EPF
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                Date
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                KG
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

                  <TableCell
                    sx={{ color: "#fff" }}
                  >
                    {row.name}
                  </TableCell>

                  <TableCell
                    sx={{ color: "#fff" }}
                  >
                    {row.epf_no}
                  </TableCell>

                  <TableCell
                    sx={{ color: "#fff" }}
                  >
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
                            value={editKg}
                            onChange={(e) =>
                            setEditKg(e.target.value)
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
                            updateKg(row.id)
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

                        row.kg

                    )}

                    </TableCell>

                  <TableCell>

                    {/* EDIT */}
                    <Button
                        onClick={() => {

                        setEditingId(row.id);

                        setEditKg(row.kg);
                        }}
                        sx={{
                        background: "#facc15",
                        color: "#000",
                        mr: 1
                        }}
                    >
                        Edit
                    </Button>

                    {/* DELETE */}
                    <Button
                        onClick={() =>
                        deleteCollection(row.id)
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

            {/* TOTAL */}
            <TableRow>

              <TableCell
                colSpan={3}
                sx={{
                  color: "#fff",
                  fontWeight: "bold"
                }}
              >
                TOTAL KG
              </TableCell>

              <TableCell
                sx={{
                  color: "#22c55e",
                  fontWeight: "bold"
                }}
              >
                {totalKg.toFixed(2)}
              </TableCell>

            </TableRow>

          </TableBody>

        </Table>

      </Paper>

    </Box>
  );
}