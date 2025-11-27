import { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import ButtonGroup from "@mui/material/ButtonGroup";
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
import { useArgonController } from "context";
import { getCardStyles, getExportButtonStyles } from "utils/tableStyles";

function PerformancePulse() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();

  // Date filter state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState("today");

  // Quick date filter functions
  const getDateByFilter = (filter) => {
    const today = new Date();
    let targetDate = new Date();

    switch (filter) {
      case "today":
        targetDate = today;
        break;
      case "yesterday":
        targetDate.setDate(today.getDate() - 1);
        break;
      case "last7days":
        targetDate.setDate(today.getDate() - 7);
        break;
      case "last30days":
        targetDate.setDate(today.getDate() - 30);
        break;
      default:
        targetDate = today;
    }

    return targetDate.toISOString().split('T')[0];
  };

  const handleQuickFilter = (filter) => {
    setDateFilter(filter);
    setSelectedDate(getDateByFilter(filter));
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setDateFilter("custom");
  };

  // Group machines by quality and shift
  const performanceData = useMemo(() => {
    const dayShift = machinesData.filter(m => m.shiftType === "Day");
    const nightShift = machinesData.filter(m => m.shiftType === "Night");

    const groupByQuality = (machines) => {
      const grouped = {};
      machines.forEach(m => {
        if (!grouped[m.qualityName]) {
          grouped[m.qualityName] = {
            qualityName: m.qualityName,
            machines: [],
            totalMachines: 0,
            totalRPM: 0,
            totalPick: 0,
            totalProduction: 0,
          };
        }
        grouped[m.qualityName].machines.push(m.machineNumber);
        grouped[m.qualityName].totalMachines++;
        grouped[m.qualityName].totalRPM += m.rpm;
        grouped[m.qualityName].totalPick += m.pick;
        grouped[m.qualityName].totalProduction += m.productionShift;
      });

      return Object.values(grouped).map(g => ({
        ...g,
        avgRPM: Math.round(g.totalRPM / g.totalMachines),
        avgPick: (g.totalPick / g.totalMachines).toFixed(2),
        machineList: g.machines.join(", "),
      }));
    };

    const dayData = groupByQuality(dayShift);
    const nightData = groupByQuality(nightShift);

    const dayTotalProduction = dayData.reduce((sum, d) => sum + d.totalProduction, 0);
    const nightTotalProduction = nightData.reduce((sum, d) => sum + d.totalProduction, 0);
    const dayAvgRPM = Math.round(dayShift.reduce((sum, m) => sum + m.rpm, 0) / dayShift.length);
    const nightAvgRPM = Math.round(nightShift.reduce((sum, m) => sum + m.rpm, 0) / nightShift.length);
    const dayAvgPick = (dayShift.reduce((sum, m) => sum + m.pick, 0) / dayShift.length).toFixed(2);
    const nightAvgPick = (nightShift.reduce((sum, m) => sum + m.pick, 0) / nightShift.length).toFixed(2);

    return {
      dayData,
      nightData,
      dayTotalProduction,
      nightTotalProduction,
      dayAvgRPM,
      nightAvgRPM,
      dayAvgPick,
      nightAvgPick,
    };
  }, []);

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(40);
    doc.text("TECHNOTEX SOLUTIONS", 148, 15, { align: "center" });
    
    doc.setFontSize(16);
    doc.text(`Performance Pulse (${new Date(selectedDate).toLocaleDateString()})`, 148, 25, { align: "center" });

    // Day Shift Section
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.text("Day Shift", 14, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total Production: ${performanceData.dayTotalProduction.toFixed(2)}`, 14, 42);
    doc.text(`Avg. RPM: ${performanceData.dayAvgRPM}`, 100, 42);
    doc.text(`Avg. Pick: ${performanceData.dayAvgPick}`, 160, 42);

    const dayTableData = performanceData.dayData.map(row => [
      row.qualityName,
      row.totalMachines,
      row.avgRPM,
      row.avgPick,
      row.machineList,
      row.totalProduction.toFixed(2),
    ]);

    doc.autoTable({
      startY: 48,
      head: [['Cloth Quality', 'Total Machine', 'RPM', 'Group Avg Pick', 'Machine No', 'Prod']],
      body: dayTableData,
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 100 },
      },
    });

    // Night Shift Section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(156, 39, 176);
    doc.text("Night Shift", 14, finalY);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Total Production: ${performanceData.nightTotalProduction.toFixed(2)}`, 14, finalY + 7);
    doc.text(`Avg. RPM: ${performanceData.nightAvgRPM}`, 100, finalY + 7);
    doc.text(`Avg. Pick: ${performanceData.nightAvgPick}`, 160, finalY + 7);

    const nightTableData = performanceData.nightData.map(row => [
      row.qualityName,
      row.totalMachines,
      row.avgRPM,
      row.avgPick,
      row.machineList,
      row.totalProduction.toFixed(2),
    ]);

    doc.autoTable({
      startY: finalY + 13,
      head: [['Cloth Quality', 'Total Machine', 'RPM', 'Group Avg Pick', 'Machine No', 'Prod']],
      body: nightTableData,
      theme: 'grid',
      headStyles: { fillColor: [156, 39, 176], fontSize: 9, fontStyle: 'bold' },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 100 },
      },
    });

    doc.save(`performance_pulse_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {/* Date Filters */}
            <Card sx={{ ...getCardStyles(darkMode), mb: 2 }}>
              <ArgonBox p={2}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={6}>
                    <ArgonBox display="flex" alignItems="center" gap={2}>
                      <ArgonTypography variant="h6" fontWeight="medium" color={darkMode ? "white" : "dark"}>
                        Date Filter:
                      </ArgonTypography>
                      <ButtonGroup variant="outlined" size="small">
                        <ArgonButton
                          color={dateFilter === "today" ? sidenavColor : "secondary"}
                          variant={dateFilter === "today" ? "gradient" : "outlined"}
                          onClick={() => handleQuickFilter("today")}
                          sx={{ 
                            fontSize: "0.75rem",
                            px: 2,
                            color: dateFilter === "today" ? "white" : (darkMode ? "#fff" : "inherit"),
                            borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)"
                          }}
                        >
                          Today
                        </ArgonButton>
                        <ArgonButton
                          color={dateFilter === "yesterday" ? sidenavColor : "secondary"}
                          variant={dateFilter === "yesterday" ? "gradient" : "outlined"}
                          onClick={() => handleQuickFilter("yesterday")}
                          sx={{ 
                            fontSize: "0.75rem",
                            px: 2,
                            color: dateFilter === "yesterday" ? "white" : (darkMode ? "#fff" : "inherit"),
                            borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)"
                          }}
                        >
                          Yesterday
                        </ArgonButton>
                        <ArgonButton
                          color={dateFilter === "last7days" ? sidenavColor : "secondary"}
                          variant={dateFilter === "last7days" ? "gradient" : "outlined"}
                          onClick={() => handleQuickFilter("last7days")}
                          sx={{ 
                            fontSize: "0.75rem",
                            px: 2,
                            color: dateFilter === "last7days" ? "white" : (darkMode ? "#fff" : "inherit"),
                            borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)"
                          }}
                        >
                          Last 7 Days
                        </ArgonButton>
                        <ArgonButton
                          color={dateFilter === "last30days" ? sidenavColor : "secondary"}
                          variant={dateFilter === "last30days" ? "gradient" : "outlined"}
                          onClick={() => handleQuickFilter("last30days")}
                          sx={{ 
                            fontSize: "0.75rem",
                            px: 2,
                            color: dateFilter === "last30days" ? "white" : (darkMode ? "#fff" : "inherit"),
                            borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)"
                          }}
                        >
                          Last 30 Days
                        </ArgonButton>
                      </ButtonGroup>
                    </ArgonBox>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      type="date"
                      label="Custom Date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      fullWidth
                      size="small"
                      InputLabelProps={{
                        shrink: true,
                        style: { color: darkMode ? "#fff" : "inherit" }
                      }}
                      InputProps={{
                        style: { 
                          color: darkMode ? "#fff" : "inherit",
                          borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.23)"
                        }
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
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <ArgonButton 
                      color="error"
                      variant="gradient" 
                      onClick={exportPDF}
                      fullWidth
                      sx={getExportButtonStyles(theme, sidenavColor)}
                    >
                      <Icon sx={{ mr: 1 }}>picture_as_pdf</Icon> Export PDF
                    </ArgonButton>
                  </Grid>
                </Grid>
              </ArgonBox>
            </Card>

            {/* Day Shift Section */}
            <Card sx={{ ...getCardStyles(darkMode), mb: 3 }}>
              <ArgonBox p={2.5}>
                <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <ArgonBox>
                    <ArgonTypography variant="h5" fontWeight="bold" color="info">
                      Day Shift
                    </ArgonTypography>
                    <ArgonTypography variant="caption" color="text">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </ArgonTypography>
                  </ArgonBox>
                  <ArgonBox display="flex" gap={3}>
                    <ArgonBox>
                      <ArgonTypography variant="caption" color="text">Total Production</ArgonTypography>
                      <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {performanceData.dayTotalProduction.toFixed(2)}
                      </ArgonTypography>
                    </ArgonBox>
                    <ArgonBox>
                      <ArgonTypography variant="caption" color="text">Avg. RPM</ArgonTypography>
                      <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {performanceData.dayAvgRPM}
                      </ArgonTypography>
                    </ArgonBox>
                    <ArgonBox>
                      <ArgonTypography variant="caption" color="text">Avg. Pick</ArgonTypography>
                      <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {performanceData.dayAvgPick}
                      </ArgonTypography>
                    </ArgonBox>
                  </ArgonBox>
                </ArgonBox>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Cloth Quality
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Total Machine
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          RPM
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Group Avg Pick
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Machine No
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Prod
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceData.dayData.map((row, index) => (
                        <TableRow key={index} sx={{ "&:hover": { background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" } }}>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit", fontWeight: "bold" }}>{row.qualityName}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit" }}>{row.totalMachines}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit" }}>{row.avgRPM}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit" }}>{row.avgPick}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit", fontSize: "0.75rem" }}>{row.machineList}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit", fontWeight: "bold" }}>{row.totalProduction.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ArgonBox>
            </Card>

            {/* Night Shift Section */}
            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
                <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <ArgonBox>
                    <ArgonTypography variant="h5" fontWeight="bold" color="secondary">
                      Night Shift
                    </ArgonTypography>
                    <ArgonTypography variant="caption" color="text">
                      {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </ArgonTypography>
                  </ArgonBox>
                  <ArgonBox display="flex" gap={3}>
                    <ArgonBox>
                      <ArgonTypography variant="caption" color="text">Total Production</ArgonTypography>
                      <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {performanceData.nightTotalProduction.toFixed(2)}
                      </ArgonTypography>
                    </ArgonBox>
                    <ArgonBox>
                      <ArgonTypography variant="caption" color="text">Avg. RPM</ArgonTypography>
                      <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {performanceData.nightAvgRPM}
                      </ArgonTypography>
                    </ArgonBox>
                    <ArgonBox>
                      <ArgonTypography variant="caption" color="text">Avg. Pick</ArgonTypography>
                      <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {performanceData.nightAvgPick}
                      </ArgonTypography>
                    </ArgonBox>
                  </ArgonBox>
                </ArgonBox>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Cloth Quality
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Total Machine
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          RPM
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Group Avg Pick
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Machine No
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold", background: darkMode ? "#1a2332" : "#f8f9fa", color: darkMode ? "#fff" : "inherit" }}>
                          Prod
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {performanceData.nightData.map((row, index) => (
                        <TableRow key={index} sx={{ "&:hover": { background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)" } }}>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit", fontWeight: "bold" }}>{row.qualityName}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit" }}>{row.totalMachines}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit" }}>{row.avgRPM}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit" }}>{row.avgPick}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit", fontSize: "0.75rem" }}>{row.machineList}</TableCell>
                          <TableCell align="center" sx={{ color: darkMode ? "#fff" : "inherit", fontWeight: "bold" }}>{row.totalProduction.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default PerformancePulse;
