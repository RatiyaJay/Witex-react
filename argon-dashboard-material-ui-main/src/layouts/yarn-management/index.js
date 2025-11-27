import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Icon from "@mui/material/Icon";
import { DataGrid } from "@mui/x-data-grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { useTheme } from "@mui/material/styles";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { firmsData } from "../manage-firm/data";
import { yarnData as initialYarnData } from "./data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getActionButtonStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

function YarnManagement() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedFirmId, setSelectedFirmId] = useState(() => {
    const p = searchParams.get("firmId");
    return p ? Number(p) : firmsData[0]?.id || null;
  });
  const [rows, setRows] = useState(initialYarnData.map(row => ({
    ...row,
    warping: row.warping || 0,
    twisting: row.twisting || 0,
    weft: row.weft || 0,
    isArchived: row.isArchived || false,
  })));
  const [gridReady, setGridReady] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [openDetails, setOpenDetails] = useState(false);
  const [detailsRow, setDetailsRow] = useState(null);
  
  // View state for active/history - must be declared before useMemo hooks
  const [view, setView] = useState("active");

  // Transfer dialog state
  const [openTransfer, setOpenTransfer] = useState(false);
  const [transferRow, setTransferRow] = useState(null);
  const [transferForm, setTransferForm] = useState({
    warping: "",
    twisting: "",
    weft: "",
  });

  useEffect(() => {
    const p = searchParams.get("firmId");
    if (p) {
      setSelectedFirmId(Number(p));
    }
  }, [searchParams]);

  useEffect(() => {
    // Defer DataGrid mount to avoid offsetHeight access during initial mount in some environments
    setGridReady(true);
  }, []);

  const firmsOptions = useMemo(() => firmsData.map((f) => ({ label: f.companyName, id: f.id })), []);
  const selectedFirm = useMemo(() => firmsData.find((f) => f.id === selectedFirmId) || null, [selectedFirmId]);
  const filteredRows = useMemo(() => rows.filter((r) => r.firmId === selectedFirmId), [rows, selectedFirmId]);
  const activeRows = useMemo(() => filteredRows.filter(r => !r.isArchived), [filteredRows]);
  const historyRows = useMemo(() => filteredRows.filter(r => r.isArchived), [filteredRows]);
  const displayRows = view === "active" ? activeRows : historyRows;
  const totalPages = Math.max(1, Math.ceil(displayRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return displayRows.slice(start, start + pageSize);
  }, [displayRows, page, totalPages]);

  const handleFirmChange = (_, value) => {
    if (value) {
      setSelectedFirmId(value.id);
      setPage(0);
      navigate({ pathname: "/yarn-management", search: `?firmId=${value.id}` }, { replace: true });
    }
  };

  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({
    challanDate: "",
    challanNo: "",
    receiveDate: "",
    time: "",
    fromFirm: "",
    agentName: "",
    manufacture: "",
    danier: "",
    yarnFillment: "",
    qualityName: "",
    grade: "",
    yarnType: "",
    lrNo: "",
    cartoonNo: "",
    totalCartoon: "",
    totalCone: "",
    netWeight: "",
    truckNo: "",
    warping: 0,
    twisting: 0,
    weft: 0,
  });

  const openAddDialog = () => {
    setForm({
      challanDate: "",
      challanNo: "",
      receiveDate: "",
      time: "",
      fromFirm: selectedFirm?.companyName || "",
      agentName: "",
      manufacture: "",
      danier: "",
      yarnFillment: "",
      qualityName: "",
      grade: "",
      yarnType: "",
      lrNo: "",
      cartoonNo: "",
      totalCartoon: "",
      totalCone: "",
      netWeight: "",
      truckNo: "",
    });
    setOpenAdd(true);
  };

  const closeAddDialog = () => setOpenAdd(false);

  const handleFormChange = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleAddSave = () => {
    const newRow = {
      id: Date.now(),
      firmId: selectedFirmId,
      ...form,
      totalCartoon: Number(form.totalCartoon || 0),
      totalCone: Number(form.totalCone || 0),
      netWeight: Number(form.netWeight || 0),
    };
    setRows((prev) => [newRow, ...prev]);
    setOpenAdd(false);
  };

  const [openDelete, setOpenDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const askDelete = (row) => {
    setRowToDelete(row);
    setOpenDelete(true);
  };
  const closeDelete = () => {
    setOpenDelete(false);
    setRowToDelete(null);
  };
  const confirmDelete = () => {
    if (rowToDelete) {
      setRows((prev) => prev.filter((r) => r.id !== rowToDelete.id));
    }
    closeDelete();
  };

  const exportCsv = () => {
    const headers = [
      ["Challan Date", "challanDate"],
      ["Challan No.", "challanNo"],
      ["Receive Date", "receiveDate"],
      ["Time", "time"],
      ["From (Firm)", "fromFirm"],
      ["Agent Name", "agentName"],
      ["Manufacture", "manufacture"],
      ["Danier", "danier"],
      ["Yarn Fillment", "yarnFillment"],
      ["Quality Name", "qualityName"],
      ["Select Grade", "grade"],
      ["Select Yarn Type", "yarnType"],
      ["LR No.", "lrNo"],
      ["Cartoon No.", "cartoonNo"],
      ["Total Cartoon", "totalCartoon"],
      ["Total Cone", "totalCone"],
      ["Net Weight", "netWeight"],
      ["Truck No.", "truckNo"],
    ];
    const escape = (v) => {
      const s = String(v ?? "");
      const needsQuotes = /[,"]/.test(s) || /\n/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };
    const csv = [headers.map(([h]) => h).join(","), ...filteredRows.map((r) => headers.map(([, key]) => escape(r[key])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yarn_export_firm_${selectedFirmId}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTransferOpen = (row) => {
    setTransferRow(row);
    setTransferForm({
      warping: "",
      twisting: "",
      weft: "",
    });
    setOpenTransfer(true);
  };

  const handleTransferSave = () => {
    if (!transferRow) return;

    const warpingQty = Number(transferForm.warping || 0);
    const twistingQty = Number(transferForm.twisting || 0);
    const weftQty = Number(transferForm.weft || 0);
    const totalTransfer = warpingQty + twistingQty + weftQty;

    if (totalTransfer > transferRow.totalCartoon) {
      alert(`Cannot transfer ${totalTransfer} cartoons. Only ${transferRow.totalCartoon} available.`);
      return;
    }

    setRows((prev) =>
      prev.map((r) => {
        if (r.id === transferRow.id) {
          const newTotal = r.totalCartoon - totalTransfer;
          const newWarping = (r.warping || 0) + warpingQty;
          const newTwisting = (r.twisting || 0) + twistingQty;
          const newWeft = (r.weft || 0) + weftQty;

          return {
            ...r,
            totalCartoon: newTotal,
            warping: newWarping,
            twisting: newTwisting,
            weft: newWeft,
            isArchived: newTotal === 0,
          };
        }
        return r;
      })
    );

    setOpenTransfer(false);
    setTransferRow(null);
  };

  const columns = [
    { field: "challanDate", headerName: "Challan Date", width: 120, align: "center", headerAlign: "center" },
    { field: "challanNo", headerName: "Challan No.", width: 130, align: "center", headerAlign: "center" },
    { field: "qualityName", headerName: "Quality Name", flex: 1, minWidth: 150, align: "center", headerAlign: "center" },
    { field: "totalCartoon", headerName: "Total Cartoon", width: 120, type: "number", align: "center", headerAlign: "center" },
    { field: "warping", headerName: "Warping", width: 100, type: "number", align: "center", headerAlign: "center", 
      renderCell: (params) => params.value || 0 },
    { field: "twisting", headerName: "Twisting", width: 100, type: "number", align: "center", headerAlign: "center",
      renderCell: (params) => params.value || 0 },
    { field: "weft", headerName: "Weft", width: 100, type: "number", align: "center", headerAlign: "center",
      renderCell: (params) => params.value || 0 },
    { field: "netWeight", headerName: "Net Weight", width: 120, type: "number", align: "center", headerAlign: "center" },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonBox display="flex" justifyContent="center" width="100%" gap={0.5}>
          <IconButton title="Details" size="small" color="info" onClick={() => { setDetailsRow(params.row); setOpenDetails(true); }}>
            <Icon fontSize="small">visibility</Icon>
          </IconButton>
          {view === "active" && (
            <IconButton title="Transfer" size="small" color="success" onClick={() => handleTransferOpen(params.row)}>
              <Icon fontSize="small">swap_horiz</Icon>
            </IconButton>
          )}
          <IconButton title="Delete" size="small" color="error" onClick={() => askDelete(params.row)}>
            <Icon fontSize="small">delete</Icon>
          </IconButton>
        </ArgonBox>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ArgonTypography variant="h4">Yarn Management</ArgonTypography>
              <ArgonBox display="flex" gap={1}>
                <ArgonButton 
                  color={sidenavColor || "warning"} 
                  variant="gradient" 
                  onClick={openAddDialog}
                  sx={getExportButtonStyles(theme, sidenavColor)}
                >
                  <Icon sx={{ mr: 1 }}>add</Icon> Add Yarn
                </ArgonButton>
                <ArgonButton 
                  color={sidenavColor || "warning"} 
                  variant="gradient" 
                  onClick={exportCsv}
                  sx={getExportButtonStyles(theme, sidenavColor)}
                >
                  <Icon sx={{ mr: 1 }}>file_download</Icon> Export CSV
                </ArgonButton>
              </ArgonBox>
            </ArgonBox>

            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
                <Grid container spacing={2} alignItems="center" mb={2}>
                  <Grid item xs={12} md={6}>
                    <ArgonBox mb={1}>
                      <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                        Select Company
                      </ArgonTypography>
                    </ArgonBox>
                    <Autocomplete
                      options={firmsOptions}
                      value={firmsOptions.find((o) => o.id === selectedFirmId) || null}
                      onChange={handleFirmChange}
                      renderInput={(params) => (
                        <TextField 
                          {...params} 
                          size="small"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "#fff",
                              "& fieldset": {
                                borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.23)",
                              },
                              "&:hover fieldset": {
                                borderColor: theme.palette.gradients[sidenavColor]?.main || theme.palette.warning.main,
                              },
                              "& input": {
                                color: darkMode ? "#fff" : "inherit",
                              },
                            },
                          }}
                        />
                      )}
                      sx={{
                        "& .MuiAutocomplete-popupIndicator": {
                          color: darkMode ? "#fff" : "inherit",
                        },
                        "& .MuiAutocomplete-clearIndicator": {
                          color: darkMode ? "#fff" : "inherit",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                {/* View Toggle */}
                <ArgonBox display="flex" gap={1} mt={2} mb={2}>
                  <ArgonButton
                    size="small"
                    color={view === "active" ? (sidenavColor || "warning") : "secondary"}
                    variant={view === "active" ? "gradient" : "outlined"}
                    onClick={() => { setView("active"); setPage(0); }}
                    sx={{ borderRadius: "8px" }}
                  >
                    Active Yarn
                  </ArgonButton>
                  <ArgonButton
                    size="small"
                    color={view === "history" ? (sidenavColor || "warning") : "secondary"}
                    variant={view === "history" ? "gradient" : "outlined"}
                    onClick={() => { setView("history"); setPage(0); }}
                    sx={{ borderRadius: "8px" }}
                  >
                    History
                  </ArgonButton>
                </ArgonBox>

                <div style={{ height: 480, width: "100%" }}>
                  {gridReady && (
                    <DataGrid
                      rows={paginatedRows}
                      columns={columns}
                      rowHeight={56}
                      columnHeaderHeight={52}
                      disableColumnMenu
                      disableRowSelectionOnClick
                      hideFooter
                      getRowId={(row) => row.id}
                      sx={getTableStyles(theme, darkMode, sidenavColor)}
                    />
                  )}
                </div>
                <ArgonBox 
                  mt={2.5} 
                  pt={2.5}
                  borderTop={darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e9ecef"}
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={2}
                >
                  <ArgonTypography variant="caption" color="text">
                    Showing {paginatedRows.length} of {displayRows.length} yarns ({view === "active" ? "Active" : "History"})
                  </ArgonTypography>
                  <ArgonBox display="flex" alignItems="center" gap={1}>
                    <ArgonButton
                      size="small"
                      variant={darkMode ? "outlined" : "gradient"}
                      color={sidenavColor || "warning"}
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      sx={getPaginationButtonStyles(theme, darkMode, sidenavColor)}
                    >
                      <Icon fontSize="small">chevron_left</Icon>
                    </ArgonButton>
                    <ArgonTypography 
                      variant="button" 
                      color="text" 
                      px={2}
                      sx={{
                        fontWeight: 600,
                        color: darkMode ? "#fff" : "inherit",
                      }}
                    >
                      {page + 1} / {totalPages}
                    </ArgonTypography>
                    <ArgonButton
                      size="small"
                      variant={darkMode ? "outlined" : "gradient"}
                      color={sidenavColor || "warning"}
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      sx={getPaginationButtonStyles(theme, darkMode, sidenavColor)}
                    >
                      <Icon fontSize="small">chevron_right</Icon>
                    </ArgonButton>
                  </ArgonBox>
                </ArgonBox>
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      {/* Add Yarn Modal */}
      <Dialog 
        open={openAdd} 
        onClose={closeAddDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            background: darkMode ? "#1a2332" : "#ffffff",
          }
        }}
      >
        <DialogTitle sx={{ background: darkMode ? "#1a2332" : "#ffffff" }}>
          <ArgonTypography variant="h5" color={darkMode ? "white" : "dark"}>Add Yarn</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonBox>
            <ArgonTypography variant="subtitle2" color="text">Yarn Details</ArgonTypography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Challan Date</ArgonTypography>
                <ArgonInput fullWidth type="date" value={form.challanDate} onChange={handleFormChange("challanDate")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Challan No.</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., CH-ALP-003" value={form.challanNo} onChange={handleFormChange("challanNo")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Receive Date</ArgonTypography>
                <ArgonInput fullWidth type="date" value={form.receiveDate} onChange={handleFormChange("receiveDate")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Time</ArgonTypography>
                <ArgonInput fullWidth type="time" value={form.time} onChange={handleFormChange("time")} />
              </Grid>
              <Grid item xs={12} md={8}>
                <ArgonTypography variant="caption" color="text">From (Firm)</ArgonTypography>
                <ArgonInput fullWidth placeholder="Firm name" value={form.fromFirm} onChange={handleFormChange("fromFirm")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Agent Name</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., Rohit Mehta" value={form.agentName} onChange={handleFormChange("agentName")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Manufacture</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., Shree Spinners" value={form.manufacture} onChange={handleFormChange("manufacture")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Danier</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., 30D" value={form.danier} onChange={handleFormChange("danier")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Yarn Fillment</ArgonTypography>
                <ArgonInput fullWidth placeholder="Full / Partial" value={form.yarnFillment} onChange={handleFormChange("yarnFillment")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Quality Name</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., SuperSoft" value={form.qualityName} onChange={handleFormChange("qualityName")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Select Grade</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., A" value={form.grade} onChange={handleFormChange("grade")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Select Yarn Type</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., Polyester" value={form.yarnType} onChange={handleFormChange("yarnType")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">LR No.</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., LR-99812" value={form.lrNo} onChange={handleFormChange("lrNo")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Cartoon No.</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., CT-001" value={form.cartoonNo} onChange={handleFormChange("cartoonNo")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Total Cartoon</ArgonTypography>
                <ArgonInput fullWidth type="number" placeholder="e.g., 20" value={form.totalCartoon} onChange={handleFormChange("totalCartoon")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Total Cone</ArgonTypography>
                <ArgonInput fullWidth type="number" placeholder="e.g., 600" value={form.totalCone} onChange={handleFormChange("totalCone")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Net Weight</ArgonTypography>
                <ArgonInput fullWidth type="number" placeholder="e.g., 520.5" value={form.netWeight} onChange={handleFormChange("netWeight")} />
              </Grid>

              <Grid item xs={12} md={6}>
                <ArgonTypography variant="caption" color="text">Truck No.</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., GJ-05-AB-1123" value={form.truckNo} onChange={handleFormChange("truckNo")} />
              </Grid>
            </Grid>
          </ArgonBox>
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={closeAddDialog} color="secondary" variant="outlined">
            Cancel
          </ArgonButton>
          <ArgonButton onClick={handleAddSave} color="primary" variant="gradient">
            <Icon sx={{ mr: 1 }}>save</Icon> Save
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog 
        open={openDelete} 
        onClose={closeDelete} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            background: darkMode ? "#1a2332" : "#ffffff",
          }
        }}
      >
        <DialogTitle sx={{ background: darkMode ? "#1a2332" : "#ffffff" }}>
          <ArgonTypography variant="h6" color={darkMode ? "white" : "dark"}>Delete Yarn</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete challan
            {" "}
            <strong>{rowToDelete?.challanNo}</strong>
            ? This action cannot be undone.
          </ArgonTypography>
        </DialogContent>
        <DialogActions>
          <ArgonButton variant="outlined" color="dark" onClick={closeDelete}>
            Cancel
          </ArgonButton>
          <ArgonButton color="error" variant="gradient" onClick={confirmDelete}>
            Delete
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog 
        open={openTransfer} 
        onClose={() => setOpenTransfer(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            background: darkMode ? "#1a2332" : "#ffffff",
          }
        }}
      >
        <DialogTitle sx={{ background: darkMode ? "#1a2332" : "#ffffff" }}>
          <ArgonTypography variant="h5" color={darkMode ? "white" : "dark"}>Transfer Yarn to Departments</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ background: darkMode ? "#1a2332" : "#ffffff" }}>
          {transferRow && (
            <ArgonBox mt={2}>
              <ArgonTypography variant="body2" color={darkMode ? "white" : "text"} mb={2}>
                Available Cartoons: <strong>{transferRow.totalCartoon}</strong>
              </ArgonTypography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                    Warping
                  </ArgonTypography>
                  <ArgonInput
                    type="number"
                    fullWidth
                    value={transferForm.warping}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, warping: e.target.value }))}
                    placeholder="0"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                    Twisting
                  </ArgonTypography>
                  <ArgonInput
                    type="number"
                    fullWidth
                    value={transferForm.twisting}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, twisting: e.target.value }))}
                    placeholder="0"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                    Weft
                  </ArgonTypography>
                  <ArgonInput
                    type="number"
                    fullWidth
                    value={transferForm.weft}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, weft: e.target.value }))}
                    placeholder="0"
                  />
                </Grid>
              </Grid>
            </ArgonBox>
          )}
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={() => setOpenTransfer(false)} color="secondary" variant="outlined">
            Cancel
          </ArgonButton>
          <ArgonButton onClick={handleTransferSave} color="success" variant="gradient">
            <Icon sx={{ mr: 1 }}>swap_horiz</Icon> Transfer
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Details Modal */}
      <Dialog 
        open={openDetails} 
        onClose={() => { setOpenDetails(false); setDetailsRow(null); }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            background: darkMode ? "#1a2332" : "#ffffff",
          }
        }}
      >
        <DialogTitle sx={{ background: darkMode ? "#1a2332" : "#ffffff" }}>
          <ArgonTypography variant="h5" color={darkMode ? "white" : "dark"}>Yarn Details</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          {detailsRow && (
            <ArgonBox>
              <ArgonTypography variant="subtitle2" color="text">Primary Details</ArgonTypography>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Challan Date</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.challanDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Challan No.</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.challanNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Receive Date</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.receiveDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Time</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.time}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">From (Firm)</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.fromFirm}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <ArgonBox mt={2}>
                <ArgonTypography variant="subtitle2" color="text">Additional Details</ArgonTypography>
                <Divider sx={{ my: 1 }} />
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Agent Name</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.agentName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Manufacture</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.manufacture}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Danier</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.danier}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Yarn Fillment</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.yarnFillment}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Quality Name</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.qualityName}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Select Grade</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.grade}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Select Yarn Type</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.yarnType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">LR No.</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.lrNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Cartoon No.</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.cartoonNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Total Cartoon</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.totalCartoon}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Total Cone</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.totalCone}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Net Weight</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.netWeight}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Truck No.</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.truckNo}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ArgonBox>
            </ArgonBox>
          )}
        </DialogContent>
        <DialogActions>
          <ArgonButton variant="outlined" color="dark" onClick={() => { setOpenDetails(false); setDetailsRow(null); }}>
            Close
          </ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default YarnManagement;