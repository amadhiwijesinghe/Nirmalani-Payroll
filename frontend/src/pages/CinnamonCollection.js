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
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";

const API =
  "https://nirmalani-payroll-production.up.railway.app";

export default function CinnamonCollection({
  plantation
}) {

  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [workerName, setWorkerName] = useState("");
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [editWorkerName, setEditWorkerName] = useState("");
  const [workerSearch, setWorkerSearch] = useState("");
  const [viewWorker, setViewWorker] = useState(null);

  const [workerId, setWorkerId] = useState("");

  const [date, setDate] = useState("");
  const [sticks, setSticks] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editSticks, setEditSticks] = useState("");

  const [filterMonth, setFilterMonth] = useState("");
  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");

  // CINNAMON WAREHOUSE
const [warehouseData, setWarehouseData] = useState([]);
const [viewWarehouseWorker, setViewWarehouseWorker] = useState(null);
const [warehouseWorkerId, setWarehouseWorkerId] = useState("");
const [warehouseDate, setWarehouseDate] = useState("");
const [warehouseWeight, setWarehouseWeight] = useState("");
const [warehouseBundles, setWarehouseBundles] = useState("");
const [warehouseSticksPerBundle, setWarehouseSticksPerBundle] = useState("");

const [editingWarehouseId, setEditingWarehouseId] = useState(null);
const [editWarehouseDate, setEditWarehouseDate] = useState("");
const [editWarehouseWeight, setEditWarehouseWeight] = useState("");
const [editWarehouseBundles, setEditWarehouseBundles] = useState("");
const [editWarehouseSticksPerBundle, setEditWarehouseSticksPerBundle] = useState("");
const [editWarehouseSticks, setEditWarehouseSticks] = useState("");


  useEffect(() => {

  fetchWorkers();
  fetchData();
  fetchWarehouseData();

}, [plantation]);

// FETCH CINNAMON WORKERS
const fetchWorkers = async () => {

    try {

        const res = await axios.get(
            `${API}/cinnamon-workers?plantation=${plantation}`
        );

        setWorkers(res.data || []);

    } catch (err) {

        console.error(
            "Cinnamon Workers Load Error:",
            err.response?.data || err
        );

    }

};

// ADD CINNAMON WORKER
const addWorker = async () => {

    if (!workerName.trim()) {

        alert("Please enter worker name");

        return;

    }

    try {

        await axios.post(
            `${API}/cinnamon-workers`,
            {
                name: workerName.trim(),
                plantation
            }
        );

        setWorkerName("");

        fetchWorkers();

        alert("✅ Cinnamon Worker Added");

    } catch (err) {

        console.error(
            "Cinnamon Worker Add Error:",
            err.response?.data || err
        );

        alert("Failed to add worker");

    }

};

// UPDATE CINNAMON WORKER
const updateWorker = async (id) => {

    if (!editWorkerName.trim()) {

        alert("Please enter worker name");

        return;

    }

    try {

        await axios.put(
            `${API}/cinnamon-workers/${id}`,
            {
                name: editWorkerName.trim()
            }
        );

        setEditingWorkerId(null);
        setEditWorkerName("");

        fetchWorkers();

    } catch (err) {

        console.error(
            "Cinnamon Worker Update Error:",
            err.response?.data || err
        );

        alert("Failed to update worker");

    }

};

// DELETE CINNAMON WORKER
const deleteWorker = async (id) => {

    if (
        !window.confirm(
            "Are you sure you want to delete this Cinnamon Worker?"
        )
    ) {
        return;
    }

    try {

        await axios.delete(
            `${API}/cinnamon-workers/${id}`
        );

        fetchWorkers();

    } catch (err) {

        console.error(
            "Cinnamon Worker Delete Error:",
            err.response?.data || err
        );

        alert("Failed to delete worker");

    }

};

  // FETCH DATA
  const fetchData = async () => {

    const res = await axios.get(
      `${API}/cinnamon-collection?plantation=${plantation}`
    );

    setData(res.data);
  };

// ================= CINNAMON WAREHOUSE =================

// FETCH WAREHOUSE DATA
const fetchWarehouseData = async () => {
  try {
    const res = await axios.get(
      `${API}/cinnamon-warehouse?plantation=${plantation}`
    );

    setWarehouseData(res.data || []);

  } catch (err) {
    console.error(
      "Cinnamon Warehouse Load Error:",
      err.response?.data || err
    );
  }
};


// SAVE WAREHOUSE
const saveWarehouse = async () => {

  if (!warehouseWorkerId || !warehouseDate) {
    alert("Please select worker and date");
    return;
  }

  try {

    await axios.post(
      `${API}/cinnamon-warehouse`,
      {
        worker_id: warehouseWorkerId,
        plantation,
        transaction_date: warehouseDate,
        weight: warehouseWeight || 0,
        bundles: warehouseBundles || 0,
        sticks_per_bundle: warehouseSticksPerBundle || 0
      }
    );

    alert("✅ Cinnamon Warehouse Saved");

    setWarehouseWorkerId("");
    setWarehouseDate("");
    setWarehouseWeight("");
    setWarehouseBundles("");
    setWarehouseSticksPerBundle("");

    fetchWarehouseData();

  } catch (err) {

    console.error(
      "Cinnamon Warehouse Save Error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      "Error saving warehouse entry"
    );
  }
};


// DELETE WAREHOUSE
const deleteWarehouse = async (id) => {

  if (!window.confirm("Delete warehouse entry?")) {
    return;
  }

  try {

    await axios.delete(
      `${API}/cinnamon-warehouse/${id}`
    );

    alert("Deleted");

    fetchWarehouseData();

  } catch (err) {

    console.error(
      "Cinnamon Warehouse Delete Error:",
      err.response?.data || err
    );

    alert("Delete failed");
  }
};


// UPDATE WAREHOUSE
const updateWarehouse = async (id) => {

  try {

    await axios.put(
      `${API}/cinnamon-warehouse/${id}`,
      {
        transaction_date: editWarehouseDate,
        weight: editWarehouseWeight || 0,
        bundles: editWarehouseBundles || 0,
        sticks_per_bundle:
          editWarehouseSticksPerBundle || 0
      }
    );

    alert("✅ Warehouse Updated");

    setEditingWarehouseId(null);

    fetchWarehouseData();

  } catch (err) {

    console.error(
      "Cinnamon Warehouse Update Error:",
      err.response?.data || err
    );

    alert("Update failed");
  }
};

  // SAVE CINNAMON COLLECTION
const saveCinnamonCollection = async () => {

  if (!workerId || !date || !sticks) {
    alert("Fill all fields");
    return;
  }

  try {

    await axios.post(
      `${API}/cinnamon-collection`,
      {
        worker_id: workerId,
        date,
        sticks,
        plantation
      }
    );

    alert("✅ Cinnamon Collection Saved");

    setWorkerId("");
    setDate("");
    setSticks("");

    fetchData();

  } catch (err) {

    console.error(
      "Cinnamon Collection Save Error:",
      err.response?.data || err
    );

    alert(
      err.response?.data?.message ||
      "Error saving"
    );
  }
};


  // DELETE
  const deleteCollection = async (id) => {

    if (!window.confirm("Delete entry?")) {
      return;
    }

    try {

      await axios.delete(
        `${API}/cinnamon-collection/${id}`
      );

      alert("Deleted");

      fetchData();

    } catch (err) {

      console.error(err);
    }
  };

  // UPDATE KG
const updateSticks = async (id) => {

  if (!editSticks) {
    alert("Enter quantity of sticks");
    return;
  }

  try {

    await axios.put(
      `${API}/cinnamon-collection/${id}`,
      {
        sticks: editSticks
      }
    );

    alert("✅ Updated");

    setEditingId(null);
    setEditSticks("");

    fetchData();

  } catch (err) {

    console.error(
      "Cinnamon Collection Update Error:",
      err.response?.data || err
    );

    alert("Update failed");
  }
};

// TOTAL KG
  const totalSticks = data
    .filter(
      row =>
        !filterMonth ||
        row.date.substring(0, 7) === filterMonth
    )
    .reduce(
      (acc, row) => acc + Number(row.sticks),
      0
    );

        // PRINT MONTLY AND WEEKLY REPORTS
    const printMonthlyReport = () => {

    const rows = data.filter(
        row =>
        !filterMonth ||
        row.date.substring(0, 7) === filterMonth
    );

    let total = 0;

    const tableRows = rows.map(row => {

        total += Number(row.sticks);

        return `
        <tr>
            <td>${row.name}</td>
            <td>${row.date.split("T")[0]}</td>
            <td>${row.sticks}</td>
        </tr>
        `;
    }).join("");

    const workerCount =
        new Set(
            rows.map(row => row.worker_id)
        ).size;

    const html = `
        <html>

        <head>

            <title>Cinnamon Collection Report</title>

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
              ${
                  plantation === "nirmalani"
                      ? "Nirmalani Plantation"
                      : "Common Plantation"
              }
          </h2>

            <h3>
            Cinnamon Collection Report
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
                <th>Date</th>
                <th>Sticks</th>
                </tr>

            </thead>

            <tbody>

                ${tableRows}

                <tr>
                <td colspan="3">
                    <b>TOTAL STICKS</b>
                </td>

                <td>
                    <b>${total.toFixed(2)}</b>
                </td>
                </tr>

            </tbody>

            </table>

            <hr>

            <h2>Summary</h2>

            <p>
            රැස් කරගත් මුළු කුරුඳු ප්‍රමාණය:
            <b>${total.toFixed(2)} sticks</b>
            </p>

            <p>
            වැඩ කල සේවකයන් ගණන:
            <b>${workerCount}</b>
            </p>

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

    total += Number(row.sticks);

    return `
      <tr>
        <td>${row.name}</td>
        <td>
          ${new Date(row.date)
            .toISOString()
            .split("T")[0]}
        </td>
        <td>${row.sticks}</td>
      </tr>
    `;
  }).join("");

  const workerCount =
    new Set(
        rows.map(row => row.worker_id)
    ).size;

  const html = `
    <html>

      <head>

        <title>Weekly Cinnamon Collection Report</title>

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
          ${
              plantation === "nirmalani"
                ? "Nirmalani Plantation"
                : "Common Plantation"
              }
        </h2>

        <h3>
          Weekly Cinnamon Collection Report
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
              <th>Date</th>
              <th>Sticks Plucked</th>
            </tr>

          </thead>

          <tbody>

            ${tableRows}

            <tr>

              <td colspan="3">
                <b>Total Sticks</b>
              </td>

              <td>
                <b>${total.toFixed(2)}</b>
              </td>

            </tr>

          </tbody>

        </table>

        <hr>

        <h2>Summary</h2>

        <p>
        රැස් කරගත් මුළු කුරුඳු ප්‍රමාණය:
        <b>${total.toFixed(2)} sticks</b>
        </p>

        <p>
        වැඩ කල සේවකයන් ගණන:
        <b>${workerCount}</b>
        </p>

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

const filteredWorkers = workers.filter((worker) =>
    worker.name
        ?.toLowerCase()
        .includes(workerSearch.trim().toLowerCase())
);


const summaryRows = Object.values(
    data
        .filter(
            row =>
                !filterMonth ||
                row.date.substring(0, 7) === filterMonth
        )
        .reduce((acc, row) => {

            const workerId = row.worker_id;

            if (!acc[workerId]) {
                acc[workerId] = {
                    worker_id: workerId,
                    name: row.name,
                    total: 0
                };
            }

            acc[workerId].total += Number(row.sticks || 0);

            return acc;

        }, {})
);

const warehouseSummaryRows = Object.values(
    warehouseData.reduce((acc, row) => {

        const workerId = row.worker_id;

        if (!acc[workerId]) {
            acc[workerId] = {
                worker_id: workerId,
                name: row.name || "-",
                totalWeight: 0,
                totalBundles: 0,
                totalSticks: 0
            };
        }

        const weight = Number(row.weight || 0);
        const bundles = Number(row.bundles || 0);
        const sticksPerBundle =
            Number(row.sticks_per_bundle || 0);

        // Total weight
        acc[workerId].totalWeight += weight;

        // Total bundles
        acc[workerId].totalBundles += bundles;

        // Total sticks
        acc[workerId].totalSticks +=
            bundles * sticksPerBundle;

        return acc;

    }, {})
);

const warehouseGrandTotalWeight =
    warehouseSummaryRows.reduce(
        (sum, worker) =>
            sum + Number(worker.totalWeight || 0),
        0
    );

const warehouseGrandTotalBundles =
    warehouseSummaryRows.reduce(
        (sum, worker) =>
            sum + Number(worker.totalBundles || 0),
        0
    );

const warehouseGrandTotalSticks =
    warehouseSummaryRows.reduce(
        (sum, worker) =>
            sum + Number(worker.totalSticks || 0),
        0
    );

const workerCollectionData = viewWorker
    ? data.filter(
        (row) =>
            Number(row.worker_id) ===
            Number(viewWorker.worker_id)
      )
    : [];

const workerCollectionTotal =
    workerCollectionData.reduce(
        (sum, row) =>
            sum + Number(row.sticks || 0),
        0
    );


const warehouseWorkerRecords = viewWarehouseWorker
    ? warehouseData.filter(
        row =>
            Number(row.worker_id) ===
            Number(viewWarehouseWorker.worker_id)
      )
    : [];

const warehouseWorkerTotal =
    warehouseWorkerRecords.reduce(
        (sum, row) =>
            sum + Number(row.weight || 0),
        0
    );

const warehouseTotalBundles =
    warehouseWorkerRecords.reduce(
        (sum, row) =>
            sum + Number(row.bundles || 0),
        0
    );

const warehouseTotalSticks =
    warehouseWorkerRecords.reduce(
        (sum, row) =>
            sum +
            (
                Number(row.bundles || 0) *
                Number(row.sticks_per_bundle || 0)
            ),
        0
    );

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
        🌿 Cinnamon Collection
      </Typography>

      {/* ================= CINNAMON WORKERS ================= */}

        <Paper
            sx={{
                p: 3,
                mb: 4,
                borderRadius: 5,
                background: "rgba(255,255,255,0.05)"
            }}
        >

            <Typography
                variant="h6"
                sx={{
                    mb: 2,
                    color: "#fff",
                    fontWeight: "bold"
                }}
            >
                👥 Cinnamon Workers
            </Typography>


            {/* ADD WORKER */}

            <Grid
                container
                spacing={2}
                sx={{ mb: 3 }}
            >

                <Grid item xs={12} md={8}>

                    <TextField
                        label="Worker Name"
                        fullWidth
                        value={workerName}
                        onChange={(e) =>
                            setWorkerName(e.target.value)
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


                <Grid item xs={12} md={4}>

                    <Button
                        fullWidth
                        onClick={addWorker}
                        sx={{
                            height: "100%",
                            background:
                                "linear-gradient(135deg,#22c55e,#4ade80)",
                            color: "#000",
                            borderRadius: 3,
                            fontWeight: "bold"
                        }}
                    >
                        + Add Worker
                    </Button>

                </Grid>

            </Grid>

            {/* SEARCH WORKER */}

            <Box sx={{ mb: 3 }}>

                <TextField
                    fullWidth
                    label="🔍 Search Cinnamon Worker"
                    placeholder="Type worker name..."
                    value={workerSearch}
                    onChange={(e) =>
                        setWorkerSearch(e.target.value)
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

            </Box>


            {/* WORKER LIST */}

            <Table>

                <TableHead>

                  <TableRow>

                      <TableCell sx={{ color: "#aaa" }}>
                          #
                      </TableCell>

                      <TableCell sx={{ color: "#aaa" }}>
                          Worker
                      </TableCell>

                      <TableCell sx={{ color: "#aaa" }}>
                          Total Weight
                      </TableCell>

                      <TableCell sx={{ color: "#aaa" }}>
                          Actions
                      </TableCell>

                  </TableRow>

              </TableHead>


                <TableBody>

                  {workerSearch.trim() !== "" &&
                      filteredWorkers.map((worker, index) => (

                        <TableRow key={worker.id}>

                            <TableCell sx={{ color: "#fff" }}>
                                {index + 1}
                            </TableCell>


                            <TableCell sx={{ color: "#fff" }}>

                                {editingWorkerId === worker.id ? (

                                    <TextField
                                        size="small"
                                        value={editWorkerName}
                                        onChange={(e) =>
                                            setEditWorkerName(
                                                e.target.value
                                            )
                                        }
                                    />

                                ) : (

                                    worker.name

                                )}

                            </TableCell>


                            <TableCell align="right">

                                {editingWorkerId === worker.id ? (

                                <>
                                    <Button
                                        onClick={() =>
                                            updateWorker(worker.id)
                                        }
                                        sx={{
                                            background: "#22c55e",
                                            color: "#000",
                                            mr: 1
                                        }}
                                    >
                                        Save
                                    </Button>
                                </>

                                ) : (

                                  <>
          
                                    <Button
                                        onClick={() => {

                                            setEditingWorkerId(
                                                worker.id
                                            );

                                            setEditWorkerName(
                                                worker.name
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
                                        deleteWorker(worker.id)
                                    }
                                    sx={{
                                        background: "#ef4444",
                                        color: "#fff"
                                    }}
                                >
                                    Delete
                                </Button>

                                </>
                                )}

                                

                            </TableCell>

                        </TableRow>

                    ))}

                </TableBody>

            </Table>

              {workerSearch.trim() !== "" &&
                filteredWorkers.length === 0 && (
                    <Typography
                        sx={{
                            color: "#aaa",
                            mt: 2,
                            textAlign: "center"
                        }}
                    >
                        No Cinnamon Worker found.
                    </Typography>
                )}

        </Paper>

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
                  setWorkerId(e.target.value);
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

          {/* QUANTITY OF STICKS */}
            <Grid item xs={12} md={3}>

              <TextField
                label="Quantity of Sticks"
                type="number"
                fullWidth
                value={sticks}
                onChange={(e) =>
                  setSticks(e.target.value)
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
              onClick={saveCinnamonCollection}
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
                    Total Sticks
                </TableCell>

                <TableCell sx={{ color: "#aaa" }}>
                    Actions
                </TableCell>

            </TableRow>
              </TableHead>

                <TableBody>

          {summaryRows.map((worker) => (

              <TableRow key={worker.worker_id}>

                  <TableCell sx={{ color: "#fff" }}>
                      {worker.name}
                  </TableCell>

                  <TableCell
                      sx={{
                          color: "#22c55e",
                          fontWeight: "bold"
                      }}
                  >
                      {worker.total.toLocaleString()}
                  </TableCell>

                  <TableCell>

                      <Button
                          onClick={() =>
                              setViewWorker(worker)
                          }
                          sx={{
                              background: "#3b82f6",
                              color: "#fff",
                              fontWeight: "bold",
                              mr: 1,
                              "&:hover": {
                                  background: "#2563eb"
                              }
                          }}
                      >
                          View
                      </Button>

                  </TableCell>

              </TableRow>

          ))}

      </TableBody>

        </Table>

      </Paper>

      {/* ================= CINNAMON WAREHOUSE ================= */}

      <Paper
        sx={{
          p: 3,
          mt: 4,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)"
        }}
      >

        <Typography
          variant="h6"
          sx={{
            mb: 3,
            color: "#fff",
            fontWeight: "bold"
          }}
        >
          🏭 Cinnamon Warehouse
        </Typography>

        <Grid container spacing={2}>

          {/* WORKER */}
          <Grid item xs={12} md={3}>

            <FormControl fullWidth>

              <InputLabel sx={{ color: "#aaa" }}>
                Worker
              </InputLabel>

              <Select
                value={warehouseWorkerId}
                onChange={(e) =>
                  setWarehouseWorkerId(e.target.value)
                }
                sx={{
                  color: "#fff"
                }}
              >

                <MenuItem value="">
                  Select Worker
                </MenuItem>

                {workers.map((worker) => (

                  <MenuItem
                    key={worker.id}
                    value={worker.id}
                  >
                    {worker.name}
                  </MenuItem>

                ))}

              </Select>

            </FormControl>

          </Grid>


          {/* DATE */}
          <Grid item xs={12} md={2}>

            <TextField
              type="date"
              fullWidth
              value={warehouseDate}
              onChange={(e) =>
                setWarehouseDate(e.target.value)
              }
              sx={{
                input: {
                  color: "#fff"
                }
              }}
            />

          </Grid>


          {/* WEIGHT */}
          <Grid item xs={12} md={2}>

            <TextField
              label="Weight"
              type="number"
              fullWidth
              value={warehouseWeight}
              onChange={(e) =>
                setWarehouseWeight(e.target.value)
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


          {/* BUNDLES */}
          <Grid item xs={12} md={2}>

            <TextField
              label="Bundles"
              type="number"
              fullWidth
              value={warehouseBundles}
              onChange={(e) =>
                setWarehouseBundles(e.target.value)
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


          {/* STICKS PER BUNDLE */}
          <Grid item xs={12} md={2}>

            <TextField
              label="Sticks / Bundle"
              type="number"
              fullWidth
              value={warehouseSticksPerBundle}
              onChange={(e) =>
                setWarehouseSticksPerBundle(e.target.value)
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


          {/* SAVE */}
          <Grid item xs={12} md={1}>

            <Button
              fullWidth
              onClick={saveWarehouse}
              sx={{
                height: "100%",
                minHeight: "56px",
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

      {/* ================= WAREHOUSE RECORDS ================= */}

      <Paper
        sx={{
          p: 2,
          mt: 3,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)"
        }}
      >

        <Typography
          variant="h6"
          sx={{
            mb: 2,
            color: "#fff",
            fontWeight: "bold"
          }}
        >
          📦 Warehouse Records
        </Typography>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell sx={{ color: "#aaa" }}>
                #
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                Worker
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                Weight
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                Bundles
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                Sticks / Bundle
              </TableCell>

              <TableCell sx={{ color: "#aaa" }}>
                Actions
              </TableCell>

            </TableRow>

          </TableHead>


          <TableBody>

            {warehouseSummaryRows.map((worker, index) => (

                <TableRow key={worker.worker_id}>

                    <TableCell sx={{ color: "#fff" }}>
                        {index + 1}
                    </TableCell>

                    <TableCell sx={{ color: "#fff" }}>
                        {worker.name}
                    </TableCell>

                    <TableCell
                        sx={{
                            color: "#22c55e",
                            fontWeight: "bold"
                        }}
                    >
                        {worker.totalWeight.toLocaleString()}
                    </TableCell>

                    <TableCell
                        sx={{
                            color: "#22c55e",
                            fontWeight: "bold"
                        }}
                    >
                        {worker.totalBundles.toLocaleString()}
                    </TableCell>

                    <TableCell
                        sx={{
                            color: "#22c55e",
                            fontWeight: "bold"
                        }}
                    >
                        {worker.totalSticks.toLocaleString()}
                    </TableCell>

                    <TableCell>

                        <Button
                            onClick={() =>
                                setViewWarehouseWorker(worker)
                            }
                            sx={{
                                background: "#3b82f6",
                                color: "#fff",
                                fontWeight: "bold",
                                "&:hover": {
                                    background: "#2563eb"
                                }
                            }}
                        >
                            View
                        </Button>

                    </TableCell>

                </TableRow>

            ))}


            {/* GRAND TOTAL */}

            <TableRow>

                <TableCell
                    colSpan={2}
                    sx={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    TOTAL WAREHOUSE
                </TableCell>

                <TableCell
                    sx={{
                        color: "#22c55e",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    {warehouseGrandTotalWeight.toLocaleString()}
                </TableCell>

                <TableCell
                    sx={{
                        color: "#22c55e",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    {warehouseGrandTotalBundles.toLocaleString()}
                </TableCell>

                <TableCell
                    sx={{
                        color: "#22c55e",
                        fontWeight: "bold",
                        fontSize: "16px"
                    }}
                >
                    {warehouseGrandTotalSticks.toLocaleString()}
                </TableCell>

                <TableCell />

            </TableRow>

        </TableBody>

        </Table>

      </Paper>

      <Dialog
        open={Boolean(viewWarehouseWorker)}
        onClose={() => setViewWarehouseWorker(null)}
        fullWidth
        maxWidth="lg"
        PaperProps={{
            sx: {
                width: "100%",
                maxWidth: {
                    xs: "100%",
                    sm: "95%",
                    md: "1000px"
                },
                m: {
                    xs: 1,
                    sm: 2
                },
                borderRadius: {
                    xs: 2,
                    sm: 3
                }
            }
        }}
    >

        <DialogTitle
          sx={{
              fontWeight: 700,
              pb: 1
          }}
      >
          🏭 Warehouse Records

          <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
          >
              Worker: {viewWarehouseWorker?.name || "-"}
          </Typography>
      </DialogTitle>

        <DialogContent>


            {warehouseWorkerRecords.length === 0 ? (

                <Typography color="text.secondary">
                    No warehouse records found for this worker.
                </Typography>

            ) : (

                <Box
                  sx={{
                      width: "100%",
                      overflowX: "auto",
                      WebkitOverflowScrolling: "touch"
                  }}
              >
                  <Table
                      sx={{
                          minWidth: 750
                      }}
                  >

                    <TableHead>
                      <TableRow>

                          <TableCell>
                              Date
                          </TableCell>

                          <TableCell align="right">
                              Weight
                          </TableCell>

                          <TableCell align="right">
                              Bundles
                          </TableCell>

                          <TableCell align="right">
                              Sticks / Bundle
                          </TableCell>

                          <TableCell align="right">
                              Actions
                          </TableCell>

                      </TableRow>
                  </TableHead>


                    <TableBody>

                        {warehouseWorkerRecords.map((row) => (

                           <TableRow key={row.id}>

                            {/* DATE */}

                            <TableCell>

                                {editingWarehouseId === row.id ? (

                                    <TextField
                                        type="date"
                                        size="small"
                                        value={editWarehouseDate}
                                        onChange={(e) =>
                                            setEditWarehouseDate(e.target.value)
                                        }
                                        InputLabelProps={{
                                            shrink: true
                                        }}
                                    />

                                ) : (

                                    row.transaction_date
                                        ? String(row.transaction_date).split("T")[0]
                                        : "-"

                                )}

                            </TableCell>


                            {/* WEIGHT */}

                            <TableCell align="right">

                                {editingWarehouseId === row.id ? (

                                    <TextField
                                        type="number"
                                        size="small"
                                        value={editWarehouseWeight}
                                        onChange={(e) =>
                                            setEditWarehouseWeight(e.target.value)
                                        }
                                        sx={{
                                            width: 100
                                        }}
                                    />

                                ) : (

                                    Number(row.weight || 0).toLocaleString()

                                )}

                            </TableCell>


                            {/* BUNDLES */}

                            <TableCell align="right">

                                {editingWarehouseId === row.id ? (

                                    <TextField
                                        type="number"
                                        size="small"
                                        value={editWarehouseBundles}
                                        onChange={(e) =>
                                            setEditWarehouseBundles(e.target.value)
                                        }
                                        sx={{
                                            width: 80
                                        }}
                                    />

                                ) : (

                                    Number(row.bundles || 0).toLocaleString()

                                )}

                            </TableCell>


                            {/* STICKS PER BUNDLE */}

                            <TableCell align="right">

                                {editingWarehouseId === row.id ? (

                                    <TextField
                                        type="number"
                                        size="small"
                                        value={editWarehouseSticksPerBundle}
                                        onChange={(e) =>
                                            setEditWarehouseSticksPerBundle(
                                                e.target.value
                                            )
                                        }
                                        sx={{
                                            width: 100
                                        }}
                                    />

                                ) : (

                                    Number(
                                        row.sticks_per_bundle || 0
                                    ).toLocaleString()

                                )}

                            </TableCell>


                            {/* ACTIONS */}

                            <TableCell align="right">

                                {editingWarehouseId === row.id ? (

                                    <>

                                        <Button
                                          size="small"
                                            onClick={async () => {

                                                await updateWarehouse(row.id);

                                                setEditingWarehouseId(null);

                                            }}
                                            sx={{
                                                background: "#22c55e",
                                                color: "#000",
                                                fontWeight: "bold",
                                                mr: 1,
                                                "&:hover": {
                                                    background: "#16a34a"
                                                }
                                            }}
                                        >
                                            Save
                                        </Button>


                                        <Button
                                          size="small"
                                            onClick={() =>
                                                setEditingWarehouseId(null)
                                            }
                                            sx={{
                                                background: "#9ca3af",
                                                color: "#000",
                                                fontWeight: "bold",
                                                "&:hover": {
                                                    background: "#6b7280"
                                                }
                                            }}
                                        >
                                            Cancel
                                        </Button>

                                    </>

                                ) : (

                                    <>

                                        <Button
                                          size="small"
                                            onClick={() => {

                                                setEditingWarehouseId(row.id);

                                                setEditWarehouseDate(
                                                    row.transaction_date
                                                        ? String(
                                                            row.transaction_date
                                                        ).split("T")[0]
                                                        : ""
                                                );

                                                setEditWarehouseWeight(
                                                    row.weight || ""
                                                );

                                                setEditWarehouseBundles(
                                                    row.bundles || ""
                                                );

                                                setEditWarehouseSticksPerBundle(
                                                    row.sticks_per_bundle || ""
                                                );

                                            }}
                                            sx={{
                                                background: "#facc15",
                                                color: "#000",
                                                fontWeight: "bold",
                                                mr: 1
                                            }}
                                        >
                                            Edit
                                        </Button>


                                        <Button
                                          size="small"
                                            onClick={() =>
                                                deleteWarehouse(row.id)
                                            }
                                            sx={{
                                                background: "#ef4444",
                                                color: "#fff",
                                                fontWeight: "bold"
                                            }}
                                        >
                                            Delete
                                        </Button>

                                    </>

                                )}

                            </TableCell>

                        </TableRow>

                        ))}


                        {/* TOTAL */}

                        <TableRow>

                          <TableCell
                              sx={{
                                  fontWeight: "bold"
                              }}
                          >
                              TOTAL
                          </TableCell>

                          <TableCell
                              align="right"
                              sx={{
                                  fontWeight: "bold",
                                  color: "#16a34a"
                              }}
                          >
                              {warehouseWorkerTotal.toLocaleString()}
                          </TableCell>

                          <TableCell
                              align="right"
                              sx={{
                                  fontWeight: "bold",
                                  color: "#16a34a"
                              }}
                          >
                              {warehouseTotalBundles.toLocaleString()}
                          </TableCell>

                          <TableCell
                              align="right"
                              sx={{
                                  fontWeight: "bold",
                                  color: "#16a34a"
                              }}
                          >
                              {warehouseTotalSticks.toLocaleString()}
                          </TableCell>

                      </TableRow>

                    </TableBody>

                </Table>
                </Box>

            )}

        </DialogContent>


        <DialogActions>

            <Button
                onClick={() =>
                    setViewWarehouseWorker(null)
                }
            >
                Close
            </Button>

        </DialogActions>

    </Dialog>

      {/* VIEW CINNAMON COLLECTION */}

      <Dialog
        open={Boolean(viewWorker)}
        onClose={() => setViewWorker(null)}
        fullWidth
        maxWidth="sm"
      >

        <DialogTitle>
          🌿 Cinnamon Collection
        </DialogTitle>

        <DialogContent>

          <Typography
            sx={{
              fontWeight: "bold",
              mb: 2
            }}
          >
            Worker: {viewWorker?.name}
          </Typography>


          {workerCollectionData.length === 0 ? (

            <Typography color="text.secondary">
              No collection records found for this worker.
            </Typography>

          ) : (

            <Table>

              <TableHead>

                <TableRow>

                  <TableCell>
                      Date
                  </TableCell>

                  <TableCell align="right">
                      Sticks
                  </TableCell>

                  <TableCell align="right">
                      Actions
                  </TableCell>

              </TableRow>

              </TableHead>


              <TableBody>

                {workerCollectionData.map((row) => (

                  <TableRow key={row.id}>

                    <TableCell>
                        {row.date
                            ? String(row.date).split("T")[0]
                            : "-"}
                    </TableCell>

                    <TableCell align="right">

                      {editingId === row.id ? (

                          <Box
                              sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  alignItems: "center",
                                  gap: 1
                              }}
                          >

                              <TextField
                                  size="small"
                                  type="number"
                                  value={editSticks}
                                  onChange={(e) =>
                                      setEditSticks(e.target.value)
                                  }
                                  sx={{
                                      width: 100,
                                      input: {
                                          color: "#fff"
                                      }
                                  }}
                              />

                              <Button
                                  onClick={async () => {
                                      await updateSticks(row.id);
                                  }}
                                  sx={{
                                      background: "#22c55e",
                                      color: "#000",
                                      fontWeight: "bold"
                                  }}
                              >
                                  Save
                              </Button>

                          </Box>

                      ) : (

                          Number(row.sticks || 0).toLocaleString()

                      )}

                  </TableCell>

                    <TableCell align="right">

                        <Button
                            onClick={() => {
                                setEditingId(row.id);
                                setEditSticks(row.sticks);
                            }}
                            sx={{
                                background: "#facc15",
                                color: "#000",
                                fontWeight: "bold",
                                mr: 1
                            }}
                        >
                            Edit
                        </Button>

                        <Button
                            onClick={() =>
                                deleteCollection(row.id)
                            }
                            sx={{
                                background: "#ef4444",
                                color: "#fff",
                                fontWeight: "bold"
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
                    sx={{
                      fontWeight: "bold"
                    }}
                  >
                    TOTAL
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: "bold",
                      color: "#16a34a"
                    }}
                  >
                    {workerCollectionTotal.toLocaleString()}
                  </TableCell>

                </TableRow>

              </TableBody>

            </Table>

          )}

        </DialogContent>


        <DialogActions>

          <Button
            onClick={() =>
              setViewWorker(null)
            }
          >
            Close
          </Button>

        </DialogActions>

      </Dialog>

    </Box>
  );
}