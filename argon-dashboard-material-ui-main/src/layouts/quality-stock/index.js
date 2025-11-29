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

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { stockManagementData } from "../mending-hub/data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

function QualityStock() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [rows, setRows] = useState(() => stockManagementData.map((r, idx) => ({
    id: idx + 1,
    qualityName: r.qualityName,
    totalTaka: r.totalTaka,
    totalMeter: r.totalMeter,
  })));
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const [openForm, setOpenForm] = useState(false);
  const [formMode, setFormMode] = useState("add");
  const [form, setForm] = useState({
    qualityName: "",
    totalTaka: "",
    totalMeter: "",
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

  const columns = [
    { 
      field: "qualityName", 
      headerName: "Quality Name", 
      flex: 1,
      minWidth: 200,
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "totalTaka", 
      headerName: "Total Taka", 
      width: 150,
      type: "number",
      headerAlign: "center",
      align: "center"
    },
    { 
      field: "totalMeter", 
      headerName: "Total Meter", 
      width: 150,
      type: "number",
      headerAlign: "center",
      align: "center"
    },
    
  ];

  const handleAddClick = () => {};

  const handleEdit = (row) => {
    setFormMode("edit");
    setEditingId(row.id);
    setForm({ ...row });
    setOpenForm(true);
  };

  const handleFormChange = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const handleFormSubmit = () => {
    if (formMode === "add") {
      return;
    } else if (formMode === "edit") {
      setRows((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...form } : r)));
    }
    setOpenForm(false);
    setEditingId(null);
  };

  const exportCsv = () => {
    const headers = [
      ["Quality Name", "qualityName"],
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
    a.download = `quality_stock_export.csv`;
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
              <ArgonTypography variant="h4">InHouse Quality Stock</ArgonTypography>
              <ArgonBox display="flex" gap={1}>
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
                    Showing {paginatedRows.length} of {rows.length} quality stocks
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

      {/* Add/Edit Form */}
      <Dialog 
        open={openForm} 
        onClose={() => setOpenForm(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: "12px" }
        }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            {formMode === "add" ? "Add Quality Stock" : "Edit Quality Stock"}
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Quality Name
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                fullWidth
                value={form.qualityName} 
                onChange={(e) => handleFormChange("qualityName", e.target.value)} 
                placeholder="e.g., SuperSoft 30D" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Total Taka
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                fullWidth
                type="number" 
                value={form.totalTaka} 
                onChange={(e) => handleFormChange("totalTaka", e.target.value)} 
                placeholder="e.g., 15000" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ArgonBox mb={1}>
                <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                  Total Meter
                </ArgonTypography>
              </ArgonBox>
              <ArgonInput 
                fullWidth
                type="number" 
                value={form.totalMeter} 
                onChange={(e) => handleFormChange("totalMeter", e.target.value)} 
                placeholder="e.g., 1200" 
              />
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
          <ArgonTypography variant="h6" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Delete Quality Stock
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete <strong>{rowToDelete?.qualityName}</strong>? This action cannot be undone.
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
          <ArgonTypography variant="h6" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Delete Quality Stock
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete <strong>{rowToDelete?.qualityName}</strong>? This action cannot be undone.
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

export default QualityStock;
