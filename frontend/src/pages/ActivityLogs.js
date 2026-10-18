
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

const API_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5000";

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  const [username, setUsername] = useState("");
  const [action, setAction] = useState("");
  const [module, setModule] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in again to view activity logs.");
      }

      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });

      if (username.trim()) params.set("username", username.trim());
      if (action) params.set("action", action);
      if (module.trim()) params.set("module", module.trim());
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const response = await fetch(
        `${API_URL}/admin/activity-logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load activity logs."
        );
      }

      setLogs(data.logs || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      setLogs([]);
      setTotal(0);
      setError(err.message || "Unable to load activity logs.");
    } finally {
      setLoading(false);
    }
  }, [
    page,
    rowsPerPage,
    username,
    action,
    module,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const clearFilters = () => {
    setUsername("");
    setAction("");
    setModule("");
    setStartDate("");
    setEndDate("");
    setPage(0);
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? String(value)
      : date.toLocaleString();
  };

  const formatJson = (value) => {
    if (value == null) return "—";

    try {
      const parsed =
        typeof value === "string" ? JSON.parse(value) : value;

      return JSON.stringify(parsed);
    } catch {
      return String(value);
    }
  };

  return (
    <Box sx={{ width: "100%", color: "#e2e8f0" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Activity Logs
          </Typography>
          <Typography sx={{ color: "#94a3b8", mt: 0.5 }}>
            Review recorded activity in the payroll system.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<RefreshIcon />}
          onClick={fetchLogs}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          p: 2,
          mb: 2,
          bgcolor: "#0f172a",
          color: "#e2e8f0",
          border: "1px solid #334155",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          flexWrap="wrap"
          gap={2}
        >
          <TextField
            label="Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              setPage(0);
            }}
            size="small"
          />

          <TextField
            select
            label="Action"
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(0);
            }}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All actions</MenuItem>
            <MenuItem value="LOGIN">LOGIN</MenuItem>
          </TextField>

          <TextField
            label="Module"
            value={module}
            onChange={(e) => {
              setModule(e.target.value);
              setPage(0);
            }}
            size="small"
          />

          <TextField
            label="From date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(0);
            }}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <TextField
            label="To date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(0);
            }}
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Button variant="outlined" onClick={clearFilters}>
            Clear filters
          </Button>
        </Stack>
      </Paper>

      <Paper
        sx={{
          bgcolor: "#0f172a",
          color: "#e2e8f0",
          border: "1px solid #334155",
          overflow: "hidden",
        }}
      >
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        )}

        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {[
                  "Date & Time",
                  "Username",
                  "Action",
                  "Module",
                  "Description",
                  "Record ID",
                  "Old Values",
                  "New Values",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      color: "#93c5fd",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {!loading && logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    No activity logs found.
                  </TableCell>
                </TableRow>
              )}

              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ color: "inherit", whiteSpace: "nowrap" }}>
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell sx={{ color: "inherit" }}>
                    {log.username}
                  </TableCell>
                  <TableCell sx={{ color: "inherit" }}>
                    {log.action}
                  </TableCell>
                  <TableCell sx={{ color: "inherit" }}>
                    {log.module}
                  </TableCell>
                  <TableCell sx={{ color: "inherit", minWidth: 200 }}>
                    {log.description}
                  </TableCell>
                  <TableCell sx={{ color: "inherit" }}>
                    {log.record_id ?? "—"}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "inherit",
                      maxWidth: 220,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {formatJson(log.old_values)}
                  </TableCell>
                  <TableCell
                    sx={{
                      color: "inherit",
                      maxWidth: 220,
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {formatJson(log.new_values)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{
            color: "#e2e8f0",
            "& .MuiTablePagination-selectIcon": { color: "#e2e8f0" },
            "& .MuiIconButton-root": { color: "#e2e8f0" },
          }}
        />
      </Paper>
    </Box>
  );
}

export default ActivityLogs;
