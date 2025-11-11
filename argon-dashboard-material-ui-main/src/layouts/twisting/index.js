import { useMemo, useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { DataGrid } from "@mui/x-data-grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TextField from "@mui/material/TextField";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { twistingData } from "./data";

const initialTwisting = twistingData;

function Twisting() {
  const [rows, setRows] = useState(initialTwisting);
  const [gridReady, setGridReady] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [openDetails, setOpenDetails] = useState(false);
  const [detailsRow, setDetailsRow] = useState(null);

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [form, setForm] = useState({
    date: "",
    tpmNo: "",
    temperature: "",
    durationMinutes: "",
    sRoll: "",
    zRoll: "",
    yarnWeight: "",
    qualityName: "",
    density: "",
  });
  const [editingId, setEditingId] = useState(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  useEffect(() => {
    // Defer DataGrid mount to avoid offsetHeight access during initial mount in some environments
    setGridReady(true);
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, totalPages]);

  const columns = [
    { field: "date", headerName: "Date", flex: 0.18, minWidth: 140 },
    { field: "tpmNo", headerName: "TPM No", flex: 0.16, minWidth: 120 },
    { field: "temperature", headerName: "Temperature (°C)", flex: 0.18, minWidth: 140 },
    { field: "durationMinutes", headerName: "Duration (min)", flex: 0.18, minWidth: 140 },
    { field: "sRoll", headerName: "S-Roll", flex: 0.14, minWidth: 110 },
    { field: "zRoll", headerName: "Z-Roll", flex: 0.14, minWidth: 110 },
    { field: "yarnWeight", headerName: "Yarn Weight (kg)", flex: 0.2, minWidth: 160 },
    { field: "qualityName", headerName: "Quality Name", flex: 0.22, minWidth: 160 },
    { field: "density", headerName: "Density", flex: 0.16, minWidth: 120 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.16,
      minWidth: 160,
      sortable: false,
      filterable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <ArgonBox display="flex" justifyContent="flex-end" width="100%" gap={0.5}>
          <IconButton title="Details" size="small" color="info" onClick={() => handleShowDetails(params.row)}>
            <Icon fontSize="small">visibility</Icon>
          </IconButton>
          <IconButton title="Edit" size="small" color="primary" onClick={() => handleEdit(params.row)}>
            <Icon fontSize="small">edit</Icon>
          </IconButton>
          <IconButton title="Delete" size="small" color="error" onClick={() => handleDeleteClick(params.row)}>
            <Icon fontSize="small">delete</Icon>
          </IconButton>
        </ArgonBox>
      ),
    },
  ];

  const handleAddClick = () => {
    setFormMode("add");
    setEditingId(null);
    setForm({
      date: "",
      tpmNo: "",
      temperature: "",
      durationMinutes: "",
      sRoll: "",
      zRoll: "",
      yarnWeight: "",
      qualityName: "",
      density: "",
    });
    setOpenForm(true);
  };

  const handleEdit = (row) => {
    setFormMode("edit");
    setEditingId(row.id);
    setForm({ ...row });
    setOpenForm(true);
  };

  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setOpenDelete(true);
  };

  const handleDeleteConfirm = () => {
    if (rowToDelete) {
      setRows((prev) => prev.filter((r) => r.id !== rowToDelete.id));
    }
    setOpenDelete(false);
    setRowToDelete(null);
  };

  const handleShowDetails = (row) => {
    setDetailsRow(row);
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
    setDetailsRow(null);
  };

  const handleFormChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleFormSubmit = () => {
    if (formMode === "add") {
      const newId = rows.length ? Math.max(...rows.map((r) => Number(r.id))) + 1 : 1;
      setRows((prev) => [{ id: newId, ...form }, ...prev]);
    } else if (formMode === "edit") {
      setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...form } : r)));
    }
    setOpenForm(false);
    setEditingId(null);
  };

  const exportCsv = () => {
    const headers = [
      ["Date", "date"],
      ["TPM No", "tpmNo"],
      ["Temperature (°C)", "temperature"],
      ["Duration (min)", "durationMinutes"],
      ["S-Roll", "sRoll"],
      ["Z-Roll", "zRoll"],
      ["Yarn Weight (kg)", "yarnWeight"],
      ["Quality Name", "qualityName"],
      ["Density", "density"],
    ];
    const escape = (v) => {
      const s = String(v ?? "");
      const needsQuotes = /[,\"]/ .test(s) || /\n/.test(s);
      const escaped = s.replace(/\"/g, '\"\"');
      return needsQuotes ? `"${escaped}"` : escaped;
    };
    const csv = [
      headers.map(([h]) => h).join(","),
      ...rows.map((r) => headers.map(([, key]) => escape(r[key])).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `twisting_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ArgonTypography variant="h4">Twisting</ArgonTypography>
              <ArgonBox display="flex" gap={1}>
                <ArgonButton color="primary" variant="gradient" onClick={handleAddClick}>
                  <Icon sx={{ mr: 1 }}>add</Icon> Add Record
                </ArgonButton>
                <ArgonButton color="dark" variant="outlined" onClick={exportCsv}>
                  <Icon sx={{ mr: 1 }}>file_download</Icon> Export CSV
                </ArgonButton>
              </ArgonBox>
            </ArgonBox>
            <Card>
              <ArgonBox p={3}>
                {gridReady && (
                  <div style={{ height: 520, width: "100%" }}>
                    <DataGrid
                      density="compact"
                      rows={paginatedRows}
                      columns={columns}
                      disableColumnMenu
                      hideFooter
                      getRowId={(row) => row.id}
                      rowHeight={36}
                      headerHeight={40}
                      sx={{ width: "100%" }}
                    />
                  </div>
                )}
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
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      {/* Details Modal */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="md" fullWidth>
        <DialogTitle>
          <ArgonTypography variant="h5">Twisting Details</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          {detailsRow && (
            <ArgonBox>
              <ArgonTypography variant="subtitle2" color="text">Record</ArgonTypography>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableBody>
                  {[
                    ["Date", "date"],
                    ["TPM No", "tpmNo"],
                    ["Temperature (°C)", "temperature"],
                    ["Duration (min)", "durationMinutes"],
                    ["S-Roll", "sRoll"],
                    ["Z-Roll", "zRoll"],
                    ["Yarn Weight (kg)", "yarnWeight"],
                    ["Quality Name", "qualityName"],
                    ["Density", "density"],
                  ].map(([label, key]) => (
                    <TableRow key={key}>
                      <TableCell sx={{ fontWeight: 600, border: 0 }}>{label}</TableCell>
                      <TableCell sx={{ border: 0 }}>{detailsRow[key]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ArgonBox>
          )}
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={handleCloseDetails} color="secondary" variant="outlined">
            Close
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Form */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <ArgonTypography variant="h5">{formMode === "add" ? "Add Record" : "Edit Record"}</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={4}>
              <TextField type="date" value={form.date} onChange={(e) => handleFormChange("date", e.target.value)} label="Date" fullWidth InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput value={form.tpmNo} onChange={(e) => handleFormChange("tpmNo", e.target.value)} placeholder="TPM No" label="TPM No" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.temperature} onChange={(e) => handleFormChange("temperature", e.target.value)} placeholder="Temperature (°C)" label="Temperature (°C)" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.durationMinutes} onChange={(e) => handleFormChange("durationMinutes", e.target.value)} placeholder="Duration (min)" label="Duration (min)" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.sRoll} onChange={(e) => handleFormChange("sRoll", e.target.value)} placeholder="S-Roll" label="S-Roll" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.zRoll} onChange={(e) => handleFormChange("zRoll", e.target.value)} placeholder="Z-Roll" label="Z-Roll" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.yarnWeight} onChange={(e) => handleFormChange("yarnWeight", e.target.value)} placeholder="Yarn Weight (kg)" label="Yarn Weight (kg)" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput value={form.qualityName} onChange={(e) => handleFormChange("qualityName", e.target.value)} placeholder="Quality Name" label="Quality Name" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.density} onChange={(e) => handleFormChange("density", e.target.value)} placeholder="Density" label="Density" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={() => setOpenForm(false)} color="secondary" variant="outlined">
            Cancel
          </ArgonButton>
          <ArgonButton onClick={handleFormSubmit} color="primary" variant="gradient">
            <Icon sx={{ mr: 1 }}>save</Icon> Save
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} maxWidth="xs" fullWidth>
        <DialogTitle>
          <ArgonTypography variant="h6">Delete Record</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete <strong>{rowToDelete?.tpmNo}</strong>? This action cannot be undone.
          </ArgonTypography>
        </DialogContent>
        <DialogActions>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenDelete(false)}>
            Cancel
          </ArgonButton>
          <ArgonButton color="error" variant="gradient" onClick={handleDeleteConfirm}>
            Delete
          </ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default Twisting;