import { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { machinesData } from "../machine-management/data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

// Sample stoppage data (would come from API in production)
const stoppageData = machinesData.map((machine, index) => ({
  id: machine.id,
  machineNumber: machine.machineNumber,
  // Filler Stop
  fillerStop: Math.floor(Math.random() * 5) + 1,
  fillerStopTime: `${8 + Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  fillerStartTime: `${8 + Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  // Machine Stop
  machineStop: Math.floor(Math.random() * 4) + 1,
  machineStopTime: `${9 + Math.floor(Math.random() * 8)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  machineStartTime: `${10 + Math.floor(Math.random() * 7)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  // Sensor Stop
  sensorStop: Math.floor(Math.random() * 3) + 1,
  sensorStopTime: `${11 + Math.floor(Math.random() * 6)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  sensorStartTime: `${12 + Math.floor(Math.random() * 5)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  // Other Stop
  otherStop: Math.floor(Math.random() * 2) + 1,
  otherStopTime: `${13 + Math.floor(Math.random() * 4)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  otherStartTime: `${14 + Math.floor(Math.random() * 3)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  // Calculated metrics
  avgBreakdownHours: (Math.random() * 2 + 0.5).toFixed(2),
  avgStartingMinutes: Math.floor(Math.random() * 15) + 5,
}));

function StoppageDetails() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [query, setQuery] = useState("");
  const [selectedMachine, setSelectedMachine] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Get unique machine numbers for dropdown
  const machineOptions = useMemo(() => {
    return ["all", ...machinesData.map(m => m.machineNumber)];
  }, []);

  // Filter based on search query and selected machine
  const filteredRows = useMemo(() => {
    let filtered = stoppageData;
    
    // Filter by selected machine
    if (selectedMachine !== "all") {
      filtered = filtered.filter(row => row.machineNumber === selectedMachine);
    }
    
    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter((row) =>
        row.machineNumber?.toLowerCase().includes(q)
      );
    }
    
    return filtered;
  }, [query, selectedMachine]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, totalPages]);

  const columns = [
    { 
      field: "machineNumber", 
      headerName: "Machine No.", 
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "fillerStop", 
      headerName: "Filler Stop", 
      width: 100,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "fillerStopTime", 
      headerName: "Filler Stop Time", 
      width: 140,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "fillerStartTime", 
      headerName: "Filler Start Time", 
      width: 140,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "machineStop", 
      headerName: "Machine Stop", 
      width: 120,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "machineStopTime", 
      headerName: "Machine Stop Time", 
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "machineStartTime", 
      headerName: "Machine Start Time", 
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "sensorStop", 
      headerName: "Sensor Stop", 
      width: 110,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "sensorStopTime", 
      headerName: "Sensor Stop Time", 
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "sensorStartTime", 
      headerName: "Sensor Start Time", 
      width: 150,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "otherStop", 
      headerName: "Other Stop", 
      width: 100,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "otherStopTime", 
      headerName: "Other Stop Time", 
      width: 140,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "otherStartTime", 
      headerName: "Other Start Time", 
      width: 140,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "avgBreakdownHours", 
      headerName: "Avg Breakdown Hours", 
      width: 160,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonBox
          sx={{
            background: darkMode ? "rgba(244, 67, 54, 0.15)" : "rgba(244, 67, 54, 0.1)",
            color: "#f44336",
            padding: "4px 12px",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          {params.value}h
        </ArgonBox>
      ),
    },
    { 
      field: "avgStartingMinutes", 
      headerName: "Avg Starting Minutes", 
      width: 160,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <ArgonBox
          sx={{
            background: darkMode ? "rgba(255, 152, 0, 0.15)" : "rgba(255, 152, 0, 0.1)",
            color: "#ff9800",
            padding: "4px 12px",
            borderRadius: "6px",
            fontWeight: "bold",
          }}
        >
          {params.value} min
        </ArgonBox>
      ),
    },
  ];

  const exportCsv = () => {
    const headers = [
      ["Machine No.", "machineNumber"],
      ["Filler Stop", "fillerStop"],
      ["Filler Stop Time", "fillerStopTime"],
      ["Filler Start Time", "fillerStartTime"],
      ["Machine Stop", "machineStop"],
      ["Machine Stop Time", "machineStopTime"],
      ["Machine Start Time", "machineStartTime"],
      ["Sensor Stop", "sensorStop"],
      ["Sensor Stop Time", "sensorStopTime"],
      ["Sensor Start Time", "sensorStartTime"],
      ["Other Stop", "otherStop"],
      ["Other Stop Time", "otherStopTime"],
      ["Other Start Time", "otherStartTime"],
      ["Avg Breakdown Hours", "avgBreakdownHours"],
      ["Avg Starting Minutes", "avgStartingMinutes"],
    ];
    
    const escape = (v) => {
      const s = String(v ?? "");
      const needsQuotes = /[,"]/.test(s) || /\n/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };
    
    const csv = [
      headers.map(([h]) => h).join(","),
      ...filteredRows.map((r) => headers.map(([, key]) => escape(r[key])).join(",")),
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stoppage_details_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalMachines = filteredRows.length;
    const avgFillerStop = (filteredRows.reduce((sum, r) => sum + r.fillerStop, 0) / totalMachines).toFixed(1);
    const avgMachineStop = (filteredRows.reduce((sum, r) => sum + r.machineStop, 0) / totalMachines).toFixed(1);
    const avgSensorStop = (filteredRows.reduce((sum, r) => sum + r.sensorStop, 0) / totalMachines).toFixed(1);
    const avgOtherStop = (filteredRows.reduce((sum, r) => sum + r.otherStop, 0) / totalMachines).toFixed(1);
    const avgBreakdown = (filteredRows.reduce((sum, r) => sum + parseFloat(r.avgBreakdownHours), 0) / totalMachines).toFixed(2);
    const avgStarting = Math.round(filteredRows.reduce((sum, r) => sum + r.avgStartingMinutes, 0) / totalMachines);
    
    return {
      totalMachines,
      avgFillerStop,
      avgMachineStop,
      avgSensorStop,
      avgOtherStop,
      avgBreakdown,
      avgStarting,
    };
  }, [filteredRows]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="flex-end" alignItems="center" mb={2}>
              <ArgonButton 
                color={sidenavColor || "warning"}
                variant="gradient" 
                onClick={exportCsv}
                sx={getExportButtonStyles(theme, sidenavColor)}
              >
                <Icon sx={{ mr: 1 }}>file_download</Icon> Export CSV
              </ArgonButton>
            </ArgonBox>

            {/* Summary Cards */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Total Machines
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                    {summary.totalMachines}
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Avg Filler Stop
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="info">
                    {summary.avgFillerStop}
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Avg Machine Stop
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="error">
                    {summary.avgMachineStop}
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Avg Sensor Stop
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="primary">
                    {summary.avgSensorStop}
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Avg Breakdown
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="error">
                    {summary.avgBreakdown}h
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Avg Starting Time
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="warning">
                    {summary.avgStarting} min
                  </ArgonTypography>
                </Card>
              </Grid>
            </Grid>

            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
                {/* Search and Filter */}
                <ArgonBox display="flex" alignItems="center" gap={2} mb={2} flexWrap="wrap">
                  <ArgonBox display="flex" alignItems="center" gap={1}>
                    <Icon color="inherit">search</Icon>
                    <ArgonInput
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by machine number..."
                      size="small"
                      sx={{ minWidth: 250 }}
                    />
                  </ArgonBox>
                  
                  <ArgonBox display="flex" alignItems="center" gap={1}>
                    <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                      Filter by Machine:
                    </ArgonTypography>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <Select
                        value={selectedMachine}
                        onChange={(e) => {
                          setSelectedMachine(e.target.value);
                          setPage(0);
                        }}
                        sx={{
                          height: "42px",
                          color: darkMode ? "#fff" : "inherit",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.23)",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: theme.palette.gradients[sidenavColor]?.main || theme.palette.warning.main,
                          },
                          "& .MuiSvgIcon-root": {
                            color: darkMode ? "#fff" : "inherit",
                          },
                        }}
                      >
                        <MenuItem value="all">All Machines</MenuItem>
                        {machineOptions.slice(1).map((machine) => (
                          <MenuItem key={machine} value={machine}>
                            {machine}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </ArgonBox>
                </ArgonBox>

                {/* Table */}
                <div style={{ height: 600, width: "100%" }}>
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
                    Showing {paginatedRows.length} of {filteredRows.length} machines
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
      <Footer />
    </DashboardLayout>
  );
}

export default StoppageDetails;
