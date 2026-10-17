
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Stack,
  CircularProgress,
} from "@mui/material";

const API =
  process.env.REACT_APP_API_URL ||
  "https://nirmalani-payroll-production.up.railway.app";

export default function AdminStaff() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await axios.get(`${API}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data.users || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load staff accounts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateAccount = async (userId, action) => {
    const actionText =
      action === "approve"
        ? "approve this staff member"
        : action === "reject"
        ? "reject this registration"
        : "deactivate this staff account";

    if (!window.confirm(`Are you sure you want to ${actionText}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `${API}/admin/users/${userId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchUsers();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update the staff account."
      );
    }
  };

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Typography
        variant="h4"
        sx={{ color: "#fff", fontWeight: 800, mb: 1 }}
      >
        Staff Management
      </Typography>

      <Typography sx={{ color: "#94a3b8", mb: 3 }}>
        Review registrations and manage staff accounts.
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Paper sx={{ p: 3 }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={fetchUsers} sx={{ mt: 2 }}>
            Try Again
          </Button>
        </Paper>
      ) : users.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          No staff accounts found.
        </Paper>
      ) : (
        <Stack spacing={2}>
          {users.map((user) => (
            <Paper
              key={user.id}
              sx={{
                p: 2.5,
                background: "#111827",
                color: "#fff",
                border: "1px solid #334155",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>
                    {user.full_name}
                  </Typography>

                  <Typography sx={{ color: "#94a3b8", mt: 0.5 }}>
                    Username: {user.username}
                  </Typography>

                  <Typography
                    sx={{ color: "#94a3b8", fontSize: "0.8rem", mt: 0.5 }}
                  >
                    Account ID: {user.id}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  alignItems="center"
                >
                  <Chip
                    label={user.account_status}
                    color={
                      user.account_status === "approved"
                        ? "success"
                        : user.account_status === "pending"
                        ? "warning"
                        : "default"
                    }
                    size="small"
                  />

                  <Chip
                    label={user.is_active ? "Active" : "Deactivated"}
                    color={user.is_active ? "success" : "error"}
                    size="small"
                  />
                </Stack>
              </Box>

              {user.account_status === "pending" && (
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 2 }}
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => updateAccount(user.id, "approve")}
                  >
                    Approve
                  </Button>

                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => updateAccount(user.id, "reject")}
                  >
                    Reject
                  </Button>
                </Stack>
              )}

              {user.account_status === "approved" &&
                Boolean(user.is_active) && (
                  <Button
                    variant="outlined"
                    color="error"
                    sx={{ mt: 2 }}
                    onClick={() =>
                      updateAccount(user.id, "deactivate")
                    }
                  >
                    Deactivate Account
                  </Button>
                )}
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
