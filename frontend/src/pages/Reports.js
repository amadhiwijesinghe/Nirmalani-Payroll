import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Divider,
  TextField
} from "@mui/material";

import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";

const API = "https://nirmalani-payroll-production.up.railway.app";

export default function Reports({ plantation }) {
  const [reportType, setReportType] = useState("plantation");
  const [reportPeriod, setReportPeriod] = useState("monthly");

  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [month, setMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [weeklyData, setWeeklyData] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  // =========================
  // LOAD PLANTATION PAYROLL
  // =========================

  useEffect(() => {
    if (reportType === "plantation") {
      fetchPlantationData();
    }
  }, [plantation, reportType]);

  const fetchPlantationData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/plantation-data?plantation=${plantation}`
      );

      setData(res.data || []);
    } catch (error) {
      console.error("Error loading plantation payroll:", error);
      alert("Error loading plantation payroll data");
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyPlantationData = async () => {
    if (!weekStart || !weekEnd) {
        alert("Please select week start and week end.");
        return false;
    }

    try {
        setWeeklyLoading(true);

        const res = await axios.get(
        `${API}/plantation-weekly-report`,
        {
            params: {
            weekStart,
            weekEnd,
            plantation
            }
        }
        );

        setWeeklyData(res.data || []);

        return true;
    } catch (error) {
        console.error(
        "Error loading weekly plantation report:",
        error
        );

        alert("Error loading weekly plantation report.");

        return false;
    } finally {
        setWeeklyLoading(false);
    }
    };

  // =========================
  // PAYROLL CALCULATION
  // =========================

  const calculate = (amount, allowance = 0) => {
    const gross =
      Number(amount || 0) +
      Number(allowance || 0);

    const epf_8 = gross * 0.08;
    const epf_12 = gross * 0.12;
    const epf_20 = epf_8 + epf_12;
    const etf = gross * 0.03;

    const total_deduction = epf_8;

    const balance =
      gross - total_deduction;

    return {
      amount: gross,
      epf_8,
      epf_12,
      epf_20,
      etf,
      allowance: Number(allowance || 0),
      total_deduction,
      balance
    };
  };

  // =========================
  // GROUP DATA
  // =========================

  const groupedData = Object.values(
    data.reduce((acc, row) => {
      const key = `${row.worker_id}-${row.month}`;

      acc[key] = row;

      return acc;
    }, {})
  );

  // =========================
  // SELECTED MONTH
  // =========================

  const rows = groupedData
    .filter(
      (row) =>
        row.days_worked > 0 &&
        row.month === month
    )
    .sort(
      (a, b) =>
        Number(a.epf_no || 0) -
        Number(b.epf_no || 0)
    );

  // =========================
  // TOTALS
  // =========================

  const totals = rows.reduce(
    (acc, row) => {
      const c = calculate(
        row.amount || 0,
        row.allowance || 0
      );

      acc.amount += Number(row.amount || 0);
      acc.epf_8 += c.epf_8;
      acc.epf_12 += c.epf_12;
      acc.epf_20 += c.epf_20;
      acc.etf += c.etf;
      acc.total_deduction += c.total_deduction;
      acc.balance += c.balance;
      acc.allowance += Number(
        row.allowance || 0
      );

      return acc;
    },
    {
      amount: 0,
      epf_8: 0,
      epf_12: 0,
      epf_20: 0,
      etf: 0,
      total_deduction: 0,
      balance: 0,
      allowance: 0
    }
  );

  // =========================
  // PLANTATION NAME
  // =========================

  const plantationName =
    plantation === "nirmalani"
      ? "NIRMALANI PLANTATION"
      : "INGURUPATHTHALA PLANTATION";

  // =========================
  // REPORT MONTH
  // =========================

  const reportMonth = new Date(
    month + "-01"
  ).toLocaleString("default", {
    month: "long",
    year: "numeric"
  });

  // =========================
  // GENERATE REPORT HTML
  // =========================

  const generateReportHTML = () => {
    const rowsHTML = rows
      .map((row) => {
        const c = calculate(
          row.amount || 0,
          row.allowance || 0
        );

        return `
          <tr>
            <td>${row.epf_no || "-"}</td>
            <td>${row.name || "-"}</td>
            <td>${row.days_worked || 0}</td>
            <td>${Number(
              row.rate_per_day || 0
            ).toFixed(2)}</td>
            <td>${c.amount.toFixed(2)}</td>
            <td>${c.epf_8.toFixed(2)}</td>
            <td>${c.total_deduction.toFixed(2)}</td>
            <td>${c.epf_12.toFixed(2)}</td>
            <td>${c.epf_20.toFixed(2)}</td>
            <td>${c.etf.toFixed(2)}</td>
            <td>${c.allowance.toFixed(2)}</td>
            <td>${c.balance.toFixed(2)}</td>
          </tr>
        `;
      })
      .join("");

    const grandTotal =
      totals.balance +
      totals.epf_20 +
      totals.etf;

    return `
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          ${plantationName} Monthly Payroll Report
        </title>

        <style>

          @page {
            size: A4 landscape;
            margin: 12mm;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #111;
          }

          h1 {
            margin: 0;
            font-size: 28px;
          }

          h2 {
            margin: 5px 0 20px 0;
          }

          .header {
            text-align: center;
            margin-bottom: 25px;
          }

          .details {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
          }

          .details td {
            border: none;
            padding: 5px;
          }

          table.report {
            width: 100%;
            border-collapse: collapse;
          }

          table.report th,
          table.report td {
            border: 1px solid #000;
            padding: 5px;
            font-size: 11px;
            white-space: nowrap;
            text-align: center;
          }

          table.report th {
            font-weight: bold;
          }

          .total {
            font-weight: bold;
          }

          .grand-total {
            margin-top: 20px;
            font-size: 16px;
            font-weight: bold;
          }

        </style>

      </head>

      <body>

        <div class="header">

          <h1>
            ${plantationName}
          </h1>

          <h2>
            MONTHLY PAYROLL REPORT
          </h2>

        </div>

        <table class="details">

          <tr>

            <td>
              <b>Plantation</b>
            </td>

            <td>
              ${plantationName}
            </td>

            <td>
              <b>Month</b>
            </td>

            <td>
              ${reportMonth}
            </td>

            <td>
              <b>Generated</b>
            </td>

            <td>
              ${new Date().toLocaleDateString()}
            </td>

          </tr>

        </table>

        <table class="report">

          <thead>

            <tr>

              <th>EPF No</th>
              <th>Name</th>
              <th>Days</th>
              <th>Rate</th>
              <th>Amount</th>
              <th>EPF 8%</th>
              <th>Deduction</th>
              <th>EPF 12%</th>
              <th>EPF 20%</th>
              <th>ETF</th>
              <th>Allowance</th>
              <th>Net Salary</th>

            </tr>

          </thead>

          <tbody>

            ${rowsHTML}

            <tr class="total">

              <td colspan="4">
                TOTAL
              </td>

              <td>
                ${totals.amount.toFixed(2)}
              </td>

              <td>
                ${totals.epf_8.toFixed(2)}
              </td>

              <td>
                ${totals.total_deduction.toFixed(2)}
              </td>

              <td>
                ${totals.epf_12.toFixed(2)}
              </td>

              <td>
                ${totals.epf_20.toFixed(2)}
              </td>

              <td>
                ${totals.etf.toFixed(2)}
              </td>

              <td>
                ${totals.allowance.toFixed(2)}
              </td>

              <td>
                ${totals.balance.toFixed(2)}
              </td>

            </tr>

          </tbody>

        </table>

        <div class="grand-total">

            Net Salary / Cash Required:
            Rs. ${totals.balance.toFixed(2)}

            </div>

      </body>

      </html>
    `;
  };

  // =========================
  // PRINT
  // =========================

  const handlePrint = () => {
    if (rows.length === 0) {
      alert("No payroll data found for this month.");
      return;
    }

    const html = generateReportHTML();

    const win = window.open(
      "",
      "_blank"
    );

    if (!win) {
      alert(
        "Please allow pop-ups in your browser."
      );
      return;
    }

    win.document.write(html);

    win.document.close();

    setTimeout(() => {
      win.print();
    }, 500);
  };

  // =========================
  // DOWNLOAD HTML
  // =========================

  const handleDownload = () => {
    if (rows.length === 0) {
      alert("No payroll data found for this month.");
      return;
    }

    const html = generateReportHTML();

    const blob = new Blob(
      [html],
      { type: "text/html" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `${plantationName} Monthly Payroll ${month}.html`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>

      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
      >
        Reports
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Generate, print and download plantation reports
      </Typography>

      <Card>

        <CardContent>

          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ mb: 3 }}
          >
            Report Settings
          </Typography>

          <Stack
            direction={{
              xs: "column",
              md: "row"
            }}
            spacing={2}
          >

            <FormControl fullWidth>

              <InputLabel>
                Report Type
              </InputLabel>

              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) =>
                  setReportType(e.target.value)
                }
              >

                <MenuItem value="plantation">
                  Plantation Workers Payroll
                </MenuItem>

                <MenuItem value="rubbertappers">
                  Rubber Tappers Payroll
                </MenuItem>

                <MenuItem value="casualworkers">
                  Casual Workers Payroll
                </MenuItem>

                <MenuItem value="attendance">
                  Attendance Register
                </MenuItem>

              </Select>

            </FormControl>

            <FormControl fullWidth>
                <InputLabel>Report Period</InputLabel>

                <Select
                    value={reportPeriod}
                    label="Report Period"
                    onChange={(e) =>
                    setReportPeriod(e.target.value)
                    }
                >
                    <MenuItem value="monthly">
                    Monthly
                    </MenuItem>

                    <MenuItem value="weekly">
                    Weekly
                    </MenuItem>
                </Select>
                </FormControl>

            {reportPeriod === "monthly" && (
                <FormControl fullWidth>

              <InputLabel>
                Month
              </InputLabel>

              <Select
                value={month}
                label="Month"
                onChange={(e) =>
                  setMonth(e.target.value)
                }
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
                ].map((name, index) => {

                  const value =
                    `${new Date().getFullYear()}-${String(
                      index + 1
                    ).padStart(2, "0")}`;

                  return (
                    <MenuItem
                      key={value}
                      value={value}
                    >
                      {name}
                    </MenuItem>
                  );

                })}

              </Select>

            </FormControl>
            )}

            {reportPeriod === "weekly" && (
                <>
                    <TextField
                    fullWidth
                    label="Week Start"
                    type="date"
                    value={weekStart}
                    onChange={(e) =>
                        setWeekStart(e.target.value)
                    }
                    InputLabelProps={{
                        shrink: true
                    }}
                    />

                    <TextField
                    fullWidth
                    label="Week End"
                    type="date"
                    value={weekEnd}
                    onChange={(e) =>
                        setWeekEnd(e.target.value)
                    }
                    InputLabelProps={{
                        shrink: true
                    }}
                    />
                </>
                )}

          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography sx={{ mb: 1 }}>
            <strong>Plantation:</strong>{" "}
            {plantationName}
          </Typography>

          <Typography sx={{ mb: 1 }}>
            <strong>Report:</strong>{" "}
            Plantation Workers Payroll
          </Typography>

          <Typography sx={{ mb: 3 }}>
            <strong>Month:</strong>{" "}
            {reportMonth}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
          >

            <Button
              variant="contained"
              startIcon={<PrintIcon />}
              onClick={handlePrint}
              disabled={loading}
            >
              Print Report
            </Button>

            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={loading}
            >
              Download Report
            </Button>

          </Stack>

        </CardContent>

      </Card>

      <Card sx={{ mt: 3 }}>

        <CardContent>

          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
          >
            Report Preview
          </Typography>

          {reportPeriod === "weekly" && (
            <Button
                variant="contained"
                onClick={fetchWeeklyPlantationData}
                disabled={weeklyLoading}
                sx={{ mb: 2 }}
            >
                {weeklyLoading
                ? "Loading Weekly Data..."
                : "Load Weekly Report"}
            </Button>
            )}

            {reportPeriod === "weekly" && (
                <Typography color="text.secondary">
                    {weeklyData.length > 0
                    ? `${weeklyData.length} attendance record(s) found.`
                    : "Select a week and click Load Weekly Report."}
                </Typography>
                )}

          <Typography
            color="text.secondary"
          >
            {loading
              ? "Loading payroll data..."
              : `${rows.length} worker(s) found for ${reportMonth}.`
            }
          </Typography>

          {!loading && rows.length > 0 && (
            <Typography
              sx={{
                mt: 2,
                fontWeight: "bold"
              }}
            >
              Net Salary: Rs.{" "}
              {totals.balance.toFixed(2)}
            </Typography>
          )}

        </CardContent>

      </Card>

    </Box>
  );
}