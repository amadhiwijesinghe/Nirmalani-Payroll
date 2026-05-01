import { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  MenuItem,
  Grid,
  Typography,
  Box
} from "@mui/material";
const API = "https://nirmalani-payroll-production.up.railway.app";

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [date, setDate] = useState("");
  const [present, setPresent] = useState("");
  const [attendanceList, setAttendanceList] = useState([]);
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");

  useEffect(() => {
    axios.get(`${API}/employees`)
      .then(res => setEmployees(res.data));

    fetchAttendance();
  }, []);

  const fetchAttendance = () => {
    axios.get(`${API}/attendance`)
      .then(res => setAttendanceList(res.data));
  };

const handleSubmit = () => {
  if (!selectedEmployee || !date || present === "") {
    alert("Fill all fields");
    return;
  }

  // 🔥 CHECK DUPLICATE
  const exists = attendanceList.some(
    row =>
      row.memberid === selectedEmployee.memberid &&
      row.date === date
  );

  if (exists) {
    alert("⚠️ Attendance already marked for this date");
    return; // 🚨 STOP here
  }

  const monthName = new Date(date).toLocaleString('default', { month: 'long' });

  axios.post(`${API}/attendance`, {
    memberid: selectedEmployee.memberid,
    date,
    present,
    month: monthName
  }).then(() => {
    resetForm();
    fetchAttendance();
  });
};

  const resetForm = () => {
    setDate("");
    setPresent("");
    setSelectedEmployee(null);
  };

  const formatMemberId = (id) => {
    return String(id).padStart(6, '0');
  };

  // 🔍 Filter
 const filtered = attendanceList.filter(row => {

  const matchesSearch =
    row.name?.toLowerCase().includes(search.toLowerCase());

  const matchesMonth =
    !filterMonth ||
    (row.date && row.date.startsWith(filterMonth));

  return matchesSearch && matchesMonth;
});

  return (
    <Box sx={{
      p: 3,
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>

      <Typography variant="h4" sx={{
        mb: 3,
        fontWeight: 800,
        color: "#fff"
      }}>
        📅 Attendance Tracker
      </Typography>

      {/* FORM */}
      <Paper sx={{
        p: 3,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
        }
      }}>
        <Grid container spacing={2}>

          <Grid item xs={12} md={3}>
            <TextField
              type="date"
              fullWidth
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={{ input: { color: "#fff" } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Employee"
              value={selectedEmployee ? selectedEmployee.memberid : ""}
              onChange={(e) => {
                const emp = employees.find(emp => emp.memberid == e.target.value);
                setSelectedEmployee(emp);
              }}
              sx={{ '& .MuiOutlinedInput-root': {
                height: 56,
                width: 250,
                paddingRight: '14px',
                color: '#fff' // text color inside input
              },
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                boxSizing: 'border-box',
                padding: '16.5px 14px',
                color: '#fff' // select text color
              },
              '& .MuiInputLabel-root': {
                color: '#aaa' // label color
              },
              '& .MuiSvgIcon-root': {
                color: '#fff' // dropdown arrow color
              }
            }}
             >
              <MenuItem value="">Select Employee</MenuItem>
              {employees.map(emp => (
                <MenuItem key={emp.memberid} value={emp.memberid}>
                  {emp.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Member ID"
              value={selectedEmployee ? formatMemberId(selectedEmployee.memberid) : ""}
              InputProps={{ readOnly: true }}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Present"
              value={present}
              onChange={(e) => setPresent(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': {
                height: 56,
                width: 120,
                paddingRight: '14px',
                color: '#fff' // text color inside input
              },
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                height: '100%',
                boxSizing: 'border-box',
                padding: '16.5px 14px',
                color: '#fff' // select text color
              },
              '& .MuiInputLabel-root': {
                color: '#aaa' // label color
              },
              '& .MuiSvgIcon-root': {
                color: '#fff' // dropdown arrow color
              }
            }}
            >
              <MenuItem value="">Select</MenuItem>
              <MenuItem value={1}>Yes</MenuItem>
              <MenuItem value={0}>No</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={handleSubmit}
              sx={{
                height: "100%",
                borderRadius: 3,
                fontWeight: 700,
                background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                color: "#fff",
                boxShadow: "0 5px 20px rgba(59,130,246,0.4)",
                transition: "0.2s",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 10px 25px rgba(99,102,241,0.5)"
                }
              }}
            >
              Save
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {/* SEARCH */}
      <TextField
        placeholder="🔍 Search attendance..."
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mt:3,
          mb: 3,
          input: { color: "#fff" },
          background: "rgba(255,255,255,0.05)",
          borderRadius: 3,
        }}
      />

      <TextField
        type="month"
        label="Filter by Month"
        value={filterMonth}
        onChange={(e) => setFilterMonth(e.target.value)}
        sx={{
          mb: 3,
          input: { color: "#fff" },
          label: { color: "#aaa" },
          background: "rgba(255,255,255,0.05)",
          borderRadius: 3,
          width: 200
        }}
      />

      <Button
        onClick={() => setFilterMonth("")}
        sx={{ ml: 2, background: "#475569", color: "#fff" }}
      >
        Clear
      </Button>

      {/* TABLE */}
      <Paper sx={{
        p: 2,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)"
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "rgba(255,255,255,0.05)" }}>
              <TableCell sx={{ color: "#aaa" }}>Date</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Month</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Name</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Member ID</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Present</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((row, i) => (
              <TableRow key={i} sx={{
                '&:hover': {
                  background: "rgba(255,255,255,0.08)"
                }
              }}>
                <TableCell sx={{ color: "#fff" }}>
                  {new Date(row.date).toLocaleDateString()}
                </TableCell>
                <TableCell sx={{ color: "#fff" }}>{row.month}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{row.name}</TableCell>
                <TableCell sx={{ color: "#fff" }}>
                  {formatMemberId(row.memberid)}
                </TableCell>
                <TableCell sx={{
                  color: row.present == 1 ? "#22c55e" : "#ef4444",
                  fontWeight: 600
                }}>
                  {row.present == 1 ? "Yes" : "No"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

    </Box>
  );
}

export default Attendance;