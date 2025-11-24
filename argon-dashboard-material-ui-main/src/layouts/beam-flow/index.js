import { useMemo, useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
// Removed MUI Tabs/Tab to avoid offsetHeight measurement issues in React 19
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Icon from "@mui/material/Icon";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { beamsData as initialBeams } from "./data";
import { machinesData } from "../machine-management/data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

function BeamFlow() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  const [tab, setTab] = useState("added");
  const [rows, setRows] = useState(initialBeams);
  const [gridReady, setGridReady] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10; // fixed page size per requirement
  const [openDetails, setOpenDetails] = useState(false);
  const [detailsRow, setDetailsRow] = useState(null);

  useEffect(() => {
    // Defer DataGrid mount to avoid offsetHeight access during initial mount in some environments
    setGridReady(true);
  }, []);

  const statusRows = useMemo(() => rows.filter((r) => r.status === tab), [rows, tab]);
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return statusRows;
    const matches = (val) => String(val ?? "").toLowerCase().includes(q);
    return statusRows.filter((r) =>
      matches(r.beamNo) ||
      matches(r.beamDate) ||
      matches(r.partyName) ||
      matches(r.yarnQuality) ||
      matches(r.machineNo) ||
      matches(r.lotNo) ||
      matches(r.beamLength) ||
      matches(r.pannaNo) ||
      matches(r.danier) ||
      matches(r.totalEnds) ||
      matches(r.krills) ||
      matches(r.section) ||
      matches(r.pipeNumber)
    );
  }, [statusRows, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, totalPages]);

  const allColumns = [
    { field: "beamNo", headerName: "Beam No.", width: 110, align: "center", headerAlign: "center" },
    { 
      field: "machineNo", 
      headerName: "Machine No", 
      width: 110, 
      align: "center", 
      headerAlign: "center",
      editable: tab === "added",
      type: "singleSelect",
      valueOptions: machinesData.map(m => m.machineNumber),
    },
    { field: "partyName", headerName: "Party Name", width: 150, align: "center", headerAlign: "center" },
    { field: "beamLength", headerName: "Beam Length", width: 120, type: "number", align: "center", headerAlign: "center" },
    { field: "remainingMeter", headerName: "Remaining Meter", width: 140, type: "number", align: "center", headerAlign: "center" },
    { field: "remainingPercentage", headerName: "Remaining %", width: 130, align: "center", headerAlign: "center" },
    { field: "daysToFinish", headerName: "Days To Finish", width: 130, type: "number", align: "center", headerAlign: "center" },
    { 
      field: "pick", 
      headerName: "Pick", 
      width: 90,
      align: "center",
      headerAlign: "center",
      valueGetter: (params) => {
        const machine = machinesData.find(m => m.machineNumber === params.row.machineNo);
        return machine ? machine.pick : "-";
      }
    },
    { field: "pipeNumber", headerName: "Pipe Number", width: 120, align: "center", headerAlign: "center" },
    { field: "totalEnds", headerName: "Ends", width: 100, type: "number", align: "center", headerAlign: "center" },
    { field: "pannaNo", headerName: "PANNO", width: 140, align: "center", headerAlign: "center" },
    { field: "danier", headerName: "Danier", width: 90, align: "center", headerAlign: "center" },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.9,
      minWidth: 180,
      sortable: false,
      filterable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <ArgonBox display="flex" justifyContent="flex-end" width="100%" gap={0.5}>
          <IconButton title="Details" size="small" color="info" onClick={() => { setDetailsRow(params.row); setOpenDetails(true); }}>
            <Icon fontSize="small">visibility</Icon>
          </IconButton>
          {tab === "added" && (
            <IconButton title="Start (to Running)" size="small" color="success" onClick={() => moveTo("running", params.row)}>
              <Icon fontSize="small">play_arrow</Icon>
            </IconButton>
          )}
          {tab === "running" && (
            <IconButton title="Release (to Released)" size="small" color="info" onClick={() => moveTo("released", params.row)}>
              <Icon fontSize="small">check_circle</Icon>
            </IconButton>
          )}
          <IconButton title="Delete" size="small" color="error" onClick={() => askDelete(params.row)}>
            <Icon fontSize="small">delete</Icon>
          </IconButton>
        </ArgonBox>
      ),
    },
  ];

  const columns = allColumns;

  const exportCsv = () => {
    const headers = [
      ["Beam No.", "beamNo"],
      ["Beam Date", "beamDate"],
      ["Party Name", "partyName"],
      ["Yarn Quality", "yarnQuality"],
      ["LOF No.", "lofNo"],
      ["Beam Length", "beamLength"],
      ["PANNA No.", "pannaNo"],
      ["Danier", "danier"],
      ["Total Ends", "totalEnds"],
      ["Krills", "krills"],
      ["Section", "section"],
      ["Pipe Number", "pipeNumber"],
      ["Status", "status"],
    ];
    const rowsToExport = filteredRows;
    const escape = (v) => {
      const s = String(v ?? "");
      const needsQuotes = /[,"]/.test(s) || /\n/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };
    const csv = [headers.map(([h]) => h).join(","), ...rowsToExport.map((r) => headers.map(([, key]) => escape(r[key])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `beams_export_${tab}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSearchChange = (e) => setQuery(e.target.value);

  // Reset/clamp page when filters change or row set changes
  useEffect(() => {
    setPage(0);
  }, [tab, query]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  // Add Beam modal state
  const [openAdd, setOpenAdd] = useState(false);
  const [form, setForm] = useState({
    beamNo: "",
    beamDate: "",
    partyName: "Self Product",
    isOutsourcing: false,
    yarnQuality: "",
    lotNo: "",
    beamLength: "",
    remainingMeter: "",
    remainingPercentage: "",
    daysToFinish: "",
    pannaNo: "",
    danier: "",
    totalEnds: "",
    pipeNumber: "",
    krills: "",
    section: "",
  });

  const openAddDialog = () => setOpenAdd(true);
  const closeAddDialog = () => setOpenAdd(false);
  const handleFormChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleAddSave = () => {
    const newRow = {
      id: Date.now(),
      status: "added",
      ...form,
      machineNo: "", // Machine will be selected from table
      beamLength: Number(form.beamLength || 0),
      totalEnds: Number(form.totalEnds || 0),
      krills: Number(form.krills || 0),
    };
    setRows((prev) => [newRow, ...prev]);
    setOpenAdd(false);
    setTab("added");
  };

  // Delete confirmation
  const [openDelete, setOpenDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const askDelete = (row) => { setRowToDelete(row); setOpenDelete(true); };
  const closeDelete = () => { setOpenDelete(false); setRowToDelete(null); };
  const confirmDelete = () => {
    if (rowToDelete) setRows((prev) => prev.filter((r) => r.id !== rowToDelete.id));
    closeDelete();
  };

  // Move to next status
  const moveTo = (next, row) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: next } : r)));
    setTab(next);
  };

  // Handle row updates for editable fields
  const processRowUpdate = (newRow) => {
    setRows((prev) => prev.map((r) => (r.id === newRow.id ? newRow : r)));
    return newRow;
  };

  const handleProcessRowUpdateError = (error) => {
    console.error("Error updating row:", error);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ArgonTypography variant="h4">Beam Management</ArgonTypography>
              <ArgonBox display="flex" gap={1}>
                <ArgonButton 
                  color={sidenavColor || "warning"} 
                  variant="gradient" 
                  onClick={openAddDialog}
                  sx={getExportButtonStyles(theme, sidenavColor)}
                >
                  <Icon sx={{ mr: 1 }}>add</Icon> Add Beam
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
                {/* Header controls: segmented status + search */}
                <ArgonBox display="flex" gap={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <ArgonBox display="flex" gap={1}>
                    <ArgonButton
                      size="small"
                      color={tab === "added" ? (sidenavColor || "warning") : "secondary"}
                      variant={tab === "added" ? "gradient" : "outlined"}
                      onClick={() => setTab("added")}
                      sx={{
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.03)",
                        },
                      }}
                    >
                      Added
                    </ArgonButton>
                    <ArgonButton
                      size="small"
                      color={tab === "running" ? (sidenavColor || "warning") : "secondary"}
                      variant={tab === "running" ? "gradient" : "outlined"}
                      onClick={() => setTab("running")}
                      sx={{
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.03)",
                        },
                      }}
                    >
                      Running
                    </ArgonButton>
                    <ArgonButton
                      size="small"
                      color={tab === "released" ? (sidenavColor || "warning") : "secondary"}
                      variant={tab === "released" ? "gradient" : "outlined"}
                      onClick={() => setTab("released")}
                      sx={{
                        borderRadius: "8px",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.03)",
                        },
                      }}
                    >
                      Released
                    </ArgonButton>
                  </ArgonBox>
                  <ArgonBox display="flex" alignItems="center" gap={1}>
                    <Icon color="inherit">search</Icon>
                    <ArgonInput
                      value={query}
                      onChange={handleSearchChange}
                      placeholder="Search beams…"
                      size="small"
                      sx={{ minWidth: 240 }}
                    />
                  </ArgonBox>
                </ArgonBox>

                <ArgonBox mt={2}>
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
                        processRowUpdate={processRowUpdate}
                        onProcessRowUpdateError={handleProcessRowUpdateError}
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
                      Showing {paginatedRows.length} of {filteredRows.length} beams
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
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      {/* Add Beam Modal */}
      <Dialog 
        open={openAdd} 
        onClose={closeAddDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px" }
        }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Add Beam
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonBox>
            <ArgonTypography variant="subtitle2" sx={{ color: darkMode ? "#fff" : "text.main" }}>
              Beam Details
            </ArgonTypography>
            <Divider sx={{ my: 1, borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.12)" }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Beam No.
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth placeholder="e.g., BM-004" value={form.beamNo} onChange={handleFormChange("beamNo")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Beam Date
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth type="date" value={form.beamDate} onChange={handleFormChange("beamDate")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={form.isOutsourcing} 
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm(prev => ({ 
                            ...prev, 
                            isOutsourcing: checked,
                            partyName: checked ? "" : "Self Product"
                          }));
                        }}
                        sx={{ color: darkMode ? "#fff" : "inherit" }}
                      />
                    }
                    label={
                      <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                        Outsourcing
                      </ArgonTypography>
                    }
                  />
                </ArgonBox>
                {form.isOutsourcing && (
                  <ArgonInput 
                    fullWidth 
                    placeholder="e.g., Alpha Textiles Pvt Ltd" 
                    value={form.partyName} 
                    onChange={handleFormChange("partyName")} 
                  />
                )}
                {!form.isOutsourcing && (
                  <ArgonInput 
                    fullWidth 
                    value="Self Product" 
                    disabled
                  />
                )}
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Yarn Quality
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth placeholder="e.g., SuperSoft 30D" value={form.yarnQuality} onChange={handleFormChange("yarnQuality")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    LOT No.
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth placeholder="e.g., LOT-1003" value={form.lotNo} onChange={handleFormChange("lotNo")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Beam Length
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth type="number" placeholder="e.g., 1200" value={form.beamLength} onChange={handleFormChange("beamLength")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Remaining Meter
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth type="number" placeholder="e.g., 1150" value={form.remainingMeter} onChange={handleFormChange("remainingMeter")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Remaining Percentage
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth placeholder="e.g., 95.8%" value={form.remainingPercentage} onChange={handleFormChange("remainingPercentage")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Days To Finish
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth type="number" placeholder="e.g., 3" value={form.daysToFinish} onChange={handleFormChange("daysToFinish")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    PANNO
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth placeholder="e.g., PANNA-ALP-004" value={form.pannaNo} onChange={handleFormChange("pannaNo")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Danier
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth placeholder="e.g., 30D" value={form.danier} onChange={handleFormChange("danier")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Total Ends
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth type="number" placeholder="e.g., 5000" value={form.totalEnds} onChange={handleFormChange("totalEnds")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Krills
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth type="number" placeholder="e.g., 12" value={form.krills} onChange={handleFormChange("krills")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Section
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth placeholder="e.g., A" value={form.section} onChange={handleFormChange("section")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonBox mb={1}>
                  <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                    Pipe Number
                  </ArgonTypography>
                </ArgonBox>
                <ArgonInput fullWidth placeholder="e.g., P-12" value={form.pipeNumber} onChange={handleFormChange("pipeNumber")} />
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
      <Dialog open={openDelete} onClose={closeDelete} maxWidth="xs" fullWidth>
        <DialogTitle>
          <ArgonTypography variant="h6">Delete Beam</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete beam
            {" "}
            <strong>{rowToDelete?.beamNo}</strong>
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

      {/* Details Modal */}
      <Dialog open={openDetails} onClose={() => { setOpenDetails(false); setDetailsRow(null); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <ArgonTypography variant="h5">Beam Details</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          {detailsRow && (
            <ArgonBox>
              <ArgonTypography variant="subtitle2" color="text">Primary Details</ArgonTypography>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Beam No.</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.beamNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Beam Date</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.beamDate}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Party Name</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.partyName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Yarn Quality</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.yarnQuality}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">LOF No.</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.lofNo}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Beam Length</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsRow.beamLength}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <ArgonBox mt={2}>
                <ArgonTypography variant="subtitle2" color="text">Additional Details</ArgonTypography>
                <Divider sx={{ my: 1 }} />
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">PANNA No.</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.panNo}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Danier</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.danier}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Total Ends</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.totalEnds}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Krills</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.krills}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Section</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.section}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Pipe Number</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.pipeNumber}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Status</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsRow.status}</TableCell>
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

export default BeamFlow;