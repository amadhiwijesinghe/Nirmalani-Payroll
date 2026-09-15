import { useEffect, useState } from "react";
import axios from "axios";

import MobilePage from "../components/mobile/MobilePage";
import MobileHeader from "../components/mobile/MobileHeader";
import ResponsiveCard from "../components/mobile/ResponsiveCard";
import MobileInput from "../components/mobile/MobileInput";
import MobileButton from "../components/mobile/MobileButton";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton
} from "@mui/material";


import DeleteIcon from "@mui/icons-material/Delete";

const API =
  "https://nirmalani-payroll-production.up.railway.app";

export default function MachineLabours({ plantation }) {

  const [workers, setWorkers] = useState([]);

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(false);


  // =========================
  // MACHINE LABOUR ATTENDANCE
  // =========================

  const [selectedWorker, setSelectedWorker] = useState("");

  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [oilCans, setOilCans] = useState("");

  const [attendanceData, setAttendanceData] = useState([]);

  const [attendanceLoading, setAttendanceLoading] = useState(false);


  // =========================
  // LOAD WORKERS
  // =========================

  const loadWorkers = async () => {

    try {

      setLoading(true);

      const res = await axios.get(
        `${API}/machine-labours?plantation=${plantation}`
      );

      setWorkers(res.data || []);

    } catch (error) {

      console.error(
        "Machine Labour Load Error:",
        error.response?.data || error
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadWorkers();

  }, [plantation]);


  // =========================
  // ADD WORKER
  // =========================

  const addWorker = async () => {

    if (!name.trim()) {

      alert("Please enter the worker name.");

      return;

    }

    try {

      await axios.post(
        `${API}/machine-labours`,
        {
          name: name.trim(),
          plantation
        }
      );

      setName("");

      loadWorkers();

    } catch (error) {

      console.error(
        "Machine Labour Add Error:",
        error.response?.data || error
      );

      alert("Failed to add Machine Labour worker.");

    }

  };


  // =========================
  // DELETE WORKER
  // =========================

  const deleteWorker = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this Machine Labour worker?"
      );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${API}/machine-labours/${id}`
      );

      loadWorkers();

    } catch (error) {

      console.error(
        "Machine Labour Delete Error:",
        error.response?.data || error
      );

      alert("Failed to delete worker.");

    }

  };

  // =========================
// LOAD MACHINE LABOUR ATTENDANCE
// =========================

const loadAttendance = async () => {

  if (!selectedWorker) {
    setAttendanceData([]);
    return;
  }

  try {

    setAttendanceLoading(true);

    const month =
      attendanceDate.slice(0, 7);

    const res = await axios.get(
      `${API}/machine-labour-attendance`,
      {
        params: {
          worker_id: selectedWorker,
          month,
          plantation
        }
      }
    );

    setAttendanceData(res.data || []);

  } catch (error) {

    console.error(
      "Machine Labour Attendance Load Error:",
      error.response?.data || error
    );

  } finally {

    setAttendanceLoading(false);

  }

};

useEffect(() => {

  loadAttendance();

}, [selectedWorker, attendanceDate, plantation]);

  // =========================
// SAVE MACHINE LABOUR ATTENDANCE
// =========================

const saveAttendance = async () => {

  if (!selectedWorker) {
    alert("Please select a Machine Labour worker.");
    return;
  }

  if (!attendanceDate) {
    alert("Please select a date.");
    return;
  }

  if (
    oilCans === "" ||
    Number(oilCans) <= 0
  ) {
    alert("Please enter the number of oil cans.");
    return;
  }

  const oilCansValue = Number(oilCans);

  // 1 oil can = 16 tanks
  const tanks = oilCansValue * 16;

  // 1 tank = Rs. 1,000
  const rate = 1000;

  // Total payment
  const total = tanks * rate;

  try {

    setAttendanceLoading(true);

    await axios.post(
      `${API}/machine-labour-attendance`,
      {
        worker_id: selectedWorker,
        plantation,
        attendance_date: attendanceDate,
        oil_cans: oilCansValue
      }
    );

    alert(
      `Saved successfully!\n\n` +
      `Oil Cans: ${oilCansValue}\n` +
      `Tanks: ${tanks}\n` +
      `Payment: Rs. ${total.toLocaleString()}`
    );

    setOilCans("");

    loadAttendance();

  } catch (error) {

    console.error(
      "Machine Labour Attendance Save Error:",
      error.response?.data || error
    );

    alert("Failed to save Machine Labour attendance.");

  } finally {

    setAttendanceLoading(false);

  }

};


return (

  <MobilePage>

    {/* HEADER */}

    <MobileHeader
      title="🚜 Machine Labour"
      subtitle="Machine labour management"
    />

    {/* ADD WORKER */}

    <ResponsiveCard>

      <Typography
        sx={{
          color: "#fff",
          fontWeight: 700,
          mb: 2
        }}
      >
        ➕ Add Machine Labour Worker
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >

        <MobileInput
          label="Machine Labour Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          sx={{
            flex: 1,
            minWidth: {
              xs: "100%",
              sm: 300
            }
          }}
        />

        <MobileButton
          fullWidth={false}
          onClick={addWorker}
        >
          Add Worker
        </MobileButton>

      </Box>

        </ResponsiveCard>


    {/* MACHINE LABOUR PAYMENT */}

    <ResponsiveCard>

      <Typography
        sx={{
          color: "#fff",
          fontWeight: 700,
          mb: 2
        }}
      >
        💰 Machine Labour Payment
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center"
        }}
      >

        {/* WORKER */}

        <MobileInput
          label="Select Worker"
          value={selectedWorker}
          onChange={(e) =>
            setSelectedWorker(e.target.value)
          }
          select
          SelectProps={{
            native: true
          }}
          sx={{
            minWidth: {
              xs: "100%",
              sm: 220
            }
          }}
        >

          <option value="">
            Select Worker
          </option>

          {workers.map((worker) => (

            <option
              key={worker.id}
              value={worker.id}
            >
              {worker.name}
            </option>

          ))}

        </MobileInput>


        {/* DATE */}

        <MobileInput
          label="Date"
          type="date"
          value={attendanceDate}
          onChange={(e) =>
            setAttendanceDate(e.target.value)
          }
          InputLabelProps={{
            shrink: true
          }}
          sx={{
            minWidth: {
              xs: "100%",
              sm: 180
            }
          }}
        />


        {/* OIL CANS */}

        <MobileInput
          label="Oil Cans (20L)"
          type="number"
          value={oilCans}
          onChange={(e) =>
            setOilCans(e.target.value)
          }
          inputProps={{
            min: 0,
            step: 0.01
          }}
          sx={{
            minWidth: {
              xs: "100%",
              sm: 180
            }
          }}
        />

      </Box>


      {/* CALCULATION */}

      {Number(oilCans) > 0 && (

        <Box
          sx={{
            mt: 3,
            p: 2,
            borderRadius: 2,
            backgroundColor: "rgba(255,255,255,0.08)"
          }}
        >

          <Typography
            sx={{
              color: "#fff",
              mb: 1
            }}
          >
            🛢️ Oil Cans:{" "}
            <strong>
              {Number(oilCans)}
            </strong>
          </Typography>

          <Typography
            sx={{
              color: "#fff",
              mb: 1
            }}
          >
            🔢 Tanks:{" "}
            <strong>
              {(Number(oilCans) * 16).toLocaleString()}
            </strong>
          </Typography>

          <Typography
            sx={{
              color: "#fff",
              mb: 1
            }}
          >
            💵 Rate per Tank:{" "}
            <strong>
              Rs. 1,000
            </strong>
          </Typography>

          <Typography
            sx={{
              color: "#fff",
              fontSize: "1.2rem",
              fontWeight: 700
            }}
          >
            💰 Total Payment: Rs.{" "}
            {(
              Number(oilCans) *
              16 *
              1000
            ).toLocaleString()}
          </Typography>

        </Box>

      )}


      {/* SAVE BUTTON */}

      <Box sx={{ mt: 2 }}>

        <MobileButton
          fullWidth={false}
          onClick={saveAttendance}
          disabled={attendanceLoading}
        >
          {attendanceLoading
            ? "Saving..."
            : "Save Payment"}
        </MobileButton>

      </Box>

    </ResponsiveCard>

    {/* SAVED MACHINE LABOUR PAYMENTS */}

<ResponsiveCard>

  <Typography
    variant="h6"
    fontWeight={700}
    sx={{
      color: "#fff",
      mb: 2
    }}
  >
    📋 Machine Labour Payments
  </Typography>


  {attendanceLoading ? (

    <Typography color="text.secondary">
      Loading payments...
    </Typography>

  ) : attendanceData.length === 0 ? (

    <Typography color="text.secondary">
      No payments recorded for this month.
    </Typography>

  ) : (

    <Box sx={{ overflowX: "auto" }}>

      <Table>

        <TableHead>

          <TableRow>

            <TableCell>
              Date
            </TableCell>

            <TableCell>
              Worker
            </TableCell>

            <TableCell align="right">
              Oil Cans
            </TableCell>

            <TableCell align="right">
              Tanks
            </TableCell>

            <TableCell align="right">
              Rate
            </TableCell>

            <TableCell align="right">
              Payment
            </TableCell>

          </TableRow>

        </TableHead>


        <TableBody>

          {attendanceData.map((row) => (

            <TableRow key={row.id}>

              <TableCell>
                {row.attendance_date
                  ? String(row.attendance_date).split("T")[0]
                  : ""}
              </TableCell>

              <TableCell>
                {row.name}
              </TableCell>

              <TableCell align="right">
                {Number(row.oil_cans || 0)}
              </TableCell>

              <TableCell align="right">
                {Number(row.tanks || 0).toLocaleString()}
              </TableCell>

              <TableCell align="right">
                Rs. {Number(row.rate || 0).toLocaleString()}
              </TableCell>

              <TableCell
                align="right"
                sx={{
                  fontWeight: 700
                }}
              >
                Rs. {Number(row.total || 0).toLocaleString()}
              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

        </Box>

      )}


      {/* MONTHLY TOTAL */}

      {attendanceData.length > 0 && (

        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: "1px solid rgba(255,255,255,0.2)"
          }}
        >

          <Typography
            sx={{
              color: "#fff",
              fontSize: "1.1rem",
              fontWeight: 700
            }}
          >
            💰 Monthly Total: Rs.{" "}
            {attendanceData
              .reduce(
                (sum, row) =>
                  sum + Number(row.total || 0),
                0
              )
              .toLocaleString()}
          </Typography>

        </Box>

      )}

    </ResponsiveCard>


    {/* WORKER LIST */}

    <ResponsiveCard>

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          color: "#fff",
          mb: 2
        }}
      >
        🚜 Machine Labour Workers
      </Typography>


      {loading ? (

        <Typography color="text.secondary">
          Loading...
        </Typography>

      ) : workers.length === 0 ? (

        <Typography color="text.secondary">
          No Machine Labour workers added yet.
        </Typography>

      ) : (

        <Box sx={{ overflowX: "auto" }}>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>
                  #
                </TableCell>

                <TableCell>
                  Name
                </TableCell>

                <TableCell align="right">
                  Action
                </TableCell>

              </TableRow>

            </TableHead>


            <TableBody>

              {workers.map((worker, index) => (

                <TableRow
                  key={worker.id}
                >

                  <TableCell>
                    {index + 1}
                  </TableCell>

                  <TableCell>
                    {worker.name}
                  </TableCell>

                  <TableCell align="right">

                    <IconButton
                      color="error"
                      onClick={() =>
                        deleteWorker(worker.id)
                      }
                    >
                      <DeleteIcon />
                    </IconButton>

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </Box>

      )}

    </ResponsiveCard>

  </MobilePage>

);

}