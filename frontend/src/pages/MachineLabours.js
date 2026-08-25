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