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

  const [allWorkersData, setAllWorkersData] = useState([]);
  const [allWorkersLoading, setAllWorkersLoading] = useState(false);

  const [rubberData, setRubberData] = useState([]);
  const [rubberLoading, setRubberLoading] = useState(false);

  const [casualData, setCasualData] = useState([]);
  const [casualLoading, setCasualLoading] = useState(false);

  const [machineLabourData, setMachineLabourData] = useState([]);
  const [machineLabourLoading, setMachineLabourLoading] = useState(false);

  const [rubberTemporaryRate, setRubberTemporaryRate] = useState(300);
  const [rubberBonusRate, setRubberBonusRate] = useState(250);
  const [rubberMinimumKg, setRubberMinimumKg] = useState(2.5);
  const [rubberBonusStartKg, setRubberBonusStartKg] = useState(7);

  // =========================
  // LOAD PLANTATION PAYROLL
  // =========================

useEffect(() => {
  if (reportType === "plantation") {
    fetchPlantationData();
  }

  if (reportType === "allworkers") {
    fetchAllWorkersData();
  }

  if (reportType === "rubbertappers") {
    fetchRubberData();
  }

  if (reportType === "casualworkers") {
    fetchCasualData();
  }

  if (reportType === "machinelabour") {
    fetchMachineLabourData();
  }

}, [
  reportType,
  plantation,
  month,
  weekStart,
  weekEnd
]);

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

  const fetchAllWorkersData = async () => {
    try {
        setAllWorkersLoading(true);

        const res = await axios.get(
        `${API}/dashboard/all-worker-salary-report/${month}`,
        {
            params: {
            plantation
            }
        }
        );

        setAllWorkersData(res.data || []);
    } catch (error) {
        console.error("Error loading all workers report:", error);
        alert("Error loading all workers report.");
    } finally {
        setAllWorkersLoading(false);
    }const fetchRubberData = async () => {
  try {
    setRubberLoading(true);

    const res = await axios.get(
      `${API}/rubber-payroll-data?plantation=${plantation}`
    );

    const settingsRes = await axios.get(
      `${API}/payroll-settings?plantation=${plantation}`
    );

    const settings = settingsRes.data || {};

    setRubberTemporaryRate(
      Number(settings.temporary_rate || 300)
    );

    setRubberBonusRate(
      Number(settings.rubber_bonus_rate || 250)
    );

    setRubberMinimumKg(
      Number(settings.rubber_minimum_kg || 2.5)
    );

    setRubberBonusStartKg(
      Number(settings.rubber_bonus_start_kg || 7)
    );

    setRubberData(res.data || []);
  } catch (error) {
    console.error(
      "Error loading rubber tappers payroll:",
      error
    );

    alert("Error loading rubber tappers payroll data.");
  } finally {
    setRubberLoading(false);
  }
};
    };

    const fetchRubberData = async () => {
        try {
            setRubberLoading(true);

            const res = await axios.get(
            `${API}/rubber-payroll-data?plantation=${plantation}`
            );

            const settingsRes = await axios.get(
            `${API}/payroll-settings?plantation=${plantation}`
            );

            const settings = settingsRes.data || {};

            setRubberTemporaryRate(
            Number(settings.temporary_rate || 300)
            );

            setRubberBonusRate(
            Number(settings.rubber_bonus_rate || 250)
            );

            setRubberMinimumKg(
            Number(settings.rubber_minimum_kg || 2.5)
            );

            setRubberBonusStartKg(
            Number(settings.rubber_bonus_start_kg || 7)
            );

            setRubberData(res.data || []);
        } catch (error) {
            console.error(
            "Error loading rubber tappers payroll:",
            error
            );

            alert("Error loading rubber tappers payroll data.");
        } finally {
            setRubberLoading(false);
        }
        };

  const fetchCasualData = async () => {
    try {
        setCasualLoading(true);

        const res = await axios.get(
            `${API}/casual-payroll-data?plantation=${plantation}`
        );

        setCasualData(res.data || []);
    } catch (error) {
        console.error(
            "Error loading casual workers payroll:",
            error
        );

        alert(
            "Error loading casual workers payroll data."
        );
    } finally {
        setCasualLoading(false);
    }
};

// =========================
// FETCH MACHINE LABOUR DATA
// =========================

const fetchMachineLabourData = async () => {
  try {
    setMachineLabourLoading(true);

    const res = await axios.get(
      `${API}/machine-labour-attendance`,
      {
        params: {
          month,
          plantation
        }
      }
    );

    setMachineLabourData(res.data || []);

  } catch (error) {
    console.error(
      "Error loading machine labour report:",
      error.response?.data || error
    );

    alert(
      "Error loading machine labour report data."
    );

  } finally {
    setMachineLabourLoading(false);
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

  const calculateAllWorkerSalary = (row) => {
  const amount = Number(row.amount || 0);
  const allowance = Number(row.allowance || 0);

  const gross = amount + allowance;
  const epf8 = gross * 0.08;
  const netSalary = gross - epf8;

  return {
    amount,
    allowance,
    gross,
    epf8,
    netSalary
  };
};

    const calculateCasualSalary = (row) => {
    const daysWorked = Number(row.worked_days || 0);
    const dailyRate = Number(row.daily_rate || 0);
    const allowance = Number(row.allowance || 0);

    const gross = daysWorked * dailyRate;

    const netSalary = gross + allowance;

    return {
        daysWorked,
        dailyRate,
        allowance,
        gross,
        netSalary
    };
    };
    const calculateRubberSalary = (row) => {
    const kg = Number(row.kg || 0);
    const workedDays = Number(row.worked_days || 0);
    const rate = Number(row.rate || 0);
    const allowance = Number(row.allowance || 0);
    const epfEnabled = Number(row.epf_enabled || 0);

    let gross = 0;
    let bonus = 0;
    let averageKg = 0;

    // Permanent Worker
    if (row.worker_category === "Permanent") {
        averageKg =
        workedDays > 0
            ? kg / workedDays
            : 0;

        if (averageKg < rubberMinimumKg) {
        gross = 0;
        } else if (averageKg <= rubberBonusStartKg) {
        gross = workedDays * rate;
        } else {
        bonus =
            (averageKg - rubberBonusStartKg) *
            rubberBonusRate;

        gross =
            (workedDays * rate) +
            bonus;
        }
    }

    // Temporary Worker
    else {
        gross =
        kg * rubberTemporaryRate;
    }

    const epf8 = epfEnabled === 1
        ? gross * 0.08
        : 0;

    const epf12 = epfEnabled === 1
        ? gross * 0.12
        : 0;

    const epf20 = epfEnabled === 1
        ? gross * 0.20
        : 0;

    const etf = epfEnabled === 1
        ? gross * 0.03
        : 0;

    const netSalary =
        gross +
        allowance -
        epf8;

    return {
        kg,
        workedDays,
        rate,
        allowance,
        averageKg,
        bonus,
        gross,
        epf8,
        epf12,
        epf20,
        etf,
        netSalary
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

    const rubberRows = Object.values(
        rubberData.reduce((acc, row) => {
            const key = `${row.worker_id}-${row.month}`;

            if (!acc[key]) {
            acc[key] = {
                worker_id: row.worker_id,
                name: row.name,
                month: row.month,
                rate: Number(row.rate || 0),
                worker_category: row.worker_category,
                epf_no: row.epf_no,
                epf_enabled: Number(row.epf_enabled || 0),
                kg: 0,
                allowance: 0,
                worked_days: 0
            };
            }

            acc[key].kg += Number(row.kg || 0);
            acc[key].allowance += Number(row.allowance || 0);
            acc[key].worked_days += Number(row.worked_days || 0);

            return acc;
        }, {})
        )
        .filter(
            (row) =>
            row.month === month &&
            row.worked_days > 0
        )
        .sort(
            (a, b) =>
            Number(a.epf_no || 0) -
            Number(b.epf_no || 0)
        );

        const casualRows = casualData
        .filter(
            (row) =>
            row.month === month &&
            Number(row.worked_days || 0) > 0
        )
        .sort(
            (a, b) =>
            Number(a.worker_id || 0) -
            Number(b.worker_id || 0)
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

  const rubberTotals = rubberRows.reduce(
    (acc, row) => {
        const c = calculateRubberSalary(row);

        acc.kg += c.kg;
        acc.gross += c.gross;
        acc.allowance += c.allowance;
        acc.epf8 += c.epf8;
        acc.epf12 += c.epf12;
        acc.epf20 += c.epf20;
        acc.etf += c.etf;
        acc.netSalary += c.netSalary;

        return acc;
    },
    {
        kg: 0,
        gross: 0,
        allowance: 0,
        epf8: 0,
        epf12: 0,
        epf20: 0,
        etf: 0,
        netSalary: 0
    }
    );

    const casualTotals = casualRows.reduce(
        (acc, row) => {
            const c = calculateCasualSalary(row);

            acc.daysWorked += c.daysWorked;
            acc.gross += c.gross;
            acc.allowance += c.allowance;
            acc.netSalary += c.netSalary;

            return acc;
        },
        {
            daysWorked: 0,
            gross: 0,
            allowance: 0,
            netSalary: 0
        }
        );

  const weeklyTotal = weeklyData.reduce(
    (total, row) => {
        return total + Number(row.amount || 0);
    },
    0
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

  const generateAllWorkersReportHTML = () => {
    const totalNetSalary = allWorkersData.reduce((total, row) => {
        const salary = calculateAllWorkerSalary(row);
        return total + salary.netSalary;
    }, 0);

    const generatedDate = new Date().toLocaleDateString("en-GB");

    const rowsHTML = allWorkersData
        .map((row, index) => {
        const salary = calculateAllWorkerSalary(row);

        return `
            <tr>
            <td>${row.type || "-"}</td>
            <td>${row.epf_no || "-"}</td>
            <td>${row.name || "-"}</td>
            <td>${Number(row.days || 0).toFixed(1)}</td>
            <td>${Number(row.rate || 0).toFixed(2)}</td>
            <td>${salary.amount.toFixed(2)}</td>
            <td>${salary.allowance.toFixed(2)}</td>
            <td>${salary.netSalary.toFixed(2)}</td>
            </tr>
        `;
        })
        .join("");

    return `
        <!DOCTYPE html>
        <html>
        <head>
        <title>All Workers Payroll Report</title>

        <style>
            @page {
            size: A4 landscape;
            margin: 12mm;
            }

            body {
            font-family: Arial, sans-serif;
            margin: 0;
            color: #000;
            font-size: 12px;
            }

            .header {
            text-align: center;
            margin-bottom: 20px;
            }

            .plantation-name {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 5px;
            }

            .report-title {
            font-size: 16px;
            font-weight: bold;
            }

            .details {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
            }

            .details td {
            padding: 5px 8px;
            }

            .details td:first-child {
            width: 100px;
            font-weight: bold;
            }

            table.report-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            }

            .report-table th,
            .report-table td {
            border: 1px solid #000;
            padding: 6px 5px;
            text-align: center;
            }

            .report-table th {
            font-weight: bold;
            }

            .report-table td:nth-child(3) {
            text-align: left;
            }

            .total {
            margin-top: 18px;
            text-align: right;
            font-size: 15px;
            font-weight: bold;
            }

            .footer {
            margin-top: 30px;
            display: flex;
            justify-content: space-between;
            font-size: 11px;
            }
        </style>
        </head>

        <body>

        <div class="header">
            <div class="plantation-name">
            ${plantationName}
            </div>

            <div class="report-title">
            ALL WORKERS PAYROLL REPORT
            </div>
        </div>

        <table class="details">
            <tr>
            <td>Plantation</td>
            <td>${plantationName}</td>
            </tr>

            <tr>
            <td>Period</td>
            <td>${reportMonth}</td>
            </tr>

            <tr>
            <td>Generated</td>
            <td>${generatedDate}</td>
            </tr>
        </table>

        <table class="report-table">
            <thead>
            <tr>
                <th>Type</th>
                <th>EPF No</th>
                <th>Name</th>
                <th>Days</th>
                <th>Rate</th>
                <th>Amount</th>
                <th>Allowance</th>
                <th>Net Salary</th>
            </tr>
            </thead>

            <tbody>
            ${rowsHTML}
            </tbody>
        </table>

        <div class="total">
            Net Salary: Rs. ${totalNetSalary.toFixed(2)}
        </div>

        <div class="footer">
            <div>Prepared By: ____________________</div>
            <div>Authorized By: ____________________</div>
        </div>

        </body>
        </html>
    `;
    };

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
          <td class="name">${row.name || "-"}</td>
          <td>${row.days_worked || 0}</td>
          <td>${Number(row.rate_per_day || 0).toFixed(2)}</td>
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
          margin: 0;
          padding: 0;
          color: #111;
          font-size: 12px;
        }

        .header {
          text-align: center;
          margin-bottom: 18px;
        }

        .plantation-name {
          font-size: 21px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .report-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 18px;
        }

        .details {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
        }

        .details td {
          padding: 5px 8px;
          border: none;
        }

        .details td.label {
          font-weight: bold;
          width: 80px;
        }

        table.report {
          width: 100%;
          border-collapse: collapse;
        }

        table.report th,
        table.report td {
          border: 1px solid #000;
          padding: 5px 4px;
          font-size: 10px;
          text-align: center;
          white-space: nowrap;
        }

        table.report th {
          font-weight: bold;
        }

        table.report td.name {
          text-align: left;
        }

        table.report tr.total {
          font-weight: bold;
        }

        .grand-total {
          margin-top: 18px;
          text-align: right;
          font-size: 15px;
          font-weight: bold;
        }

      </style>

    </head>

    <body>

      <div class="header">

        <div class="plantation-name">
          ${plantationName}
        </div>

        <div class="report-title">
          MONTHLY PAYROLL REPORT
        </div>

      </div>

      <table class="details">

        <tr>

          <td class="label">
            Plantation
          </td>

          <td>
            ${plantationName}
          </td>

          <td class="label">
            Period
          </td>

          <td>
            ${reportMonth}
          </td>

          <td class="label">
            Generated
          </td>

          <td>
            ${new Date().toLocaleDateString("en-GB")}
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

  // =======================
  // GENERATE WEEKLY REPORT
  // =======================
  const generateWeeklyReportHTML = () => {
  const rowsHTML = weeklyData
    .map((row) => {
      return `
        <tr>
          <td>${row.epf_no || "-"}</td>
          <td>${row.name || "-"}</td>
          <td>
            ${new Date(
              row.attendance_date
            ).toLocaleDateString()}
          </td>
          <td>
            ${Number(
              row.attendance_value || 0
            ).toFixed(2)}
          </td>
          <td>
            Rs. ${Number(
              row.daily_rate || 0
            ).toFixed(2)}
          </td>
          <td>
            Rs. ${Number(
              row.amount || 0
            ).toFixed(2)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>

    <html>

    <head>

      <title>
        ${plantationName} Weekly Payroll Report
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
          padding: 7px;
          font-size: 12px;
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
          WEEKLY PAYROLL REPORT
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
            <b>Week</b>
          </td>

          <td>
            ${weekStart} to ${weekEnd}
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
            <th>Date</th>
            <th>Attendance</th>
            <th>Rate</th>
            <th>Amount</th>

          </tr>

        </thead>

        <tbody>

          ${rowsHTML}

          <tr class="total">

            <td colspan="5">
              TOTAL
            </td>

            <td>
              Rs. ${weeklyTotal.toFixed(2)}
            </td>

          </tr>

        </tbody>

      </table>

      <div class="grand-total">

        Weekly Total / Cash Required:
        Rs. ${weeklyTotal.toFixed(2)}

      </div>

    </body>

    </html>
  `;
};

  // =========================
  // PRINT
  // =========================

    const handlePrint = async () => {
        if (reportType === "allworkers") {
            if (allWorkersData.length === 0) {
            alert("No all workers payroll data found for this month.");
            return;
            }

            const html = generateAllWorkersReportHTML();

            const win = window.open("", "_blank");

            if (!win) {
            alert("Please allow pop-ups to print the report.");
            return;
            }

            win.document.write(html);
            win.document.close();

            win.onload = () => {
            win.focus();
            win.print();
            };

                    return;
        }

        // MACHINE LABOUR PRINT REPORT
        if (
            reportType === "machinelabour" &&
            reportPeriod === "monthly"
        ) {
            if (machineLabourData.length === 0) {
                alert(
                    "No machine labour payments found for this month."
                );
                return;
            }

            const rowsHTML = machineLabourData
                .map((row) => {
                    return `
                        <tr>
                            <td>
                                ${
                                    row.attendance_date
                                        ? String(
                                              row.attendance_date
                                          ).split("T")[0]
                                        : "-"
                                }
                            </td>

                            <td class="name">
                                ${row.name || "-"}
                            </td>

                            <td>
                                ${Number(
                                    row.oil_cans || 0
                                )}
                            </td>

                            <td>
                                ${Number(
                                    row.tanks || 0
                                ).toLocaleString()}
                            </td>

                            <td>
                                Rs. ${Number(
                                    row.rate || 0
                                ).toLocaleString()}
                            </td>

                            <td>
                                Rs. ${Number(
                                    row.total || 0
                                ).toLocaleString()}
                            </td>
                        </tr>
                    `;
                })
                .join("");

            const monthlyTotal = machineLabourData.reduce(
                (sum, row) =>
                    sum + Number(row.total || 0),
                0
            );

            const html = `
                <!DOCTYPE html>
                <html>

                <head>

                    <title>
                        ${plantationName}
                        Machine Labour Payroll Report
                    </title>

                    <style>

                        @page {
                            size: A4 portrait;
                            margin: 15mm;
                        }

                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            color: #111;
                            font-size: 12px;
                        }

                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                        }

                        .plantation-name {
                            font-size: 21px;
                            font-weight: bold;
                            margin-bottom: 6px;
                        }

                        .report-title {
                            font-size: 16px;
                            font-weight: bold;
                        }

                        .details {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }

                        .details td {
                            padding: 6px 8px;
                        }

                        .details td.label {
                            font-weight: bold;
                            width: 80px;
                        }

                        table.report {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        table.report th,
                        table.report td {
                            border: 1px solid #000;
                            padding: 7px 6px;
                            text-align: center;
                        }

                        table.report th {
                            font-weight: bold;
                        }

                        table.report td.name {
                            text-align: left;
                        }

                        table.report tr.total {
                            font-weight: bold;
                        }

                        .grand-total {
                            margin-top: 20px;
                            text-align: right;
                            font-size: 15px;
                            font-weight: bold;
                        }

                    </style>

                </head>

                <body>

                    <div class="header">

                        <div class="plantation-name">
                            ${plantationName}
                        </div>

                        <div class="report-title">
                            MONTHLY MACHINE LABOUR PAYROLL REPORT
                        </div>

                    </div>

                    <table class="details">

                        <tr>

                            <td class="label">
                                Plantation
                            </td>

                            <td>
                                ${plantationName}
                            </td>

                            <td class="label">
                                Period
                            </td>

                            <td>
                                ${reportMonth}
                            </td>

                            <td class="label">
                                Generated
                            </td>

                            <td>
                                ${new Date().toLocaleDateString(
                                    "en-GB"
                                )}
                            </td>

                        </tr>

                    </table>

                    <table class="report">

                        <thead>

                            <tr>
                                <th>Date</th>
                                <th>Worker</th>
                                <th>Oil Cans</th>
                                <th>Tanks</th>
                                <th>Rate</th>
                                <th>Payment</th>
                            </tr>

                        </thead>

                        <tbody>

                            ${rowsHTML}

                            <tr class="total">

                                <td colspan="5">
                                    MONTHLY TOTAL
                                </td>

                                <td>
                                    Rs.
                                    ${monthlyTotal.toLocaleString()}
                                </td>

                            </tr>

                        </tbody>

                    </table>

                    <div class="grand-total">

                        Total Machine Labour Payment:
                        Rs. ${monthlyTotal.toLocaleString()}

                    </div>

                </body>

                </html>
            `;

            const win = window.open(
                "",
                "_blank"
            );

            if (!win) {
                alert(
                    "Please allow pop-ups to print the report."
                );
                return;
            }

            win.document.write(html);
            win.document.close();

            setTimeout(() => {
                win.focus();
                win.print();
            }, 500);

            return;
        }

        if (
            reportType === "rubbertappers" &&
            reportPeriod === "monthly"
        ) {
            if (rubberRows.length === 0) {
                alert(
                    "No rubber tappers payroll data found for this month."
                );
                return;
            }

            const rowsHTML = rubberRows
                .map((row) => {
                    const c = calculateRubberSalary(row);

                    return `
                        <tr>
                            <td>${row.epf_no || "-"}</td>
                            <td class="name">${row.name || "-"}</td>
                            <td>${row.worker_category || "-"}</td>
                            <td>${c.workedDays}</td>
                            <td>${c.kg.toFixed(2)}</td>
                            <td>${c.rate.toFixed(2)}</td>
                            <td>${c.gross.toFixed(2)}</td>
                            <td>${c.allowance.toFixed(2)}</td>
                            <td>${c.epf8.toFixed(2)}</td>
                            <td>${c.epf12.toFixed(2)}</td>
                            <td>${c.epf20.toFixed(2)}</td>
                            <td>${c.etf.toFixed(2)}</td>
                            <td>${c.netSalary.toFixed(2)}</td>
                        </tr>
                    `;
                })
                .join("");

            const html = `
                <!DOCTYPE html>
                <html>

                <head>

                    <title>
                        ${plantationName} Rubber Tappers Payroll Report
                    </title>

                    <style>

                        @page {
                            size: A4 landscape;
                            margin: 12mm;
                        }

                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            color: #111;
                            font-size: 11px;
                        }

                        .header {
                            text-align: center;
                            margin-bottom: 18px;
                        }

                        .plantation-name {
                            font-size: 21px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }

                        .report-title {
                            font-size: 16px;
                            font-weight: bold;
                            margin-bottom: 18px;
                        }

                        .details {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 18px;
                        }

                        .details td {
                            padding: 5px 8px;
                        }

                        .details td.label {
                            font-weight: bold;
                            width: 80px;
                        }

                        table.report {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        table.report th,
                        table.report td {
                            border: 1px solid #000;
                            padding: 5px 4px;
                            font-size: 9px;
                            text-align: center;
                            white-space: nowrap;
                        }

                        table.report th {
                            font-weight: bold;
                        }

                        table.report td.name {
                            text-align: left;
                        }

                        table.report tr.total {
                            font-weight: bold;
                        }

                        .grand-total {
                            margin-top: 18px;
                            text-align: right;
                            font-size: 15px;
                            font-weight: bold;
                        }


                    </style>

                </head>

                <body>

                    <div class="header">

                        <div class="plantation-name">
                            ${plantationName}
                        </div>

                        <div class="report-title">
                            MONTHLY RUBBER TAPPERS PAYROLL REPORT
                        </div>

                    </div>

                    <table class="details">

                        <tr>

                            <td class="label">
                                Plantation
                            </td>

                            <td>
                                ${plantationName}
                            </td>

                            <td class="label">
                                Period
                            </td>

                            <td>
                                ${reportMonth}
                            </td>

                            <td class="label">
                                Generated
                            </td>

                            <td>
                                ${new Date().toLocaleDateString("en-GB")}
                            </td>

                        </tr>

                    </table>

                    <table class="report">

                        <thead>

                            <tr>
                                <th>EPF No</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Days</th>
                                <th>KG</th>
                                <th>Rate</th>
                                <th>Gross Salary</th>
                                <th>Allowance</th>
                                <th>EPF 8%</th>
                                <th>EPF 12%</th>
                                <th>Total EPF</th>
                                <th>ETF</th>
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
                                    ${rubberTotals.kg.toFixed(2)}
                                </td>

                                <td>
                                    -
                                </td>

                                <td>
                                    ${rubberTotals.gross.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.allowance.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.epf8.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.epf12.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.epf20.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.etf.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.netSalary.toFixed(2)}
                                </td>

                            </tr>

                        </tbody>

                    </table>

                    <div class="grand-total">

                        Net Salary / Cash Required:
                        Rs. ${rubberTotals.netSalary.toFixed(2)}

                    </div>

                </body>

                </html>
            `;

            const win = window.open(
                "",
                "_blank"
            );

            if (!win) {
                alert(
                    "Please allow pop-ups to print the report."
                );
                return;
            }

            win.document.write(html);
            win.document.close();

            setTimeout(() => {
                win.focus();
                win.print();
            }, 500);

            return;
        }

          if (reportType === "plantation") {
            if (rows.length === 0) {
            alert("No plantation workers payroll data found for this month.");
            return;
            }

            const html = generateReportHTML();

            const blob = new Blob([html], {
            type: "text/html"
            });

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `Plantation_Workers_Payroll_${month}.html`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            return;
        }

        if (reportPeriod === "weekly") {
        if (!weekStart || !weekEnd) {
        alert("Please select week start and week end.");
        return;
        }

        const success = await fetchWeeklyPlantationData();

        if (!success) {
        return;
        }

        if (weeklyData.length === 0) {
        alert("No attendance found for this week.");
        return;
        }

        const html = generateWeeklyReportHTML();

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

        return;
    }

    if (rows.length === 0) {
        alert(
        "No payroll data found for this month."
        );
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

    const handleDownload = async () => {
        if (reportType === "allworkers") {
            if (allWorkersData.length === 0) {
            alert("No all workers payroll data found for this month.");
            return;
            }

            const html = generateAllWorkersReportHTML();

            const blob = new Blob([html], {
            type: "text/html"
            });

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `All_Workers_Payroll_${month}.html`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            return;
        }

                // MACHINE LABOUR DOWNLOAD REPORT
        if (
            reportType === "machinelabour" &&
            reportPeriod === "monthly"
        ) {
            if (machineLabourData.length === 0) {
                alert(
                    "No machine labour payments found for this month."
                );
                return;
            }

            const rowsHTML = machineLabourData
                .map((row) => {
                    return `
                        <tr>
                            <td>
                                ${
                                    row.attendance_date
                                        ? String(
                                              row.attendance_date
                                          ).split("T")[0]
                                        : "-"
                                }
                            </td>

                            <td class="name">
                                ${row.name || "-"}
                            </td>

                            <td>
                                ${Number(
                                    row.oil_cans || 0
                                )}
                            </td>

                            <td>
                                ${Number(
                                    row.tanks || 0
                                ).toLocaleString()}
                            </td>

                            <td>
                                Rs. ${Number(
                                    row.rate || 0
                                ).toLocaleString()}
                            </td>

                            <td>
                                Rs. ${Number(
                                    row.total || 0
                                ).toLocaleString()}
                            </td>
                        </tr>
                    `;
                })
                .join("");

            const monthlyTotal = machineLabourData.reduce(
                (sum, row) =>
                    sum + Number(row.total || 0),
                0
            );

            const html = `
                <!DOCTYPE html>
                <html>

                <head>

                    <title>
                        ${plantationName}
                        Machine Labour Payroll Report
                    </title>

                    <style>

                        @page {
                            size: A4 portrait;
                            margin: 15mm;
                        }

                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            color: #111;
                            font-size: 12px;
                        }

                        .header {
                            text-align: center;
                            margin-bottom: 20px;
                        }

                        .plantation-name {
                            font-size: 21px;
                            font-weight: bold;
                            margin-bottom: 6px;
                        }

                        .report-title {
                            font-size: 16px;
                            font-weight: bold;
                        }

                        .details {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 20px;
                        }

                        .details td {
                            padding: 6px 8px;
                        }

                        .details td.label {
                            font-weight: bold;
                            width: 80px;
                        }

                        table.report {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        table.report th,
                        table.report td {
                            border: 1px solid #000;
                            padding: 7px 6px;
                            text-align: center;
                        }

                        table.report th {
                            font-weight: bold;
                        }

                        table.report td.name {
                            text-align: left;
                        }

                        table.report tr.total {
                            font-weight: bold;
                        }

                        .grand-total {
                            margin-top: 20px;
                            text-align: right;
                            font-size: 15px;
                            font-weight: bold;
                        }

                    </style>

                </head>

                <body>

                    <div class="header">

                        <div class="plantation-name">
                            ${plantationName}
                        </div>

                        <div class="report-title">
                            MONTHLY MACHINE LABOUR PAYROLL REPORT
                        </div>

                    </div>

                    <table class="details">

                        <tr>

                            <td class="label">
                                Plantation
                            </td>

                            <td>
                                ${plantationName}
                            </td>

                            <td class="label">
                                Period
                            </td>

                            <td>
                                ${reportMonth}
                            </td>

                            <td class="label">
                                Generated
                            </td>

                            <td>
                                ${new Date().toLocaleDateString(
                                    "en-GB"
                                )}
                            </td>

                        </tr>

                    </table>

                    <table class="report">

                        <thead>

                            <tr>
                                <th>Date</th>
                                <th>Worker</th>
                                <th>Oil Cans</th>
                                <th>Tanks</th>
                                <th>Rate</th>
                                <th>Payment</th>
                            </tr>

                        </thead>

                        <tbody>

                            ${rowsHTML}

                            <tr class="total">

                                <td colspan="5">
                                    MONTHLY TOTAL
                                </td>

                                <td>
                                    Rs.
                                    ${monthlyTotal.toLocaleString()}
                                </td>

                            </tr>

                        </tbody>

                    </table>

                    <div class="grand-total">

                        Total Machine Labour Payment:
                        Rs. ${monthlyTotal.toLocaleString()}

                    </div>

                </body>

                </html>
            `;

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
                `${plantationName} Machine Labour Payroll ${month}.html`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            return;
        }

        if (
            reportType === "rubbertappers" &&
            reportPeriod === "monthly"
        ) {

        if (
            reportType === "rubbertappers" &&
            reportPeriod === "monthly"
        ) {
            if (rubberRows.length === 0) {
                alert(
                    "No rubber tappers payroll data found for this month."
                );
                return;
            }

            const rowsHTML = rubberRows
                .map((row) => {
                    const c = calculateRubberSalary(row);

                    return `
                        <tr>
                            <td>${row.epf_no || "-"}</td>
                            <td class="name">${row.name || "-"}</td>
                            <td>${row.worker_category || "-"}</td>
                            <td>${c.workedDays}</td>
                            <td>${c.kg.toFixed(2)}</td>
                            <td>${c.rate.toFixed(2)}</td>
                            <td>${c.gross.toFixed(2)}</td>
                            <td>${c.allowance.toFixed(2)}</td>
                            <td>${c.epf8.toFixed(2)}</td>
                            <td>${c.epf12.toFixed(2)}</td>
                            <td>${c.epf20.toFixed(2)}</td>
                            <td>${c.etf.toFixed(2)}</td>
                            <td>${c.netSalary.toFixed(2)}</td>
                        </tr>
                    `;
                })
                .join("");

            const html = `
                <!DOCTYPE html>
                <html>

                <head>

                    <title>
                        ${plantationName} Rubber Tappers Payroll Report
                    </title>

                    <style>

                        @page {
                            size: A4 landscape;
                            margin: 12mm;
                        }

                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            color: #111;
                            font-size: 11px;
                        }

                        .header {
                            text-align: center;
                            margin-bottom: 18px;
                        }

                        .plantation-name {
                            font-size: 21px;
                            font-weight: bold;
                            margin-bottom: 5px;
                        }

                        .report-title {
                            font-size: 16px;
                            font-weight: bold;
                            margin-bottom: 18px;
                        }

                        .details {
                            width: 100%;
                            border-collapse: collapse;
                            margin-bottom: 18px;
                        }

                        .details td {
                            padding: 5px 8px;
                        }

                        .details td.label {
                            font-weight: bold;
                            width: 80px;
                        }

                        table.report {
                            width: 100%;
                            border-collapse: collapse;
                        }

                        table.report th,
                        table.report td {
                            border: 1px solid #000;
                            padding: 5px 4px;
                            font-size: 9px;
                            text-align: center;
                            white-space: nowrap;
                        }

                        table.report th {
                            font-weight: bold;
                        }

                        table.report td.name {
                            text-align: left;
                        }

                        table.report tr.total {
                            font-weight: bold;
                        }

                        .grand-total {
                            margin-top: 18px;
                            text-align: right;
                            font-size: 15px;
                            font-weight: bold;
                        }

                    </style>

                </head>

                <body>

                    <div class="header">

                        <div class="plantation-name">
                            ${plantationName}
                        </div>

                        <div class="report-title">
                            MONTHLY RUBBER TAPPERS PAYROLL REPORT
                        </div>

                    </div>

                    <table class="details">

                        <tr>

                            <td class="label">
                                Plantation
                            </td>

                            <td>
                                ${plantationName}
                            </td>

                            <td class="label">
                                Period
                            </td>

                            <td>
                                ${reportMonth}
                            </td>

                            <td class="label">
                                Generated
                            </td>

                            <td>
                                ${new Date().toLocaleDateString("en-GB")}
                            </td>

                        </tr>

                    </table>

                    <table class="report">

                        <thead>

                            <tr>
                                <th>EPF No</th>
                                <th>Name</th>
                                <th>Category</th>
                                <th>Days</th>
                                <th>KG</th>
                                <th>Rate</th>
                                <th>Gross Salary</th>
                                <th>Allowance</th>
                                <th>EPF 8%</th>
                                <th>EPF 12%</th>
                                <th>Total EPF</th>
                                <th>ETF</th>
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
                                    ${rubberTotals.kg.toFixed(2)}
                                </td>

                                <td>
                                    -
                                </td>

                                <td>
                                    ${rubberTotals.gross.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.allowance.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.epf8.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.epf12.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.epf20.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.etf.toFixed(2)}
                                </td>

                                <td>
                                    ${rubberTotals.netSalary.toFixed(2)}
                                </td>

                            </tr>

                        </tbody>

                    </table>

                    <div class="grand-total">

                        Net Salary / Cash Required:
                        Rs. ${rubberTotals.netSalary.toFixed(2)}

                    </div>

                </body>

                </html>
            `;

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
                `${plantationName} Rubber Tappers Payroll ${month}.html`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            return;
        }

        if (reportPeriod === "weekly") {
        if (!weekStart || !weekEnd) {
        alert("Please select week start and week end.");
        return;
        }

        const success = await fetchWeeklyPlantationData();

        if (!success) {
        return;
        }

        if (weeklyData.length === 0) {
        alert("No attendance found for this week.");
        return;
        }

        const html = generateWeeklyReportHTML();

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
        `${plantationName} Weekly Payroll ${weekStart} to ${weekEnd}.html`;

        document.body.appendChild(link);

        link.click();

        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        return;
    }

    if (rows.length === 0) {
        alert(
        "No payroll data found for this month."
        );
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

                <MenuItem value="allworkers">All Workers Payroll</MenuItem>
                <MenuItem value="plantation">Plantation Workers Payroll</MenuItem>
                <MenuItem value="rubbertappers">Rubber Tappers Payroll</MenuItem>
                <MenuItem value="casualworkers">Casual Workers Payroll</MenuItem>
                <MenuItem value="machinelabour">
                Machine Labourers Payroll
                </MenuItem>
                <MenuItem value="attendance">Attendance Register</MenuItem>

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
            {reportType === "allworkers"
                ? "All Workers Payroll"
                : reportType === "plantation"
                ? "Plantation Workers Payroll"
                : reportType === "rubbertappers"
                ? "Rubber Tappers Payroll"
                : reportType === "casualworkers"
                ? "Casual Workers Payroll"
                : reportType === "attendance"
                ? "Attendance Register"
                : "Machine Labourers Payroll"}
            </Typography>

            <Typography sx={{ mb: 3 }}>
            <strong>
                {reportPeriod === "weekly" ? "Week:" : "Month:"}
            </strong>{" "}
            {reportPeriod === "weekly"
                ? weekStart && weekEnd
                ? `${weekStart} - ${weekEnd}`
                : "Not selected"
                : reportMonth}
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

    {reportType === "machinelabour" ? (
  <>
    <Typography color="text.secondary">
      {machineLabourLoading
        ? "Loading machine labour data..."
        : `${machineLabourData.length} payment(s) found for ${reportMonth}.`}
    </Typography>

    {!machineLabourLoading && machineLabourData.length > 0 && (
      <Box sx={{ mt: 3, overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Date
              </th>

              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Worker
              </th>

              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Oil Cans
              </th>

              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Tanks
              </th>

              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Rate
              </th>

              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Payment
              </th>
            </tr>
          </thead>

          <tbody>
            {machineLabourData.map((row) => (
              <tr key={row.id}>

                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px"
                  }}
                >
                  {row.attendance_date
                    ? String(row.attendance_date).split("T")[0]
                    : "-"}
                </td>

                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px"
                  }}
                >
                  {row.name || "-"}
                </td>

                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right"
                  }}
                >
                  {Number(row.oil_cans || 0)}
                </td>

                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right"
                  }}
                >
                  {Number(row.tanks || 0).toLocaleString()}
                </td>

                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right"
                  }}
                >
                  Rs. {Number(row.rate || 0).toLocaleString()}
                </td>

                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "right",
                    fontWeight: "bold"
                  }}
                >
                  Rs. {Number(row.total || 0).toLocaleString()}
                </td>

              </tr>
            ))}

            <tr>
              <td
                colSpan="5"
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "right",
                  fontWeight: "bold"
                }}
              >
                MONTHLY TOTAL
              </td>

              <td
                style={{
                  border: "1px solid #ccc",
                  padding: "10px",
                  textAlign: "right",
                  fontWeight: "bold"
                }}
              >
                Rs.{" "}
                {machineLabourData
                  .reduce(
                    (sum, row) =>
                      sum + Number(row.total || 0),
                    0
                  )
                  .toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </Box>
    )}

    {!machineLabourLoading &&
      machineLabourData.length === 0 && (
        <Typography
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          No machine labour payments found for {reportMonth}.
        </Typography>
      )}
  </>
) : reportType === "allworkers" ? (
    <>
        <Typography color="text.secondary">
        {allWorkersLoading
            ? "Loading all workers data..."
            : `${allWorkersData.length} worker(s) found for ${reportMonth}.`}
        </Typography>

        {!allWorkersLoading && allWorkersData.length > 0 && (
        <Box sx={{ mt: 3, overflowX: "auto" }}>
            <table
            style={{
                width: "100%",
                borderCollapse: "collapse"
            }}
            >
            <thead>
                <tr>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    Type
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    EPF No
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    Name
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    Days
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    Rate
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    Amount
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    Allowance
                </th>
                <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                    Net Salary
                </th>
                </tr>
            </thead>

            <tbody>
                {allWorkersData.map((row, index) => {
                const salary = calculateAllWorkerSalary(row);

                return (
                    <tr key={`${row.type}-${row.name}-${index}`}>
                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center"
                        }}
                    >
                        {row.type}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center"
                        }}
                    >
                        {row.epf_no || "-"}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px"
                        }}
                    >
                        {row.name || "-"}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center"
                        }}
                    >
                        {Number(row.days || 0).toFixed(1)}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "right"
                        }}
                    >
                        {Number(row.rate || 0).toFixed(2)}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "right"
                        }}
                    >
                        {salary.amount.toFixed(2)}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "right"
                        }}
                    >
                        {salary.allowance.toFixed(2)}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "right"
                        }}
                    >
                        {salary.netSalary.toFixed(2)}
                    </td>
                    </tr>
                );
                })}
            </tbody>
            </table>
        </Box>
        )}

        {!allWorkersLoading && allWorkersData.length > 0 && (
        <Typography
            sx={{
            mt: 3,
            fontWeight: "bold",
            fontSize: "18px"
            }}
        >
            Net Salary: Rs.{" "}
            {allWorkersData
            .reduce((total, row) => {
                const salary = calculateAllWorkerSalary(row);
                return total + salary.netSalary;
            }, 0)
            .toFixed(2)}
        </Typography>
        )}
    </>
) : reportType === "casualworkers" &&
    reportPeriod === "monthly" ? (

        <>
    <Typography color="text.secondary">
        {casualLoading
            ? "Loading casual workers payroll data..."
            : `${casualRows.length} casual worker(s) found for ${reportMonth}.`}
    </Typography>

    {!casualLoading && casualRows.length > 0 && (
        <Box
            sx={{
                mt: 3,
                overflowX: "auto"
            }}
        >
            <table
                style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: "13px"
                }}
            >
                <thead>
                    <tr>
                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px"
                            }}
                        >
                            Name
                        </th>

                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px"
                            }}
                        >
                            Days Worked
                        </th>

                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px"
                            }}
                        >
                            Daily Rate
                        </th>

                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px"
                            }}
                        >
                            Allowance
                        </th>

                        <th
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px"
                            }}
                        >
                            Total Salary
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {casualRows.map((row) => {
                        const c = calculateCasualSalary(row);

                        return (
                            <tr key={row.worker_id}>
                                <td
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "8px"
                                    }}
                                >
                                    {row.name || "-"}
                                </td>

                                <td
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "8px",
                                        textAlign: "center"
                                    }}
                                >
                                    {c.daysWorked}
                                </td>

                                <td
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "8px",
                                        textAlign: "right"
                                    }}
                                >
                                    Rs. {c.dailyRate.toFixed(2)}
                                </td>

                                <td
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "8px",
                                        textAlign: "right"
                                    }}
                                >
                                    Rs. {c.allowance.toFixed(2)}
                                </td>

                                <td
                                    style={{
                                        border: "1px solid #ccc",
                                        padding: "8px",
                                        textAlign: "right"
                                    }}
                                >
                                    Rs. {c.netSalary.toFixed(2)}
                                </td>
                            </tr>
                        );
                    })}

                    <tr>
                        <td
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                fontWeight: "bold"
                            }}
                        >
                            TOTAL
                        </td>

                        <td
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                fontWeight: "bold",
                                textAlign: "center"
                            }}
                        >
                            {casualTotals.daysWorked}
                        </td>

                        <td
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px"
                            }}
                        >
                            -
                        </td>

                        <td
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                fontWeight: "bold",
                                textAlign: "right"
                            }}
                        >
                            Rs. {casualTotals.allowance.toFixed(2)}
                        </td>

                        <td
                            style={{
                                border: "1px solid #ccc",
                                padding: "8px",
                                fontWeight: "bold",
                                textAlign: "right"
                            }}
                        >
                            Rs. {casualTotals.netSalary.toFixed(2)}
                        </td>
                    </tr>
                </tbody>
            </table>

            <Typography
                sx={{
                    mt: 2,
                    textAlign: "right",
                    fontWeight: "bold"
                }}
            >
                Net Salary / Cash Required: Rs.{" "}
                {casualTotals.netSalary.toFixed(2)}
            </Typography>
        </Box>
    )}

        <Typography color="text.secondary">
            {rubberLoading
                ? "Loading rubber tappers payroll data..."
                : `${rubberRows.length} rubber tapper(s) found for ${reportMonth}.`}
        </Typography>

        {!rubberLoading && rubberRows.length > 0 && (
            <Box
                sx={{
                    mt: 3,
                    overflowX: "auto"
                }}
            >
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "13px"
                    }}
                >
                    <thead>
                        <tr>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                EPF No
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                Name
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                Category
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                Days
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                KG
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                Rate
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                Gross Salary
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                Allowance
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                EPF 8%
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                EPF 12%
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                Total EPF
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                ETF
                            </th>

                            <th
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                Net Salary
                            </th>

                        </tr>
                    </thead>

                    <tbody>

                        {rubberRows.map((row, index) => {

                            const c =
                                calculateRubberSalary(row);

                            return (
                                <tr
                                    key={`${row.worker_id}-${index}`}
                                >

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "center"
                                        }}
                                    >
                                        {row.epf_no || "-"}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px"
                                        }}
                                    >
                                        {row.name || "-"}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "center"
                                        }}
                                    >
                                        {row.worker_category || "-"}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "center"
                                        }}
                                    >
                                        {c.workedDays}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        {c.kg.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        Rs. {c.rate.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        Rs. {c.gross.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        Rs. {c.allowance.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        Rs. {c.epf8.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        Rs. {c.epf12.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        Rs. {c.epf20.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        Rs. {c.etf.toFixed(2)}
                                    </td>

                                    <td
                                        style={{
                                            border: "1px solid #ccc",
                                            padding: "8px",
                                            textAlign: "right"
                                        }}
                                    >
                                        <strong>
                                            Rs. {c.netSalary.toFixed(2)}
                                        </strong>
                                    </td>

                                </tr>
                            );
                        })}

                        <tr>

                            <td
                                colSpan={4}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    fontWeight: "bold"
                                }}
                            >
                                TOTAL
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: "bold"
                                }}
                            >
                                {rubberTotals.kg.toFixed(2)}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px"
                                }}
                            >
                                -
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: "bold"
                                }}
                            >
                                Rs. {rubberTotals.gross.toFixed(2)}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: "bold"
                                }}
                            >
                                Rs. {rubberTotals.allowance.toFixed(2)}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: "bold"
                                }}
                            >
                                Rs. {rubberTotals.epf8.toFixed(2)}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: "bold"
                                }}
                            >
                                Rs. {rubberTotals.epf12.toFixed(2)}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: "bold"
                                }}
                            >
                                Rs. {rubberTotals.epf20.toFixed(2)}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: "bold"
                                }}
                            >
                                Rs. {rubberTotals.etf.toFixed(2)}
                            </td>

                            <td
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "8px",
                                    textAlign: "right",
                                    fontWeight: "bold"
                                }}
                            >
                                Rs. {rubberTotals.netSalary.toFixed(2)}
                            </td>

                        </tr>

                    </tbody>
                </table>
            </Box>
        )}

        {!rubberLoading &&
            rubberRows.length > 0 && (
                <Typography
                    sx={{
                        mt: 3,
                        fontWeight: "bold",
                        fontSize: "18px"
                    }}
                >
                    Net Salary: Rs.{" "}
                    {rubberTotals.netSalary.toFixed(2)}
                </Typography>
            )}
    </>
    ) : (
    <>
        <Typography color="text.secondary">
        {weeklyLoading
            ? "Loading weekly data..."
            : weeklyData.length > 0
            ? `${weeklyData.length} attendance record(s) found.`
            : "Select a week and click Load Weekly Report."}
        </Typography>

        {weeklyData.length > 0 && (
        <>
            <Box
            sx={{
                mt: 3,
                overflowX: "auto"
            }}
            >
            <table
                style={{
                width: "100%",
                borderCollapse: "collapse"
                }}
            >
                <thead>
                <tr>
                    <th
                    style={{
                        border: "1px solid #ccc",
                        padding: "8px"
                    }}
                    >
                    EPF No
                    </th>

                    <th
                    style={{
                        border: "1px solid #ccc",
                        padding: "8px"
                    }}
                    >
                    Name
                    </th>

                    <th
                    style={{
                        border: "1px solid #ccc",
                        padding: "8px"
                    }}
                    >
                    Date
                    </th>

                    <th
                    style={{
                        border: "1px solid #ccc",
                        padding: "8px"
                    }}
                    >
                    Attendance
                    </th>

                    <th
                    style={{
                        border: "1px solid #ccc",
                        padding: "8px"
                    }}
                    >
                    Rate
                    </th>

                    <th
                    style={{
                        border: "1px solid #ccc",
                        padding: "8px"
                    }}
                    >
                    Amount
                    </th>
                </tr>
                </thead>

                <tbody>
                {weeklyData.map((row, index) => (
                    <tr key={row.id || index}>
                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center"
                        }}
                    >
                        {row.epf_no || "-"}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px"
                        }}
                    >
                        {row.name || "-"}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center"
                        }}
                    >
                        {new Date(
                        row.attendance_date
                        ).toLocaleDateString()}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "center"
                        }}
                    >
                        {Number(
                        row.attendance_value || 0
                        ).toFixed(2)}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "right"
                        }}
                    >
                        Rs.{" "}
                        {Number(
                        row.daily_rate || 0
                        ).toFixed(2)}
                    </td>

                    <td
                        style={{
                        border: "1px solid #ccc",
                        padding: "8px",
                        textAlign: "right"
                        }}
                    >
                        Rs.{" "}
                        {Number(
                        row.amount || 0
                        ).toFixed(2)}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </Box>

            <Typography
            sx={{
                mt: 3,
                fontWeight: "bold",
                fontSize: "18px"
            }}
            >
            Weekly Total: Rs.{" "}
            {weeklyTotal.toFixed(2)}
            </Typography>
        </>
        )}
    </>
    )}

    </CardContent>
    </Card>

    </Box>
  );
}