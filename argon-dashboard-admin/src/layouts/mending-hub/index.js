import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Icon from "@mui/material/Icon";
import { useTheme } from "@mui/material/styles";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import ProductionEntry from "./production-entry";
import StockManagement from "./stock-management";

import { qualityListData } from "./data";
import { useArgonController } from "context";
import { getCardStyles, getExportButtonStyles } from "utils/tableStyles";

function MendingHub() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [tab, setTab] = useState("production");
  const [qualities, setQualities] = useState(qualityListData);
  const [openQualityManager, setOpenQualityManager] = useState(false);
  const [openAddQuality, setOpenAddQuality] = useState(false);
  const [openEditQuality, setOpenEditQuality] = useState(false);
  const [openDeleteQuality, setOpenDeleteQuality] = useState(false);
  const [newQualityName, setNewQualityName] = useState("");
  const [editingQuality, setEditingQuality] = useState(null);
  const [deletingQuality, setDeletingQuality] = useState(null);

  const handleAddQuality = () => {
    if (newQualityName.trim()) {
      const newId = qualities.length ? Math.max(...qualities.map(q => q.id)) + 1 : 1;
      setQualities([...qualities, { id: newId, qualityName: newQualityName.trim() }]);
      setNewQualityName("");
      setOpenAddQuality(false);
    }
  };

  const handleEditQuality = () => {
    if (editingQuality && newQualityName.trim()) {
      setQualities(qualities.map(q => 
        q.id === editingQuality.id ? { ...q, qualityName: newQualityName.trim() } : q
      ));
      setNewQualityName("");
      setEditingQuality(null);
      setOpenEditQuality(false);
    }
  };

  const handleDeleteQuality = () => {
    if (deletingQuality) {
      setQualities(qualities.filter(q => q.id !== deletingQuality.id));
      setDeletingQuality(null);
      setOpenDeleteQuality(false);
    }
  };

  const openEditDialog = (quality) => {
    setEditingQuality(quality);
    setNewQualityName(quality.qualityName);
    setOpenEditQuality(true);
  };

  const openDeleteDialog = (quality) => {
    setDeletingQuality(quality);
    setOpenDeleteQuality(true);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ArgonTypography variant="h4">Mending Hub</ArgonTypography>
              <ArgonButton 
                color={sidenavColor || "warning"} 
                variant="gradient" 
                onClick={() => setOpenQualityManager(true)}
                sx={getExportButtonStyles(theme, sidenavColor)}
              >
                <Icon sx={{ mr: 1 }}>category</Icon> Manage Qualities
              </ArgonButton>
            </ArgonBox>

            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
                <ArgonBox display="flex" gap={1} mb={2}>
                  <ArgonButton
                    size="small"
                    color={tab === "production" ? (sidenavColor || "warning") : "secondary"}
                    variant={tab === "production" ? "gradient" : "outlined"}
                    onClick={() => setTab("production")}
                    sx={{
                      borderRadius: "8px",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                  >
                    Production Entry
                  </ArgonButton>
                  <ArgonButton
                    size="small"
                    color={tab === "stock" ? (sidenavColor || "warning") : "secondary"}
                    variant={tab === "stock" ? "gradient" : "outlined"}
                    onClick={() => setTab("stock")}
                    sx={{
                      borderRadius: "8px",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": { transform: "scale(1.03)" },
                    }}
                  >
                    Stock Management
                  </ArgonButton>
                </ArgonBox>

                {tab === "production" && <ProductionEntry qualities={qualities} />}
                {tab === "stock" && <StockManagement qualities={qualities} />}
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      {/* Quality Manager Dialog */}
      <Dialog 
        open={openQualityManager} 
        onClose={() => setOpenQualityManager(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle>
          <ArgonBox display="flex" justifyContent="space-between" alignItems="center">
            <ArgonTypography variant="h5" sx={{ color: darkMode ? "#fff" : "inherit" }}>
              Quality Management
            </ArgonTypography>
            <ArgonButton 
              size="small"
              color="success" 
              variant="gradient"
              onClick={() => setOpenAddQuality(true)}
              sx={{ borderRadius: "8px" }}
            >
              <Icon sx={{ mr: 1 }}>add</Icon> Add New
            </ArgonButton>
          </ArgonBox>
        </DialogTitle>
        <DialogContent>
          <ArgonBox mt={1}>
            <ArgonTypography variant="caption" color="text" mb={2}>
              Total Qualities: {qualities.length}
            </ArgonTypography>
            <ArgonBox mt={2}>
              {qualities.length === 0 ? (
                <ArgonTypography variant="body2" color="text" textAlign="center" py={3}>
                  No qualities added yet. Click &quot;Add New&quot; to create one.
                </ArgonTypography>
              ) : (
                qualities.map((quality) => (
                  <ArgonBox 
                    key={quality.id}
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="center"
                    p={1.5}
                    mb={1}
                    borderRadius="8px"
                    sx={{
                      background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                      }
                    }}
                  >
                    <ArgonTypography variant="body2" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
                      {quality.qualityName}
                    </ArgonTypography>
                    <ArgonBox display="flex" gap={1}>
                      <ArgonButton
                        size="small"
                        color="info"
                        variant="outlined"
                        onClick={() => openEditDialog(quality)}
                        sx={{ 
                          borderRadius: "6px",
                          minWidth: "auto",
                          px: 1.5,
                        }}
                      >
                        <Icon fontSize="small">edit</Icon>
                      </ArgonButton>
                      <ArgonButton
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => openDeleteDialog(quality)}
                        sx={{ 
                          borderRadius: "6px",
                          minWidth: "auto",
                          px: 1.5,
                        }}
                      >
                        <Icon fontSize="small">delete</Icon>
                      </ArgonButton>
                    </ArgonBox>
                  </ArgonBox>
                ))
              )}
            </ArgonBox>
          </ArgonBox>
        </DialogContent>
        <DialogActions>
          <ArgonButton 
            onClick={() => setOpenQualityManager(false)} 
            color="secondary" 
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Close
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Add Quality Dialog */}
      <Dialog 
        open={openAddQuality} 
        onClose={() => { setOpenAddQuality(false); setNewQualityName(""); }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Add Quality
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonBox mt={2}>
            <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
              Quality Name
            </ArgonTypography>
            <ArgonInput 
              fullWidth
              value={newQualityName} 
              onChange={(e) => setNewQualityName(e.target.value)} 
              placeholder="e.g., SuperSoft 30D" 
              sx={{ mt: 1 }}
            />
          </ArgonBox>
        </DialogContent>
        <DialogActions>
          <ArgonButton 
            onClick={() => { setOpenAddQuality(false); setNewQualityName(""); }} 
            color="secondary" 
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Cancel
          </ArgonButton>
          <ArgonButton 
            onClick={handleAddQuality} 
            color="primary" 
            variant="gradient"
            sx={{ borderRadius: "8px" }}
          >
            <Icon sx={{ mr: 1 }}>save</Icon> Add
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Edit Quality Dialog */}
      <Dialog 
        open={openEditQuality} 
        onClose={() => { setOpenEditQuality(false); setNewQualityName(""); setEditingQuality(null); }} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Edit Quality
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonBox mt={2}>
            <ArgonTypography variant="caption" fontWeight="bold" sx={{ color: darkMode ? "#fff" : "inherit" }}>
              Quality Name
            </ArgonTypography>
            <ArgonInput 
              fullWidth
              value={newQualityName} 
              onChange={(e) => setNewQualityName(e.target.value)} 
              placeholder="e.g., SuperSoft 30D" 
              sx={{ mt: 1 }}
            />
          </ArgonBox>
        </DialogContent>
        <DialogActions>
          <ArgonButton 
            onClick={() => { setOpenEditQuality(false); setNewQualityName(""); setEditingQuality(null); }} 
            color="secondary" 
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Cancel
          </ArgonButton>
          <ArgonButton 
            onClick={handleEditQuality} 
            color="primary" 
            variant="gradient"
            sx={{ borderRadius: "8px" }}
          >
            <Icon sx={{ mr: 1 }}>save</Icon> Update
          </ArgonButton>
        </DialogActions>
      </Dialog>

      {/* Delete Quality Confirmation */}
      <Dialog 
        open={openDeleteQuality} 
        onClose={() => { setOpenDeleteQuality(false); setDeletingQuality(null); }} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle>
          <ArgonTypography variant="h6" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Delete Quality
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete <strong>{deletingQuality?.qualityName}</strong>? This action cannot be undone.
          </ArgonTypography>
        </DialogContent>
        <DialogActions>
          <ArgonButton 
            onClick={() => { setOpenDeleteQuality(false); setDeletingQuality(null); }} 
            color="secondary" 
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Cancel
          </ArgonButton>
          <ArgonButton 
            onClick={handleDeleteQuality} 
            color="error" 
            variant="gradient"
            sx={{ borderRadius: "8px" }}
          >
            <Icon sx={{ mr: 1 }}>delete</Icon> Delete
          </ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default MendingHub;
