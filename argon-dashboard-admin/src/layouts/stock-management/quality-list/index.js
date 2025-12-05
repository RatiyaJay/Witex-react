import { useMemo, useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
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

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { qualityListData } from "./data";
import { qualityStockData } from "../../quality-stock/data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

function QualityList() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [rows, setRows] = useState(qualityListData);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [openDelivery, setOpenDelivery] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    qualityName: "",
    deliveryTaka: "",
    deliveryMeter: "",
  });

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
    { 
      field: "qualityName", 
      headerName: "Quality Name", 
      flex: 1,
      minWidth: 180,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "oldTaka", 
      headerName: "Old Taka", 
      width: 120,
      type: "number",
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "oldMeter", 
      headerName: "Old Meter", 
      width: 120,
      type: "number",
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "newTaka", 
      headerName: "New Taka", 
      width: 120,
      type: "number",
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "newMeter", 
      headerName: "New Meter", 
      width: 120,
      type: "number",
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "deliveredTaka", 
      headerName: "Delivered Taka", 
      width: 140,
      type: "number",
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "deliveredMeter", 
      headerName: "Delivered Meter", 
      width: 150,
      type: "number",
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "totalTaka", 
      headerName: "Total Taka", 
      width: 120,
      type: "number",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <ArgonBox fontWeight="bold" color={darkMode ? "info" : "primary"}>
          {params.value}
        </ArgonBox>
      )
    },
    { 
      field: "totalMeter", 
      headerName: "Total Meter", 
      width: 120,
      type: "number",
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <ArgonBox fontWeight="bold" color={darkMode ? "info" : "primary"}>
          {params.value}
        </ArgonBox>
      )
    },
  ];

  const handleAddDelivery = () => {
    setDeliveryForm({
      qualityName: "",
      deliveryTaka: "",
      deliveryMeter: "",
    });
    setOpenDelivery(true);
  };

  const handleDeliveryFormChange = (key, value) => {
    setDeliveryForm((f) => ({ ...f, [key]: value }));
  };

  const handleDeliverySubmit = () => {
    const { qualityName, deliveryTaka, deliveryMeter } = deliveryForm;
    const taka = Number(deliveryTaka) || 0;
    const meter = Number(deliveryMeter) || 0;

    setRows((prev) => prev.map((r) => {
      if (r.qualityName === qualityName) {
        return {
          ...r,
          deliveredTaka: r.deliveredTaka + taka,
          deliveredMeter: r.deliveredMeter + meter,
          totalTaka: r.oldTaka + r.newTaka - (r.deliveredTaka + taka),
          totalMeter: r.oldMeter + r.newMeter - (r.deliveredMeter + meter),
        };
      }
      return r;
    }));

    setOpenDelivery(false);
  };

  const exportCsv = () => {
    const headers = [
      ["Quality Name", "qualityName"],
      ["Old Taka", "oldTaka"],
      ["Old Meter", "oldMeter"],
      ["New Taka", "newTaka"],
      ["New Meter", "newMeter"],
      ["Delivered Taka", "deliveredTaka"],
      ["Delivered Meter", "deliveredMeter"],
      ["Total Taka", "totalTaka"],
      ["Total Meter", "totalMeter"],
    ];
    const escape = (v) => {
      const s = String(v ?? "");
      const needsQuotes = /[,"]/.test(s) || /\n/.test(s);
      const escaped = s.replace(/"/g, '""');
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
    a.download = `quality_list_export.csv`;
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
              <ArgonTypography variant="h4" fontWeight="bold" color={darkMode ? "white" : "dark"}>Quality List</ArgonTypography>
              <ArgonBox display="flex" gap={1}>
                <ArgonButton 
                  color={sidenavColor || "warning"} 
                  variant="gradient" 
                  onClick={handleAddDelivery}
                  sx={getExportButtonStyles(theme, sidenavColor)}
                >
                  <Icon sx={{ mr: 1 }}>local_shipping</Icon> Add Delivery
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
                    Showing {paginatedRows.length} of {rows.length} quality items
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

      {/* Add Delivery Dialog */}
      <Dialog 
        open={openDelivery} 
        onClose={() => setOpenDelivery(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px" }
        }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Add Delivery
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Select Quality
                </ArgonTypography>
              </ArgonBox>
              <FormControl fullWidth>
                <Select 
                  value={deliveryForm.qualityName} 
                  onChange={(e) => handleDeliveryFormChange("qualityName", e.target.value)}
                  displayEmpty
                  sx={{ height: "42px" }}
                >
                  <MenuItem value="">Select Quality</MenuItem>
                  {qualityStockData.map((quality) => (
                    <MenuItem key={quality.id} value={quality.qualityName}>
                      {quality.qualityName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Delivery Taka
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                fullWidth
                type="number" 
                value={deliveryForm.deliveryTaka} 
                onChange={(e) => handleDeliveryFormChange("deliveryTaka", e.target.value)} 
                placeholder="e.g., 1000" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Delivery Meter
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                fullWidth
                type="number" 
                value={deliveryForm.deliveryMeter} 
                onChange={(e) => handleDeliveryFormChange("deliveryMeter", e.target.value)} 
                placeholder="e.g., 80" 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <ArgonButton 
            onClick={() => setOpenDelivery(false)} 
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
            onClick={handleDeliverySubmit} 
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
            <Icon sx={{ mr: 1 }}>save</Icon> Add Delivery
          </ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default QualityList;
