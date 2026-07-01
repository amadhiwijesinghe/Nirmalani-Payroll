import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import dayjs from "dayjs";

import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer
} from "@mui/material";

const API = "https://nirmalani-payroll-production.up.railway.app";


export default function AttendanceRegister({ plantation }) {

  const currentYear = new Date().getFullYear();

  const [month, setMonth] = useState(new Date().getMonth() + 1);

  const [year, setYear] = useState(currentYear);

  // Number of days in selected month
  const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();

  // Temporary empty workers
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isEditing, setIsEditing] = useState(true);

    useEffect(() => {

        loadWorkers();

        loadAttendance();

    }, [plantation, month, year]);

  // Load Workers
  const loadWorkers = async () => {

    try {

        const res = await axios.get(
            `${API}/attendance-register/workers`,
            {
                params: {
                    plantation
                }
            }
        );

        setWorkers(res.data);

        console.log("Workers Loaded:", res.data.length);
        console.log(res.data);

        const duplicateKeys = new Set();

        res.data.forEach(worker => {

            const key = `${worker.worker_type}-${worker.worker_id}`;

            if (duplicateKeys.has(key)) {
                console.log("Duplicate Key:", key, worker);
            }

            duplicateKeys.add(key);

        });

    } catch (err) {

        console.log(err);

    }

};

// Load Attendance
const loadAttendance = async () => {

    try {

        const res = await axios.get(
            `${API}/attendance-register`,
            {
                params: {
                    plantation,
                    month,
                    year
                }
            }
        );

        const attendanceObject = {};

        res.data.forEach(row => {

            const date = dayjs(row.attendance_date)
                .format("YYYY-MM-DD");

            const key =
                `${row.worker_type}-${row.worker_id}-${date}`;

            attendanceObject[key] = row.is_present === 1;

        });

        setAttendance(attendanceObject);

    } catch (err) {

        console.log(err);

    }

};

// Toggle Function
const toggleAttendance = (worker, day) => {

    const date = dayjs(`${year}-${month}-${day}`)
        .format("YYYY-MM-DD");

    const key =
        `${worker.worker_type}-${worker.worker_id}-${date}`;

    setAttendance(prev => ({
        ...prev,
        [key]: !prev[key]
    }));

};

// Save Attendance
const saveAttendance = async () => {

    try {

        const attendanceData = [];
        Object.entries(attendance).forEach(([key, value]) => {

            const parts = key.split("-");

            attendanceData.push({

                worker_type: parts[0],

                worker_id: parseInt(parts[1]),

                attendance_date: `${parts[2]}-${parts[3]}-${parts[4]}`,

                plantation,

                is_present: value ? 1 : 0

            });

        });

        await axios.post(
            `${API}/attendance-register`,
            attendanceData
        );

        setIsEditing(false);

        alert("Attendance Saved Successfully");

    } catch (err) {

        console.log(err);

        alert("Error Saving Attendance");

    }

};

  return (

    <Paper
        sx={{
            p: 3,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
        }}
    >

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Attendance Register
      </Typography>

      {/* Toolbar */}

      <Stack
        direction="row"
        spacing={2}
        mb={3}
        flexWrap="wrap"
      >

        <FormControl sx={{ minWidth:150 }}>

          <InputLabel>Month</InputLabel>

          <Select
            value={month}
            label="Month"
            onChange={(e)=>setMonth(e.target.value)}
          >

            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December"
            ].map((m,index)=>(

              <MenuItem
                key={index}
                value={index+1}
              >
                {m}
              </MenuItem>

            ))}

          </Select>

        </FormControl>

        <FormControl sx={{ minWidth:120 }}>

          <InputLabel>Year</InputLabel>

          <Select
            value={year}
            label="Year"
            onChange={(e)=>setYear(e.target.value)}
          >

            {Array.from(
              {length:15},
              (_,i)=>currentYear-5+i
            ).map(y=>(

              <MenuItem
                key={y}
                value={y}
              >
                {y}
              </MenuItem>

            ))}

          </Select>

        </FormControl>

        <Button
            variant="contained"
            color="success"
            onClick={saveAttendance}
            disabled={!isEditing}
        >
            Save
        </Button>

       <Button
            variant="contained"
            color="warning"
            disabled={isEditing}
            onClick={() => setIsEditing(true)}
        >
            Edit
        </Button>

        <Button
          variant="contained"
          color="secondary"
        >
          Finalize
        </Button>

        <Button variant="outlined">

          Print

        </Button>

      </Stack>

      {/* Attendance Table */}

      <TableContainer
        sx={{
            flex: 1,
            overflow: "auto",
            border: "1px solid #444",
            borderRadius: 2
        }}
      >

        <Table stickyHeader>

          <TableHead>

            <TableRow>

              <TableCell
                sx={{
                    width: 90,
                    borderRight: "1px solid rgba(255,255,255,0.15)",
                    fontWeight: "bold"
                }}
            >
                EPF
            </TableCell>

            <TableCell
                sx={{
                    minWidth: 250,
                    borderRight: "2px solid rgba(255,255,255,0.2)",
                    fontWeight: "bold"
                }}
            >
                Name
            </TableCell>

              {Array.from(
                {length:daysInMonth},
                (_,i)=>(
                <TableCell
                    key={i}
                    align="center"
                    sx={{
                        borderLeft: "1px solid rgba(255,255,255,0.08)",
                        borderRight: "1px solid rgba(255,255,255,0.08)",
                        fontWeight: "bold",
                        minWidth: 40
                    }}
                >
                    {i + 1}
                </TableCell>
                )
              )}

            </TableRow>

          </TableHead>

          <TableBody>

            {workers.map(worker=>(

            <TableRow
                key={`${worker.worker_type}-${worker.worker_id}-${worker.name}`}
                sx={{
                    "& td": {
                        borderBottom: "1px solid rgba(255,255,255,0.12)"
                    }
                }}
            >

            <TableCell sx={{ width: 150 }}>
                {worker.epf_no || "-"}
            </TableCell>

            <TableCell
                sx={{
                    minWidth: 250,
                    whiteSpace: "nowrap",
                    fontWeight: 500
                }}
            >
                {worker.name}
            </TableCell>

            {Array.from({ length: daysInMonth }, (_, i) => {

                const date = dayjs(
                    `${year}-${month}-${i + 1}`
                ).format("YYYY-MM-DD");

                const attendanceKey =
                    `${worker.worker_type}-${worker.worker_id}-${date}`;

                return (

                <TableCell
                    key={i}
                    align="center"
                    onClick={
                        isEditing
                            ? () => toggleAttendance(worker, i + 1)
                            : undefined
                    }
                >
                    {attendance[attendanceKey] && (
                        <Box
                            sx={{
                                width: 26,
                                height: 26,
                                borderRadius: 1,
                                bgcolor: "#4caf50",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                margin: "0 auto",
                                fontWeight: "bold",
                                cursor: isEditing
                                    ? "pointer"
                                    : "not-allowed",
                                opacity: isEditing ? 1 : 0.75,
                            }}
                        >
                            ✓
                        </Box>
                    )}
                </TableCell>

                );

            })}

            </TableRow>

            ))}

            </TableBody>

        </Table>

      </TableContainer>

    </Paper>

  );

}