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
import { useTheme } from "@mui/material/styles";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { machinesData } from "./data";
import { beamsData } from "../beam-flow/data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getActionButtonStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

const initialMachines = machinesData;

function MachineManagement() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
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
    productionShift: "",
    productionDay: "",
    productionMonth: "",
    dobbyType: "loom",
    reed: "",
    weftYarn: "",
    shiftType: "Day",
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
    causeOfError: "None",
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
  const motorKwOptions = ["3.7", "5.5", "7.5", "11", "15"];
  const shiftOptions = ["Day", "Night"];
  const causeOfErrorOptions = ["None", "Mechanical", "Electrical", "Weft Yarn"];

  const columns = [
    { 
      field: "machineNumber", 
      headerName: "Machine No.", 
      width: 120,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "efficiency", 
      headerName: "Efficiency", 
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => `${params.value}%`
    },
    { 
      field: "current", 
      headerName: "Current", 
      width: 90,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "rpm", 
      headerName: "RPM", 
      width: 80,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "qualityName", 
      headerName: "Quality Name", 
      width: 140
    },
    { 
      field: "greyQuality", 
      headerName: "Grey Quality", 
      width: 120
    },
    { 
      field: "pick", 
      headerName: "Pick", 
      width: 80,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "productionShift", 
      headerName: "Prod (Shift)", 
      width: 110,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "productionDay", 
      headerName: "Prod (Day)", 
      width: 110,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "beamNo", 
      headerName: "Beam No.", 
      width: 110,
      headerAlign: "center",
      align: "center",
      valueGetter: (params) => {
        const beam = beamsData.find(b => b.machineNo === params.row.machineNumber && b.status === "running");
        return beam ? beam.beamNo : "-";
      }
    },
    { 
      field: "partyName", 
      headerName: "Party Name", 
      width: 150,
      headerAlign: "center",
      align: "center",
      valueGetter: (params) => {
        const beam = beamsData.find(b => b.machineNo === params.row.machineNumber && b.status === "running");
        return beam ? beam.partyName : "-";
      }
    },
    { 
      field: "beamLength", 
      headerName: "Beam Length", 
      width: 120,
      headerAlign: "center",
      align: "center",
      valueGetter: (params) => {
        const beam = beamsData.find(b => b.machineNo === params.row.machineNumber && b.status === "running");
        return beam ? beam.beamLength : "-";
      }
    },
    { 
      field: "pipeNumber", 
      headerName: "Pipe Number", 
      width: 120,
      headerAlign: "center",
      align: "center",
      valueGetter: (params) => {
        const beam = beamsData.find(b => b.machineNo === params.row.machineNumber && b.status === "running");
        return beam ? beam.pipeNumber : "-";
      }
    },
    { 
      field: "krills", 
      headerName: "Krills", 
      width: 90,
      headerAlign: "center",
      align: "center",
      valueGetter: (params) => {
        const beam = beamsData.find(b => b.machineNo === params.row.machineNumber && b.status === "running");
        return beam ? beam.krills : "-";
      }
    },
    { 
      field: "minCurrent", 
      headerName: "Min Current", 
      width: 110,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "maxCurrent", 
      headerName: "Max Current", 
      width: 110,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "dobbyType", 
      headerName: "Dobby", 
      width: 100,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "reed", 
      headerName: "Reed", 
      width: 90,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "shiftType", 
      headerName: "Shift", 
      width: 90,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "causeOfError", 
      headerName: "Cause of Error", 
      width: 130,
      headerAlign: "center",
      align: "center"
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonBox display="flex" justifyContent="center" width="100%" gap={0.5}>
          <IconButton 
            title="View Details" 
            size="small" 
            color="info" 
            onClick={() => handleShowDetails(params.row)}
            sx={{
              borderRadius: "10px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.1)",
                backgroundColor: darkMode ? "rgba(33, 150, 243, 0.2)" : "rgba(33, 150, 243, 0.12)",
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.4)",
              },
            }}
          >
            <Icon fontSize="small">visibility</Icon>
          </IconButton>
          <IconButton 
            title="Edit" 
            size="small" 
            onClick={() => handleEdit(params.row)}
            sx={{
              borderRadius: "10px",
              transition: "all 0.2s ease-in-out",
              color: theme.palette.gradients[sidenavColor]?.main || theme.palette.success.main,
              "&:hover": {
                transform: "scale(1.1)",
                backgroundColor: darkMode 
                  ? `${theme.palette.gradients[sidenavColor]?.main || theme.palette.success.main}30`
                  : `${theme.palette.gradients[sidenavColor]?.main || theme.palette.success.main}20`,
                boxShadow: `0 4px 12px ${theme.palette.gradients[sidenavColor]?.main || theme.palette.success.main}50`,
              },
            }}
          >
            <Icon fontSize="small">edit</Icon>
          </IconButton>
          <IconButton 
            title="Delete" 
            size="small" 
            color="error" 
            onClick={() => handleDeleteClick(params.row)}
            sx={{
              borderRadius: "10px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.1)",
                backgroundColor: darkMode ? "rgba(244, 67, 54, 0.2)" : "rgba(244, 67, 54, 0.12)",
                boxShadow: "0 4px 12px rgba(244, 67, 54, 0.4)",
              },
            }}
          >
            <Icon fontSize="small">delete</Icon>
          </IconButton>
        </ArgonBox>
      ),
    },
  ];

  const handleAddClick = () => {
    setFormMode("add");
    setEditingId(null);
    
    // Auto-generate next machine number in format MC001, MC002, etc.
    const existingMachineNumbers = rows
      .map(r => r.machineNumber)
      .filter(num => /^MC\d+$/.test(num))
      .map(num => parseInt(num.replace('MC', ''), 10))
      .filter(num => !isNaN(num));
    
    const nextNumber = existingMachineNumbers.length > 0 
      ? Math.max(...existingMachineNumbers) + 1 
      : 1;
    
    const nextMachineNumber = `MC${String(nextNumber).padStart(3, '0')}`;
    
    setForm({
      machineNumber: nextMachineNumber,
      efficiency: "",
      current: "",
      rpm: "",
      qualityName: "",
      greyQuality: "",
      pick: "",
      productionShift: "",
      productionDay: "",
      productionMonth: "",
      dobbyType: "loom",
      reed: "",
      weftYarn: "",
      shiftType: "Day",
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
      causeOfError: "None",
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
              <ArgonButton 
                color={sidenavColor || "warning"}
                variant="gradient" 
                onClick={exportCsv}
                sx={getExportButtonStyles(theme, sidenavColor)}
              >
                <Icon sx={{ mr: 1 }}>file_download</Icon> Export CSV
              </ArgonButton>
            </ArgonBox>
            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
                <div style={{ height: 480, width: "100%" }}>
                  <DataGrid
                    rows={paginatedRows}
                    columns={columns}
                    disableColumnMenu
                    disableRowSelectionOnClick
                    hideFooter
                    getRowId={(row) => row.id}
                    rowHeight={56}
                    columnHeaderHeight={52}
                    sx={getTableStyles(theme, darkMode, sidenavColor)}
                  />
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
                    Showing {paginatedRows.length} of {rows.length} machines
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

      {/* Details Modal */}
      <Dialog 
        open={openDetails} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px" }
        }}
      >
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
          <ArgonButton 
            onClick={handleCloseDetails} 
            color="secondary" 
            variant="outlined"
            sx={{
              borderRadius: "8px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            Close
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Add/Edit Form */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px" }
        }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5">{formMode === "add" ? "Add Machine" : "Edit Machine"}</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Machine No.
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                value={form.machineNumber} 
                onChange={(e) => handleFormChange("machineNumber", e.target.value)} 
                placeholder="MC001" 
                disabled={formMode === "add"}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Efficiency (%)
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.efficiency} 
                onChange={(e) => handleFormChange("efficiency", e.target.value)} 
                placeholder="92.5" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Current
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.current} 
                onChange={(e) => handleFormChange("current", e.target.value)} 
                placeholder="12.3" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  RPM (Auto)
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.rpm} 
                onChange={(e) => handleFormChange("rpm", e.target.value)} 
                placeholder="180" 
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Quality Name
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                value={form.qualityName} 
                onChange={(e) => handleFormChange("qualityName", e.target.value)} 
                placeholder="SuperSoft" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Grey Quality
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                value={form.greyQuality} 
                onChange={(e) => handleFormChange("greyQuality", e.target.value)} 
                placeholder="GS-30D" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Pick (Auto)
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.pick} 
                onChange={(e) => handleFormChange("pick", e.target.value)} 
                placeholder="28" 
                disabled
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Production (Shift)
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.productionShift} 
                onChange={(e) => handleFormChange("productionShift", e.target.value)} 
                placeholder="180" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Production (Day)
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.productionDay} 
                onChange={(e) => handleFormChange("productionDay", e.target.value)} 
                placeholder="520.4" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Dobby Type
                </ArgonTypography>
              </ArgonBox>
              <FormControl fullWidth>
                <Select 
                  value={form.dobbyType} 
                  onChange={(e) => handleFormChange("dobbyType", e.target.value)}
                  sx={{ height: "42px" }}
                >
                  {dobbyOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Reed
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                value={form.reed} 
                onChange={(e) => handleFormChange("reed", e.target.value)} 
                placeholder="60/2" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Weft Yarn
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                value={form.weftYarn} 
                onChange={(e) => handleFormChange("weftYarn", e.target.value)} 
                placeholder="Polyester 30D" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Shift
                </ArgonTypography>
              </ArgonBox>
              <FormControl fullWidth>
                <Select 
                  value={form.shiftType} 
                  onChange={(e) => handleFormChange("shiftType", e.target.value)}
                  sx={{ height: "42px" }}
                >
                  {shiftOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Beam Loading Date & Time
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                value={form.beamLoadingDateTime} 
                onChange={(e) => handleFormChange("beamLoadingDateTime", e.target.value)} 
                placeholder="2025-02-05 09:20" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Remaining Beam Meter
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.remainingBeamMeter} 
                onChange={(e) => handleFormChange("remainingBeamMeter", e.target.value)} 
                placeholder="420.5" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Motor (kW)
                </ArgonTypography>
              </ArgonBox>
              <FormControl fullWidth>
                <Select 
                  value={form.motorKw} 
                  onChange={(e) => handleFormChange("motorKw", e.target.value)}
                  sx={{ height: "42px" }}
                >
                  {motorKwOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Min Current
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.minCurrent} 
                onChange={(e) => handleFormChange("minCurrent", e.target.value)} 
                placeholder="9.8" 
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Max Current
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                type="number" 
                value={form.maxCurrent} 
                onChange={(e) => handleFormChange("maxCurrent", e.target.value)} 
                placeholder="14.2" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" color="text">
                  Cause of Error
                </ArgonTypography>
              </ArgonBox>
              <FormControl fullWidth>
                <Select 
                  value={form.causeOfError || "None"} 
                  onChange={(e) => handleFormChange("causeOfError", e.target.value)}
                  displayEmpty
                  sx={{ height: "42px" }}
                >
                  {causeOfErrorOptions.map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <ArgonButton 
            onClick={() => setOpenForm(false)} 
            color="secondary" 
            variant="outlined"
            sx={{
              borderRadius: "8px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            Cancel
          </ArgonButton>
          <ArgonButton 
            onClick={handleFormSubmit} 
            color="primary" 
            variant="gradient"
            sx={{
              borderRadius: "8px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
              },
            }}
          >
            <Icon sx={{ mr: 1 }}>save</Icon> Save
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog 
        open={openDelete} 
        onClose={() => setOpenDelete(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px" }
        }}
      >
        <DialogTitle>
          <ArgonTypography variant="h6">Delete Machine</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete <strong>{rowToDelete?.machineNumber}</strong>? This action cannot be undone.
          </ArgonTypography>
        </DialogContent>
        <DialogActions>
          <ArgonButton 
            variant="outlined" 
            color="dark" 
            onClick={() => setOpenDelete(false)}
            sx={{
              borderRadius: "8px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              },
            }}
          >
            Cancel
          </ArgonButton>
          <ArgonButton 
            color="error" 
            variant="gradient" 
            onClick={handleDeleteConfirm}
            sx={{
              borderRadius: "8px",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                transform: "scale(1.03)",
                boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
              },
            }}
          >
            Delete
          </ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default MachineManagement;