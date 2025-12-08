import { useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import Card from "@mui/material/Card";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonPagination from "components/ArgonPagination";
import Table from "examples/Tables/Table";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useArgonController } from "context";

const GET_MACHINE_METRICS = gql`
  query GetMachineMetrics($page: Int, $pageSize: Int, $search: String) {
    machineMetrics(page: $page, pageSize: $pageSize, search: $search) {
      items {
        id
        deviceId
        efficiencyPercentage
        currentRpm
        powerOnMinutes
        runningMinutes
        lastUpdated
        device {
          machineName
          aliasMachineNo
        }
        shift {
          shiftType
          startTime
          endTime
        }
      }
      total
      page
      pageSize
    }
  }
`;

function MachineManagement2() {
  const [controller] = useArgonController();
  const { darkMode } = controller;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const pageSize = 10;

  const { data, loading, error, refetch } = useQuery(GET_MACHINE_METRICS, {
    variables: { page, pageSize, search: search || undefined },
    pollInterval: 60000, // Poll every minute for real-time updates
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  const metrics = data?.machineMetrics?.items || [];
  const total = data?.machineMetrics?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  // Auto-refresh every minute
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 60000);

    return () => clearInterval(interval);
  }, [refetch]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 80) return "success.main";
    if (efficiency >= 60) return "warning.main";
    return "error.main";
  };

  const getShiftTypeColor = (type) => {
    switch (type) {
      case "DAY":
        return "primary";
      case "NIGHT":
        return "default";
      case "EXTRA":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Table configuration for theme's Table component
  const tableColumns = [
    { name: "machine", align: "left", width: "25%" },
    { name: "efficiency", align: "center", width: "15%" },
    { name: "rpm", align: "center", width: "15%" },
    { name: "shift", align: "center", width: "20%" },
    { name: "runtime", align: "center", width: "25%" },
  ];

  const tableRows = metrics.map((metric) => ({
    machine: (
      <ArgonBox>
        <ArgonTypography variant="button" fontWeight="medium" color={darkMode ? "white" : "dark"}>
          {metric.device?.machineName || `Machine ${metric.deviceId}`}
        </ArgonTypography>
        <ArgonTypography variant="caption" color="text" display="block">
          {metric.device?.aliasMachineNo ? `Alias: ${metric.device.aliasMachineNo}` : `Device: ${metric.deviceId}`}
        </ArgonTypography>
      </ArgonBox>
    ),
    efficiency: (
      <ArgonBox display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <ArgonTypography 
          variant="h6" 
          fontWeight="bold" 
          color={getEfficiencyColor(metric.efficiencyPercentage)}
        >
          {metric.efficiencyPercentage.toFixed(1)}%
        </ArgonTypography>
        <ArgonBox
          sx={{
            width: "60px",
            height: "4px",
            borderRadius: "2px",
            background: `linear-gradient(90deg, ${
              metric.efficiencyPercentage >= 80 
                ? "#4caf50" 
                : metric.efficiencyPercentage >= 60 
                ? "#ff9800" 
                : "#f44336"
            } ${metric.efficiencyPercentage}%, rgba(0,0,0,0.1) ${metric.efficiencyPercentage}%)`,
          }}
        />
      </ArgonBox>
    ),
    rpm: (
      <ArgonBox display="flex" flexDirection="column" alignItems="center">
        <ArgonTypography variant="button" fontWeight="medium" color={darkMode ? "white" : "dark"}>
          {metric.currentRpm}
        </ArgonTypography>
        <ArgonTypography variant="caption" color="text">
          RPM
        </ArgonTypography>
      </ArgonBox>
    ),
    shift: (
      <ArgonBox display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <Chip
          label={metric.shift?.shiftType || "N/A"}
          color={getShiftTypeColor(metric.shift?.shiftType)}
          size="small"
          sx={{ fontWeight: "bold" }}
        />
        {metric.shift && (
          <ArgonTypography variant="caption" color="text">
            {formatTime12Hour(metric.shift.startTime)} - {formatTime12Hour(metric.shift.endTime)}
          </ArgonTypography>
        )}
      </ArgonBox>
    ),
    runtime: (
      <ArgonBox display="flex" flexDirection="column" alignItems="center">
        <ArgonTypography variant="button" fontWeight="medium" color="success">
          {formatDuration(metric.runningMinutes)}
        </ArgonTypography>
        <ArgonTypography variant="caption" color="text">
          / {formatDuration(metric.powerOnMinutes)}
        </ArgonTypography>
      </ArgonBox>
    ),
    hasBorder: true,
  }));

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <ArgonBox mb={3}>
          <Card>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <ArgonBox>
                <ArgonTypography variant="h6" gutterBottom>
                  Machine Management 2
                </ArgonTypography>
                <ArgonBox display="flex" alignItems="center" lineHeight={0}>
                  <Icon
                    sx={{
                      fontWeight: "bold",
                      color: ({ palette: { info } }) => info.main,
                      mt: -0.5,
                    }}
                  >
                    precision_manufacturing
                  </Icon>
                  <ArgonTypography variant="button" fontWeight="regular" color="text">
                    &nbsp;Real-time machine efficiency monitoring
                  </ArgonTypography>
                </ArgonBox>
              </ArgonBox>
              <ArgonBox display="flex" alignItems="center" gap={2}>
                <ArgonBox
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    background: darkMode
                      ? "linear-gradient(195deg, rgba(73, 163, 241, 0.1), rgba(26, 115, 232, 0.1))"
                      : "linear-gradient(195deg, rgba(73, 163, 241, 0.05), rgba(26, 115, 232, 0.05))",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                >
                  <Icon sx={{ color: "success.main", fontSize: "16px" }}>fiber_manual_record</Icon>
                  <ArgonTypography variant="caption" color="text">
                    Live Updates
                  </ArgonTypography>
                </ArgonBox>
                <TextField
                  placeholder="Search machines..."
                  value={search}
                  onChange={handleSearchChange}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Icon fontSize="small">search</Icon>
                      </InputAdornment>
                    ),
                    style: { color: darkMode ? "#fff" : "inherit" },
                  }}
                  sx={{
                    minWidth: "250px",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                      },
                      "&:hover fieldset": {
                        borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#0ea5e9",
                      },
                    },
                  }}
                />
              </ArgonBox>
            </ArgonBox>
          </Card>
        </ArgonBox>

        <Card>
          <ArgonBox>
            {error ? (
              <ArgonBox display="flex" justifyContent="center" alignItems="center" p={6}>
                <ArgonTypography variant="body2" color="error" textAlign="center">
                  Error loading machine data: {error.message}
                  <br />
                  <ArgonButton size="small" color="info" onClick={() => refetch()} sx={{ mt: 2 }}>
                    Retry
                  </ArgonButton>
                </ArgonTypography>
              </ArgonBox>
            ) : loading && metrics.length === 0 ? (
              <ArgonBox display="flex" justifyContent="center" alignItems="center" p={6}>
                <CircularProgress size={40} />
                <ArgonTypography variant="body2" color="text" ml={2}>
                  Loading machine data...
                </ArgonTypography>
              </ArgonBox>
            ) : metrics.length === 0 ? (
              <ArgonBox textAlign="center" py={6}>
                <Icon sx={{ fontSize: "64px", color: "text.secondary", mb: 2 }}>
                  precision_manufacturing
                </Icon>
                <ArgonTypography variant="h6" color="text" mb={1}>
                  No machines found
                </ArgonTypography>
                <ArgonTypography variant="body2" color="text">
                  {search ? "Try adjusting your search criteria" : "No approved machines available for monitoring"}
                </ArgonTypography>
              </ArgonBox>
            ) : (
              <>
                <Table columns={tableColumns} rows={tableRows} />

                {totalPages > 1 && (
                  <ArgonBox display="flex" justifyContent="center" p={3}>
                    <ArgonPagination
                      variant="gradient"
                      color="info"
                    >
                      <ArgonPagination item onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                        <Icon>keyboard_arrow_left</Icon>
                      </ArgonPagination>
                      
                      {[...Array(Math.min(5, totalPages))].map((_, index) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + index;
                        return (
                          <ArgonPagination
                            item
                            key={pageNum}
                            active={pageNum === page}
                            onClick={() => setPage(pageNum)}
                          >
                            {pageNum}
                          </ArgonPagination>
                        );
                      })}

                      <ArgonPagination item onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                        <Icon>keyboard_arrow_right</Icon>
                      </ArgonPagination>
                    </ArgonPagination>
                  </ArgonBox>
                )}

                <ArgonBox p={2} display="flex" justifyContent="space-between" alignItems="center">
                  <ArgonTypography variant="caption" color="text">
                    Showing {metrics.length} of {total} machines • Last updated: {new Date().toLocaleTimeString()}
                  </ArgonTypography>
                  <ArgonButton
                    variant="outlined"
                    color="info"
                    size="small"
                    onClick={() => refetch()}
                    disabled={loading}
                  >
                    <Icon sx={{ mr: 0.5 }}>refresh</Icon>
                    Refresh
                  </ArgonButton>
                </ArgonBox>
              </>
            )}
          </ArgonBox>
        </Card>
      </ArgonBox>
    </DashboardLayout>
  );
}

export default MachineManagement2;