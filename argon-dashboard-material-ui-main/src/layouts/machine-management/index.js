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
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { machinesData } from "./data";

const initialMachines = machinesData;

function MachineManagement() {
  const [rows, setRows] = useState(initialMachines);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [openDetails, setOpenDetails] = useState(false);
  const [detailsRow, setDetailsRow] = useState(null);

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("add"); // add | edit
  const [form, setForm] = useState({
    machineNumber: "",
    efficiency: "",
    current: "",
    rpm: "",
    qualityName: "",
    greyQuality: "",
    pick: "",
    productionDay: "",
    productionMonth: "",
    dobbyType: "loom",
    reed: "",
    weftYarn: "",
    shift: "", // (ne)
    powerOnTime: "", // (ne)
    runningTime: "", // (ne)
    stopTime: "", // (ne)
    fillerTime: "", // (ne)
    machineStop: "", // (ne)
    sensorStop: "", // (ne)
    otherStop: "", // (ne)
    totalStop: "", // (ne)
    beamNo: "", // (ne)
    beamLoadingDateTime: "",
    remainingBeamMeter: "",
    motorKw: "5.5",
    minCurrent: "", // (ne)
    maxCurrent: "", // (ne)
  });
  const [editingId, setEditingId] = useState(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  useEffect(() => {
    setPage(0);
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, totalPages]);

  const dobbyOptions = ["hobby", "loom", "plain", "jacquard"];
  const motorKwOptions = ["3.7", "5.5", "7.5", "11", "15"]; // example options

  const columns = [
    { field: "machineNumber", headerName: "Machine No.", flex: 0.18, minWidth: 140 },
    { field: "efficiency", headerName: "Efficiency", flex: 0.14, minWidth: 110 },
    { field: "current", headerName: "Current", flex: 0.12, minWidth: 100 },
    { field: "rpm", headerName: "RPM", flex: 0.12, minWidth: 90 },
    { field: "qualityName", headerName: "Quality Name", flex: 0.22, minWidth: 160 },
    { field: "greyQuality", headerName: "Grey Quality", flex: 0.22, minWidth: 160 },
    { field: "pick", headerName: "Pick", flex: 0.12, minWidth: 90 },
    { field: "productionDay", headerName: "Prod (Day)", flex: 0.16, minWidth: 120 },
    { field: "productionMonth", headerName: "Prod (Month)", flex: 0.18, minWidth: 140 },
    { field: "dobbyType", headerName: "Dobby", flex: 0.12, minWidth: 100 },
    { field: "reed", headerName: "Reed", flex: 0.14, minWidth: 110 },
    { field: "weftYarn", headerName: "Weft Yarn", flex: 0.2, minWidth: 150 },
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
      machineNumber: "",
      efficiency: "",
      current: "",
      rpm: "",
      qualityName: "",
      greyQuality: "",
      pick: "",
      productionDay: "",
      productionMonth: "",
      dobbyType: "loom",
      reed: "",
      weftYarn: "",
      shift: "",
      powerOnTime: "",
      runningTime: "",
      stopTime: "",
      fillerTime: "",
      machineStop: "",
      sensorStop: "",
      otherStop: "",
      totalStop: "",
      beamNo: "",
      beamLoadingDateTime: "",
      remainingBeamMeter: "",
      motorKw: "5.5",
      minCurrent: "",
      maxCurrent: "",
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
      ["Machine No.", "machineNumber"],
      ["Efficiency", "efficiency"],
      ["Current", "current"],
      ["RPM", "rpm"],
      ["Quality Name", "qualityName"],
      ["Grey Quality", "greyQuality"],
      ["Pick", "pick"],
      ["Prod (Day)", "productionDay"],
      ["Prod (Month)", "productionMonth"],
      ["Dobby", "dobbyType"],
      ["Reed", "reed"],
      ["Weft Yarn", "weftYarn"],
      ["Shift (ne)", "shift"],
      ["Power On Time (ne)", "powerOnTime"],
      ["Running Time (ne)", "runningTime"],
      ["Stop Time (ne)", "stopTime"],
      ["Filler Time (ne)", "fillerTime"],
      ["Machine Stop (ne)", "machineStop"],
      ["Sensor Stop (ne)", "sensorStop"],
      ["Other Stop (ne)", "otherStop"],
      ["Total Stop (ne)", "totalStop"],
      ["Beam No (ne)", "beamNo"],
      ["Beam Loading DateTime", "beamLoadingDateTime"],
      ["Remaining Beam Meter", "remainingBeamMeter"],
      ["Motor (kW)", "motorKw"],
      ["Min Current (ne)", "minCurrent"],
      ["Max Current (ne)", "maxCurrent"],
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
    a.download = `machines_export.csv`;
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
              <ArgonTypography variant="h4">Machine Management</ArgonTypography>
              <ArgonBox display="flex" gap={1}>
                <ArgonButton color="primary" variant="gradient" onClick={handleAddClick}>
                  <Icon sx={{ mr: 1 }}>add</Icon> Add Machine
                </ArgonButton>
                <ArgonButton color="dark" variant="outlined" onClick={exportCsv}>
                  <Icon sx={{ mr: 1 }}>file_download</Icon> Export CSV
                </ArgonButton>
              </ArgonBox>
            </ArgonBox>
            <Card>
              <ArgonBox p={3}>
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
          <ArgonTypography variant="h5">Machine Details</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          {detailsRow && (
            <ArgonBox>
              <ArgonTypography variant="subtitle2" color="text">Operational</ArgonTypography>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Machine No.</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.machineNumber}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Efficiency</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.efficiency}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Current</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.current}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>RPM</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.rpm}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Quality Name</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.qualityName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Grey Quality</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.greyQuality}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Pick</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.pick}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Prod (Day)</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.productionDay}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Prod (Month)</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.productionMonth}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Dobby</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.dobbyType}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Reed</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.reed}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }}>Weft Yarn</TableCell>
                    <TableCell sx={{ border: 0 }}>{detailsRow.weftYarn}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <ArgonTypography variant="subtitle2" color="text" sx={{ mt: 2 }}>Counters & Beam</ArgonTypography>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableBody>
                  {[
                    ["Shift (ne)", "shift"],
                    ["Power On Time (ne)", "powerOnTime"],
                    ["Running Time (ne)", "runningTime"],
                    ["Stop Time (ne)", "stopTime"],
                    ["Filler Time (ne)", "fillerTime"],
                    ["Machine Stop (ne)", "machineStop"],
                    ["Sensor Stop (ne)", "sensorStop"],
                    ["Other Stop (ne)", "otherStop"],
                    ["Total Stop (ne)", "totalStop"],
                    ["Beam No (ne)", "beamNo"],
                    ["Beam Loading DateTime", "beamLoadingDateTime"],
                    ["Remaining Beam Meter", "remainingBeamMeter"],
                    ["Motor (kW)", "motorKw"],
                    ["Min Current (ne)", "minCurrent"],
                    ["Max Current (ne)", "maxCurrent"],
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
          <ArgonTypography variant="h5">{formMode === "add" ? "Add Machine" : "Edit Machine"}</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={4}>
              <ArgonInput value={form.machineNumber} onChange={(e) => handleFormChange("machineNumber", e.target.value)} placeholder="Machine No." label="Machine No." />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.efficiency} onChange={(e) => handleFormChange("efficiency", e.target.value)} placeholder="Efficiency" label="Efficiency" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.current} onChange={(e) => handleFormChange("current", e.target.value)} placeholder="Current" label="Current" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.rpm} onChange={(e) => handleFormChange("rpm", e.target.value)} placeholder="RPM" label="RPM" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput value={form.qualityName} onChange={(e) => handleFormChange("qualityName", e.target.value)} placeholder="Quality Name" label="Quality Name" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput value={form.greyQuality} onChange={(e) => handleFormChange("greyQuality", e.target.value)} placeholder="Grey Quality" label="Grey Quality" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.pick} onChange={(e) => handleFormChange("pick", e.target.value)} placeholder="Pick" label="Pick" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.productionDay} onChange={(e) => handleFormChange("productionDay", e.target.value)} placeholder="Production (Day)" label="Production (Day)" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput type="number" value={form.productionMonth} onChange={(e) => handleFormChange("productionMonth", e.target.value)} placeholder="Production (Month)" label="Production (Month)" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Dobby</InputLabel>
                <Select value={form.dobbyType} label="Dobby" onChange={(e) => handleFormChange("dobbyType", e.target.value)}>
                  {dobbyOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput value={form.reed} onChange={(e) => handleFormChange("reed", e.target.value)} placeholder="Reed" label="Reed" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonInput value={form.weftYarn} onChange={(e) => handleFormChange("weftYarn", e.target.value)} placeholder="Weft Yarn" label="Weft Yarn" />
            </Grid>

            {/* Non-editable fields (ne) */}
            {["shift","powerOnTime","runningTime","stopTime","fillerTime","machineStop","sensorStop","otherStop","totalStop","beamNo","minCurrent","maxCurrent"].map((key) => (
              <Grid item xs={12} sm={4} key={key}>
                <ArgonInput value={form[key]} onChange={(e) => handleFormChange(key, e.target.value)} placeholder={`${key}`} label={`${key} (ne)`} disabled />
              </Grid>
            ))}

            <Grid item xs={12} sm={6}>
              <ArgonInput value={form.beamLoadingDateTime} onChange={(e) => handleFormChange("beamLoadingDateTime", e.target.value)} placeholder="Beam Loading Date & Time" label="Beam Loading Date & Time" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonInput type="number" value={form.remainingBeamMeter} onChange={(e) => handleFormChange("remainingBeamMeter", e.target.value)} placeholder="Remaining Beam Meter" label="Remaining Beam Meter" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Motor (kW)</InputLabel>
                <Select value={form.motorKw} label="Motor (kW)" onChange={(e) => handleFormChange("motorKw", e.target.value)}>
                  {motorKwOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
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
          <ArgonTypography variant="h6">Delete Machine</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete <strong>{rowToDelete?.machineNumber}</strong>? This action cannot be undone.
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

export default MachineManagement;