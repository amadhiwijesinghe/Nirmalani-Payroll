import { useState, useEffect } from 'react';
import axios from 'axios';
import MobilePage from "../components/mobile/MobilePage";
import MobileHeader from "../components/mobile/MobileHeader";
import ResponsiveCard from "../components/mobile/ResponsiveCard";
import ResponsiveTable from "../components/mobile/ResponsiveTable";
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
const API = "https://nirmalani-payroll-production.up.railway.app";


export default function Employees({ plantation }) {
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
  }, [plantation]);

  const fetchEmployees = () => {

    console.log("PLANTATION:", plantation);

    axios
      .get(`${API}/employees?plantation=${plantation}`)
      .then(res => {

        console.log("EMPLOYEES:", res.data);

        setEmployees(res.data);
        setFiltered(res.data);
      })
      .catch(err => {
        console.log(err);
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
      basic_salary: salary,
      plantation
    };

    if (editId) {
      axios.put(`${API}/employees/${editId}`, payload)
        .then(() => {
          resetForm();
          fetchEmployees();
        });
    } else {
      axios.post(`${API}/employees`, payload)
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
    axios.delete(`${API}/employees/${id}`)
      .then(fetchEmployees);
  };

  const formatMemberId = (id) => {
    return String(id).padStart(6, '0');
  };

  return (
    <MobilePage>

      {/* HEADER */}
     <MobileHeader
      title="👥 Employees"
      subtitle="Manage plantation employees"
    />

      {/* FORM CARD */}
      <ResponsiveCard>
        <Grid container spacing={2}>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="Name"
              fullWidth
              value={name}
              onChange={e => setName(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
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

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              label="NIC"
              fullWidth
              value={NIC}
              onChange={e => setNIC(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="Salary"
              fullWidth
              value={salary}
              onChange={e => setSalary(e.target.value)}
              sx={{ input: { color: "#fff" }, label: { color: "#aaa" } }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <Button
              fullWidth
              onClick={saveEmployee}
              sx={{
                height: {
                  xs: 45,
                  md: "100%"
                },
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
      </ResponsiveCard>

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
          background: "rgba(255,255,255,0.05)",
          maxWidth: {
            xs: "100%",
            md: 500
          },
        }}
      />

      {/* TABLE */}
      <ResponsiveCard sx={{ p: 2 }}>
        <ResponsiveTable>

        <Table sx={{ minWidth: 750 }}>
          <TableHead>
            <TableRow sx={{ background: "rgba(255,255,255,0.05)" }}>
              <TableCell 
                sx={{ color: "#aaa", fontSize: { xs: "12px",md: "14px"}}}>Name</TableCell>
              <TableCell 
                sx={{ color: "#aaa", fontSize: { xs: "12px",md: "14px"}}}>Member ID</TableCell>
              <TableCell 
                sx={{ color: "#aaa", fontSize: { xs: "12px",md: "14px"}}}>NIC</TableCell>
              <TableCell 
                sx={{ color: "#aaa", fontSize: { xs: "12px",md: "14px"}}}>Salary</TableCell>
              <TableCell 
                sx={{ color: "#aaa", fontSize: { xs: "12px",md: "14px"}}}>Action</TableCell>
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
                <TableCell
                  sx={{ color: "#fff", fontSize: { xs: "12px",md: "14px"}}}>{emp.name}</TableCell>
                <TableCell
                  sx={{ color: "#fff", fontSize: { xs: "12px",md: "14px"}}}>{formatMemberId(emp.memberid)}</TableCell>
                <TableCell
                  sx={{ color: "#fff", fontSize: { xs: "12px",md: "14px"}}}>{emp.NIC}</TableCell>
                <TableCell
                  sx={{ color: "#22c55e", fontSize: { xs: "12px",md: "14px"}}}>
                  Rs. {Number(emp.basic_salary).toLocaleString()}
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", gap: 1, flexDirection: { xs: "column", sm: "row"}}}>
                    
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
                          boxShadow: "0 10px 25px rgba(245,158,11,0.5)",
                        },
                        maxWidth: {
                          xs: "100%",
                          md: 500
                        },
                      }}
                    >
                      Edit
                    </Button>

                    <Button
                      size="small"
                      onClick={() => deleteEmployee(emp.id)}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 600,
                        background: "linear-gradient(135deg, #ef4444, #f87171)",
                        color: "#fff",
                        transition: "0.2s",
                        "&:hover": {
                          transform: "scale(1.05)",
                          boxShadow: "0 10px 25px rgba(239,68,68,0.5)" // ✅ fixed
                        },
                        maxWidth: {
                          xs: "100%",
                          md: 500
                        },
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
        </ResponsiveTable>
      </ResponsiveCard>
    </MobilePage>
  );
}