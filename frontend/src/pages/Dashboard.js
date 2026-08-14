import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

import {
  Box,
  Typography,
  Grid,
  MenuItem
} from "@mui/material";

import MobileInput from "../components/mobile/MobileInput";
import DashboardStatCard from "../components/mobile/DashboardStatCard";
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

  const netProfit =
    Number(income) -
    Number(expense);


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


  const selectedMonthLabel =
    dayjs(
      `${selectedMonth}-01`
    ).format("MMMM YYYY");


  // =========================
  // UI
  // =========================

  return (

    <Box sx={{ width: "100%" }}>

      {/* HEADER */}

      <ResponsiveCard
        sx={{
          mb: 3,
          p: {
            xs: 2,
            md: 3
          }
        }}
      >

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{
            fontSize: {
              xs: "1.3rem",
              md: "1.8rem"
            }
          }}
        >
          {plantation === "nirmalani"
            ? "⚡ Nirmalani Plantation"
            : "🌿 Ingurupaththala Plantation"}
        </Typography>

        <Typography
          color="text.secondary"
          sx={{ mt: 0.5 }}
        >
          Monthly Summary
        </Typography>

        <Box sx={{ mt: 2, maxWidth: 250 }}>

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

      </ResponsiveCard>


      {/* MONTH */}

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{ mb: 2 }}
      >
        {selectedMonthLabel}
      </Typography>


      {/* FINANCIAL SUMMARY */}

      <Grid
        container
        spacing={2}
      >

        <Grid item xs={12} md={4}>

          <DashboardStatCard
            title="💰 Total Income"
            value={
              loading
                ? "Loading..."
                : `Rs. ${income.toLocaleString()}`
            }
            color="#22c55e"
          />

        </Grid>


        <Grid item xs={12} md={4}>

          <DashboardStatCard
            title="💸 Total Expenditure"
            value={
              loading
                ? "Loading..."
                : `Rs. ${expense.toLocaleString()}`
            }
            color="#ef4444"
          />

        </Grid>


        <Grid item xs={12} md={4}>

          <DashboardStatCard
            title="📈 Net Profit"
            value={
              loading
                ? "Loading..."
                : `Rs. ${netProfit.toLocaleString()}`
            }
            color="#8b5cf6"
          />

        </Grid>

      </Grid>


      {/* PAYROLL SUMMARY */}

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          mt: 4,
          mb: 2
        }}
      >
        Labour & Payroll Summary
      </Typography>


      <Grid
        container
        spacing={2}
      >

        <Grid item xs={12} md={4}>

          <DashboardStatCard
            title="🌱 Plantation Labour"
            value={
              loading
                ? "Loading..."
                : `Rs. ${plantationCost.toLocaleString()}`
            }
            color="#22c55e"
          />

        </Grid>


        <Grid item xs={12} md={4}>

          <DashboardStatCard
            title="👷 Casual Labour"
            value={
              loading
                ? "Loading..."
                : `Rs. ${casualCost.toLocaleString()}`
            }
            color="#f59e0b"
          />

        </Grid>


        <Grid item xs={12} md={4}>

          <DashboardStatCard
            title="🧤 Rubber Tappers"
            value={
              loading
                ? "Loading..."
                : `Rs. ${rubberCost.toLocaleString()}`
            }
            color="#3b82f6"
          />

        </Grid>

      </Grid>


      {/* TOTAL LABOUR */}

      <ResponsiveCard
        sx={{
          mt: 3,
          p: 2
        }}
      >

        <Typography
          color="text.secondary"
          variant="body2"
        >
          Total Labour Cost
        </Typography>

        <Typography
          variant="h5"
          fontWeight={800}
          sx={{ mt: 0.5 }}
        >
          Rs.{" "}
          {(
            plantationCost +
            casualCost +
            rubberCost
          ).toLocaleString()}
        </Typography>

      </ResponsiveCard>

    </Box>

  );

}