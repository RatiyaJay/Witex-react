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

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { beamsData as initialBeams } from "./data";

function BeamFlow() {
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
      matches(r.lofNo) ||
      matches(r.beamLength) ||
      matches(r.panNo) ||
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

  const columns = [
    { field: "beamNo", headerName: "Beam No.", flex: 0.9, minWidth: 120 },
    { field: "beamDate", headerName: "Beam Date", flex: 0.9, minWidth: 130 },
    { field: "partyName", headerName: "Party Name", flex: 1.2, minWidth: 180 },
    { field: "yarnQuality", headerName: "Yarn Quality", flex: 1.1, minWidth: 160 },
    { field: "lofNo", headerName: "LOF No.", flex: 0.9, minWidth: 120 },
    { field: "beamLength", headerName: "Beam Length", flex: 0.9, minWidth: 130, type: "number" },
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

  const exportCsv = () => {
    const headers = [
      ["Beam No.", "beamNo"],
      ["Beam Date", "beamDate"],
      ["Party Name", "partyName"],
      ["Yarn Quality", "yarnQuality"],
      ["LOF No.", "lofNo"],
      ["Beam Length", "beamLength"],
      ["PAN No.", "panNo"],
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
    partyName: "",
    yarnQuality: "",
    lofNo: "",
    beamLength: "",
    panNo: "",
    danier: "",
    totalEnds: "",
    krills: "",
    section: "",
    pipeNumber: "",
  });

  const openAddDialog = () => setOpenAdd(true);
  const closeAddDialog = () => setOpenAdd(false);
  const handleFormChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleAddSave = () => {
    const newRow = {
      id: Date.now(),
      status: "added",
      ...form,
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ArgonTypography variant="h4">Beam Management</ArgonTypography>
              <ArgonBox display="flex" gap={1}>
                <ArgonButton color="primary" variant="gradient" onClick={openAddDialog}>
                  <Icon sx={{ mr: 1 }}>add</Icon> Add Beam
                </ArgonButton>
                <ArgonButton color="dark" variant="outlined" onClick={exportCsv}>
                  <Icon sx={{ mr: 1 }}>file_download</Icon> Export CSV
                </ArgonButton>
              </ArgonBox>
            </ArgonBox>

            <Card>
             <ArgonBox p={3}>
                {/* Header controls: segmented status + search */}
                <ArgonBox display="flex" gap={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
                  <ArgonBox display="flex" gap={1}>
                    <ArgonButton
                      size="small"
                      color={tab === "added" ? "primary" : "secondary"}
                      variant={tab === "added" ? "gradient" : "outlined"}
                      onClick={() => setTab("added")}
                    >
                      Added
                    </ArgonButton>
                    <ArgonButton
                      size="small"
                      color={tab === "running" ? "primary" : "secondary"}
                      variant={tab === "running" ? "gradient" : "outlined"}
                      onClick={() => setTab("running")}
                    >
                      Running
                    </ArgonButton>
                    <ArgonButton
                      size="small"
                      color={tab === "released" ? "primary" : "secondary"}
                      variant={tab === "released" ? "gradient" : "outlined"}
                      onClick={() => setTab("released")}
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
                        density="compact"
                        rows={paginatedRows}
                        columns={columns}
                        rowHeight={36}
                        headerHeight={40}
                        disableColumnMenu
                        hideFooter
                        getRowId={(row) => row.id}
                        sx={{ width: "100%" }}
                      />
                    )}
                  </div>
                  {/* Custom pagination controls */}
                  <ArgonBox mt={1} display="flex" alignItems="center" justifyContent="flex-end" gap={1}>
                    <ArgonButton
                      size="small"
                      variant="outlined"
                      color="secondary"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                      Previous
                    </ArgonButton>
                    <ArgonTypography variant="caption" color="text">
                      Page {page + 1} of {totalPages}
                    </ArgonTypography>
                    <ArgonButton
                      size="small"
                      variant="outlined"
                      color="secondary"
                      disabled={page >= totalPages - 1}
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    >
                      Next
                    </ArgonButton>
                  </ArgonBox>
                </ArgonBox>
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      {/* Add Beam Modal */}
      <Dialog open={openAdd} onClose={closeAddDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <ArgonTypography variant="h5">Add Beam</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonBox>
            <ArgonTypography variant="subtitle2" color="text">Beam Details</ArgonTypography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Beam No.</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., BM-004" value={form.beamNo} onChange={handleFormChange("beamNo")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Beam Date</ArgonTypography>
                <ArgonInput fullWidth type="date" value={form.beamDate} onChange={handleFormChange("beamDate")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Party Name</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., Alpha Textiles Pvt Ltd" value={form.partyName} onChange={handleFormChange("partyName")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Yarn Quality</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., SuperSoft 30D" value={form.yarnQuality} onChange={handleFormChange("yarnQuality")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">LOF No.</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., LOF-1003" value={form.lofNo} onChange={handleFormChange("lofNo")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Beam Length</ArgonTypography>
                <ArgonInput fullWidth type="number" placeholder="e.g., 1200" value={form.beamLength} onChange={handleFormChange("beamLength")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">PAN No.</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., PAN-ALP-004" value={form.panNo} onChange={handleFormChange("panNo")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Danier</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., 30D" value={form.danier} onChange={handleFormChange("danier")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Total Ends</ArgonTypography>
                <ArgonInput fullWidth type="number" placeholder="e.g., 5000" value={form.totalEnds} onChange={handleFormChange("totalEnds")} />
              </Grid>

              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Krills</ArgonTypography>
                <ArgonInput fullWidth type="number" placeholder="e.g., 12" value={form.krills} onChange={handleFormChange("krills")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Section</ArgonTypography>
                <ArgonInput fullWidth placeholder="e.g., A" value={form.section} onChange={handleFormChange("section")} />
              </Grid>
              <Grid item xs={12} md={4}>
                <ArgonTypography variant="caption" color="text">Pipe Number</ArgonTypography>
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
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">PAN No.</TableCell>
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