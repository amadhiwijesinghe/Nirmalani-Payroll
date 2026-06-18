import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";

const API =
  "https://nirmalani-payroll-production.up.railway.app";

export default function CoconutCollection({
  plantation
}) {
  
 const [collectionData, setCollectionData] = useState([]);
 const [salesData, setSalesData] = useState([]);
 const [freeData, setFreeData] = useState([]);

 const [collectionDate, setCollectionDate] = useState("");
 const [collectionQty, setCollectionQty] = useState("");

 const [salesDate, setSalesDate] = useState("");
 const [salesPrice, setSalesPrice] = useState("");
 const [salesQty, setSalesQty] = useState("");

 const [freeDate, setFreeDate] = useState("");
 const [freeQty, setFreeQty] = useState("");
 const [freeNote, setFreeNote] = useState("");

 const [filterMonth, setFilterMonth] = useState("");
 const [weekStart, setWeekStart] = useState("");
 const [weekEnd, setWeekEnd] = useState("");


 const totalCollected =
  collectionData.reduce(
    (sum,row)=>
      sum + Number(row.quantity),
    0
  );

 const totalSold =
  salesData.reduce(
    (sum,row)=>
      sum + Number(row.quantity_sold),
    0
  );

 const totalFree =
  freeData.reduce(
    (sum,row)=>
      sum + Number(row.quantity),
    0
  );

 const remaining =
  totalCollected -
  totalSold -
  totalFree;


 useEffect(() => {

  fetchData();
  fetchSales();
  fetchFreeGiving();

}, [plantation]);


  // FETCH DATA
  const fetchData = async () => {

    const res =
        await axios.get(
        `${API}/coconut-collection?plantation=${plantation}`
        );

    setCollectionData(res.data);
    };

  const fetchSales = async () => {

    const res = await axios.get(
        `${API}/coconut-sales?plantation=${plantation}`
    );

    setSalesData(res.data);
    };

    const fetchFreeGiving = async () => {

    const res = await axios.get(
        `${API}/coconut-free-giving?plantation=${plantation}`
    );

    setFreeData(res.data);
    };


  // SAVE COCONUT COLLECTION
  const saveCollection = async () => {

    await axios.post(
        `${API}/coconut-collection`,
        {
            collection_date: collectionDate,
            quantity: collectionQty,
            plantation
        }
        );

      alert("✅ Coconut Collection Saved");

      fetchData();

      setCollectionDate("");
      setCollectionQty("");

  };

  const saveSales = async () => {

    const saleAmount =
        Number(salesPrice || 0) *
        Number(salesQty || 0);

    await axios.post(
        `${API}/coconut-sales`,
        {
        sale_date: salesDate,
        price: salesPrice,
        quantity_sold: salesQty,
        sale_amount: saleAmount,
        plantation
        }
    );

    alert("✅ Coconut Sale Saved");

    setSalesDate("");
    setSalesPrice("");
    setSalesQty("");

    fetchSales();
    };

    const saveFreeGiving = async () => {

        await axios.post(
            `${API}/coconut-free-giving`,
            {
            free_date: freeDate,
            quantity: freeQty,
            note: freeNote,
            plantation
            }
        );

        alert("✅ Free Giving Saved");

        setFreeDate("");
        setFreeQty("");
        setFreeNote("");

        fetchFreeGiving();
        };

  // DELETE
  const deleteCollection = async (id) => {

    if (!window.confirm("Delete entry?")) {
      return;
    }

    try {

      await axios.delete(
        `${API}/coconut-collection/${id}`
      );

      alert("Deleted");

      fetchData();

    } catch (err) {

      console.error(err);
    }
  };

  const summaryDates = [
    ...new Set([
        ...collectionData.map(r => r.collection_date),
        ...salesData.map(r => r.sale_date),
        ...freeData.map(r => r.free_date)
    ])
    ].sort();
  

  const monthlyCollected =
  collectionData
    .filter(row =>
      filterMonth
        ? row.collection_date
            ?.split("T")[0]
            .startsWith(filterMonth)
        : true
    )
    .reduce(
      (sum,row)=>
        sum + Number(row.quantity),
      0
    );

const monthlySold =
  salesData
    .filter(row =>
      filterMonth
        ? row.sale_date
            ?.split("T")[0]
            .startsWith(filterMonth)
        : true
    )
    .reduce(
      (sum,row)=>
        sum + Number(row.quantity_sold),
      0
    );

const monthlyFree =
  freeData
    .filter(row =>
      filterMonth
        ? row.free_date
            ?.split("T")[0]
            .startsWith(filterMonth)
        : true
    )
    .reduce(
      (sum,row)=>
        sum + Number(row.quantity),
      0
    );

    // WEEKLY 
    const weeklyCollected =
  collectionData
    .filter(row => {

      const d =
        row.collection_date
          ?.split("T")[0];

      return (
        weekStart &&
        weekEnd &&
        d >= weekStart &&
        d <= weekEnd
      );

    })
    .reduce(
      (sum,row)=>
        sum + Number(row.quantity),
      0
    );

const weeklySold =
  salesData
    .filter(row => {

      const d =
        row.sale_date
          ?.split("T")[0];

      return (
        weekStart &&
        weekEnd &&
        d >= weekStart &&
        d <= weekEnd
      );

    })
    .reduce(
      (sum,row)=>
        sum + Number(row.quantity_sold),
      0
    );

const weeklyFree =
  freeData
    .filter(row => {

      const d =
        row.free_date
          ?.split("T")[0];

      return (
        weekStart &&
        weekEnd &&
        d >= weekStart &&
        d <= weekEnd
      );

    })
    .reduce(
      (sum,row)=>
        sum + Number(row.quantity),
      0
    );

    // DOWNLOAD MONTHLY REPORT
    const downloadMonthlyReport = () => {

        if (!filterMonth) {
            alert("Select a month first");
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(
            "Monthly Coconut Report",
            14,
            20
        );

        doc.setFontSize(12);

        doc.text(
            `Month: ${filterMonth}`,
            14,
            30
        );

        autoTable(doc, {
            startY: 40,
            head: [[
            "Date",
            "Collected",
            "Sales Amount",
            "Free Giving",
            "Remaining"
            ]],

            body: summaryDates
            .filter(date =>
                date?.split("T")[0]
                .startsWith(filterMonth)
            )
            .map(date => {

                const collected =
                collectionData
                    .filter(r =>
                    r.collection_date?.split("T")[0] ===
                    date?.split("T")[0]
                    )
                    .reduce(
                    (s,r)=>s+Number(r.quantity),
                    0
                    );

                const free =
                freeData
                    .filter(r =>
                    r.free_date?.split("T")[0] ===
                    date?.split("T")[0]
                    )
                    .reduce(
                    (s,r)=>s+Number(r.quantity),
                    0
                    );

                const salesAmount =
                salesData
                    .filter(r =>
                    r.sale_date?.split("T")[0] ===
                    date?.split("T")[0]
                    )
                    .reduce(
                    (s,r)=>
                        s +
                        (
                        Number(r.price) *
                        Number(r.quantity_sold)
                        ),
                    0
                    );

                return [
                date?.split("T")[0],
                collected,
                salesAmount,
                free,
                ""
                ];

            })
        });

        doc.save(
            `Monthly_Coconut_Report_${filterMonth}.pdf`
        );
        };

  // DOWNLOAD WEEKLY REPORT
  const downloadWeeklyReport = () => {

    if (!weekStart || !weekEnd) {
        alert("Select week range");
        return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(
        "Weekly Coconut Report",
        14,
        20
    );

    doc.text(
        `${weekStart} to ${weekEnd}`,
        14,
        30
    );

    autoTable(doc, {
        startY: 40,

        head: [[
        "Date",
        "Collected",
        "Sales Amount",
        "Free Giving",
        "Remaining"
        ]],

        body: summaryDates
        .filter(date => {

            const d =
            date?.split("T")[0];

            return (
            d >= weekStart &&
            d <= weekEnd
            );

        })
        .map(date => {

            const collected =
            collectionData
                .filter(r =>
                r.collection_date?.split("T")[0] ===
                date?.split("T")[0]
                )
                .reduce(
                (s,r)=>s+Number(r.quantity),
                0
                );

            const free =
            freeData
                .filter(r =>
                r.free_date?.split("T")[0] ===
                date?.split("T")[0]
                )
                .reduce(
                (s,r)=>s+Number(r.quantity),
                0
                );

            const salesAmount =
            salesData
                .filter(r =>
                r.sale_date?.split("T")[0] ===
                date?.split("T")[0]
                )
                .reduce(
                (s,r)=>
                    s +
                    (
                    Number(r.price) *
                    Number(r.quantity_sold)
                    ),
                0
                );

            return [
            date?.split("T")[0],
            collected,
            salesAmount,
            free,
            ""
            ];

        })
    });

    doc.save(
        `Weekly_Coconut_Report.pdf`
    );
    };
  return (

    <Box
      sx={{
        p: 3,
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a, #1e293b)"
      }}
    >

      {/* HEADER */}
      <Typography
        variant="h4"
        sx={{
          color: "#fff",
          fontWeight: 800,
          mb: 3
        }}
      >
        🥥 Coconut Collection
      </Typography>

      {/* FORM */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 5,
          background: "rgba(255,255,255,0.05)"
        }}
      >
        <Typography
        variant="h6"
        sx={{
          color: "#fff",
          fontWeight: 800,
          mb: 3
        }}
      >
        🌴 පොල් කැඩීම
      </Typography>

        <Grid container spacing={2}>
            
            <Grid item xs={4}>
            <TextField
                type="date"
                fullWidth
                value={collectionDate}
                onChange={(e)=>
                setCollectionDate(e.target.value)
                }
            />
            </Grid>

            <Grid item xs={4}>
            <TextField
                label="Number of Coconuts"
                fullWidth
                value={collectionQty}
                onChange={(e)=>
                setCollectionQty(e.target.value)
                }
            />
            </Grid>

            <Grid item xs={4}>
            <Button sx={{
                height: "100%",
                background:
                  "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                borderRadius: 3,
                fontWeight: "bold"}}
                variant="contained"
                onClick={saveCollection}
            >
                Save
            </Button>
            </Grid>
        </Grid>

      </Paper>

      <Paper
        sx={{
            p: 3,
            mb: 4,
            borderRadius: 5,
            background: "rgba(255,255,255,0.05)"
        }}
        >

        <Typography
            variant="h6"
            sx={{
            color:"#fff",
            mb:2,
            fontWeight:"bold"
            }}
        >
            💰 පොල් විකිණීම්
        </Typography>

        <Grid container spacing={2} alignItems="stretch">

            <Grid item xs={3}>
            <TextField
                type="date"
                fullWidth
                value={salesDate}
                onChange={(e)=>
                setSalesDate(e.target.value)
                }
            />
            </Grid>

            <Grid item xs={3}>
            <TextField
                label="Price Per Coconut"
                fullWidth
                value={salesPrice}
                onChange={(e)=>
                setSalesPrice(e.target.value)
                }
            />
            </Grid>

            <Grid item xs={2}>
            <TextField
                label="Number of Coconuts Sold"
                fullWidth
                value={salesQty}
                onChange={(e)=>
                setSalesQty(e.target.value)
                }
            />
            </Grid>

            <Grid item xs={2}>
            <TextField
                label="Coconut Sale"
                fullWidth
                disabled
                value={
                Number(salesPrice || 0) *
                Number(salesQty || 0)
                }
            />
            </Grid>

        <Grid item xs={2}>
            <Button
                sx={{
                    height: "56px",
                    background:
                    "linear-gradient(135deg,#22c55e,#4ade80)",
                    color: "#000",
                    borderRadius: 3,
                    fontWeight: "bold"}}
                variant="contained"
                onClick={saveSales}
            >
                Save
            </Button>
        </Grid>
      </Grid>
    </Paper>

    <Paper
        sx={{
            p: 3,
            mb: 4,
            borderRadius: 5,
            background: "rgba(255,255,255,0.05)"
        }}
        >

        <Typography
            variant="h6"
            sx={{
            color:"#fff",
            mb:2,
            fontWeight:"bold"
            }}
        >
            🎁 නොමිලේ බෙදාදීම
        </Typography>

        <Grid container spacing={2} alignItems="stretch">

            <Grid item xs={3}>
            <TextField
                type="date"
                fullWidth
                value={freeDate}
                onChange={(e)=>
                setFreeDate(e.target.value)
                }
            />
            </Grid>

            <Grid item xs={3}>
            <TextField
                label="Number of Coconuts"
                fullWidth
                value={freeQty}
                onChange={(e)=>
                setFreeQty(e.target.value)
                }
            />
            </Grid>

            <Grid item xs={4}>
            <TextField
                label="Note"
                fullWidth
                value={freeNote}
                onChange={(e)=>
                setFreeNote(e.target.value)
                }
            />
            </Grid>

            <Grid item xs={2}>
            <Button
                sx={{
                height: "56px",
                background:
                    "linear-gradient(135deg,#22c55e,#4ade80)",
                color: "#000",
                borderRadius: 3,
                fontWeight: "bold"
                }}
                variant="contained"
                onClick={saveFreeGiving}
            >
                Save
            </Button>
            </Grid>

        </Grid>

        </Paper>

        <Paper
            sx={{
                p:3,
                mb:3,
                borderRadius:5,
                background:"rgba(255,255,255,0.05)"
            }}
            >

            <Grid container spacing={2}>

                <Grid item xs={4}>
                <TextField
                    type="month"
                    fullWidth
                    label="Filter By Month"
                    InputLabelProps={{ shrink:true }}
                    value={filterMonth}
                    onChange={(e)=>
                    setFilterMonth(e.target.value)
                    }
                />
                </Grid>

                <Grid item xs={3}>
                <TextField
                    type="date"
                    fullWidth
                    label="Week Start"
                    InputLabelProps={{ shrink:true }}
                    value={weekStart}
                    onChange={(e)=>
                    setWeekStart(e.target.value)
                    }
                />
                </Grid>

                <Grid item xs={3}>
                <TextField
                    type="date"
                    fullWidth
                    label="Week End"
                    InputLabelProps={{ shrink:true }}
                    value={weekEnd}
                    onChange={(e)=>
                    setWeekEnd(e.target.value)
                    }
                />
                </Grid>

                            <Grid container spacing={2} sx={{ mb: 3 }}>

                <Grid item>
                    <Button
                    sx={{
                        height: "56px",
                        background:
                            "linear-gradient(135deg,#22c55e,#4ade80)",
                        color: "#000",
                        borderRadius: 3,
                        fontWeight: "bold"
                        }}
                    variant="contained"
                    color="success"
                    onClick={downloadMonthlyReport}
                    >
                    Download Monthly Report
                    </Button>
                </Grid>

                <Grid item>
                    <Button
                    sx={{
                        height: "56px",
                        background:
                            "linear-gradient(135deg,#22c55e,#4ade80)",
                        color: "#000",
                        borderRadius: 3,
                        fontWeight: "bold"
                        }}
                    variant="contained"
                    color="primary"
                    onClick={downloadWeeklyReport}
                    >
                    Download Weekly Report
                    </Button>
                </Grid>

                </Grid>
            </Grid>

            </Paper>

        <Paper
            sx={{
                p: 3,
                mt: 3,
                borderRadius: 5,
                background: "rgba(255,255,255,0.05)"
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
                📊 Coconut Summary
            </Typography>

            <Table>

                <TableHead>

                <TableRow>

                    <TableCell sx={{ color:"#aaa" }}>
                    Date
                    </TableCell>

                    <TableCell sx={{ color:"#aaa" }}>
                    Number of Coconuts
                    </TableCell>

                    <TableCell sx={{ color:"#aaa" }}>
                    Coconut Sales
                    </TableCell>

                    <TableCell sx={{ color:"#aaa" }}>
                    Free Giving
                    </TableCell>

                    <TableCell sx={{ color:"#aaa" }}>
                    Remaining
                    </TableCell>

                </TableRow>

                </TableHead>

                <TableBody>

                {summaryDates.map((date, index) => {

                    const collected =
                    collectionData
                        .filter(r => r.collection_date === date)
                        .reduce((sum,r) =>
                        sum + Number(r.quantity),
                        0);

                    const sold =
                    salesData
                        .filter(r => r.sale_date === date)
                        .reduce((sum,r) =>
                        sum + Number(r.quantity_sold),
                        0);

                    const free =
                    freeData
                        .filter(r => r.free_date === date)
                        .reduce((sum,r) =>
                        sum + Number(r.quantity),
                        0);

                    const salesAmount =
                        salesData
                            .filter(r => r.sale_date === date)
                            .reduce(
                            (sum,r) =>
                                sum +
                                (
                                Number(r.price || 0) *
                                Number(r.quantity_sold || 0)
                                ),
                            0
                            );

                    let runningBalance = 0;

                    summaryDates
                    .slice(0, index + 1)
                    .forEach(d => {

                        const c =
                        collectionData
                            .filter(r => r.collection_date === d)
                            .reduce((s,r)=>
                            s + Number(r.quantity),
                            0);

                        const s =
                        salesData
                            .filter(r => r.sale_date === d)
                            .reduce((s,r)=>
                            s + Number(r.quantity_sold),
                            0);

                        const f =
                        freeData
                            .filter(r => r.free_date === d)
                            .reduce((s,r)=>
                            s + Number(r.quantity),
                            0);

                        runningBalance += c - s - f;

                    });

                    return (

                    <TableRow key={date}>

                        <TableCell sx={{ color:"#fff" }}>
                        {date?.split("T")[0]}
                        </TableCell>

                        <TableCell sx={{ color:"#22c55e" }}>
                        {collected}
                        </TableCell>

                        <TableCell sx={{ color:"#0ea5e9" }}>
                        Rs. {salesAmount.toLocaleString()}
                        </TableCell>

                        <TableCell sx={{ color:"#f59e0b" }}>
                        {free}
                        </TableCell>

                        <TableCell
                        sx={{
                            color:"#fff",
                            fontWeight:"bold"
                        }}
                        >
                        {runningBalance}
                        </TableCell>

                    </TableRow>

                    );

                })}

                </TableBody>

            </Table>

            </Paper>
    </Box>
  );
}