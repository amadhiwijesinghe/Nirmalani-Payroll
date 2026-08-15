import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import {
  Box,
  Typography,
  Grid,
  MenuItem,
  LinearProgress,
  Divider
} from "@mui/material";

import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import GroupsIcon from "@mui/icons-material/Groups";
import GrassIcon from "@mui/icons-material/Grass";
import RubberIcon from "@mui/icons-material/LocalFlorist";

import MobileInput from "../components/mobile/MobileInput";
import ResponsiveCard from "../components/mobile/ResponsiveCard";

const API =
  "https://nirmalani-payroll-production.up.railway.app";

export default function Dashboard({ plantation }) {

  const currentMonth = dayjs().format("YYYY-MM");

  const [selectedMonth, setSelectedMonth] =
    useState(currentMonth);

  const [loading, setLoading] =
    useState(true);

  const [income, setIncome] =
    useState(0);

  const [expense, setExpense] =
    useState(0);

  const [plantationSummary, setPlantationSummary] =
    useState({ totalRequired: 0 });

  const [casualSummary, setCasualSummary] =
    useState({ totalRequired: 0 });

  const [rubberSummary, setRubberSummary] =
    useState({ totalRequired: 0 });


  // =========================
  // MONTHS
  // =========================

  const months = [
    { label: "January", value: `${dayjs().year()}-01` },
    { label: "February", value: `${dayjs().year()}-02` },
    { label: "March", value: `${dayjs().year()}-03` },
    { label: "April", value: `${dayjs().year()}-04` },
    { label: "May", value: `${dayjs().year()}-05` },
    { label: "June", value: `${dayjs().year()}-06` },
    { label: "July", value: `${dayjs().year()}-07` },
    { label: "August", value: `${dayjs().year()}-08` },
    { label: "September", value: `${dayjs().year()}-09` },
    { label: "October", value: `${dayjs().year()}-10` },
    { label: "November", value: `${dayjs().year()}-11` },
    { label: "December", value: `${dayjs().year()}-12` }
  ];


  // =========================
  // FETCH DASHBOARD
  // =========================

  useEffect(() => {

    fetchDashboard();

  }, [selectedMonth, plantation]);


  const fetchDashboard = async () => {

    try {

      setLoading(true);

      const [
        incomeRes,
        expenseRes,
        plantationRes,
        casualRes,
        rubberRes
      ] = await Promise.all([

        axios.get(
          `${API}/dashboard/total-income/${selectedMonth}?plantation=${plantation}`
        ),

        axios.get(
          `${API}/dashboard/total-expenditure/${selectedMonth}?plantation=${plantation}`
        ),

        axios.get(
          `${API}/dashboard/plantation-total-required/${selectedMonth}?plantation=${plantation}`
        ),

        axios.get(
          `${API}/dashboard/casual-summary/${selectedMonth}?plantation=${plantation}`
        ),

        axios.get(
          `${API}/dashboard/rubber-summary/${selectedMonth}?plantation=${plantation}`
        )

      ]);


      setIncome(
        Number(incomeRes.data.total || 0)
      );

      setExpense(
        Number(expenseRes.data.total || 0)
      );

      setPlantationSummary(
        plantationRes.data || { totalRequired: 0 }
      );

      setCasualSummary(
        casualRes.data || { totalRequired: 0 }
      );

      setRubberSummary(
        rubberRes.data || { totalRequired: 0 }
      );

    } catch (error) {

      console.error(
        "Dashboard Error:",
        error.response?.data || error
      );

      setIncome(0);
      setExpense(0);

      setPlantationSummary({
        totalRequired: 0
      });

      setCasualSummary({
        totalRequired: 0
      });

      setRubberSummary({
        totalRequired: 0
      });

    } finally {

      setLoading(false);

    }

  };


  // =========================
  // CALCULATIONS
  // =========================

  const plantationCost =
    Number(
      plantationSummary.totalRequired || 0
    );

  const casualCost =
    Number(
      casualSummary.totalRequired || 0
    );

  const rubberCost =
    Number(
      rubberSummary.totalRequired || 0
    );

  const totalLabour =
    plantationCost +
    casualCost +
    rubberCost;

  const netProfit =
    income - expense;


  const selectedMonthLabel =
    dayjs(
      `${selectedMonth}-01`
    ).format("MMMM YYYY");


  // =========================
  // FORMATTING
  // =========================

  const formatMoney = (value) => {

    return `Rs. ${Number(value || 0).toLocaleString(
      "en-LK",
      {
        maximumFractionDigits: 2
      }
    )}`;

  };


  const getPercentage = (value, total) => {

    if (!total || total === 0) {
      return 0;
    }

    return Math.min(
      100,
      (value / total) * 100
    );

  };


  const plantationPercentage =
    getPercentage(
      plantationCost,
      totalLabour
    );

  const casualPercentage =
    getPercentage(
      casualCost,
      totalLabour
    );

  const rubberPercentage =
    getPercentage(
      rubberCost,
      totalLabour
    );


  // =========================
  // UI
  // =========================

  return (

    <Box
      sx={{
        width: "100%",
        pb: 4
      }}
    >

      {/* ================================= */}
      {/* WELCOME HEADER */}
      {/* ================================= */}

      <ResponsiveCard
        sx={{
          position: "relative",
          overflow: "hidden",
          p: {
            xs: 2.5,
            sm: 3,
            md: 4
          },

          background:
            plantation === "nirmalani"
              ? "linear-gradient(135deg, rgba(22,101,52,0.45), rgba(15,23,42,0.95))"
              : "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(15,23,42,0.95))",

          border:
            "1px solid rgba(255,255,255,0.10)"
        }}
      >

        {/* Decorative circle */}

        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            right: -70,
            top: -70,
            background:
              "rgba(34,197,94,0.12)"
          }}
        />

        <Box
          sx={{
            position: "relative",
            zIndex: 1
          }}
        >

          <Typography
            sx={{
              color: "#86efac",
              fontSize: {
                xs: "0.75rem",
                md: "0.85rem"
              },
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.5,
              mb: 1
            }}
          >
            Payroll Overview
          </Typography>


          <Typography
            sx={{
              fontWeight: 900,
              color: "#fff",
              fontSize: {
                xs: "1.6rem",
                sm: "2rem",
                md: "2.4rem"
              }
            }}
          >
            {plantation === "nirmalani"
              ? "⚡ Nirmalani Plantation"
              : "🌿 Ingurupaththala Plantation"}
          </Typography>


          <Typography
            sx={{
              color: "#cbd5e1",
              mt: 0.7,
              fontSize: {
                xs: "0.85rem",
                md: "1rem"
              }
            }}
          >
            Your monthly financial and labour overview
          </Typography>


          {/* MONTH SELECTOR */}

          <Box
            sx={{
              mt: 3,
              maxWidth: {
                xs: "100%",
                sm: 260
              }
            }}
          >

            <MobileInput
              select
              label="Select Month"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value)
              }
            >

              {months.map((month) => (

                <MenuItem
                  key={month.value}
                  value={month.value}
                >
                  {month.label}
                </MenuItem>

              ))}

            </MobileInput>

          </Box>

        </Box>

      </ResponsiveCard>


      {/* ================================= */}
      {/* MONTH TITLE */}
      {/* ================================= */}

      <Box
        sx={{
          mt: 3,
          mb: 2
        }}
      >

        <Typography
          sx={{
            color: "#94a3b8",
            fontSize: "0.8rem",
            textTransform: "uppercase",
            letterSpacing: 1.2,
            fontWeight: 700
          }}
        >
          Monthly Summary
        </Typography>

        <Typography
          sx={{
            color: "#fff",
            fontSize: {
              xs: "1.4rem",
              md: "1.7rem"
            },
            fontWeight: 800
          }}
        >
          {selectedMonthLabel}
        </Typography>

      </Box>


      {/* ================================= */}
      {/* FINANCIAL CARDS */}
      {/* ================================= */}

      <Grid
        container
        spacing={3}
        sx={{
          alignItems: "stretch"
        }}
      >

        {/* INCOME */}

        <Grid
          item
          xs={12}
          sm={6}
          md={4}
          sx={{
            display: "flex"
          }}
        >

          <ResponsiveCard
            sx={{
              minHeight: 190,
              height: "100%",
              mb: 0,
              borderLeft:
                "5px solid #22c55e",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(255,255,255,0.04))"
            }}
          >

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >

              <Box>

                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontWeight: 700,
                    fontSize: "0.9rem"
                  }}
                >
                  Total Income
                </Typography>

                <Typography
                  sx={{
                    color: "#22c55e",
                    fontWeight: 900,
                    fontSize: {
                      xs: "1.8rem",
                      md: "2.1rem"
                    },
                    mt: 1
                  }}
                >
                  {loading
                    ? "..."
                    : formatMoney(income)}
                </Typography>

              </Box>

              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(34,197,94,0.15)"
                }}
              >
                <TrendingUpIcon
                  sx={{
                    color: "#22c55e"
                  }}
                />
              </Box>

            </Box>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                mt: 2
              }}
            >
              Money received during {selectedMonthLabel}
            </Typography>

          </ResponsiveCard>

        </Grid>


        {/* EXPENDITURE */}

        <Grid item xs={12} sm={6} md={4}>

          <ResponsiveCard
            sx={{
              height: "100%",
              mb: 0,
              borderLeft:
                "5px solid #ef4444",
              background:
                "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(255,255,255,0.04))"
            }}
          >

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >

              <Box>

                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontWeight: 700,
                    fontSize: "0.9rem"
                  }}
                >
                  Total Expenditure
                </Typography>

                <Typography
                  sx={{
                    color: "#ef4444",
                    fontWeight: 900,
                    fontSize: {
                      xs: "1.8rem",
                      md: "2.1rem"
                    },
                    mt: 1
                  }}
                >
                  {loading
                    ? "..."
                    : formatMoney(expense)}
                </Typography>

              </Box>

              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(239,68,68,0.15)"
                }}
              >
                <TrendingDownIcon
                  sx={{
                    color: "#ef4444"
                  }}
                />
              </Box>

            </Box>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                mt: 2
              }}
            >
              Total spending during {selectedMonthLabel}
            </Typography>

          </ResponsiveCard>

        </Grid>


        {/* NET PROFIT */}

        <Grid item xs={12} sm={12} md={4}>

          <ResponsiveCard
            sx={{
              height: "100%",
              mb: 0,
              borderLeft:
                `5px solid ${
                  netProfit >= 0
                    ? "#8b5cf6"
                    : "#f97316"
                }`,

              background:
                netProfit >= 0
                  ? "linear-gradient(135deg, rgba(139,92,246,0.15), rgba(255,255,255,0.04))"
                  : "linear-gradient(135deg, rgba(249,115,22,0.15), rgba(255,255,255,0.04))"
            }}
          >

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start"
              }}
            >

              <Box>

                <Typography
                  sx={{
                    color: "#94a3b8",
                    fontWeight: 700,
                    fontSize: "0.9rem"
                  }}
                >
                  Net Profit
                </Typography>

                <Typography
                  sx={{
                    color:
                      netProfit >= 0
                        ? "#a78bfa"
                        : "#fb923c",

                    fontWeight: 900,

                    fontSize: {
                      xs: "1.8rem",
                      md: "2.1rem"
                    },

                    mt: 1
                  }}
                >
                  {loading
                    ? "..."
                    : formatMoney(netProfit)}
                </Typography>

              </Box>

              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    netProfit >= 0
                      ? "rgba(139,92,246,0.15)"
                      : "rgba(249,115,22,0.15)"
                }}
              >
                <AccountBalanceWalletIcon
                  sx={{
                    color:
                      netProfit >= 0
                        ? "#a78bfa"
                        : "#fb923c"
                  }}
                />
              </Box>

            </Box>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                mt: 2
              }}
            >
              {netProfit >= 0
                ? "Positive balance for the month"
                : "Expenditure is higher than income"}
            </Typography>

          </ResponsiveCard>

        </Grid>

      </Grid>


      {/* ================================= */}
      {/* LABOUR SECTION */}
      {/* ================================= */}

      <Box sx={{ mt: 4, mb: 2 }}>

        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.35rem"
          }}
        >
          👥 Labour Overview
        </Typography>

        <Typography
          sx={{
            color: "#64748b",
            fontSize: "0.85rem",
            mt: 0.4
          }}
        >
          Breakdown of labour costs for the selected month
        </Typography>

      </Box>


      <Grid
        container
        spacing={3}
        sx={{
          alignItems: "stretch"
        }}
      >

        {/* PLANTATION */}

        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: "flex"
          }}
        >

          <ResponsiveCard
            sx={{
              height: "100%",
              mb: 0
            }}
          >

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5
              }}
            >

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(34,197,94,0.12)"
                }}
              >
                <AgricultureIcon
                  sx={{
                    color: "#22c55e"
                  }}
                />
              </Box>

              <Box>

                <Typography
                  sx={{
                    color: "#cbd5e1",
                    fontWeight: 700
                  }}
                >
                  Plantation Labour
                </Typography>

                <Typography
                  sx={{
                    color: "#22c55e",
                    fontWeight: 900,
                    fontSize: "1.45rem"
                  }}
                >
                  {loading
                    ? "..."
                    : formatMoney(plantationCost)}
                </Typography>

              </Box>

            </Box>


            <LinearProgress
              variant="determinate"
              value={plantationPercentage}
              sx={{
                mt: 2,
                height: 7,
                borderRadius: 5,
                background:
                  "rgba(255,255,255,0.06)",

                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#22c55e",
                  borderRadius: 5
                }
              }}
            />


            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                mt: 1
              }}
            >
              {plantationPercentage.toFixed(1)}% of labour cost
            </Typography>

          </ResponsiveCard>

        </Grid>


        {/* CASUAL */}

        <Grid item xs={12} md={4}>

          <ResponsiveCard
            sx={{
              height: "100%",
              mb: 0
            }}
          >

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5
              }}
            >

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(245,158,11,0.12)"
                }}
              >
                <GroupsIcon
                  sx={{
                    color: "#f59e0b"
                  }}
                />
              </Box>

              <Box>

                <Typography
                  sx={{
                    color: "#cbd5e1",
                    fontWeight: 700
                  }}
                >
                  Casual Labour
                </Typography>

                <Typography
                  sx={{
                    color: "#f59e0b",
                    fontWeight: 900,
                    fontSize: "1.45rem"
                  }}
                >
                  {loading
                    ? "..."
                    : formatMoney(casualCost)}
                </Typography>

              </Box>

            </Box>


            <LinearProgress
              variant="determinate"
              value={casualPercentage}
              sx={{
                mt: 2,
                height: 7,
                borderRadius: 5,
                background:
                  "rgba(255,255,255,0.06)",

                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#f59e0b",
                  borderRadius: 5
                }
              }}
            />


            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                mt: 1
              }}
            >
              {casualPercentage.toFixed(1)}% of labour cost
            </Typography>

          </ResponsiveCard>

        </Grid>


        {/* RUBBER */}

        <Grid item xs={12} md={4}>

          <ResponsiveCard
            sx={{
              height: "100%",
              mb: 0
            }}
          >

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5
              }}
            >

              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background:
                    "rgba(59,130,246,0.12)"
                }}
              >
                <RubberIcon
                  sx={{
                    color: "#3b82f6"
                  }}
                />
              </Box>

              <Box>

                <Typography
                  sx={{
                    color: "#cbd5e1",
                    fontWeight: 700
                  }}
                >
                  Rubber Tappers
                </Typography>

                <Typography
                  sx={{
                    color: "#3b82f6",
                    fontWeight: 900,
                    fontSize: "1.45rem"
                  }}
                >
                  {loading
                    ? "..."
                    : formatMoney(rubberCost)}
                </Typography>

              </Box>

            </Box>


            <LinearProgress
              variant="determinate"
              value={rubberPercentage}
              sx={{
                mt: 2,
                height: 7,
                borderRadius: 5,
                background:
                  "rgba(255,255,255,0.06)",

                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#3b82f6",
                  borderRadius: 5
                }
              }}
            />


            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem",
                mt: 1
              }}
            >
              {rubberPercentage.toFixed(1)}% of labour cost
            </Typography>

          </ResponsiveCard>

        </Grid>

      </Grid>


      {/* ================================= */}
      {/* TOTAL LABOUR */}
      {/* ================================= */}

      <ResponsiveCard
        sx={{
          mt: 2,

          background:
            "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(139,92,246,0.10), rgba(255,255,255,0.03))",

          border:
            "1px solid rgba(139,92,246,0.18)"
        }}
      >

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap"
          }}
        >

          <Box>

            <Typography
              sx={{
                color: "#94a3b8",
                fontSize: "0.8rem",
                textTransform: "uppercase",
                letterSpacing: 1
              }}
            >
              Total Labour Cost
            </Typography>

            <Typography
              sx={{
                color: "#fff",
                fontSize: {
                  xs: "1.7rem",
                  md: "2rem"
                },
                fontWeight: 900,
                mt: 0.5
              }}
            >
              {loading
                ? "..."
                : formatMoney(totalLabour)}
            </Typography>

          </Box>


          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1,
              borderRadius: 3,
              background:
                "rgba(255,255,255,0.05)"
            }}
          >

            <GrassIcon
              sx={{
                color: "#8b5cf6"
              }}
            />

            <Typography
              sx={{
                color: "#cbd5e1",
                fontSize: "0.8rem"
              }}
            >
              Labour overview
            </Typography>

          </Box>

        </Box>

      </ResponsiveCard>


      {/* ================================= */}
      {/* FINANCIAL HEALTH */}
      {/* ================================= */}

      <ResponsiveCard
        sx={{
          mt: 2
        }}
      >

        <Typography
          sx={{
            color: "#fff",
            fontWeight: 800,
            fontSize: "1.1rem"
          }}
        >
          💡 Financial Health
        </Typography>

        <Divider
          sx={{
            my: 2,
            borderColor:
              "rgba(255,255,255,0.06)"
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap"
          }}
        >

          <Box>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem"
              }}
            >
              Income
            </Typography>

            <Typography
              sx={{
                color: "#22c55e",
                fontWeight: 800
              }}
            >
              {formatMoney(income)}
            </Typography>

          </Box>


          <Box>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem"
              }}
            >
              Expenditure
            </Typography>

            <Typography
              sx={{
                color: "#ef4444",
                fontWeight: 800
              }}
            >
              {formatMoney(expense)}
            </Typography>

          </Box>


          <Box>

            <Typography
              sx={{
                color: "#64748b",
                fontSize: "0.75rem"
              }}
            >
              Result
            </Typography>

            <Typography
              sx={{
                color:
                  netProfit >= 0
                    ? "#a78bfa"
                    : "#fb923c",
                fontWeight: 800
              }}
            >
              {netProfit >= 0
                ? "Profitable"
                : "Loss"}
            </Typography>

          </Box>

        </Box>

      </ResponsiveCard>

    </Box>
  );
}