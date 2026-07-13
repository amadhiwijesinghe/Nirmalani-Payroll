import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import MobilePage from "../components/mobile/MobilePage";
import MobileHeader from "../components/mobile/MobileHeader";
import ResponsiveCard from "../components/mobile/ResponsiveCard";
import MobileButton from "../components/mobile/MobileButton";
import MobileInput from "../components/mobile/MobileInput";
import { useMediaQuery } from "@mui/material";
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
  TableContainer,

  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,

  TextField

} from "@mui/material";
import printAttendanceRegister from "../utils/printAttendanceRegister";

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
  const [workerType, setWorkerType] = useState("all");

  const [rubberDialogOpen, setRubberDialogOpen] = useState(false);

  const [selectedWorker, setSelectedWorker] = useState(null);

  const [selectedDate, setSelectedDate] = useState("");

  const [rubberAttendance, setRubberAttendance] = useState({
    attendance_value:1,
    liter:"",
    drc:"",
    kg:""

  });

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

            attendanceObject[key] = Number(row.attendance_value) || 0;

        });

        const rubberRes = await axios.get(
            `${API}/rubber-attendance-calendar`,
            {
                params: {
                    plantation,
                    month,
                    year
                }
            }
        );

        rubberRes.data.forEach(row => {

            const date = dayjs(row.attendance_date)
                .format("YYYY-MM-DD");

            const key =
                `rubber-${row.worker_id}-${date}`;

            attendanceObject[key] =
                Number(row.attendance_value) || 0;

        });

        setAttendance(attendanceObject);

    } catch (err) {

        console.log(err);

    }

};

// Toggle Attendance 
const toggleAttendance = (worker, day) => {

    const date = dayjs(
        `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`
    ).format("YYYY-MM-DD");

    const key =
        `${worker.worker_type}-${worker.worker_id}-${date}`;

    const currentDate = dayjs(date);
    const isSunday = currentDate.day() === 0;

    setAttendance(prev => {

        const value = prev[key] || 0;

        let newValue = 0;

        if (isSunday) {

            // Sunday:
            // Empty -> 1.5 -> Empty

            newValue =
                value === 0 ? 1.5 : 0;

        } else {

            // Weekdays:
            // Empty -> Full -> Half -> Empty

            if (value === 0)
                newValue = 1;

            else if (value === 1)
                newValue = 0.5;

            else
                newValue = 0;

        }

        return {

            ...prev,

            [key]: newValue

        };

    });

};

// Open Dialog Boox for Rubber Tappers 
const openRubberDialog = (worker, date) => {

    setSelectedWorker(worker);

    setSelectedDate(date);

    setRubberAttendance({
        attendance_value: dayjs(date).day() === 0 ? 1.5 : 1,
        liter: "",
        drc: "",
        kg: ""
    });

    setRubberDialogOpen(true);

};

// KG auto calculation
const calculateKG = (liter, drc) => {

    const l = Number(liter || 0);
    const d = Number(drc || 0);

    return (l * d).toFixed(2);

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
                attendance_value: value,
                is_present: value > 0 ? 1 : 0
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

// Save Rubber Attendance
const saveRubberAttendance = async () => {

    try {

        await axios.post(
            `${API}/rubber-attendance-register`,
            {
                worker_id: selectedWorker.worker_id,
                plantation,
                attendance_date: selectedDate,
                attendance_value: rubberAttendance.attendance_value,
                liter: rubberAttendance.liter,
                drc: rubberAttendance.drc,
                kg: rubberAttendance.kg,
                allowance: rubberAttendance.allowance
            }
        );
        await loadAttendance();

        setRubberDialogOpen(false);

        alert("Rubber attendance saved.");

    } catch (err) {

        console.log(err);

        alert(err.response?.data?.message || "Error");

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

// Finalize Attendance Function
const finalizeAttendance = async () => {

    const confirmFinalize = window.confirm(
        `Finalize attendance for ${dayjs(`${year}-${month}-01`).format("MMMM YYYY")}?\n\nAfter finalizing, attendance will become read-only.`
    );

    if (!confirmFinalize) return;

    try {

        await axios.post(
            `${API}/attendance-register/finalize`,
            {
                plantation,
                month,
                year
            }
        );

        setIsFinalized(true);
        setIsEditing(false);

        alert("Attendance Finalized Successfully.");

    } catch (err) {

        console.log(err);
        alert("Error Finalizing Attendance.");

    }

};

// Filtered Workers
const filteredWorkers =
    workerType === "all"
        ? workers
        : workers.filter(
            worker => worker.worker_type === workerType
        );
const isMobile = useMediaQuery("(max-width:900px)");

  return (

    <MobilePage>   

      <MobileHeader
        title="📅 Attendance Register"
        subtitle="Manage daily worker attendance"
      />
      <ResponsiveCard>

      <Stack
        direction={{
            xs: "column",
            md: "row",
        }}
        spacing={2}
        alignItems={{
            xs: "stretch",
            md: "center",
        }}
    >

        <FormControl
            sx={{
                minWidth: {
                    xs: "100%",
                    md: 160,
                },
            }}
        >
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

        <FormControl
            sx={{
                minWidth: {
                    xs: "100%",
                    md: 220,
                },
            }}
        >
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

        <FormControl sx={{ minWidth: 220 }}>
          <InputLabel>Worker Type</InputLabel>

          <Select
              value={workerType}
              label="Worker Type"
              onChange={(e) => setWorkerType(e.target.value)}
          >
              <MenuItem value="all">
                  All Workers
              </MenuItem>

              <MenuItem value="plantation">
                  Plantation Workers
              </MenuItem>

              <MenuItem value="rubber">
                  Rubber Tappers
              </MenuItem>

              <MenuItem value="casual">
                  Casual Workers
              </MenuItem>

          </Select>

      </FormControl>

      <MobileButton
        color="primary"
        onClick={saveAttendance}
        disabled={!isEditing || isFinalized}
        fullWidth={isMobile}
      >
        Save
      </MobileButton>

      <MobileButton
        color="warning"
        onClick={() => setIsEditing(true)}
        disabled={isEditing || isFinalized}
        fullWidth={isMobile}
      >
        Edit
      </MobileButton>

      <MobileButton
        color="danger"
        onClick={finalizeAttendance}
        disabled={isFinalized}
        fullWidth={isMobile}
        >
        Finalize
      </MobileButton>

      <MobileButton
        color="secondary"
        fullWidth={isMobile}
        onClick={() =>
            printAttendanceRegister({
            workers: filteredWorkers,
            attendance,
            month,
            year,
            plantation,
            workerType,
            daysInMonth,
            })
        }
        >
        Print
      </MobileButton>

      </Stack>
      </ResponsiveCard>

      {!isMobile && (

        <ResponsiveCard sx={{ p: 2 }}>

        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
                flexWrap: "wrap",
                gap: 2,
            }}
            >
            <Typography
                sx={{
                fontWeight: 700,
                color: isFinalized
                    ? "#ef4444"
                    : isEditing
                    ? "#22c55e"
                    : "#f59e0b",
                }}
            >
                {isFinalized
                ? "🔒 Attendance Finalized"
                : isEditing
                ? "🟢 Editing Mode"
                : "🟡 Saved (Read Only)"}
            </Typography>

            <Typography
                sx={{
                color: "#94a3b8",
                fontWeight: 600,
                }}
            >
                {dayjs(`${year}-${month}-01`).format("MMMM YYYY")}
            </Typography>
            </Box>

        <TableContainer
            sx={{
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "70vh"
            }}
        >
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

            {filteredWorkers.map((worker) => {

              const totalPresent = Array.from(
                { length: daysInMonth },
                (_, i) => {

                    const date = dayjs(
                        `${year}-${String(month).padStart(2,"0")}-${String(i+1).padStart(2,"0")}`
                    ).format("YYYY-MM-DD");

                    return Number(
                        attendance[
                            `${worker.worker_type}-${worker.worker_id}-${date}`
                        ] || 0
                    );

                }
            ).reduce((sum, value) => sum + value, 0);

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
                    worker.worker_type === "rubber"
                        ? `rubber-${worker.worker_id}-${date}`
                        : `${worker.worker_type}-${worker.worker_id}-${date}`;

                const currentDate = dayjs(date);

                const isSaturday = currentDate.day() === 6;
                const isSunday = currentDate.day() === 0;
                const isFuture = currentDate.isAfter(dayjs(), "day");
                const value = attendance[attendanceKey] || 0;

                return (

                    <TableCell
                        key={i}
                        align="center"
                        onClick={() => {
                            if (!isEditing) return;
                            if (isFinalized) return;
                            if (isFuture) return;
                            if (worker.worker_type === "rubber") {
                                openRubberDialog(worker, date);
                            } else {
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

                       {value > 0 && (

                            <Box
                                sx={{
                                    width: 22,
                                    height: 22,
                                    bgcolor:
                                        value === 1.5
                                            ? "#ff9800"
                                            : value === 0.5
                                            ? "#2196f3"
                                            : "#4CAF50",

                                    borderRadius: "6px",

                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",

                                    margin: "auto",

                                    color: "#fff",

                                    fontWeight: "bold",
                                    fontSize: 12
                                }}
                            >

                                {value === 1
                                    ? "✓"
                                    : value === 0.5
                                    ? "½"
                                    : "1½"}

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
      </ResponsiveCard>
      )}

      {isMobile && (

        <ResponsiveCard>

            <Typography
                variant="h6"
                fontWeight="bold"
                mb={2}
            >
                📱 Mobile Attendance
            </Typography>

            <Typography>
                Mobile version coming...
            </Typography>

        </ResponsiveCard>

        )}

      <Dialog
        open={rubberDialogOpen}
        onClose={() => setRubberDialogOpen(false)}
        maxWidth="sm"
        fullWidth
    >

        <DialogTitle>

            Rubber Tapper Attendance

        </DialogTitle>

        <DialogContent>

            <Stack spacing={2} sx={{ mt: 1 }}>

                <Typography>

                    <b>Worker :</b> {selectedWorker?.name}

                </Typography>

                <Typography>

                    <b>Date :</b> {selectedDate}

                </Typography>

                {dayjs(selectedDate).day() === 0 ? (

                    <FormControl fullWidth>

                        <MobileInput
                            label="Attendance"
                            value="Sunday Work (1.5 Days)"
                            InputProps={{
                                readOnly: true
                            }}
                        />

                    </FormControl>

                    ) : (

                    <FormControl fullWidth>

                        <InputLabel>Attendance</InputLabel>

                        <Select
                            value={rubberAttendance.attendance_value}
                            label="Attendance"
                            onChange={(e) => {

                                setRubberAttendance({
                                    ...rubberAttendance,
                                    attendance_value: e.target.value
                                });

                            }}
                        >

                            <MenuItem value={1}>
                                Present
                            </MenuItem>

                            <MenuItem value={0.5}>
                                Half Day
                            </MenuItem>

                        </Select>

                    </FormControl>

                    )}

                <MobileInput
                    label="Collected Liter"
                    type="number"
                    value={rubberAttendance.liter}
                    onChange={(e)=>{

                        const liter = e.target.value;

                        setRubberAttendance({

                            ...rubberAttendance,

                            liter,

                            kg: calculateKG(
                                liter,
                                rubberAttendance.drc
                            )

                        });

                    }}
                />

                <MobileInput
                    label="DRC %"
                    type="number"
                    value={rubberAttendance.drc}
                    onChange={(e)=>{

                        const drc = e.target.value;

                        setRubberAttendance({

                            ...rubberAttendance,

                            drc,

                            kg: calculateKG(
                                rubberAttendance.liter,
                                drc
                            )

                        });

                    }}
                />

                <MobileInput
                    label="KG"
                    value={rubberAttendance.kg}
                    InputProps={{
                        readOnly:true
                    }}
                />

            </Stack>

        </DialogContent>

        <DialogActions>

            <MobileButton
                color="secondary"
                fullWidth={false}
                onClick={() => setRubberDialogOpen(false)}
            >
                Cancel
            </MobileButton>

            <MobileButton
                color="primary"
                fullWidth={false}
                onClick={saveRubberAttendance}
            >
                Save
            </MobileButton>

        </DialogActions>

    </Dialog>

    </MobilePage>
  );

}