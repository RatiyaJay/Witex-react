import { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import jsPDF from "jspdf";
import "jspdf-autotable";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { machinesData } from "../machine-management/data";
import { beamsData } from "../beam-flow/data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

function OperationalReport() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [selectedMachine, setSelectedMachine] = useState("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Generate operational report data
  const reportData = useMemo(() => {
    return machinesData.map((machine) => {
      const beam = beamsData.find(b => b.machineNo === machine.machineNumber && b.status === "running");
      
      return {
        id: machine.id,
        machineNumber: machine.machineNumber,
        beamNo: beam?.beamNo || "-",
        qualityName: machine.qualityName,
        efficiency: machine.efficiency,
        rpm: machine.rpm,
        pick: machine.pick,
        current: machine.current,
        productionShift: machine.productionShift,
        productionDay: machine.productionDay,
        runningTime: machine.runningTime,
        stopTime: machine.stopTime || "00:30",
        totalStop: machine.totalStop,
        powerOnTime: machine.powerOnTime,
        causeOfError: machine.causeOfError,
        shiftType: machine.shiftType,
      };
    });
  }, []);

  // Filter by selected machine
  const filteredRows = useMemo(() => {
    if (selectedMachine === "all") return reportData;
    return reportData.filter(row => row.machineNumber === selectedMachine);
  }, [reportData, selectedMachine]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, totalPages]);

  const columns = [
    { field: "machineNumber", headerName: "Machine No.", width: 120, align: "center", headerAlign: "center" },
    { field: "beamNo", headerName: "Beam No.", width: 110, align: "center", headerAlign: "center" },
    { field: "qualityName", headerName: "Quality", flex: 1, minWidth: 140, align: "center", headerAlign: "center" },
    { field: "efficiency", headerName: "Efficiency %", width: 120, align: "center", headerAlign: "center",
      renderCell: (params) => `${params.value}%` },
    { field: "rpm", headerName: "RPM", width: 90, align: "center", headerAlign: "center" },
    { field: "pick", headerName: "Pick", width: 90, align: "center", headerAlign: "center" },
    { field: "current", headerName: "Current (A)", width: 110, align: "center", headerAlign: "center" },
    { field: "productionShift", headerName: "Shift Prod.", width: 110, align: "center", headerAlign: "center" },
    { field: "productionDay", headerName: "Day Prod.", width: 110, align: "center", headerAlign: "center" },
    { field: "runningTime", headerName: "Running Time", width: 120, align: "center", headerAlign: "center" },
    { field: "stopTime", headerName: "Stop Time", width: 110, align: "center", headerAlign: "center" },
    { field: "totalStop", headerName: "Total Stops", width: 110, align: "center", headerAlign: "center" },
    { field: "powerOnTime", headerName: "Power On", width: 110, align: "center", headerAlign: "center" },
    { field: "shiftType", headerName: "Shift", width: 90, align: "center", headerAlign: "center" },
    { field: "causeOfError", headerName: "Error", width: 120, align: "center", headerAlign: "center",
      renderCell: (params) => {
        const hasError = params.value && params.value !== "None";
        return (
          <ArgonBox
            sx={{
              background: hasError ? "rgba(244, 67, 54, 0.15)" : "rgba(76, 175, 80, 0.15)",
              color: hasError ? "#f44336" : "#4caf50",
              padding: "4px 8px",
              borderRadius: "6px",
              fontWeight: "bold",
              fontSize: "0.75rem",
            }}
          >
            {params.value}
          </ArgonBox>
        );
      }
    },
  ];

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Add title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("Operational Report", 14, 20);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Total Machines: ${filteredRows.length}`, 14, 34);
    
    // Prepare table data
    const tableData = filteredRows.map(row => [
      row.machineNumber,
      row.beamNo,
      row.qualityName,
      `${row.efficiency}%`,
      row.rpm,
      row.pick,
      row.current,
      row.productionShift,
      row.productionDay,
      row.runningTime,
      row.stopTime,
      row.totalStop,
      row.powerOnTime,
      row.shiftType,
      row.causeOfError,
    ]);
    
    // Add table
    doc.autoTable({
      startY: 40,
      head: [[
        'Machine No.',
        'Beam No.',
        'Quality',
        'Efficiency',
        'RPM',
        'Pick',
        'Current',
        'Shift Prod.',
        'Day Prod.',
        'Running',
        'Stop',
        'Stops',
        'Power On',
        'Shift',
        'Error',
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7,
        textColor: 50,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { top: 40 },
    });
    
    // Save PDF
    const filename = selectedMachine === "all" 
      ? `operational_report_all_machines.pdf`
      : `operational_report_${selectedMachine}.pdf`;
    doc.save(filename);
  };

  const exportCSV = () => {
    const headers = [
      ["Machine No.", "machineNumber"],
      ["Beam No.", "beamNo"],
      ["Quality", "qualityName"],
      ["Efficiency %", "efficiency"],
      ["RPM", "rpm"],
      ["Pick", "pick"],
      ["Current (A)", "current"],
      ["Shift Production", "productionShift"],
      ["Day Production", "productionDay"],
      ["Running Time", "runningTime"],
      ["Stop Time", "stopTime"],
      ["Total Stops", "totalStop"],
      ["Power On Time", "powerOnTime"],
      ["Shift", "shiftType"],
      ["Cause of Error", "causeOfError"],
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
    a.download = `operational_report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate summary
  const summary = useMemo(() => {
    const totalMachines = filteredRows.length;
    const avgEfficiency = (filteredRows.reduce((sum, r) => sum + r.efficiency, 0) / totalMachines).toFixed(2);
    const totalProduction = filteredRows.reduce((sum, r) => sum + r.productionDay, 0);
    const avgRPM = Math.round(filteredRows.reduce((sum, r) => sum + r.rpm, 0) / totalMachines);
    const machinesWithErrors = filteredRows.filter(r => r.causeOfError && r.causeOfError !== "None").length;
    
    return {
      totalMachines,
      avgEfficiency,
      totalProduction,
      avgRPM,
      machinesWithErrors,
    };
  }, [filteredRows]);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
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
                    {machinesData.map((machine) => (
                      <MenuItem key={machine.id} value={machine.machineNumber}>
                        {machine.machineNumber}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </ArgonBox>

              <ArgonBox display="flex" gap={1}>
                <ArgonButton 
                  color="error"
                  variant="gradient" 
                  onClick={exportPDF}
                  sx={getExportButtonStyles(theme, sidenavColor)}
                >
                  <Icon sx={{ mr: 1 }}>picture_as_pdf</Icon> Export PDF
                </ArgonButton>
                <ArgonButton 
                  color={sidenavColor || "warning"}
                  variant="gradient" 
                  onClick={exportCSV}
                  sx={getExportButtonStyles(theme, sidenavColor)}
                >
                  <Icon sx={{ mr: 1 }}>file_download</Icon> Export CSV
                </ArgonButton>
              </ArgonBox>
            </ArgonBox>

            {/* Summary Cards */}
            <Grid container spacing={2} mb={3}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Total Machines
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                    {summary.totalMachines}
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Avg Efficiency
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="success">
                    {summary.avgEfficiency}%
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Total Production
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="info">
                    {summary.totalProduction}m
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Avg RPM
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="primary">
                    {summary.avgRPM}
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Machines with Errors
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="error">
                    {summary.machinesWithErrors}
                  </ArgonTypography>
                </Card>
              </Grid>
            </Grid>

            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
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

export default OperationalReport;
