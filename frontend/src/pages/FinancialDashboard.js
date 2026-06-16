import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Button
} from "@mui/material";
import {
  MenuItem,
  TextField
} from "@mui/material";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API =
  process.env.REACT_APP_API_URL ||
  "https://nirmalani-payroll-production.up.railway.app";

export default function FinancialDashboard({
  plantation
}) {

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [profitData, setProfitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [employeeSummary, setEmployeeSummary] = useState({});
  const [plantationSummary, setPlantationSummary] = useState({});
  const [casualSummary, setCasualSummary] = useState({});
  const [rubberSummary, setRubberSummary] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const [salaryReport, setSalaryReport] = useState([]);

  const months = [
  { label: "January", value: "2026-01" },
  { label: "February", value: "2026-02" },
  { label: "March", value: "2026-03" },
  { label: "April", value: "2026-04" },
  { label: "May", value: "2026-05" },
  { label: "June", value: "2026-06" },
  { label: "July", value: "2026-07" },
  { label: "August", value: "2026-08" },
  { label: "September", value: "2026-09" },
  { label: "October", value: "2026-10" },
  { label: "November", value: "2026-11" },
  { label: "December", value: "2026-12" }
];
  useEffect(() => {
    fetchDashboard();
  }, [selectedMonth]);

  const fetchDashboard = async () => {

    try {

      const [
        incomeRes,
        expenseRes,
        profitRes,
        reportRes,
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
          `${API}/dashboard/monthly-profit-loss?plantation=${plantation}`
        ),

        axios.get(
          `${API}/dashboard/all-worker-salary-report/${selectedMonth}?plantation=${plantation}`
        ),

        axios.get(
  `${API}/dashboard/plantation-total-required/${selectedMonth}?plantation=${plantation}`),
        axios.get(`${API}/dashboard/casual-summary/${selectedMonth}?plantation=${plantation}`),
        axios.get(`${API}/dashboard/rubber-summary/${selectedMonth}?plantation=${plantation}`)

      ]);

      setIncome(
        incomeRes.data.total || 0
      );

      setExpense(
        expenseRes.data.total || 0
      );

      setProfitData(
        profitRes.data || []
      );

      setSalaryReport(reportRes.data);
      console.log("REPORT DATA:", reportRes.data);
      console.log("IS ARRAY:", Array.isArray(reportRes.data));

      setPlantationSummary(plantationRes.data);
      setCasualSummary(casualRes.data);
      setRubberSummary(rubberRes.data);

      console.log("Plantation Summary:", plantationRes.data);
      console.log("Casual Summary:", casualRes.data);
      console.log("Rubber Summary:", rubberRes.data);

    } catch (error) {

        console.log("ERROR URL:",
          error.config?.url
        );

        console.log("ERROR DATA:",
          error.response?.data
        );

        console.log("FULL ERROR:",
          error
        );

      }finally {

      setLoading(false);
    }
  };

  const netProfit =
    Number(income || 0) -
    Number(expense || 0);

  const totalPayrollRequired =

    Number(plantationSummary.totalRequired || 0)
    +
    Number(casualSummary.totalRequired || 0)
    +
    Number(rubberSummary.totalRequired || 0);

  const totalEPF =
    Number(plantationSummary.totalEPF || 0);

  const totalETF =
    Number(plantationSummary.totalETF || 0);
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mt: 10
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const filteredData =
  profitData.filter(
    row =>
      row.month
        .startsWith(
          selectedYear.toString()
        )
  );

  const yearlyIncome =
  filteredData.reduce(
    (sum,row)=>
      sum + Number(row.income),
    0
  );

const yearlyExpense =
  filteredData.reduce(
    (sum,row)=>
      sum + Number(row.expense),
    0
  );

const yearlyProfit =
  yearlyIncome -
  yearlyExpense;

  const printFinancialReport = () => {

  const rowsHTML =
    filteredData.map(row => `

      <tr>

        <td>${row.month}</td>

        <td>
          Rs.${row.income}
        </td>

        <td>
          Rs.${row.expense}
        </td>

        <td>
          Rs.${row.profit}
        </td>

      </tr>

    `).join("");

  const html = `

    <html>

      <head>

        <title>
          Financial Report
        </title>

        <style>

          body{
            font-family:Arial;
            padding:20px;
          }

          table{
            width:100%;
            border-collapse:collapse;
          }

          th,td{
            border:1px solid #000;
            padding:8px;
          }

        </style>

      </head>

      <body>

        <h1>
          Nirmalani Plantation
        </h1>

        <h2>
          Financial Report
        </h2>

        <h3>
          Year:
          ${selectedYear}
        </h3>

        <h3>
          Total Income:
          Rs.${yearlyIncome}
        </h3>

        <h3>
          Total Expenditure:
          Rs.${yearlyExpense}
        </h3>

        <h3>
          Net Profit:
          Rs.${yearlyProfit}
        </h3>

        <table>

          <thead>

            <tr>

              <th>Month</th>

              <th>Income</th>

              <th>Expense</th>

              <th>Profit</th>

            </tr>

          </thead>

          <tbody>

            ${rowsHTML}

          </tbody>

        </table>

        <script>
          window.print();
        </script>

      </body>

    </html>
  `;

  const win =
    window.open(
      "",
      "_blank"
    );

  win.document.write(html);

  win.document.close();
};

const downloadSalaryPDF = () => {

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  doc.setFontSize(16);

  const totalAmount = salaryReport.reduce(
  (sum, row) => sum + Number(row.amount || 0),
  0
  );

  const plantationAmount =
    salaryReport
      .filter(
        row => row.type === "Plantation"
      )
      .reduce(
        (sum, row) =>
          sum + Number(row.amount || 0),
        0
      );

  const totalEPF8 =
    plantationAmount * 0.08;

  const totalEPF12 =
    plantationAmount * 0.12;

  const totalEPF20 =
    totalEPF8 + totalEPF12;

  const totalETF =
    plantationAmount * 0.03;

  const totalAllowance =
    salaryReport.reduce(
      (sum, row) =>
        sum + Number(row.allowance || 0),
      0
    );

  const totalNetSalary =
    salaryReport.reduce((sum, row) => {

      const amount =
        Number(row.amount || 0);

      const allowance =
        Number(row.allowance || 0);

      const epf8 =
        row.type === "Plantation"
          ? amount * 0.08
          : 0;

      return sum + (
        amount -
        epf8 +
        allowance
      );

    }, 0);

  const totalRequired =
    totalNetSalary +
    totalEPF20 +
    totalETF;

  autoTable(doc, {
    startY: 8,

    margin: {
      left: 5,
      right: 5
    },

    tableWidth: "auto",

    theme: "grid",

    styles: {
      fontSize: 7,
      cellPadding: 1,
      halign: "left"
    },

    headStyles: {
      fontSize: 8
    },

    head: [
      [
        {
          content: `NIRMALANI PLANTATION BALANCE PAY - ${selectedMonth}`,
          colSpan: 13,
          styles: {
            halign: "center",
            fontStyle: "bold",
            fontSize: 10
          }
        }
      ],
    
    [
      "Type",
      "EPF",
      "Name",
      "Month",
      "Days",
      "Rate",
      "Amount",
      "EPF 8%",
      "EPF 12%",
      "EPF 20%",
      "ETF",
      "Allowance",
      "Net Salary"
    ]],

    body: Array.isArray(salaryReport)
      ? [
          ...salaryReport.map((row) => {

            const amount = Number(row.amount || 0);
            const allowance = Number(row.allowance || 0);

            const isPlantation =
              row.type === "Plantation";

            const epf8 =
              isPlantation ? amount * 0.08 : 0;

            const epf12 =
              isPlantation ? amount * 0.12 : 0;

            const epf20 =
              isPlantation ? amount * 0.20 : 0;

            const etf =
              isPlantation ? amount * 0.03 : 0;

            const netSalary =
              amount - epf8 + allowance;

            return [
              row.type,
              row.epf_no || "",
              row.name,
              row.month,
              row.days,
              row.rate,
              amount.toFixed(2),
              epf8.toFixed(2),
              epf12.toFixed(2),
              epf20.toFixed(2),
              etf.toFixed(2),
              allowance.toFixed(2),
              netSalary.toFixed(2)
            ];
          }),

          [
            "",
            "",
            "GRAND TOTAL",
            "",
            "",
            "",
            totalAmount.toFixed(2),
            totalEPF8.toFixed(2),
            totalEPF12.toFixed(2),
            totalEPF20.toFixed(2),
            totalETF.toFixed(2),
            totalAllowance.toFixed(2),
            totalNetSalary.toFixed(2)
          ],

          [
            "",
            "",
            "TOTAL REQUIRED",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            totalRequired.toFixed(2)
          ]
        ]
      : []

      
  });

  doc.save(
    `Salary-Report-${selectedMonth}.pdf`
  );
};

const downloadFinancialReport = async () => {

  try {

    const month =
      `${selectedYear}-${String(selectedMonth).padStart(2,"0")}`;

    const res =
      await axios.get(
        `${API}/dashboard/monthly-financial-report/${month}`
      );

    const income =
      res.data.income;

    const expenditure =
      res.data.expenditure;

    const doc =
      new jsPDF();

    doc.setFontSize(16);

    doc.text(
      "NIRMALANI PLANTATION",
      70,
      15
    );

    doc.text(
      "MONTHLY FINANCIAL REPORT",
      55,
      25
    );

    doc.text(
      `Month : ${month}`,
      14,
      35
    );

    let totalIncome = 0;

    autoTable(doc,{
      startY:45,

      head:[["Income Category","Amount"]],

      body:income.map(row=>{

        totalIncome +=
          Number(row.amount);

        return [
          row.category,
          Number(row.amount)
            .toFixed(2)
        ];
      })
    });

    autoTable(doc,{
      startY:
        doc.lastAutoTable.finalY + 15,

      head:[["Expense Category","Amount"]],

      body:expenditure.map(row=>{

        return [
          row.category,
          Number(row.amount)
            .toFixed(2)
        ];
      })
    });

    const totalExpense =
      expenditure.reduce(
        (sum,row)=>
          sum + Number(row.amount),
        0
      );

    const profit =
      totalIncome - totalExpense;

    let y =
      doc.lastAutoTable.finalY + 15;

    doc.text(
      `Total Income : Rs.${totalIncome.toFixed(2)}`,
      14,
      y
    );

    doc.text(
      `Total Expenditure : Rs.${totalExpense.toFixed(2)}`,
      14,
      y + 10
    );

    doc.text(
      `Net Profit : Rs.${profit.toFixed(2)}`,
      14,
      y + 20
    );

    doc.save(
      `Financial_Report_${month}.pdf`
    );

  } catch(err) {

    console.error(err);

    alert("Report generation failed");
  }
};

  return (

    <Box
      sx={{
        p: 3,
        background:
          "linear-gradient(135deg,#0f172a,#1e293b)",
        minHeight: "100vh"
      }}
    >

      {/* HEADER */}

      <Typography
        variant="h4"
        sx={{
          color: "#fff",
          fontWeight: "bold",
          mb: 4
        }}
      >
        📊 Financial Dashboard
      </Typography>

            <TextField
              select
              label="Month"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value)
              }
              sx={{ mb: 3, width: 150}}
            >
              {months.map((m) => (
                <MenuItem
                  key={m.value}
                  value={m.value}
                >
                  {m.label}
                </MenuItem>
              ))}
            </TextField>

      {/* SUMMARY CARDS */}

      <Grid container spacing={3}>

        <Grid item xs={12} md={4}>

          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background:
                "rgba(34,197,94,0.15)",
              backdropFilter:
                "blur(10px)"
            }}
          >

            <Typography
              sx={{
                color: "#cbd5e1"
              }}
            >
              Total Income
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: "#22c55e",
                fontWeight: "bold"
              }}
            >
              Rs.
              {Number(income)
                .toLocaleString()}
            </Typography>

          </Paper>

        </Grid>

        <Grid item xs={12} md={4}>

          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background:
                "rgba(239,68,68,0.15)",
              backdropFilter:
                "blur(10px)"
            }}
          >

            <Typography
              sx={{
                color: "#cbd5e1"
              }}
            >
              Total Expenditure
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: "#ef4444",
                fontWeight: "bold"
              }}
            >
              Rs.
              {Number(expense)
                .toLocaleString()}
            </Typography>

          </Paper>

        </Grid>

        <Grid item xs={12} md={4}>

          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              background:
                netProfit >= 0
                  ? "rgba(59,130,246,0.15)"
                  : "rgba(239,68,68,0.15)",
              backdropFilter:
                "blur(10px)"
            }}
          >

            <Typography
              sx={{
                color: "#cbd5e1"
              }}
            >
              Net Profit
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color:
                  netProfit >= 0
                    ? "#3b82f6"
                    : "#ef4444",
                fontWeight: "bold"
              }}
            >
              Rs.
              {Number(netProfit)
                .toLocaleString()}
            </Typography>

          </Paper>

        </Grid>

        <Button
          variant="contained"
          onClick={downloadFinancialReport}
          sx={{
            ml: 2,
            mt: 4,
            background:"linear-gradient(135deg,#22c55e,#16a34a)",
            height: 50,
            fontWeight: "bold"
            
          }}
            
        >
          DOWNLOAD MONTHLY FINANCIAL REPORT
        </Button>

      </Grid>

      <Grid
        container
        spacing={3}
        sx={{ mt: 2, mb: 3 }}
      >

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              height: 130,
              borderRadius: 4,
              background: "rgba(34,197,94,0.15)",
              backdropFilter: "blur(10px)"
            }}
          >
            <Typography sx={{ color: "#cbd5e1" }}>
              🌱 Plantation Labour Cost
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: "#22c55e",
                fontWeight: "bold"
              }}
            >
              Rs.
              {Number(
                plantationSummary.totalRequired || 0
              ).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              height: 130,
              borderRadius: 4,
              background: "rgba(249,115,22,0.15)",
              backdropFilter: "blur(10px)"
            }}
          >
            <Typography sx={{ color: "#cbd5e1" }}>
              👷 Casual Labour Cost
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: "#f97316",
                fontWeight: "bold"
              }}
            >
              Rs.
              {Number(
                casualSummary.totalRequired || 0
              ).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              height: 130,
              borderRadius: 4,
              background: "rgba(6,182,212,0.15)",
              backdropFilter: "blur(10px)"
            }}
          >
            <Typography sx={{ color: "#cbd5e1" }}>
              🥛 Rubber Labour Cost
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: "#06b6d4",
                fontWeight: "bold"
              }}
            >
              Rs.
              {Number(
                rubberSummary.totalRequired || 0
              ).toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper
            sx={{
              p: 3,
              height: 130,
              borderRadius: 4,
              background: "rgba(59,130,246,0.15)",
              backdropFilter: "blur(10px)"
            }}
          >
            <Typography sx={{ color: "#cbd5e1" }}>
              💰 Total Labour Cost
            </Typography>

            <Typography
              variant="h4"
              sx={{
                color: "#3b82f6",
                fontWeight: "bold"
              }}
            >
              Rs.
              {totalPayrollRequired.toLocaleString()}
            </Typography>
          </Paper>
        </Grid>

        <Button
          variant="contained"
          onClick={downloadSalaryPDF}
          sx={{
            ml: 2,
            mt: 7,
            background:
              "linear-gradient(135deg,#facc15,#eab308)",
            height: 50,
            fontWeight: "bold"
          }}
          >
          📄 Download BALANCE PAY PDF
        </Button>
      </Grid>




      <TextField
        select
        label="Year"
        value={selectedYear}
        onChange={(e)=>
            setSelectedYear(
            e.target.value
            )
        }
        sx={{
            mb:3,
            mt: 4,
            minWidth:150
        }}
        >

        {[2026,2027]
            .map((year)=>(
            <MenuItem
                key={year}
                value={year}
            >
                {year}
            </MenuItem>
        ))}

        </TextField>

        <Grid
            container
            spacing={2}
            sx={{ mb:3 }}
            >

            <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    background: "rgba(34,197,94,0.15)",
                    backdropFilter: "blur(10px)",
                    color: "#fff"
                  }}
                >

                <Typography>
                    Year Income
                </Typography>

                <Typography
                    variant="h5"
                >
                    Rs.
                    {yearlyIncome
                    .toLocaleString()}
                </Typography>

                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                 <Paper
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    background: "rgba(249,115,22,0.15)",
                    backdropFilter: "blur(10px)",
                    color: "#fff"
                  }}
                >

                <Typography>
                    Year Expense
                </Typography>

                <Typography
                    variant="h5"
                >
                    Rs.
                    {yearlyExpense
                    .toLocaleString()}
                </Typography>

                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper
                  sx={{
                    p: 2,
                    borderRadius: 4,
                    background: "rgba(168,85,247,0.15)",
                    backdropFilter: "blur(10px)",
                    color: "#fff"
                  }}
                >

                <Typography>
                    Year Profit
                </Typography>

                <Typography
                    variant="h5"
                >
                    Rs.
                    {yearlyProfit
                    .toLocaleString()}
                </Typography>

                </Paper>
            </Grid>

            </Grid>

        <Button
            variant="contained"
            onClick={printFinancialReport}
            sx={{
                mb: 3,
                background:
                "linear-gradient(135deg,#3b82f6,#2563eb)",
                fontWeight: "bold"
            }}
            >
            📄 Print Financial Report
            </Button>

      {/* MONTHLY PROFIT TABLE */}

      <Paper
        sx={{
          mt: 4,
          p: 3,
          borderRadius: 4,
          background:
            "rgba(255,255,255,0.05)",
          overflowX: "auto"
        }}
      >

        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            mb: 2,
            fontWeight: "bold"
          }}
        >
          📈 Monthly Profit & Loss
        </Typography>

        <Table>

          <TableHead>

            <TableRow>

              <TableCell
                sx={{
                  color: "#94a3b8",
                  fontWeight: "bold"
                }}
              >
                Year
              </TableCell>

              <TableCell
                sx={{
                  color: "#94a3b8",
                  fontWeight: "bold"
                }}
              >
                Month
              </TableCell>

              <TableCell
                sx={{
                  color: "#94a3b8",
                  fontWeight: "bold"
                }}
              >
                Income
              </TableCell>

              <TableCell
                sx={{
                  color: "#94a3b8",
                  fontWeight: "bold"
                }}
              >
                Expenditure
              </TableCell>

              <TableCell
                sx={{
                  color: "#94a3b8",
                  fontWeight: "bold"
                }}
              >
                Profit
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>

            {filteredData.map((row) => (

              <TableRow key={row.month}>

                <TableCell>
                    {row.month.split("-")[0]}
                    </TableCell>

                    <TableCell>
                    {new Date(row.month + "-01")
                        .toLocaleString(
                        "default",
                        {
                            month: "long"
                        }
                        )}
                    </TableCell>

                <TableCell
                  sx={{
                    color: "#22c55e"
                  }}
                >
                  Rs.
                  {Number(row.income)
                    .toLocaleString()}
                </TableCell>

                <TableCell
                  sx={{
                    color: "#ef4444"
                  }}
                >
                  Rs.
                  {Number(row.expense)
                    .toLocaleString()}
                </TableCell>

                <TableCell
                  sx={{
                    color:
                      row.profit >= 0
                        ? "#3b82f6"
                        : "#ef4444",
                    fontWeight: "bold"
                  }}
                >
                  Rs.
                  {Number(row.profit)
                    .toLocaleString()}
                </TableCell>

              </TableRow>

            ))}

          </TableBody>

        </Table>

      </Paper>

    </Box>
  );
}