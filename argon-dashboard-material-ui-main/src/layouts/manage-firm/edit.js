import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";
import { firmsData } from "./data";

export default function EditFirm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const firm = useMemo(() => {
    if (id) {
      const found = firmsData.find((f) => String(f.id) === String(id));
      return found || null;
    }
    return null;
  }, [id]);

  const form = useMemo(() => {
    return (
      firm || {
        companyName: "",
        accountYear: "",
        gstin: "",
        website: "",
        address1: "",
        address2: "",
        address3: "",
        state: "",
        city: "",
        pincode: "",
        phone: "",
      }
    );
  }, [firm]);

  const pageTitle = firm ? "Edit Firm" : "Add Firm";

  const handleCancel = () => navigate("/manage-firm");
  const handleSave = () => {
    // Static UI phase: no persistence. Navigate back.
    navigate("/manage-firm");
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ArgonTypography variant="h4">{pageTitle}</ArgonTypography>
              <ArgonButton color="secondary" variant="outlined" onClick={handleCancel}>
                <Icon sx={{ mr: 1 }}>arrow_back</Icon> Back to List
              </ArgonButton>
            </ArgonBox>
            <Card>
              <ArgonBox p={3}>
                <ArgonTypography variant="subtitle2" color="text">Primary Details</ArgonTypography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ArgonTypography variant="caption" color="text">Company Name</ArgonTypography>
                    <ArgonInput fullWidth placeholder="e.g., Alpha Textiles Pvt Ltd" defaultValue={form.companyName} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ArgonTypography variant="caption" color="text">Account Year</ArgonTypography>
                    <ArgonInput fullWidth placeholder="e.g., 2024-2025" defaultValue={form.accountYear} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ArgonTypography variant="caption" color="text">GSTIN</ArgonTypography>
                    <ArgonInput fullWidth placeholder="e.g., 24ABCDE1234F1Z5" defaultValue={form.gstin} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ArgonTypography variant="caption" color="text">Website</ArgonTypography>
                    <ArgonInput fullWidth placeholder="https://company.example" defaultValue={form.website} />
                  </Grid>
                </Grid>

                <ArgonBox mt={2}>
                  <ArgonTypography variant="subtitle2" color="text">Address Details</ArgonTypography>
                  <Divider sx={{ my: 1 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <ArgonTypography variant="caption" color="text">Address 1</ArgonTypography>
                      <ArgonInput fullWidth placeholder="Street / Area" defaultValue={form.address1} />
                    </Grid>
                    <Grid item xs={12}>
                      <ArgonTypography variant="caption" color="text">Address 2</ArgonTypography>
                      <ArgonInput fullWidth placeholder="Block / Building" defaultValue={form.address2} />
                    </Grid>
                    <Grid item xs={12}>
                      <ArgonTypography variant="caption" color="text">Address 3</ArgonTypography>
                      <ArgonInput fullWidth placeholder="Floor / Landmark" defaultValue={form.address3} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ArgonTypography variant="caption" color="text">State</ArgonTypography>
                      <ArgonInput fullWidth placeholder="e.g., Gujarat" defaultValue={form.state} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ArgonTypography variant="caption" color="text">City</ArgonTypography>
                      <ArgonInput fullWidth placeholder="e.g., Surat" defaultValue={form.city} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <ArgonTypography variant="caption" color="text">Pincode</ArgonTypography>
                      <ArgonInput fullWidth placeholder="e.g., 395006" defaultValue={form.pincode} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <ArgonTypography variant="caption" color="text">Phone Number</ArgonTypography>
                      <ArgonInput fullWidth placeholder="e.g., +91 98765 43210" defaultValue={form.phone} />
                    </Grid>
                  </Grid>
                </ArgonBox>

                <ArgonBox display="flex" justifyContent="flex-end" gap={1} mt={3}>
                  <ArgonButton variant="outlined" color="secondary" onClick={handleCancel}>
                    Cancel
                  </ArgonButton>
                  <ArgonButton variant="gradient" color="primary" onClick={handleSave}>
                    <Icon sx={{ mr: 1 }}>save</Icon> Save
                  </ArgonButton>
                </ArgonBox>
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}