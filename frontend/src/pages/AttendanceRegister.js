import { useState, useEffect } from "react";
import axios from "axios";
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
  const [workers, setWorkers] = useState([]);
  const [attendance, setAttendance] = useState({});

  const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();

  const today = dayjs();
  const [isEditing, setIsEditing] = useState(true);
  const [isFinalized, setIsFinalized] = useState(false);
  useEffect(()=>{

      loadWorkers();

      loadAttendance();

      loadStatus();

  },[
      plantation,
      month,
      year
  ]);

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

        console.log(res.data);

        setWorkers(res.data);

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

            attendanceObject[key] =
                row.is_present === 1;

        });

        setAttendance(attendanceObject);

    } catch (err) {

        console.log(err);

    }

};

// Toggle Attendance 
const toggleAttendance = (worker, day) => {

    const date = dayjs(
        `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    ).format("YYYY-MM-DD");

    const key = `${worker.worker_type}-${worker.worker_id}-${date}`;

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

                worker_id: Number(parts[1]),

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

// Load Attendance
const loadStatus = async () => {

    try{

        const res = await axios.get(
            `${API}/attendance-register/status`,
            {
                params:{
                    plantation,
                    month,
                    year
                }
            }
        );

        setIsFinalized(res.data.is_finalized === 1);

    }catch(err){

        console.log(err);

    }

};


  return (
    <Paper
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        minHeight: "100%"
      }}
    >

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Attendance Register
      </Typography>

      <Stack
        direction="row"
        spacing={2}
        mb={2}
        sx={{
            flexShrink: 0
        }}
    >

        <FormControl sx={{ minWidth: 160 }}>
          <InputLabel>Month</InputLabel>

          <Select
            value={month}
            label="Month"
            onChange={(e) => setMonth(e.target.value)}
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
            ].map((m, i) => (

              <MenuItem
                key={i}
                value={i + 1}
              >
                {m}
              </MenuItem>

            ))}

          </Select>

        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>

          <Select
            value={year}
            label="Year"
            onChange={(e) => setYear(e.target.value)}
          >

            {Array.from(
              { length: 15 },
              (_, i) => currentYear - 5 + i
            ).map(y => (

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

      </Stack>

      <TableContainer
        sx={{
            maxHeight: "70vh",
            overflow: "auto",
            border: "1px solid #555",
            borderRadius: 1
        }}
    >

      <Typography
        sx={{
            mb: 2,
            fontWeight: "bold",
            color: isEditing ? "#4caf50" : "#f44336"
        }}
    >
        {isEditing
            ? "🟢 Editing Enabled"
            : "🔒 Attendance Locked"}
    </Typography>

        <Table
          stickyHeader
          sx={{
              tableLayout: "fixed",
              minWidth: `${360 + (daysInMonth * 60)}px`,
              borderCollapse: "separate",
              borderSpacing: 0
          }}
      >

          <TableHead>

            <TableRow>
              <TableCell
                sx={{
                    position: "sticky",
                    left: 0,
                    width: 100,
                    minWidth: 100,
                    maxWidth: 100,

                    zIndex: 50,

                    backgroundColor: "#1e293b",
                    color: "#fff",

                    borderRight: "2px solid #555"
                }}
            >
                EPF
            </TableCell>

            <TableCell
              sx={{
                  position: "sticky",

                  left: 130,

                  width: 260,
                  minWidth: 260,
                  maxWidth: 260,

                  zIndex: 49,

                  backgroundColor: "#1e293b",
                  color: "#fff",

                  borderRight: "2px solid #555"
              }}
          >
              Name
          </TableCell>

              {Array.from({ length: daysInMonth }, (_, i) => {

                const isToday =
                    today.year() === year &&
                    today.month() + 1 === month &&
                    today.date() === i + 1;

                const currentDate = dayjs(
                  `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
              );

              const isSaturday = currentDate.day() === 6;
              const isSunday = currentDate.day() === 0;

                return (

                    <TableCell
                      key={i}
                      align="center"
                      sx={{
                          width: 60,
                          minWidth: 60,
                          maxWidth: 60,
                          padding: "4px",
                          backgroundColor:
                            isToday
                                ? "#1976d2"                // Today (Blue)
                                : isSunday
                                ? "#7f1d1d"                // Sunday (Dark Red)
                                : isSaturday
                                ? "#92400e"                // Saturday (Brown/Gold)
                                : "#1e293b", 
                          color: "#fff",
                          fontWeight: "bold",
                          border: "1px solid rgba(255,255,255,0.1)"
                      }}
                  >
                       <Box>

                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                fontSize: 10
                            }}
                        >
                            {currentDate.format("ddd")}
                        </Typography>

                        <Typography
                            fontWeight="bold"
                        >
                            {i + 1}
                        </Typography>

                    </Box>
                    </TableCell>

                );

            })}

            <TableCell
              align="center"
              sx={{
                width: 90,
                minWidth: 90,
                backgroundColor: "#1e293b",
                color: "#fff",
                fontWeight: "bold"
              }}
            >
              Total
            </TableCell>

            </TableRow>
            

          </TableHead>

          <TableBody>

            {workers.map((worker) => {

              const totalPresent = Array.from(
                  { length: daysInMonth },
                  (_, i) => {

                      const date = dayjs(
                          `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
                      ).format("YYYY-MM-DD");

                      return attendance[
                          `${worker.worker_type}-${worker.worker_id}-${date}`
                      ]
                          ? 1
                          : 0;

                  }
              ).reduce((a, b) => a + b, 0);

              return (

            <TableRow
                key={`${worker.worker_type}-${worker.worker_id}`}
            >

            <TableCell
              sx={{
                position: "sticky",
                left: 0,
                width: 100,
                minWidth: 100,
                maxWidth: 100,
                backgroundColor: "#202020",
                zIndex: 20,
                borderRight: "2px solid #555"
            }}
          >
              {worker.epf_no || "-"}
          </TableCell>

          <TableCell
            sx={{
              position: "sticky",
              left: 130,
              width: 260,
              minWidth: 260,
              backgroundColor: "#202020",
              zIndex: 19,
              borderRight: "2px solid #555",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              boxShadow: "6px 0 10px rgba(0,0,0,0.35)"
            }}
          >
            {worker.name}
          </TableCell>

            {Array.from({ length: daysInMonth }, (_, i) => {

                const date = dayjs(
                    `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`
                ).format("YYYY-MM-DD");

                const attendanceKey =
                    `${worker.worker_type}-${worker.worker_id}-${date}`;

                const currentDate = dayjs(date);

                const isSaturday = currentDate.day() === 6;
                const isSunday = currentDate.day() === 0;
                const isFuture = currentDate.isAfter(dayjs(), "day");

                return (

                    <TableCell
                        key={i}
                        align="center"
                        onClick={() => {
                          if (!isEditing) return;
                          if (!isFuture) {
                            toggleAttendance(worker, i + 1);
                          }
                        }}
                        sx={{
                          width: 60,
                          minWidth: 60,
                          maxWidth: 60,
                          padding: "4px",
                          backgroundColor:
                            isSunday
                                ? "rgba(255,0,0,0.08)"
                                : isSaturday
                                ? "rgba(255,193,7,0.08)"
                                : "inherit",
                          cursor: !isEditing
                            ? "default"
                            : isFuture
                            ? "not-allowed"
                            : "pointer",
                          opacity: isFuture ? 0.5 : 1,
                          border: "1px solid rgba(255,255,255,0.08)",
                          zIndex: 1,
                      }}
                    >

                        {attendance[attendanceKey] && (

                            <Box
                              sx={{
                                  width: 22,
                                  height: 22,

                                  bgcolor: "#4CAF50",

                                  borderRadius: "6px",

                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",

                                  margin: "auto",

                                  color: "#fff",

                                  fontWeight: 700,
                                  fontSize: 15,

                                  boxShadow: "0 2px 6px rgba(0,0,0,0.35)",

                                  transition: "0.15s"
                              }}
                          >
                                ✓
                            </Box>

                        )}

                    </TableCell>

                    

                );

            })}
            <TableCell
              align="center"
              sx={{
                  fontWeight: "bold"
              }}
          >
              {totalPresent}
          </TableCell>

            </TableRow>

              );

})}

            </TableBody>

        </Table>

      </TableContainer>

    </Paper>
  );

}