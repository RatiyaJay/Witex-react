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
  const [openAddQuality, setOpenAddQuality] = useState(false);
  const [newQualityName, setNewQualityName] = useState("");

  const handleAddQuality = () => {
    if (newQualityName.trim()) {
      const newId = qualities.length ? Math.max(...qualities.map(q => q.id)) + 1 : 1;
      setQualities([...qualities, { id: newId, qualityName: newQualityName.trim() }]);
      setNewQualityName("");
      setOpenAddQuality(false);
    }
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
                onClick={() => setOpenAddQuality(true)}
                sx={getExportButtonStyles(theme, sidenavColor)}
              >
                <Icon sx={{ mr: 1 }}>add</Icon> Add Quality
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

      <Dialog 
        open={openAddQuality} 
        onClose={() => setOpenAddQuality(false)} 
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
            onClick={() => setOpenAddQuality(false)} 
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

      <Footer />
    </DashboardLayout>
  );
}

export default MendingHub;
