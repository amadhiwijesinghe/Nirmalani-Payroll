import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Box
} from '@mui/material';
import jsPDF from "jspdf";

const API = "https://nirmalani-payroll-production.up.railway.app";

export default function Payslips() {
  const [data, setData] = useState([]);
  const [month, setMonth] = useState("");

  useEffect(() => {
    if (month) {
      axios.get(`${API}/payroll/${month}`)
        .then(res => setData(res.data))
        .catch(err => console.error(err));
    } else {
      axios.get(`${API}/payroll`)
        .then(res => setData(res.data))
        .catch(err => console.error(err));
    }
  }, [month]);

  const formatMemberId = (id) => {
    return String(id).padStart(6, '0');
  };

  // 🔥 FINAL PDF FUNCTION (WORKS IN VERCEL)
  const generatePayslip = (emp) => {
    try {
      console.log("Generating PDF:", emp);

      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("PAYSLIP", 20, 20);

      doc.setFontSize(12);

      let y = 40;

      const row = (label, value) => {
        doc.text(label, 20, y);
        doc.text(String(value ?? "-"), 100, y);
        y += 10;
      };

      const epf = emp.epf || (emp.basic_salary * 0.08).toFixed(2);

      row("Employee Name:", emp.name);
      row("Member ID:", formatMemberId(emp.memberid));
      row("Month:", emp.month);
      row("Days Worked:", emp.days_worked);
      row("Basic Salary:", `Rs. ${emp.basic_salary}`);
      row("Allowance:", `Rs. ${emp.total_allowance}`);
      row("EPF (8%):", `Rs. ${epf}`);
      row("Net Salary:", `Rs. ${emp.net_salary}`);

      // 🔥 FORCE DOWNLOAD FIX
      const pdfBlob = doc.output("blob");
      const url = window.URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${emp.name || "payslip"}.pdf`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("PDF ERROR:", err);
      alert("PDF generation failed");
    }
  };

  // 🔥 SELECT STYLE
  const selectStyle = {
    '& .MuiOutlinedInput-root': {
      height: 56,
      paddingRight: '14px',
      color: '#fff'
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
      padding: '16.5px 14px',
      color: '#fff'
    },
    '& .MuiInputLabel-root': {
      color: '#aaa'
    },
    '& .MuiSvgIcon-root': {
      color: '#fff'
    }
  };

  return (
    <Box sx={{
      p: 3,
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f172a, #1e293b)"
    }}>

      <Typography variant="h4" sx={{
        mb: 3,
        color: "#fff",
        fontWeight: 800
      }}>
        🧾 Payslips
      </Typography>

      {/* FILTER */}
      <Paper sx={{
        p: 3,
        mb: 3,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)"
      }}>
        <TextField
          select
          label="Select Month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          sx={{ ...selectStyle, width: 220 }}
        >
          <MenuItem value="">All Months</MenuItem>
          {[
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
          ].map(m => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* TABLE */}
      <Paper sx={{
        p: 2,
        borderRadius: 5,
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(20px)"
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ color: "#aaa" }}>Name</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Member ID</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Month</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Days</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Allowance</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Net Salary</TableCell>
              <TableCell sx={{ color: "#aaa" }}>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length > 0 ? (
              data.map((emp, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: "#fff" }}>{emp.name}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>
                    {formatMemberId(emp.memberid)}
                  </TableCell>
                  <TableCell sx={{ color: "#fff" }}>{emp.month}</TableCell>
                  <TableCell sx={{ color: "#fff" }}>{emp.days_worked}</TableCell>
                  <TableCell sx={{ color: "#f59e0b" }}>
                    Rs. {emp.total_allowance}
                  </TableCell>
                  <TableCell sx={{ color: "#22c55e", fontWeight: 700 }}>
                    Rs. {emp.net_salary}
                  </TableCell>

                  <TableCell>
                    <Button
                      onClick={() => generatePayslip(emp)}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 600,
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        color: "#fff",
                        "&:hover": {
                          transform: "scale(1.05)"
                        }
                      }}
                    >
                      PDF
                    </Button>
                  </TableCell>

                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} sx={{ color: "#aaa" }}>
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

    </Box>
  );
}