import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Typography,
  Grid,
  Box
} from '@mui/material';


export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  const [name, setName] = useState('');
  const [memberid, setMemberID] = useState('');
  const [salary, setSalary] = useState('');
  const [editId, setEditId] = useState(null);
  const [NIC, setNIC] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get('http://localhost:5000/employees')
      .then(res => {
        setEmployees(res.data);
        setFiltered(res.data);
      });
  };

  // 🔍 SEARCH FILTER
  useEffect(() => {
    const result = employees.filter(emp =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      String(emp.memberid).includes(search)
    );
    setFiltered(result);
  }, [search, employees]);

  const saveEmployee = () => {
    const numericId = parseInt(memberid);

    if (memberid.length !== 6 || numericId < 1 || numericId > 999) {
      alert("Member ID must be between 000001 and 000999");
      return;
    }

    const payload = {
      name,
      memberid: numericId,
      NIC,
      basic_salary: salary
    };

    if (editId) {
      axios.put(`http://localhost:5000/employees/${editId}`, payload)
        .then(() => {
          resetForm();
          fetchEmployees();
        });
    } else {
      axios.post('http://localhost:5000/employees', payload)
        .then(() => {
          resetForm();
          fetchEmployees();
        });
    }
  };

  const resetForm = () => {
    setEditId(null);
    setName('');
    setMemberID('');
    setNIC('');
    setSalary('');
  };

  const editEmployee = (emp) => {
    setName(emp.name);
    setMemberID(String(emp.memberid).padStart(6, "0"));
    setNIC(emp.NIC);
    setSalary(emp.basic_salary);
    setEditId(emp.id);
  };

  const deleteEmployee = (id) => {
    if (!window.confirm("Delete employee?")) return;
    axios.delete(`http://localhost:5000/employees/${id}`)
      .then(fetchEmployees);
  };

  const formatMemberId = (id) => {
    return String(id).padStart(6, '0');
  };

  return (
    <Box sx={{
      p: 3,
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>

      {/* HEADER */}
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: 1
        }}
      >
        👥 Employees Dashboard
      </Typography>

      {/* FORM CARD */}
      <Paper sx={{
        p: 3,
        mb: 4,
        borderRadius: 5,
        backdropFilter: "blur(20px)",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
      }}>
        <Grid container spacing={2}>

          <Grid item xs={12} md={3}>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Member ID"
              fullWidth
              value={memberid}
              onChange={(e) => {
                let value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setMemberID(value);
              }}
              onBlur={() => {
                if (memberid) setMemberID(memberid.padStart(6, "0"));
              }}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label="NIC"
              fullWidth
              value={NIC}
              onChange={e => setNIC(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Salary"
              fullWidth
              value={salary}
              onChange={e => setSalary(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={saveEmployee}
              sx={{
                height: "100%",
                borderRadius: 3,
                fontWeight: 700,
                background: "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                boxShadow: "0 5px 20px rgba(34,197,94,0.4)",
                transition: "0.2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 10px 30px rgba(34,197,94,0.6)"
                }
              }}
            >
              {editId ? "Update" : "Add"}
            </Button>
          </Grid>

        </Grid>
      </Paper>

      {/* SEARCH */}
      <TextField
        placeholder="🔍 Search employee..."
        fullWidth
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3,
          input: { color: "#fff" },
          borderRadius: 3,
          background: "rgba(255,255,255,0.05)"
        }}
      />

      {/* TABLE */}
      <Paper sx={{
        p: 2,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: "rgba(255,255,255,0.05)" }}>
              <TableCell sx={{ color: "#aaa" }}>Name</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Member ID</TableCell>
              <TableCell sx={{ color: "#aaa" }}>NIC</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Salary</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map(emp => (
              <TableRow
                key={emp.id}
                sx={{
                  '&:hover': {
                    background: "rgba(255,255,255,0.08)",
                    transition: "0.2s"
                  }
                }}
              >
                <TableCell sx={{ color: "#fff" }}>{emp.name}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{formatMemberId(emp.memberid)}</TableCell>
                <TableCell sx={{ color: "#fff" }}>{emp.NIC}</TableCell>
                <TableCell sx={{ color: "#22c55e" }}>
                  Rs. {Number(emp.basic_salary).toLocaleString()}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    
                    <Button
                      size="small"
                      onClick={() => editEmployee(emp)}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #facc15, #f59e0b)",
                        color: "#000",
                        transition: "0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 10px 25px rgba(245,158,11,0.5)" // ✅ fixed
                        }
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      onClick={() => deleteEmployee(emp.memberid)}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #ef4444, #f87171)",
                        color: "#fff",
                        transition: "0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 10px 25px rgba(239,68,68,0.5)" // ✅ fixed
                        }
                      }}
                    >
                      Delete
                    </Button>

                  </Box>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}