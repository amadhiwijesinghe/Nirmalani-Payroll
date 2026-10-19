
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Button,
  Chip,
} from "@mui/material";

const API =
  process.env.REACT_APP_API_URL ||
  "https://nirmalani-payroll-production.up.railway.app";

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/admin/activity-logs?limit=500`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setLogs(response.data.logs || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load activity logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actions = [
    ...new Set(logs.map((log) => log.action).filter(Boolean)),
  ];

  const filteredLogs = logs.filter((log) => {
    const query = search.toLowerCase();

    const matchesSearch = [
      log.username,
      log.action,
      log.module,
      log.description,
      log.record_id,
    ].some((value) => String(value || "").toLowerCase().includes(query));

    return (
      matchesSearch &&
      (actionFilter === "all" || log.action === actionFilter)
    );
  });

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Typography
        variant="h4"
        sx={{ color: "#fff", fontWeight: 800, mb: 1 }}
      >
        Activity Logs
      </Typography>

      <Typography sx={{ color: "#94a3b8", mb: 3 }}>
        Review recorded user actions and system activity.
      </Typography>

      <Paper
        sx={{
          p: 2,
          mb: 3,
          background: "#111827",
          color: "#fff",
          border: "1px solid #334155",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <TextField
            label="Search logs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Username, module, description..."
            size="small"
            sx={{
              flex: 1,
              minWidth: 220,
              "& .MuiInputBase-root": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#94a3b8" },
            }}
          />

          <TextField
            select
            label="Action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            size="small"
            sx={{
              minWidth: 150,
              "& .MuiInputBase-root": { color: "#fff" },
              "& .MuiInputLabel-root": { color: "#94a3b8" },
            }}
          >
            <MenuItem value="all">All actions</MenuItem>
            {actions.map((action) => (
              <MenuItem key={action} value={action}>
                {action}
              </MenuItem>
            ))}
          </TextField>

          <Button variant="contained" onClick={fetchLogs}>
            Refresh
          </Button>
        </Box>
      </Paper>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={fetchLogs} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Paper>
      ) : (
        <>
          <Typography sx={{ color: "#cbd5e1", mb: 1 }}>
            Showing {filteredLogs.length} of {logs.length} recorded actions
          </Typography>

          <TableContainer
            component={Paper}
            sx={{
              background: "#111827",
              border: "1px solid #334155",
              overflowX: "auto",
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  {[
                    "Date & Time",
                    "Username",
                    "Action",
                    "Module",
                    "Description",
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        color: "#cbd5e1",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        borderColor: "#334155",
                      }}
                    >
                      {heading}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell
                      sx={{ color: "#cbd5e1", borderColor: "#334155" }}
                    >
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "—"}
                    </TableCell>

                    <TableCell
                      sx={{ color: "#fff", borderColor: "#334155" }}
                    >
                      {log.username}
                    </TableCell>

                    <TableCell sx={{ borderColor: "#334155" }}>
                      <Chip
                        label={log.action}
                        size="small"
                        color={log.action === "LOGIN" ? "success" : "primary"}
                      />
                    </TableCell>

                    <TableCell
                      sx={{ color: "#cbd5e1", borderColor: "#334155" }}
                    >
                      {log.module}
                    </TableCell>

                    <TableCell
                      sx={{
                        color: "#cbd5e1",
                        borderColor: "#334155",
                        minWidth: 220,
                      }}
                    >
                      {log.description}
                    </TableCell>
                  </TableRow>
                ))}

                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ color: "#94a3b8", py: 4 }}
                    >
                      No matching activity logs found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}
