import { useState } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import MenuItem from "@mui/material/MenuItem";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { useArgonController } from "context";
import { getTableStyles, getCardStyles, getPaginationButtonStyles } from "utils/tableStyles";

const GET_APPROVED_DEVICES = gql`
  query GetApprovedDevices($page: Int, $pageSize: Int, $search: String, $organizationId: ID, $isActive: Boolean) {
    approvedDevices(page: $page, pageSize: $pageSize, search: $search, organizationId: $organizationId, isActive: $isActive) {
      items {
        id
        deviceId
        machineName
        aliasMachineNo
        isActive
        ipv4Address
        organizationId
        approvedAt
        approver {
          name
        }
        organization {
          id
          name
        }
      }
      total
      page
      pageSize
    }
    organizations {
      items {
        id
        name
      }
    }
  }
`;

const UPDATE_DEVICE = gql`
  mutation UpdateDevice($deviceId: ID!, $input: UpdateDeviceInput!) {
    updateDevice(deviceId: $deviceId, input: $input) {
      id
      deviceId
      machineName
      aliasMachineNo
      isActive
      ipv4Address
      organizationId
    }
  }
`;

function ApprovedDevices() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [orgFilter, setOrgFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [formData, setFormData] = useState({
    machineName: "",
    aliasMachineNo: "",
    isActive: true,
    ipv4Address: "",
    organizationId: "",
  });

  const { data, loading, refetch } = useQuery(GET_APPROVED_DEVICES, {
    variables: { 
      page, 
      pageSize, 
      search: query,
      organizationId: orgFilter || null,
      isActive: activeFilter === "" ? null : activeFilter === "true",
    },
    fetchPolicy: "network-only",
  });

  const [updateDevice] = useMutation(UPDATE_DEVICE, {
    onCompleted: () => {
      refetch();
      handleCloseDialog();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleEdit = (device) => {
    setSelectedDevice(device);
    setFormData({
      machineName: device.machineName || "",
      aliasMachineNo: device.aliasMachineNo || "",
      isActive: device.isActive,
      ipv4Address: device.ipv4Address || "",
      organizationId: device.organizationId || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDevice(null);
    setFormData({
      machineName: "",
      aliasMachineNo: "",
      isActive: true,
      ipv4Address: "",
      organizationId: "",
    });
  };

  const handleSave = () => {
    if (!selectedDevice) return;

    updateDevice({
      variables: {
        deviceId: selectedDevice.id,
        input: {
          machineName: formData.machineName || null,
          aliasMachineNo: formData.aliasMachineNo || null,
          isActive: formData.isActive,
          ipv4Address: formData.ipv4Address || null,
          organizationId: formData.organizationId || null,
        },
      },
    });
  };

  const devices = data?.approvedDevices?.items || [];
  const organizations = data?.organizations?.items || [];
  const total = data?.approvedDevices?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns = [
    { 
      field: "deviceId", 
      headerName: "Device ID (Serial No)", 
      width: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonTypography variant="body2" fontWeight="bold" color={darkMode ? "white" : "dark"}>
          {params.value}
        </ArgonTypography>
      ),
    },
    { 
      field: "machineName", 
      headerName: "Machine Name", 
      flex: 1,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "aliasMachineNo", 
      headerName: "Alias Machine No", 
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "isActive", 
      headerName: "Active", 
      width: 100,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Checkbox checked={params.value} disabled />
      ),
    },
    { 
      field: "ipv4Address", 
      headerName: "IPv4 Address", 
      width: 140,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "organization", 
      headerName: "Organization", 
      width: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.row.organization?.name || "-",
    },
    { 
      field: "actions", 
      headerName: "Actions", 
      width: 100,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => (
        <ArgonButton
          size="small"
          color={sidenavColor || "info"}
          variant="gradient"
          onClick={() => handleEdit(params.row)}
        >
          <Icon fontSize="small">edit</Icon>
        </ArgonButton>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
                <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                  Approved Devices
                </ArgonTypography>

                {/* Filters */}
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} md={4}>
                    <ArgonBox display="flex" alignItems="center" gap={1}>
                      <Icon color="inherit">search</Icon>
                      <ArgonInput
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search devices..."
                        size="small"
                        fullWidth
                      />
                    </ArgonBox>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Organization"
                      value={orgFilter}
                      onChange={(e) => {
                        setOrgFilter(e.target.value);
                        setPage(1);
                      }}
                      size="small"
                      fullWidth
                      SelectProps={{
                        displayEmpty: true,
                      }}
                      InputLabelProps={{
                        shrink: true,
                        style: { 
                          color: darkMode ? "#fff" : "inherit",
                          backgroundColor: darkMode ? "#1a2332" : "#ffffff",
                          paddingLeft: "8px",
                          paddingRight: "8px",
                          marginLeft: "-4px"
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: darkMode ? "#fff" : "inherit",
                          "& fieldset": {
                            borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)"
                          },
                        }
                      }}
                    >
                      <MenuItem value="">All Organizations</MenuItem>
                      <MenuItem value="none">None</MenuItem>
                      {organizations.map((org) => (
                        <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Status"
                      value={activeFilter}
                      onChange={(e) => {
                        setActiveFilter(e.target.value);
                        setPage(1);
                      }}
                      size="small"
                      fullWidth
                      SelectProps={{
                        displayEmpty: true,
                      }}
                      InputLabelProps={{
                        shrink: true,
                        style: { 
                          color: darkMode ? "#fff" : "inherit",
                          backgroundColor: darkMode ? "#1a2332" : "#ffffff",
                          paddingLeft: "8px",
                          paddingRight: "8px",
                          marginLeft: "-4px"
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          color: darkMode ? "#fff" : "inherit",
                          "& fieldset": {
                            borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)"
                          },
                        }
                      }}
                    >
                      <MenuItem value="">All Status</MenuItem>
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>

                {/* Table */}
                <div style={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={devices}
                    columns={columns}
                    loading={loading}
                    disableColumnMenu
                    disableRowSelectionOnClick
                    hideFooter
                    rowHeight={56}
                    columnHeaderHeight={52}
                    sx={getTableStyles(theme, darkMode, sidenavColor)}
                  />
                </div>

                {/* Pagination */}
                <ArgonBox 
                  mt={2.5} 
                  pt={2.5}
                  borderTop={darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid #e9ecef"}
                  display="flex" 
                  alignItems="center" 
                  justifyContent="space-between"
                >
                  <ArgonTypography variant="caption" color="text">
                    Showing {devices.length} of {total} devices
                  </ArgonTypography>
                  <ArgonBox display="flex" alignItems="center" gap={1}>
                    <ArgonButton
                      size="small"
                      variant={darkMode ? "outlined" : "gradient"}
                      color={sidenavColor || "info"}
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      sx={getPaginationButtonStyles(theme, darkMode, sidenavColor)}
                    >
                      <Icon fontSize="small">chevron_left</Icon>
                    </ArgonButton>
                    <ArgonTypography variant="button" color="text" px={2} sx={{ fontWeight: 600, color: darkMode ? "#fff" : "inherit" }}>
                      {page} / {totalPages}
                    </ArgonTypography>
                    <ArgonButton
                      size="small"
                      variant={darkMode ? "outlined" : "gradient"}
                      color={sidenavColor || "info"}
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Edit Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: darkMode ? "#1a2332" : "#ffffff",
            color: darkMode ? "#fff" : "inherit",
          }
        }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
            Edit Device
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonBox mt={2}>
            <ArgonTypography variant="caption" color="text" mb={1} display="block">
              Device ID (Serial No): <strong>{selectedDevice?.deviceId}</strong>
            </ArgonTypography>
            
            <TextField
              label="Machine Name"
              value={formData.machineName}
              onChange={(e) => setFormData({ ...formData, machineName: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
                style: { 
                  color: darkMode ? "#fff" : "inherit",
                  backgroundColor: darkMode ? "#1a2332" : "#ffffff",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  marginLeft: "-4px"
                }
              }}
              InputProps={{
                style: { color: darkMode ? "#fff" : "inherit" }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)" },
                }
              }}
            />

            <TextField
              label="Alias Machine No"
              value={formData.aliasMachineNo}
              onChange={(e) => setFormData({ ...formData, aliasMachineNo: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
                style: { 
                  color: darkMode ? "#fff" : "inherit",
                  backgroundColor: darkMode ? "#1a2332" : "#ffffff",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  marginLeft: "-4px"
                }
              }}
              InputProps={{
                style: { color: darkMode ? "#fff" : "inherit" }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)" },
                }
              }}
            />

            <TextField
              label="IPv4 Address"
              value={formData.ipv4Address}
              onChange={(e) => setFormData({ ...formData, ipv4Address: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{
                shrink: true,
                style: { 
                  color: darkMode ? "#fff" : "inherit",
                  backgroundColor: darkMode ? "#1a2332" : "#ffffff",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  marginLeft: "-4px"
                }
              }}
              InputProps={{
                style: { color: darkMode ? "#fff" : "inherit" }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)" },
                }
              }}
            />

            <TextField
              select
              label="Organization"
              value={formData.organizationId}
              onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })}
              fullWidth
              margin="normal"
              SelectProps={{
                displayEmpty: true,
              }}
              InputLabelProps={{
                shrink: true,
                style: { 
                  color: darkMode ? "#fff" : "inherit",
                  backgroundColor: darkMode ? "#1a2332" : "#ffffff",
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  marginLeft: "-4px"
                }
              }}
              InputProps={{
                style: { color: darkMode ? "#fff" : "inherit" }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)" },
                }
              }}
            >
              <MenuItem value="">None</MenuItem>
              {organizations.map((org) => (
                <MenuItem key={org.id} value={org.id}>{org.name}</MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  sx={{ color: darkMode ? "#fff" : "inherit" }}
                />
              }
              label="Active"
              sx={{ mt: 2, color: darkMode ? "#fff" : "inherit" }}
            />
          </ArgonBox>
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={handleCloseDialog} color="secondary">
            Cancel
          </ArgonButton>
          <ArgonButton onClick={handleSave} color={sidenavColor || "info"} variant="gradient">
            Save
          </ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default ApprovedDevices;
