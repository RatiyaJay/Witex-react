import { useMemo, useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Icon from "@mui/material/Icon";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import { productionEntryData } from "./data";
import { machinesData } from "../machine-management/data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

function ProductionEntry({ qualities }) {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [rows, setRows] = useState(productionEntryData);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState({
    pageNo: "",
    dateTime: "",
    qualityName: "",
    takaNo: "",
    totalTaka: "",
    meter: "",
    totalMeter: "",
    machineNo: "",
    tp: "",
  });

  const [lastQuality, setLastQuality] = useState("");

  useEffect(() => {
    setPage(0);
  }, []);

  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, totalPages]);

  const columns = [
    { field: "pageNo", headerName: "Page No.", width: 100, align: "center", headerAlign: "center" },
    { field: "dateTime", headerName: "Date & Time", width: 150, align: "center", headerAlign: "center" },
    { field: "qualityName", headerName: "Quality Name", flex: 1, minWidth: 150, align: "center", headerAlign: "center" },
    { field: "takaNo", headerName: "Taka No.", width: 100, type: "number", align: "center", headerAlign: "center" },
    { field: "totalTaka", headerName: "Total Taka", width: 110, type: "number", align: "center", headerAlign: "center" },
    { field: "meter", headerName: "Meter", width: 90, type: "number", align: "center", headerAlign: "center" },
    { field: "totalMeter", headerName: "Total Meter", width: 110, type: "number", align: "center", headerAlign: "center" },
    { field: "machineNo", headerName: "Machine No.", width: 120, align: "center", headerAlign: "center" },
    { field: "tp", headerName: "TP", width: 100, align: "center", headerAlign: "center" },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      filterable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <IconButton 
          title="Delete" 
          size="small" 
          color="error" 
          onClick={() => handleDelete(params.row.id)}
          sx={{
            borderRadius: "10px",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              transform: "scale(1.1)",
              backgroundColor: darkMode ? "rgba(244, 67, 54, 0.2)" : "rgba(244, 67, 54, 0.12)",
            },
          }}
        >
          <Icon fontSize="small">delete</Icon>
        </IconButton>
      ),
    },
  ];

  const handleAddClick = () => {
    const now = new Date();
    const dateTimeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const lastPageNo = rows.length > 0 ? Math.max(...rows.map(r => r.pageNo)) : 0;
    const lastTakaNo = rows.length > 0 ? Math.max(...rows.map(r => r.takaNo)) : 0;
    
    setForm({
      pageNo: lastPageNo + 1,
      dateTime: dateTimeStr,
      qualityName: lastQuality || "",
      takaNo: lastTakaNo + 1,
      totalTaka: "",
      meter: "",
      totalMeter: "",
      machineNo: "",
      tp: "",
    });
    setOpenForm(true);
  };

  const handleFormChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleFormSubmit = () => {
    const newId = rows.length ? Math.max(...rows.map(r => r.id)) + 1 : 1;
    const newRow = {
      id: newId,
      ...form,
      totalTaka: Number(form.totalTaka) || 0,
      meter: Number(form.meter) || 0,
      totalMeter: Number(form.totalMeter) || 0,
    };
    setRows([newRow, ...rows]);
    setLastQuality(form.qualityName);
    setOpenForm(false);
  };

  const handleDelete = (id) => {
    setRows(rows.filter(r => r.id !== id));
  };

  return (
    <>
      <ArgonBox display="flex" justifyContent="flex-end" mb={2}>
        <ArgonButton 
          color={sidenavColor || "warning"} 
          variant="gradient" 
          onClick={handleAddClick}
          sx={getExportButtonStyles(theme, sidenavColor)}
        >
          <Icon sx={{ mr: 1 }}>add</Icon> Add Entry
        </ArgonButton>
      </ArgonBox>

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
      >
        <ArgonTypography variant="caption" color="text">
          Showing {paginatedRows.length} of {rows.length} entries
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
          <ArgonTypography variant="button" color="text" px={2} sx={{ fontWeight: 600, color: darkMode ? "#fff" : "inherit" }}>
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

      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle>
          <ArgonTypography variant="h5" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Add Production Entry
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Page No.
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput fullWidth type="number" value={form.pageNo} onChange={(e) => handleFormChange("pageNo", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Date & Time
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput fullWidth value={form.dateTime} onChange={(e) => handleFormChange("dateTime", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Quality Name
                </ArgonTypography>
              </ArgonBox>
              <FormControl fullWidth>
                <Select value={form.qualityName} onChange={(e) => handleFormChange("qualityName", e.target.value)} displayEmpty sx={{ height: "42px" }}>
                  <MenuItem value="">Select Quality</MenuItem>
                  {qualities.map((q) => (
                    <MenuItem key={q.id} value={q.qualityName}>{q.qualityName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Taka No.
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput fullWidth type="number" value={form.takaNo} onChange={(e) => handleFormChange("takaNo", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Total Taka
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput fullWidth type="number" value={form.totalTaka} onChange={(e) => handleFormChange("totalTaka", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Meter
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput fullWidth type="number" value={form.meter} onChange={(e) => handleFormChange("meter", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Total Meter
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput fullWidth type="number" value={form.totalMeter} onChange={(e) => handleFormChange("totalMeter", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Machine No.
                </ArgonTypography>
              </ArgonBox>
              <FormControl fullWidth>
                <Select value={form.machineNo} onChange={(e) => handleFormChange("machineNo", e.target.value)} displayEmpty sx={{ height: "42px" }}>
                  <MenuItem value="">Select Machine</MenuItem>
                  {machinesData.map((m) => (
                    <MenuItem key={m.id} value={m.machineNumber}>{m.machineNumber}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  TP
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput fullWidth value={form.tp} onChange={(e) => handleFormChange("tp", e.target.value)} placeholder="e.g., TP-A1" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={() => setOpenForm(false)} color="secondary" variant="outlined" sx={{ borderRadius: "8px" }}>
            Cancel
          </ArgonButton>
          <ArgonButton onClick={handleFormSubmit} color="primary" variant="gradient" sx={{ borderRadius: "8px" }}>
            <Icon sx={{ mr: 1 }}>save</Icon> Save
          </ArgonButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

ProductionEntry.propTypes = {
  qualities: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default ProductionEntry;
