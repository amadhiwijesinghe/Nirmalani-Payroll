import { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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

  const daysInMonth = dayjs(`${year}-${month}-01`).daysInMonth();

  useEffect(() => {

    loadWorkers();

    }, [plantation]);
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
  return (
    <Paper
      sx={{
        p: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >

      <Typography
        variant="h4"
        fontWeight="bold"
        mb={3}
      >
        Attendance Register
      </Typography>

      <Stack direction="row" spacing={2} mb={3}>

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

      </Stack>

      <TableContainer
        sx={{
          flex: 1,
          overflow: "auto",
          border: "1px solid #ddd"
        }}
      >

        <Table stickyHeader>

          <TableHead>

            <TableRow>

              <TableCell sx={{ minWidth: 100 }}>
                EPF
              </TableCell>

              <TableCell sx={{ minWidth: 250 }}>
                Name
              </TableCell>

              {Array.from(
                { length: daysInMonth },
                (_, i) => (

                  <TableCell
                    key={i}
                    align="center"
                  >
                    {i + 1}
                  </TableCell>

                )
              )}

            </TableRow>

          </TableHead>

          <TableBody>

            {workers.map((worker) => (

            <TableRow
                key={`${worker.worker_type}-${worker.worker_id}`}
            >

            <TableCell>

                {worker.epf_no || "-"}

            </TableCell>

            <TableCell
                sx={{
                    whiteSpace: "nowrap",
                    minWidth: 250
                }}
            >

                {worker.name}

            </TableCell>

            {Array.from(
                { length: daysInMonth },
                (_, i) => (

            <TableCell
                key={i}
                align="center"
            >

            </TableCell>

            ))}

            </TableRow>

            ))}

            </TableBody>

        </Table>

      </TableContainer>

    </Paper>
  );

}