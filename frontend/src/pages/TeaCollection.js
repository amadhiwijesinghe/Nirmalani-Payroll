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

export default function TeaCollection() {

  const [workers, setWorkers] = useState([]);
  const [data, setData] = useState([]);

  const [workerId, setWorkerId] = useState("");
  const [selectedEpf, setSelectedEpf] = useState("");

  const [date, setDate] = useState("");
  const [kg, setKg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editKg, setEditKg] = useState("");

  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {

    fetchWorkers();
    fetchData();

  }, []);

  // FETCH WORKERS
  const fetchWorkers = async () => {

    const res = await axios.get(
      `${API}/plantation-workers`
    );

    setWorkers(res.data);
  };

  // FETCH DATA
  const fetchData = async () => {

    const res = await axios.get(
      `${API}/tea-collection`
    );

    setData(res.data);
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
          kg
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
                  color: "#fff"
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
                borderRadius: 3
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
            label="Filter Month"
            value={filterMonth}
            onChange={(e) =>
              setFilterMonth(e.target.value)
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
                    {row.date}
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