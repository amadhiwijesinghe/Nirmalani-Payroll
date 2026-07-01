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

  useEffect(() => {

    loadWorkers();

    }, [plantation]);

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

    } catch (err) {

        console.log(err);

    }

};

  return (

    <Paper sx={{ p:3 }}>

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
            onClick={loadWorkers}
        >

            Load Register

        </Button>

        <Button
          variant="contained"
          color="success"
        >
          Save
        </Button>

        <Button
          variant="contained"
          color="warning"
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
            maxHeight: "70vh",
            border: "1px solid #ddd"
        }}
    >

        <Table
            stickyHeader
            sx={{
                tableLayout: "fixed"
            }}
        >

          <TableHead>

            <TableRow>

              <TableCell>EPF</TableCell>

              <TableCell>Name</TableCell>

              {Array.from(
                {length:daysInMonth},
                (_,i)=>(
                  <TableCell
                    key={i}
                    align="center"
                  >
                    {i+1}
                  </TableCell>
                )
              )}

            </TableRow>

          </TableHead>

          <TableBody>

            {workers.map(worker=>(

            <TableRow
                key={`${worker.worker_type}-${worker.worker_id}`}
                sx={{
                    "& td": {
                        borderBottom: "1px solid rgba(255,255,255,0.12)"
                    }
                }}
            >

            <TableCell sx={{ width: 80 }}>
                {worker.epf_no || "-"}
            </TableCell>

            <TableCell sx={{ width: 250 }}>
                {worker.name}
            </TableCell>

            {Array.from(
                {length:daysInMonth},
                (_,i)=>(

            <TableCell
                key={i}
                align="center"
            >

            </TableCell>

                )
            )}

            </TableRow>

            ))}

            </TableBody>

        </Table>

      </TableContainer>

    </Paper>

  );

}