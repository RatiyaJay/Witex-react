import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
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

const GET_ALL_DEVICES = gql`
  query GetAllDevices($page: Int, $pageSize: Int, $search: String, $status: DeviceStatus, $organizationId: ID, $isActive: Boolean, $onlyConfigured: Boolean) {
    devices(page: $page, pageSize: $pageSize, search: $search, status: $status, organizationId: $organizationId, isActive: $isActive, onlyConfigured: $onlyConfigured) {
      items {
        id
        deviceId
        status
        machineName
        aliasMachineNo
        isActive
        ipv4Address
        organizationId
        approvedAt
        rejectedAt
        firstSeenAt
        approver {
          name
        }
        rejecter {
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

function AllDevices() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("APPROVED");
  const [orgFilter, setOrgFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("true");
  const pageSize = 10;

  const { data, loading } = useQuery(GET_ALL_DEVICES, {
    variables: { 
      page, 
      pageSize, 
      search: query,
      status: statusFilter || null,
      organizationId: orgFilter || null,
      isActive: activeFilter === "" ? null : activeFilter === "true",
      onlyConfigured: true, // Only show configured devices
    },
    fetchPolicy: "network-only",
  });

  const devices = data?.devices?.items || [];
  const organizations = data?.organizations?.items || [];
  const total = data?.devices?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns = [
    { 
      field: "deviceId", 
      headerName: "Device ID", 
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonTypography variant="body2" fontWeight="bold" color={darkMode ? "white" : "dark"}>
          {params.value}
        </ArgonTypography>
      ),
    },
    { 
      field: "status", 
      headerName: "Status", 
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const statusColors = {
          PENDING: "warning",
          APPROVED: "success",
          REJECTED: "error",
        };
        return (
          <Chip 
            label={params.value} 
            color={statusColors[params.value] || "default"}
            size="small"
            sx={{ fontWeight: "bold" }}
          />
        );
      },
    },
    { 
      field: "machineName", 
      headerName: "Machine Name", 
      flex: 1,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.value || "-",
    },
    { 
      field: "aliasMachineNo", 
      headerName: "Alias No", 
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.value || "-",
    },
    { 
      field: "isActive", 
      headerName: "Active", 
      width: 90,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Checkbox checked={params.value} disabled />
      ),
    },
    { 
      field: "ipv4Address", 
      headerName: "IPv4", 
      width: 130,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.value || "-",
    },
    { 
      field: "organization", 
      headerName: "Organization", 
      width: 160,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => params.row.organization?.name || "-",
    },
    { 
      field: "firstSeenAt", 
      headerName: "First Seen", 
      width: 160,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonTypography variant="caption" color="text">
          {new Date(params.value).toLocaleString()}
        </ArgonTypography>
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
                  All Devices
                </ArgonTypography>

                {/* Filters */}
                <Grid container spacing={2} mb={2}>
                  <Grid item xs={12} md={3}>
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
                  <Grid item xs={12} md={2.25}>
                    <TextField
                      select
                      label="Status"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
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
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="APPROVED">Approved</MenuItem>
                      <MenuItem value="REJECTED">Rejected</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2.25}>
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
                  <Grid item xs={12} md={2.25}>
                    <TextField
                      select
                      label="Active Status"
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
                      <MenuItem value="">All</MenuItem>
                      <MenuItem value="true">Active</MenuItem>
                      <MenuItem value="false">Inactive</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={2.25}>
                    <ArgonButton
                      color="secondary"
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setQuery("");
                        setStatusFilter("APPROVED");
                        setOrgFilter("");
                        setActiveFilter("true");
                        setPage(1);
                      }}
                    >
                      <Icon sx={{ mr: 1 }}>refresh</Icon> Reset
                    </ArgonButton>
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
      <Footer />
    </DashboardLayout>
  );
}

export default AllDevices;
