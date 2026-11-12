import { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Box,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  process.env.REACT_APP_API_URL || "https://nirmalani-payroll-production.up.railway.app";

export default function CoconutCollection({
  plantation
}) {
  
 const [collectionData, setCollectionData] = useState([]);
 const [viewCollection, setViewCollection] = useState(null);
const [editingCollectionId, setEditingCollectionId] = useState(null);
const [editCollectionDate, setEditCollectionDate] = useState("");
const [editCollectionQty, setEditCollectionQty] = useState("");
 const [salesData, setSalesData] = useState([]);
 const [freeData, setFreeData] = useState([]);
 const [selectedSummaryDate, setSelectedSummaryDate] = useState(null);
const [editingRecord, setEditingRecord] = useState(null);
  const [summaryDialogMode, setSummaryDialogMode] = useState("view");

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

        const handleViewCollection = (record) => {
            setViewCollection(record);
            };

        const handleViewSummary = (date) => {
            setSelectedSummaryDate(date.split("T")[0]);
            setSummaryDialogMode("view");
            };

        const deleteSummaryRecord = async (type, id) => {
            if (!window.confirm("Are you sure you want to delete this record?")) {
                return;
            }

            try {
                const endpoint =
                type === "collection"
                    ? "coconut-collection"
                    : type === "sales"
                    ? "coconut-sales"
                    : "coconut-free-giving";

                await axios.delete(`${API}/${endpoint}/${id}`);

                await Promise.all([
                fetchData(),
                fetchSales(),
                fetchFreeGiving()
                ]);

                alert("Record deleted successfully!");
            } catch (err) {
                console.error("Delete error:", err);
                alert("Failed to delete record.");
            }
            };

            const handleEditSummaryRecord = (type, record) => {
                setEditingRecord({
                    type,
                    id: record.id,
                    date:
                    type === "collection"
                        ? record.collection_date?.split("T")[0]
                        : type === "sales"
                        ? record.sale_date?.split("T")[0]
                        : record.free_date?.split("T")[0],
                    quantity:
                    type === "sales"
                        ? record.quantity_sold
                        : record.quantity,
                    price: record.price || "",
                    note: record.note || ""
                });
                };

                const updateSummaryRecord = async () => {
                    if (!editingRecord) return;

                    try {
                        const { type, id, date, quantity, price, note } = editingRecord;

                        const endpoint =
                        type === "collection"
                            ? "coconut-collection"
                            : type === "sales"
                            ? "coconut-sales"
                            : "coconut-free-giving";

                        let data = {};

                        if (type === "collection") {
                        data = {
                            collection_date: date,
                            quantity
                        };
                        } else if (type === "sales") {
                        data = {
                            sale_date: date,
                            quantity_sold: quantity,
                            price
                        };
                        } else {
                        data = {
                            free_date: date,
                            quantity,
                            note
                        };
                        }

                        await axios.put(`${API}/${endpoint}/${id}`, data);

                        await Promise.all([
                        fetchData(),
                        fetchSales(),
                        fetchFreeGiving()
                        ]);

                        setEditingRecord(null);

                        alert("Record updated successfully!");
                    } catch (err) {
                        console.error("Update error:", err);
                        alert("Failed to update record.");
                    }
                    };

const handleEditCollection = (record) => {
  setEditingCollectionId(record.id);
  setEditCollectionDate(
    record.collection_date
      ? record.collection_date.split("T")[0]
      : ""
  );
  setEditCollectionQty(record.quantity);
};

const updateCollection = async () => {
  try {
    await axios.put(`${API}/coconut-collection/${editingCollectionId}`, {
      collection_date: editCollectionDate,
      quantity: editCollectionQty,
    });

    alert("Coconut collection updated successfully!");
    setEditingCollectionId(null);
    fetchData();
  } catch (err) {
    console.error("Update error:", err);
    alert("Failed to update coconut collection.");
  }
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

                const soldQty =
                    salesData
                        .filter(r =>
                        r.sale_date?.split("T")[0] ===
                        date?.split("T")[0]
                        )
                        .reduce(
                        (s,r) => s + Number(r.quantity_sold),
                        0
                        );

                    const remaining =
                    collected -
                    soldQty -
                    free;

                    return [
                    date?.split("T")[0],
                    collected,
                    salesAmount,
                    free,
                    remaining
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

            const soldQty =
                salesData
                    .filter(r =>
                    r.sale_date?.split("T")[0] ===
                    date?.split("T")[0]
                    )
                    .reduce(
                    (s,r) => s + Number(r.quantity_sold),
                    0
                    );

                const remaining =
                collected -
                soldQty -
                free;

                return [
                date?.split("T")[0],
                collected,
                salesAmount,
                free,
                remaining
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
    mb: 3,
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
    🥥 Individual Coconut Collection Records
  </Typography>

  <Table>
    <TableHead>
      <TableRow>
        <TableCell sx={{ color: "#aaa" }}>Date</TableCell>
        <TableCell sx={{ color: "#aaa" }}>Quantity</TableCell>
        <TableCell sx={{ color: "#aaa" }}>Actions</TableCell>
      </TableRow>
    </TableHead>

    <TableBody>
      {collectionData.map((record) => (
        <TableRow key={record.id}>
          <TableCell sx={{ color: "#fff" }}>
            {record.collection_date?.split("T")[0]}
          </TableCell>

          <TableCell sx={{ color: "#22c55e" }}>
            {record.quantity}
          </TableCell>

          <TableCell>
            <Button
              size="small"
              variant="contained"
              color="info"
              onClick={() => handleViewCollection(record)}
              sx={{ mr: 1 }}
            >
              View
            </Button>

            <Button
              size="small"
              variant="contained"
              color="warning"
              onClick={() => handleEditCollection(record)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>

            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => deleteCollection(record.id)}
            >
              Delete
            </Button>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</Paper>


{/* VIEW COCONUT COLLECTION */}
<Dialog
  open={Boolean(viewCollection)}
  onClose={() => setViewCollection(null)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Coconut Collection Details</DialogTitle>

  <DialogContent>
    {viewCollection && (
      <>
        <Typography sx={{ mb: 2 }}>
          Date: {viewCollection.collection_date?.split("T")[0]}
        </Typography>

        <Typography>
          Number of Coconuts: {viewCollection.quantity}
        </Typography>
      </>
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setViewCollection(null)}>
      Close
    </Button>
  </DialogActions>
</Dialog>

{/* EDIT COCONUT COLLECTION */}
<Dialog
  open={editingCollectionId !== null}
  onClose={() => setEditingCollectionId(null)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>Edit Coconut Collection</DialogTitle>

  <DialogContent>
    <TextField
      label="Collection Date"
      type="date"
      fullWidth
      margin="normal"
      InputLabelProps={{ shrink: true }}
      value={editCollectionDate}
      onChange={(e) => setEditCollectionDate(e.target.value)}
    />

    <TextField
      label="Number of Coconuts"
      type="number"
      fullWidth
      margin="normal"
      value={editCollectionQty}
      onChange={(e) => setEditCollectionQty(e.target.value)}
    />
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setEditingCollectionId(null)}>
      Cancel
    </Button>

    <Button
      variant="contained"
      color="success"
      onClick={updateCollection}
      disabled={!editCollectionDate || editCollectionQty === ""}
    >
      Update
    </Button>
  </DialogActions>
</Dialog>

{/* EDIT SUMMARY RECORD */}
<Dialog
  open={Boolean(editingRecord)}
  onClose={() => setEditingRecord(null)}
  fullWidth
  maxWidth="sm"
>
  <DialogTitle>
    Edit {
      editingRecord?.type === "collection"
        ? "Coconut Collection"
        : editingRecord?.type === "sales"
        ? "Coconut Sales"
        : "Free Giving"
    }
  </DialogTitle>

  <DialogContent>
    <TextField
      label="Date"
      type="date"
      fullWidth
      margin="normal"
      InputLabelProps={{ shrink: true }}
      value={editingRecord?.date || ""}
      onChange={(e) =>
        setEditingRecord({
          ...editingRecord,
          date: e.target.value
        })
      }
    />

    <TextField
      label="Number of Coconuts"
      type="number"
      fullWidth
      margin="normal"
      value={editingRecord?.quantity || ""}
      onChange={(e) =>
        setEditingRecord({
          ...editingRecord,
          quantity: e.target.value
        })
      }
    />

    {editingRecord?.type === "sales" && (
      <TextField
        label="Price Per Coconut"
        type="number"
        fullWidth
        margin="normal"
        value={editingRecord.price}
        onChange={(e) =>
          setEditingRecord({
            ...editingRecord,
            price: e.target.value
          })
        }
      />
    )}

    {editingRecord?.type === "free" && (
      <TextField
        label="Note"
        fullWidth
        margin="normal"
        value={editingRecord.note}
        onChange={(e) =>
          setEditingRecord({
            ...editingRecord,
            note: e.target.value
          })
        }
      />
    )}
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setEditingRecord(null)}>
      Cancel
    </Button>

    <Button
      variant="contained"
      color="success"
      onClick={updateSummaryRecord}
      disabled={
        !editingRecord?.date ||
        editingRecord?.quantity === ""
      }
    >
      Update
    </Button>
  </DialogActions>
</Dialog>



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

                    <TableCell sx={{ color:"#aaa" }}>
                        Actions
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

                        <TableCell>
                            <Button
                                size="small"
                                variant="contained"
                                color="info"
                                onClick={() => handleViewSummary(date)}
                                sx={{ mr: 1 }}
                            >
                                View
                            </Button>

                            </TableCell>

                    </TableRow>

                    );

                })}

                </TableBody>

            </Table>

            </Paper>

            {/* DAILY COCONUT DETAILS */}
<Dialog
  open={selectedSummaryDate !== null}
  onClose={() => setSelectedSummaryDate(null)}
  fullWidth
  maxWidth="md"
>
  <DialogTitle>
    Coconut Details - {selectedSummaryDate}
  </DialogTitle>

  <DialogContent>

    {/* COCONUT COLLECTION */}
    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
      🌴 පොල් කැඩීම
    </Typography>

    {collectionData
      .filter(r => r.collection_date?.split("T")[0] === selectedSummaryDate)
      .map(record => (
        <Box
            key={record.id}
            sx={{
                p: 2,
                mb: 1,
                bgcolor: "#f1f5f9",
                color: "#1e293b",
                borderRadius: 2
            }}
            >
          <Typography>
            Date: {record.collection_date?.split("T")[0]}
          </Typography>
          <Typography>
            Quantity: {record.quantity}
          </Typography>

          {(
            <>
              <Button
                size="small"
                color="warning"
                onClick={() => handleEditSummaryRecord("collection", record)}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => deleteSummaryRecord("collection", record.id)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      ))}

    {/* COCONUT SALES */}
    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
      💰 පොල් විකිණීම්
    </Typography>

    {salesData
      .filter(r => r.sale_date?.split("T")[0] === selectedSummaryDate)
      .map(record => (
        <Box
            key={record.id}
            sx={{
                p: 2,
                mb: 1,
                bgcolor: "#f1f5f9",
                color: "#1e293b",
                borderRadius: 2
            }}
            >
          <Typography>
            Date: {record.sale_date?.split("T")[0]}
          </Typography>
          <Typography>
            Quantity Sold: {record.quantity_sold}
          </Typography>
          <Typography>
            Price Per Coconut: Rs. {record.price}
          </Typography>
          <Typography>
            Total: Rs. {(Number(record.price) * Number(record.quantity_sold)).toLocaleString()}
          </Typography>

          {(
            <>
              <Button
                size="small"
                color="warning"
                onClick={() => handleEditSummaryRecord("sales", record)}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => deleteSummaryRecord("sales", record.id)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      ))}

    {/* FREE GIVING */}
    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
      🎁 නොමිලේ බෙදාදීම
    </Typography>

    {freeData
      .filter(r => r.free_date?.split("T")[0] === selectedSummaryDate)
      .map(record => (
        <Box
            key={record.id}
            sx={{
                p: 2,
                mb: 1,
                bgcolor: "#f1f5f9",
                color: "#1e293b",
                borderRadius: 2
            }}
            >
          <Typography>
            Date: {record.free_date?.split("T")[0]}
          </Typography>
          <Typography>
            Quantity: {record.quantity}
          </Typography>
          <Typography>
            Note: {record.note || "-"}
          </Typography>

          {(
            <>
              <Button
                size="small"
                color="warning"
                onClick={() => handleEditSummaryRecord("free", record)}
              >
                Edit
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => deleteSummaryRecord("free", record.id)}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      ))}

  </DialogContent>

  <DialogActions>
    <Button onClick={() => setSelectedSummaryDate(null)}>
      Close
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}