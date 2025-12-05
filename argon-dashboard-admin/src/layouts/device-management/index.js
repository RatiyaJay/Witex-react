import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
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
import { 
  getTableStyles, 
  getCardStyles, 
  getPaginationButtonStyles 
} from "utils/tableStyles";

const GET_DEVICES = gql`
  query GetDevices($page: Int, $pageSize: Int, $search: String, $status: DeviceStatus) {
    devices(page: $page, pageSize: $pageSize, search: $search, status: $status) {
      items {
        id
        deviceId
        status
        approvedBy
        approvedAt
        rejectedBy
        rejectedAt
        notes
        firstSeenAt
        createdAt
        approver {
          id
          name
          email
        }
        rejecter {
          id
          name
          email
        }
      }
      total
      page
      pageSize
    }
  }
`;

const APPROVE_DEVICE = gql`
  mutation ApproveDevice($input: ApproveDeviceInput!) {
    approveDevice(input: $input) {
      id
      deviceId
      status
      approvedAt
      approver {
        name
      }
    }
  }
`;

const REJECT_DEVICE = gql`
  mutation RejectDevice($input: RejectDeviceInput!) {
    rejectDevice(input: $input) {
      id
      deviceId
      status
      rejectedAt
      rejecter {
        name
      }
    }
  }
`;

function DeviceManagement() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const pageSize = 10;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); // "approve" or "reject"
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [notes, setNotes] = useState("");

  const { data, loading, refetch } = useQuery(GET_DEVICES, {
    variables: { page, pageSize, search: query, status: statusFilter },
    fetchPolicy: "network-only",
  });

  const [approveDevice] = useMutation(APPROVE_DEVICE, {
    onCompleted: () => {
      refetch();
      handleCloseDialog();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const [rejectDevice] = useMutation(REJECT_DEVICE, {
    onCompleted: () => {
      refetch();
      handleCloseDialog();
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const handleApprove = (device) => {
    setSelectedDevice(device);
    setDialogType("approve");
    setNotes("");
    setDialogOpen(true);
  };

  const handleReject = (device) => {
    setSelectedDevice(device);
    setDialogType("reject");
    setNotes("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedDevice(null);
    setNotes("");
    setDialogType("");
  };

  const handleConfirm = () => {
    if (!selectedDevice) return;

    if (dialogType === "approve") {
      approveDevice({
        variables: {
          input: {
            deviceId: selectedDevice.id,
            notes: notes || null,
          },
        },
      });
    } else if (dialogType === "reject") {
      rejectDevice({
        variables: {
          input: {
            deviceId: selectedDevice.id,
            notes: notes || null,
          },
        },
      });
    }
  };

  const devices = data?.devices?.items || [];
  const total = data?.devices?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns = [
    { 
      field: "deviceId", 
      headerName: "Device ID", 
      flex: 1,
      minWidth: 200,
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
      width: 130,
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
      field: "firstSeenAt", 
      headerName: "First Seen", 
      width: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonTypography variant="caption" color="text">
          {new Date(params.value).toLocaleString()}
        </ArgonTypography>
      ),
    },
    { 
      field: "approver", 
      headerName: "Approved By", 
      width: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (!params.row.approver) return "-";
        return (
          <ArgonBox>
            <ArgonTypography variant="caption" color={darkMode ? "white" : "dark"}>
              {params.row.approver.name || params.row.approver.email}
            </ArgonTypography>
            <ArgonTypography variant="caption" color="text" display="block">
              {new Date(params.row.approvedAt).toLocaleString()}
            </ArgonTypography>
          </ArgonBox>
        );
      },
    },
    { 
      field: "rejecter", 
      headerName: "Rejected By", 
      width: 180,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        if (!params.row.rejecter) return "-";
        return (
          <ArgonBox>
            <ArgonTypography variant="caption" color={darkMode ? "white" : "dark"}>
              {params.row.rejecter.name || params.row.rejecter.email}
            </ArgonTypography>
            <ArgonTypography variant="caption" color="text" display="block">
              {new Date(params.row.rejectedAt).toLocaleString()}
            </ArgonTypography>
          </ArgonBox>
        );
      },
    },
    { 
      field: "notes", 
      headerName: "Notes", 
      flex: 1,
      minWidth: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonTypography variant="caption" color="text">
          {params.value || "-"}
        </ArgonTypography>
      ),
    },
    { 
      field: "actions", 
      headerName: "Actions", 
      width: 200,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        if (params.row.status === "PENDING") {
          return (
            <ArgonBox display="flex" gap={1}>
              <ArgonButton
                size="small"
                color="success"
                variant="gradient"
                onClick={() => handleApprove(params.row)}
              >
                <Icon fontSize="small">check</Icon>
              </ArgonButton>
              <ArgonButton
                size="small"
                color="error"
                variant="gradient"
                onClick={() => handleReject(params.row)}
              >
                <Icon fontSize="small">close</Icon>
              </ArgonButton>
            </ArgonBox>
          );
        }
        return "-";
      },
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
                <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                    Device Management
                  </ArgonTypography>
                  <ArgonBox display="flex" gap={1}>
                    <ArgonButton
                      size="small"
                      color={statusFilter === "PENDING" ? (sidenavColor || "info") : "secondary"}
                      variant={statusFilter === "PENDING" ? "gradient" : "outlined"}
                      onClick={() => {
                        setStatusFilter("PENDING");
                        setPage(1);
                      }}
                    >
                      Pending
                    </ArgonButton>
                    <ArgonButton
                      size="small"
                      color={statusFilter === "APPROVED" ? (sidenavColor || "info") : "secondary"}
                      variant={statusFilter === "APPROVED" ? "gradient" : "outlined"}
                      onClick={() => {
                        setStatusFilter("APPROVED");
                        setPage(1);
                      }}
                    >
                      Approved
                    </ArgonButton>
                    <ArgonButton
                      size="small"
                      color={statusFilter === "REJECTED" ? (sidenavColor || "info") : "secondary"}
                      variant={statusFilter === "REJECTED" ? "gradient" : "outlined"}
                      onClick={() => {
                        setStatusFilter("REJECTED");
                        setPage(1);
                      }}
                    >
                      Rejected
                    </ArgonButton>
                    <ArgonButton
                      size="small"
                      color={!statusFilter ? (sidenavColor || "info") : "secondary"}
                      variant={!statusFilter ? "gradient" : "outlined"}
                      onClick={() => {
                        setStatusFilter(null);
                        setPage(1);
                      }}
                    >
                      All
                    </ArgonButton>
                  </ArgonBox>
                </ArgonBox>

                {/* Search */}
                <ArgonBox display="flex" alignItems="center" gap={1} mb={2}>
                  <Icon color="inherit">search</Icon>
                  <ArgonInput
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by device ID..."
                    size="small"
                    sx={{ minWidth: 300 }}
                  />
                </ArgonBox>

                {/* Table */}
                <div style={{ height: 600, width: "100%" }}>
                  <DataGrid
                    rows={devices}
                    columns={columns}
                    loading={loading}
                    disableColumnMenu
                    disableRowSelectionOnClick
                    hideFooter
                    rowHeight={70}
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
                  flexWrap="wrap"
                  gap={2}
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
                    <ArgonTypography 
                      variant="button" 
                      color="text" 
                      px={2}
                      sx={{
                        fontWeight: 600,
                        color: darkMode ? "#fff" : "inherit",
                      }}
                    >
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

      {/* Confirmation Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            background: darkMode ? "#1a2332" : "#ffffff",
            color: darkMode ? "#fff" : "inherit",
          }
        }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
            {dialogType === "approve" ? "Approve Device" : "Reject Device"}
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonBox mb={2}>
            <ArgonTypography variant="body2" color="text">
              Device ID: <strong>{selectedDevice?.deviceId}</strong>
            </ArgonTypography>
          </ArgonBox>
          <ArgonBox mt={2}>
            <TextField
              label="Notes (Optional)"
              multiline
              rows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              InputLabelProps={{
                shrink: true,
                style: { 
                  color: darkMode ? "#fff" : "inherit",
                  backgroundColor: darkMode ? "#1a2332" : "#ffffff",
                  paddingLeft: "4px",
                  paddingRight: "4px"
                }
              }}
              InputProps={{
                style: { color: darkMode ? "#fff" : "inherit" }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)"
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
                }
              }}
            />
          </ArgonBox>
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={handleCloseDialog} color="secondary">
            Cancel
          </ArgonButton>
          <ArgonButton 
            onClick={handleConfirm} 
            color={dialogType === "approve" ? "success" : "error"}
            variant="gradient"
          >
            {dialogType === "approve" ? "Approve" : "Reject"}
          </ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default DeviceManagement;
