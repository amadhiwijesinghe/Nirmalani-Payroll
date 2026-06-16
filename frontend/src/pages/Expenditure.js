import { useState, useEffect } from "react";

import axios from "axios";

import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@mui/material";

const API =
"https://nirmalani-payroll-production.up.railway.app";

export default function Expenditure({
  plantation
}) {

  const [data, setData] = useState([]);

  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const [subCategory, setSubCategory] = useState("");
  const [customSubCategory, setCustomSubCategory] = useState("");

  const [amount, setAmount] = useState("");

  const [note, setNote] = useState("");

  const [date, setDate] = useState("");

  const [filterMonth, setFilterMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  const [weekStart, setWeekStart] = useState("");

  const [weekEnd, setWeekEnd] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [photo, setPhoto] = useState([]);
  const [transactionType, setTransactionType] = useState("Expense");

  const [bankAccount, setBankAccount] = useState("");
  const [reportBank, setReportBank] = useState("");

const categories = {

  "Salaries & Wages": {
    hasSub: true,

    subs: [
      "Employee Salaries",
      "Checkroll Salaries",
      "Casual Worker Wages",
      "Coconut Pluckers"

    ]
  },

  EPF: {
    hasSub: true,

    subs: [
      "Monthly Payment",
      "Surcharges"
    ]
  },

  "Cinnaman Payment": {
    hasSub: false,

    subs: []
  },

  ETF: {
    hasSub: false,

    subs: []
  },

  "Allowance & Bounce": {
    hasSub: false,

    subs: []
  },

  Weeding: {
    hasSub: true,

    subs: [
        "Cinnamon Weeding",
        "General Weeding",
        "Weedicide"
    ]
  },

  Electricity: {
    hasSub: false,

    subs: []
  },

  Telephone: {
    hasSub: false,

    subs: []
  },

  "Manuring & Pruning": {
    hasSub: true,

    subs: [
        "Fertilizing",
        "Manuring",
        "Pruning",
        "Shade"
    ]
  },

  "Payment for Rubber Latex": {
    hasSub: false,

    subs: []
  },

  "Nursery & New Clearing": {
    hasSub: true,

    subs: [
        "Nursery",
        "New Clearing"
    ]
  },

  Maintenance: {
    hasSub: false,

    subs: []
  },

  "Travelling": {
    hasSub: true,

    subs: [
        "Travelling",
        "Transport",
        "Diesel & Oil",
        "Tools"
    ]
  },

  "Staff Welfare": {
    hasSub: false,

    subs: []
  },

  "Miscelleneous": {
    hasSub: true,

    subs: [
        "Miscelleneous",
        "Stationary",
        "Donations"
    ]
  },

  Gratuity: {
    hasSub: false,

    subs: []
  },

  "Visting Agent": {
    hasSub: false,

    subs: []
  },

  Chemicals: {
    hasSub: false,

    subs: []
  },

  "Holiday Pay": {
    hasSub: false,

    subs: []
  },

  "F.Loan": {
    hasSub: false,

    subs: []
  },

  Audit: {
    hasSub: false,

    subs: []
  },

  "Rubber Latex Tax": {
    hasSub: false,

    subs: []
  },
};

  useEffect(() => {

    fetchData();

  }, []);

  const fetchData = async () => {

    try {

      const res =
        await axios.get(
          `${API}/expenditure?plantation=${plantation}`
        );

      setData(res.data);

    } catch (err) {

      console.error(err);
    }
  };

  const addExpense = async () => {

  if (
    transactionType === "Expense" &&
    (!category && !customCategory)
  ) {
    alert("Select category");
    return;
  }

  if (!amount || !date) {
    alert("Fill all fields");
    return;
  }

    try {

      const formData = new FormData();

      formData.append(
        "bank_account",
        bankAccount
      );

      formData.append(
        "transaction_type",
        transactionType
      );

      formData.append(
        "category",
        customCategory || category
      );

      formData.append(
        "sub_category",
        categories[category]?.hasSub
          ? (
              customSubCategory ||
              subCategory
            )
          : ""
      );

      formData.append("amount", amount);
      formData.append("note", note);
      formData.append("date", date);

      photo.forEach((file) => {
        formData.append("photos", file);
      });

      await axios.post(
        `${API}/expenditure`,
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      alert("Expense Added");

      setCategory("");
      setCustomCategory("");
      setSubCategory("");
      setCustomSubCategory("");
      setAmount("");
      setNote("");
      setDate("");
      setPhoto([]);

      fetchData();

    } catch (err) {

      console.error(err);

      alert("Server Error");
    }
  };

  const deleteExpense = async (id) => {

    if (!window.confirm(
        "Delete this expense?"
    )) return;

    try {

        await axios.delete(
        `${API}/expenditure/${id}`
        );

        fetchData();

    } catch (err) {

        console.error(err);

        alert("Delete Failed");
    }
};

const updateExpense = async (id) => {

  try {

    const formData = new FormData();

    formData.append(
      "bank_account",
      bankAccount
    );

    formData.append(
      "transaction_type",
      transactionType
    );

    formData.append(
      "category",
      customCategory || category
    );

    formData.append(
      "sub_category",
      customSubCategory || subCategory
    );

    formData.append("amount", amount);
    formData.append("note", note);
    formData.append("date", date);

    photo.forEach((file) => {
      formData.append("photos", file);
    });

    await axios.put(
      `${API}/expenditure/${id}`,
      formData,
      {
        headers: {
          "Content-Type":
            "multipart/form-data"
        }
      }
    );

    alert("Updated");

    setEditingId(null);

    setCategory("");
    setCustomCategory("");
    setSubCategory("");
    setCustomSubCategory("");
    setAmount("");
    setNote("");
    setDate("");
    setPhoto([]);

    fetchData();

  } catch (err) {

    console.error(err);

    alert("Update Failed");
  }
};

  const filteredData = data.filter((row) => {

    const monthMatch =
      !filterMonth ||
      row.date?.startsWith(filterMonth);

    const bankMatch =
      !reportBank ||
      row.bank_account === reportBank;

    return monthMatch && bankMatch;
  });

const totalExpense = filteredData
  .filter(
    row =>
      row.transaction_type !== "Received"
  )
  .reduce(
    (sum,row)=>
      sum + Number(row.amount || 0),
    0
  );

const totalReceived = filteredData
  .filter(
    row =>
      row.transaction_type === "Received"
  )
  .reduce(
    (sum,row)=>
      sum + Number(row.amount || 0),
    0
  );

const balance =
  totalReceived - totalExpense;

  const sampathData = filteredData.filter(
  row => row.bank_account === "Sampath"
);

const nationsData = filteredData.filter(
  row => row.bank_account === "Nations Trust"
);

const getSummary = (rows) => {
  const received = rows
    .filter(r => r.transaction_type === "Received")
    .reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );

  const expense = rows
    .filter(r => r.transaction_type === "Expense")
    .reduce(
      (sum, r) => sum + Number(r.amount || 0),
      0
    );

  return {
    received,
    expense,
    balance: received - expense
  };
};

const sampathSummary = getSummary(sampathData);
const nationsSummary = getSummary(nationsData);

  const printMonthlyReport = () => {

    if (!filterMonth) {

      alert("Select month");

      return;
    }


  const rows = data.filter(row =>
    row.date.startsWith(filterMonth) &&
    (
      !reportBank ||
      row.bank_account === reportBank
    )
  );

    let totalExpense = 0;
    let totalReceived = 0;

    const rowsHTML = rows.map((row)=>{

      if (row.transaction_type === "Expense") {
        totalExpense += Number(row.amount);
      }

      if (row.transaction_type === "Received") {
        totalReceived += Number(row.amount);
      }

      return `
        <tr>

          <td>${row.date.split("T")[0]}</td>

          <td>${row.category}</td>

          <td>${row.sub_category || "-"}</td>

          <td>${row.note || "-"}</td>

          <td>
            ${
              row.transaction_type === "Received"
              ? row.amount
              : "-"
            }
          </td>

          <td>
            ${
              row.transaction_type === "Expense"
              ? row.amount
              : "-"
            }
          </td>

        </tr>
      `;
    }).join("");

    const html = `
      <html>

        <head>

          <title>
            Nirmalani Plantation Monthly Expenditure Report
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

          <h2>
            Nirmalani Plantation Monthly Expenditure Report
          </h2>

        <h3>
          Month:
          ${
            filterMonth
          }
          ${
            new Date(filterMonth + "-01")
              .toLocaleString(
                "default",
                {
                  month:"long"
                }
              )
          }
        </h3>

          <table>

            <thead>

              <tr>

                <th>Date</th>

                <th>Category</th>

                <th>Sub Category</th>

                <th>Note</th>

                <th>Amount Received</th>

                <th>Amount Spent</th>

                

              </tr>

            </thead>

            <tbody>

              ${rowsHTML}

            </tbody>

          </table>

          <h3>
            Money Received:
            Rs.${totalReceived.toFixed(2)}
          </h3>

          <h3>
            Total Expense:
            Rs.${totalExpense.toFixed(2)}
          </h3>

          <h3>
            Balance:
            Rs.${(totalReceived - totalExpense).toFixed(2)}
          </h3>

          <script>
            window.print();
          </script>

        </body>

      </html>
    `;

    const win =
      window.open("", "_blank");

    win.document.write(html);

    win.document.close();
  };

  const printWeeklyReport = () => {

    if (!weekStart || !weekEnd) {

      alert("Select week");

      return;
    }

  const rows = data.filter(row => {

    const rowDate =
      row.date.split("T")[0];

    return (
      rowDate >= weekStart &&
      rowDate <= weekEnd &&
      (
        !reportBank ||
        row.bank_account === reportBank
      )
    );
  });

    let totalExpense = 0;
    let totalReceived = 0;

    const rowsHTML = rows.map((row)=>{

      if (row.transaction_type === "Expense") {
        totalExpense += Number(row.amount);
      }

      if (row.transaction_type === "Received") {
        totalReceived += Number(row.amount);
      }

      return `
        <tr>
        
          <td>${row.date.split("T")[0]}</td>
          
          <td>${row.category}</td>

          <td>${row.sub_category || "-"}</td>

          <td>${row.note || "-"}</td>

          <td>
            ${
              row.transaction_type === "Received"
              ? row.amount
              : "-"
            }
          </td>

          <td>
            ${
              row.transaction_type === "Expense"
              ? row.amount
              : "-"
            }
          </td>

          

        </tr>
      `;
    }).join("");

    const html = `
      <html>

        <head>

          <title>
            Nirmalani Plantation Weekly Expenditure Report
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

          <h2>
            Nirmalani Plantation Weekly Expenditure Report
          </h2>

          <p>
            ${weekStart}
            to
            ${weekEnd}
          </p>

          <table>

            <thead>

              <tr>

                <th>Date</th>

                <th>Category</th>

                <th>Sub Category</th>

                <th>Note</th>

                <th>Amount Received</th>

                <th>Amount Spent</th>

              </tr>

            </thead>

            <tbody>

              ${rowsHTML}

            </tbody>

          </table>

          <h3>
            Money Received:
            Rs.${totalReceived.toFixed(2)}
          </h3>

          <h3>
            Total Expense:
            Rs.${totalExpense.toFixed(2)}
          </h3>

          <h3>
            Balance:
            Rs.${(totalReceived - totalExpense).toFixed(2)}
          </h3>

          <script>
            window.print();
          </script>

        </body>

      </html>
    `;

    const win =
      window.open("", "_blank");

    win.document.write(html);

    win.document.close();
  };


  return (

    <Box
      sx={{
        p:3,
        minHeight:"100vh",
        background:
          "linear-gradient(135deg,#0f172a,#1e293b)"
      }}
    >

      <Typography
        variant="h4"
        sx={{
          color:"#fff",
          mb:3,
          fontWeight:"bold"
        }}
      >
        💸 Expenditure Dashboard
      </Typography>

      <Paper
        sx={{
          p:3,
          mb:4,
          borderRadius:5,
          background:
            "rgba(255,255,255,0.05)"
        }}
      >

        <Grid container spacing={2}>

        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            label="Bank Account"
            value={bankAccount}
            onChange={(e) =>
              setBankAccount(e.target.value)
            }
            sx={{ width: 200}}
          >
            <MenuItem value="Sampath">
              Sampath Bank
            </MenuItem>

            <MenuItem value="Nations Trust">
              Nations Trust Bank
            </MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            select
            fullWidth
            label="Transaction Type"
            value={transactionType}
            onChange={(e) =>
              setTransactionType(e.target.value)
            }
            sx={{
              input: { color: "#fff" },
              label: { color: "#aaa" }
            }}
          >
            <MenuItem value="Expense">
              Expense
            </MenuItem>

            <MenuItem value="Received">
              Money Received
            </MenuItem>

            <MenuItem value="Opening Balance">
              Opening Balance
            </MenuItem>
          </TextField>
        </Grid>

        {transactionType === "Expense" && (
          <>
          <Grid item xs={12} md={2}>
            <TextField
              select
              fullWidth
              label="Category"
              value={category}
              onChange={(e)=>{
                setCategory(e.target.value);
                setSubCategory("");
              }}
              sx={{
                width: 250,
                input:{color:"#fff"},
                label:{color:"#aaa"}
              }}
            >
              {Object.keys(categories)
                .map((c)=>(
                <MenuItem
                  key={c}
                  value={c}
                >
                  {c}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

            {categories[category]?.hasSub && (

            <>

                {/* SUBCATEGORY DROPDOWN */}

                <Grid item xs={12} md={2}>

                <TextField
                    select
                    fullWidth
                    label="Sub Category"
                    value={subCategory}
                    onChange={(e)=>
                    setSubCategory(
                        e.target.value
                    )
                    }
                    sx={{
                    width:250,
                    input:{color:"#fff"},
                    label:{color:"#aaa"}
                    }}
                >

                    {(categories[category]?.subs || [])
                    .map((sub)=>(

                    <MenuItem
                        key={sub}
                        value={sub}
                    >
                        {sub}
                    </MenuItem>

                    ))}

                </TextField>

                </Grid>

                {/* CUSTOM SUBCATEGORY */}

                <Grid item xs={12} md={2}>

                <TextField
                    fullWidth
                    label="Custom Subcategory"
                    value={customSubCategory}
                    onChange={(e)=>
                    setCustomSubCategory(
                        e.target.value
                    )
                    }
                    sx={{
                    width:250,
                    input:{color:"#fff"},
                    label:{color:"#aaa"}
                    }}
                />

                </Grid>

            </>

            )}

            <Grid item xs={12} md={2}>

                <TextField
                    fullWidth
                    label="Custom Category"
                    value={customCategory}
                    onChange={(e)=>
                    setCustomCategory(
                        e.target.value
                    )
                    }
                    sx={{
                    input:{color:"#fff"},
                    label:{color:"#aaa"}
                    }}
                />

                </Grid>
          </>
        )}

          

          <Grid item xs={12} md={2}>
            <TextField
              label="Amount"
              type="number"
              fullWidth
              value={amount}
              onChange={(e)=>
                setAmount(e.target.value)
              }
              sx={{
                input:{color:"#fff"},
                label:{color:"#aaa"}
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              label="Note"
              fullWidth
              value={note}
              onChange={(e)=>
                setNote(e.target.value)
              }
              sx={{
                input:{color:"#fff"},
                label:{color:"#aaa"}
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              type="date"
              fullWidth
              value={date}
              onChange={(e)=>
                setDate(e.target.value)
              }
              sx={{
                input:{color:"#fff"}
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
            >
              Upload Receipt
              <input
                type="file"
                hidden
                multiple
                accept="image/*,.pdf"
                onChange={(e) =>
                  setPhoto([...e.target.files])
                }
              />
            </Button>

            {Array.isArray(photo) && photo.length > 0 && (
              <Box sx={{ mt: 1 }}>
                {photo.map((file, index) => (
                  <Typography
                    key={index}
                    variant="caption"
                    display="block"
                    sx={{
                      color: "#fff",
                      fontSize: "12px"
                    }}
                  >
                    📎 {file.type === "application/pdf"
                        ? "📄"
                        : "🖼️"} {file.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              onClick={() => {
                if (editingId) {
                    updateExpense(editingId);
                } else {
                    addExpense();
                }
                }}
              sx={{
                height:"100%",
                background:
                  "linear-gradient(135deg,#ef4444,#f87171)",
                color:"#fff",
                fontWeight:"bold"
              }}
            >
              {editingId ? "Update" : "Add"}
            </Button>
          </Grid>

        </Grid>

      </Paper>

      <Paper
        sx={{
            p:3,
            borderRadius:5,
            background:
            "rgba(255,255,255,0.05)"
        }}
        >

        <Box
            sx={{
            display:"flex",
            gap:2,
            flexWrap:"wrap",
            mb:3
            }}
        >

          <TextField
            select
            label="Report Account"
            value={reportBank}
            onChange={(e)=>
              setReportBank(e.target.value)
            }

            sx={{width: 200}}
          >
            <MenuItem value="">
              All Accounts
            </MenuItem>

            <MenuItem value="Sampath">
              Sampath Bank
            </MenuItem>

            <MenuItem value="Nations Trust">
              Nations Trust Bank
            </MenuItem>
          </TextField>

            <TextField
            type="month"
            value={filterMonth}
            onChange={(e)=>
                setFilterMonth(
                e.target.value
                )
            }
            sx={{
                input:{color:"#fff"}
            }}
            />

            <TextField
            type="date"
            value={weekStart}
            onChange={(e)=>
                setWeekStart(
                e.target.value
                )
            }
            sx={{
                input:{color:"#fff"}
            }}
            />

            <TextField
            type="date"
            value={weekEnd}
            onChange={(e)=>
                setWeekEnd(
                e.target.value
                )
            }
            sx={{
                input:{color:"#fff"}
            }}
            />

            <Button
            onClick={printWeeklyReport}
            sx={{
                background:"#0ea5e9",
                color:"#fff",
                fontWeight: "bold"
            }}
            >
            Weekly Report
            </Button>

            <Button
            onClick={printMonthlyReport}
            sx={{
                background:"#8b5cf6",
                color:"#fff",
                fontWeight: "bold"
            }}
            >
            Monthly Report
            </Button>

        </Box>

        <Table>

            <TableHead>

            <TableRow>

              <TableCell sx={{color:"#aaa"}}>
                Date
              </TableCell>

              <TableCell sx={{color:"#aaa"}}>
                Bank Account
              </TableCell>

              <TableCell sx={{ color:"#aaa" }}>
                Type
              </TableCell>

                <TableCell sx={{color:"#aaa"}}>
                Category
                </TableCell>

                <TableCell sx={{color:"#aaa"}}>
                Sub Category
                </TableCell>

                <TableCell sx={{color:"#aaa"}}>
                  Amount Received
                </TableCell>

                <TableCell sx={{color:"#aaa"}}>
                  Amount Spent
                </TableCell>

                <TableCell sx={{color:"#aaa"}}>
                Note
                </TableCell>

                <TableCell sx={{color:"#aaa"}}>
                  Receipt
                </TableCell>

                <TableCell sx={{color:"#aaa"}}>
                Actions
                </TableCell>

            </TableRow>

            </TableHead>

            <TableBody>

            {filteredData.map((row) => (

                <TableRow key={row.id}>

                <TableCell sx={{color:"#fff"}}>
                    {new Date(row.date)
                    .toLocaleDateString("en-CA")}
                </TableCell>

                <TableCell sx={{color:"#fff"}}>
                  {row.bank_account}
                </TableCell>

                <TableCell
                  sx={{
                    color:
                      row.transaction_type === "Expense"
                        ? "#ef4444"
                        : "#22c55e"
                  }}
                >
                  {row.transaction_type}
                </TableCell>

                <TableCell sx={{color:"#fff"}}>
                    {row.category}
                </TableCell>

                <TableCell sx={{color:"#fff"}}>
                    {row.sub_category || "-"}
                </TableCell>

                <TableCell sx={{ color:"#38bdf8" }}>
                  {(
                      row.transaction_type === "Received" ||
                      row.transaction_type === "Opening Balance"
                    )
                      ? `Rs. ${Number(row.amount).toFixed(2)}`
                      : "-"
                  }
                </TableCell>

                <TableCell sx={{ color:"#ef4444" }}>
                  {row.transaction_type === "Expense"
                    ? `Rs. ${Number(row.amount).toFixed(2)}`
                    : "-"
                  }
                </TableCell>

                <TableCell sx={{color:"#fff"}}>
                    {row.note || "-"}
                </TableCell>

                  <TableCell>
                    {(() => {
                      const photos = JSON.parse(
                        row.photos || "[]"
                      );

                      return photos.map((file) => (
                        <div key={file}>
                         <a
                            href={`${API}/uploads/expenditure/${file}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {file}
                          </a>
                        </div>
                      ));
                    })()}
                  </TableCell>

                <TableCell>

                    <Button
                    size="small"
                    sx={{
                        mr:1,
                        background:"#eab308",
                        color:"#000"
                    }}
                    onClick={() => {

                        setEditingId(row.id);

                        setCategory(row.category);

                        setSubCategory(
                          row.sub_category || ""
                        );

                        setAmount(row.amount);

                        setNote(
                          row.note || ""
                        );

                        setDate(
                          row.date.split("T")[0]
                        );

                        setPhoto([]);
                    }}
                    >
                    Edit
                    </Button>

                    <Button
                    size="small"
                    sx={{
                        background:"#ef4444",
                        color:"#fff"
                    }}
                    onClick={() =>
                        deleteExpense(row.id)
                    }
                    >
                    Delete
                    </Button>

                </TableCell>

                </TableRow>
            ))}

            </TableBody>

        </Table>

        </Paper>

        {reportBank === "" ? (
          <Table sx={{ mt: 3 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color:"#aaa", fontWeight:"bold" }}>
                  Bank Account
                </TableCell>

                <TableCell sx={{ color:"#22c55e", fontWeight:"bold" }}>
                  Money Received
                </TableCell>

                <TableCell sx={{ color:"#ef4444", fontWeight:"bold" }}>
                  Total Expense
                </TableCell>

                <TableCell sx={{ color:"#38bdf8", fontWeight:"bold" }}>
                  Balance
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              <TableRow>
                <TableCell sx={{ color:"#fff" }}>
                  Sampath Bank
                </TableCell>

                <TableCell sx={{ color:"#22c55e" }}>
                  Rs. {sampathSummary.received.toFixed(2)}
                </TableCell>

                <TableCell sx={{ color:"#ef4444" }}>
                  Rs. {sampathSummary.expense.toFixed(2)}
                </TableCell>

                <TableCell sx={{ color:"#38bdf8" }}>
                  Rs. {sampathSummary.balance.toFixed(2)}
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ color:"#fff" }}>
                  Nations Trust Bank
                </TableCell>

                <TableCell sx={{ color:"#22c55e" }}>
                  Rs. {nationsSummary.received.toFixed(2)}
                </TableCell>

                <TableCell sx={{ color:"#ef4444" }}>
                  Rs. {nationsSummary.expense.toFixed(2)}
                </TableCell>

                <TableCell sx={{ color:"#38bdf8" }}>
                  Rs. {nationsSummary.balance.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <Table sx={{ mt: 3 }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ color:"#22c55e" }}>
                  Money Received
                </TableCell>

                <TableCell sx={{ color:"#ef4444" }}>
                  Total Expense
                </TableCell>

                <TableCell sx={{ color:"#38bdf8" }}>
                  Balance
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ color:"#22c55e" }}>
                  Rs. {totalReceived.toFixed(2)}
                </TableCell>

                <TableCell sx={{ color:"#ef4444" }}>
                  Rs. {totalExpense.toFixed(2)}
                </TableCell>

                <TableCell sx={{ color:"#38bdf8" }}>
                  Rs. {balance.toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        )}

    </Box>
  );
}