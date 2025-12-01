// Comprehensive Analytics Dashboard with all production metrics

import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { useTheme } from "@mui/material/styles";
  import {
    BarChart,
    Bar,
    LineChart,
    Line,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    RadarChart,
    Radar,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
  } from "recharts";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { machinesData } from "../machine-management/data";
import { useArgonController } from "context";

function Dashboard() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [timeRange, setTimeRange] = useState("day"); // day, month, year

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const totalMachines = machinesData.length;
    
    // Total Production (2 shifts)
    const totalProduction = machinesData.reduce((sum, m) => sum + m.productionDay, 0);
    
    // Average Metrics
    const avgEfficiency = (machinesData.reduce((sum, m) => sum + m.efficiency, 0) / totalMachines).toFixed(2);
    const avgCurrent = (machinesData.reduce((sum, m) => sum + m.current, 0) / totalMachines).toFixed(2);
    const avgRPM = Math.round(machinesData.reduce((sum, m) => sum + m.rpm, 0) / totalMachines);
    const avgPick = Math.round(machinesData.reduce((sum, m) => sum + m.pick, 0) / totalMachines);
    const avgBreakdown = (machinesData.reduce((sum, m) => sum + m.totalStop, 0) / totalMachines).toFixed(1);
    
    // Quality-wise production
    const qualityProduction = {};
    machinesData.forEach(m => {
      if (!qualityProduction[m.qualityName]) {
        qualityProduction[m.qualityName] = 0;
      }
      qualityProduction[m.qualityName] += m.productionDay;
    });
    
    return {
      totalMachines,
      totalProduction,
      avgEfficiency,
      avgCurrent,
      avgRPM,
      avgPick,
      avgBreakdown,
      qualityProduction,
    };
  }, []);

  // Sample data for charts (would come from API in production)
  const productionData = [
    { name: "Mon", SuperSoft: 2800, PrimeWeft: 2100, ComfortWeave: 1900, UltraWeave: 1500, BasicWeave: 1200 },
    { name: "Tue", SuperSoft: 2600, PrimeWeft: 1900, ComfortWeave: 2100, UltraWeave: 1700, BasicWeave: 1100 },
    { name: "Wed", SuperSoft: 2900, PrimeWeft: 2200, ComfortWeave: 1800, UltraWeave: 1600, BasicWeave: 1300 },
    { name: "Thu", SuperSoft: 2700, PrimeWeft: 2000, ComfortWeave: 2000, UltraWeave: 1550, BasicWeave: 1150 },
    { name: "Fri", SuperSoft: 2850, PrimeWeft: 2150, ComfortWeave: 1950, UltraWeave: 1650, BasicWeave: 1250 },
    { name: "Sat", SuperSoft: 2750, PrimeWeft: 2050, ComfortWeave: 2050, UltraWeave: 1600, BasicWeave: 1200 },
    { name: "Sun", SuperSoft: 2800, PrimeWeft: 2100, ComfortWeave: 1900, UltraWeave: 1580, BasicWeave: 1220 },
  ];

  const yarnUsageData = [
    { name: "Mon", Warping: 320, Twisting: 280, Weft: 250 },
    { name: "Tue", Warping: 310, Twisting: 270, Weft: 240 },
    { name: "Wed", Warping: 330, Twisting: 290, Weft: 260 },
    { name: "Thu", Warping: 315, Twisting: 275, Weft: 245 },
    { name: "Fri", Warping: 325, Twisting: 285, Weft: 255 },
    { name: "Sat", Warping: 318, Twisting: 278, Weft: 248 },
    { name: "Sun", Warping: 322, Twisting: 282, Weft: 252 },
  ];

  const deliveredTakaData = [
    { name: "Mon", SuperSoft: 8500, PrimeWeft: 7200, ComfortWeave: 6800, UltraWeave: 5500, BasicWeave: 4200 },
    { name: "Tue", SuperSoft: 8200, PrimeWeft: 6900, ComfortWeave: 7100, UltraWeave: 5800, BasicWeave: 4000 },
    { name: "Wed", SuperSoft: 8700, PrimeWeft: 7400, ComfortWeave: 6600, UltraWeave: 5600, BasicWeave: 4300 },
    { name: "Thu", SuperSoft: 8400, PrimeWeft: 7100, ComfortWeave: 6900, UltraWeave: 5650, BasicWeave: 4100 },
    { name: "Fri", SuperSoft: 8600, PrimeWeft: 7300, ComfortWeave: 6750, UltraWeave: 5700, BasicWeave: 4250 },
  ];

  const deliveredMeterData = [
    { name: "Mon", SuperSoft: 2650, PrimeWeft: 2050, ComfortWeave: 1850, UltraWeave: 1450, BasicWeave: 1150 },
    { name: "Tue", SuperSoft: 2550, PrimeWeft: 1950, ComfortWeave: 2050, UltraWeave: 1650, BasicWeave: 1050 },
    { name: "Wed", SuperSoft: 2750, PrimeWeft: 2150, ComfortWeave: 1750, UltraWeave: 1550, BasicWeave: 1250 },
    { name: "Thu", SuperSoft: 2650, PrimeWeft: 2000, ComfortWeave: 1950, UltraWeave: 1500, BasicWeave: 1100 },
    { name: "Fri", SuperSoft: 2700, PrimeWeft: 2100, ComfortWeave: 1850, UltraWeave: 1600, BasicWeave: 1200 },
  ];

  const foldingDeliveryMetersData = [
    { name: "Mon", FoldingMeter: 2400, DeliveryMeter: 2700 },
    { name: "Tue", FoldingMeter: 2350, DeliveryMeter: 2600 },
    { name: "Wed", FoldingMeter: 2450, DeliveryMeter: 2800 },
    { name: "Thu", FoldingMeter: 2380, DeliveryMeter: 2680 },
    { name: "Fri", FoldingMeter: 2420, DeliveryMeter: 2750 },
    { name: "Sat", FoldingMeter: 2390, DeliveryMeter: 2720 },
    { name: "Sun", FoldingMeter: 2410, DeliveryMeter: 2740 },
  ];

  const foldingDeliveryTotalsData = [
    { name: "Mon", FoldingTaka: 7800, DeliveryTaka: 10400 },
    { name: "Tue", FoldingTaka: 7600, DeliveryTaka: 10100 },
    { name: "Wed", FoldingTaka: 8100, DeliveryTaka: 10700 },
    { name: "Thu", FoldingTaka: 7900, DeliveryTaka: 10350 },
    { name: "Fri", FoldingTaka: 8050, DeliveryTaka: 10600 },
    { name: "Sat", FoldingTaka: 7950, DeliveryTaka: 10450 },
    { name: "Sun", FoldingTaka: 8000, DeliveryTaka: 10500 },
  ];

  const efficiencyTrendData = [
    { name: "Mon", efficiency: 88.5 },
    { name: "Tue", efficiency: 90.2 },
    { name: "Wed", efficiency: 87.8 },
    { name: "Thu", efficiency: 92.1 },
    { name: "Fri", efficiency: 89.5 },
    { name: "Sat", efficiency: 91.3 },
    { name: "Sun", efficiency: 93.2 },
  ];

  const currentTrendData = [
    { name: "Mon", current: 11.6 },
    { name: "Tue", current: 12.1 },
    { name: "Wed", current: 11.3 },
    { name: "Thu", current: 12.4 },
    { name: "Fri", current: 11.8 },
    { name: "Sat", current: 12.0 },
    { name: "Sun", current: 12.3 },
  ];

  const rpmTrendData = [
    { name: "Mon", rpm: 880 },
    { name: "Tue", rpm: 900 },
    { name: "Wed", rpm: 870 },
    { name: "Thu", rpm: 925 },
    { name: "Fri", rpm: 890 },
    { name: "Sat", rpm: 905 },
    { name: "Sun", rpm: 915 },
  ];

  const pickTrendData = [
    { name: "Mon", pick: 62 },
    { name: "Tue", pick: 64 },
    { name: "Wed", pick: 60 },
    { name: "Thu", pick: 66 },
    { name: "Fri", pick: 63 },
    { name: "Sat", pick: 65 },
    { name: "Sun", pick: 67 },
  ];

  const shortageTrendData = [
    { name: "Jul", v6: 2000, v7: 4000, v8: 0 },
    { name: "Aug", v6: 3500, v7: 6000, v8: 0 },
    { name: "Sep", v6: 5000, v7: 8500, v8: 0 },
    { name: "Oct", v6: 7000, v7: 12000, v8: 0 },
    { name: "Nov", v6: 12000, v7: 15000, v8: 0 },
    { name: "Dec", v6: 18000, v7: 19000, v8: 0 },
    { name: "Jan", v6: 30000, v7: 22000, v8: 5000 },
    { name: "Feb", v6: 45000, v7: 26000, v8: 9000 },
    { name: "Mar", v6: 52000, v7: 30000, v8: 16000 },
    { name: "Apr", v6: 48000, v7: 35000, v8: 24000 },
    { name: "May", v6: 52000, v7: 38000, v8: 30000 },
  ];

  const shortageTotalData = shortageTrendData.map((d) => ({ name: d.name, total: (d.v6 || 0) + (d.v7 || 0) + (d.v8 || 0) }));

  const stoppageAnalysisData = [
    { name: "Filler Stop", value: 35, hours: 0.7, color: "#f44336" },
    { name: "Machine Stop", value: 30, hours: 0.6, color: "#ff9800" },
    { name: "Sensor Stop", value: 20, hours: 0.4, color: "#2196f3" },
    { name: "Other Stop", value: 15, hours: 0.3, color: "#9c27b0" },
  ];

  const errorAnalysisData = [
    { name: "Mon", Mechanical: 12, Electrical: 8, WeftYarn: 5 },
    { name: "Tue", Mechanical: 10, Electrical: 6, WeftYarn: 7 },
    { name: "Wed", Mechanical: 15, Electrical: 9, WeftYarn: 6 },
    { name: "Thu", Mechanical: 11, Electrical: 7, WeftYarn: 8 },
    { name: "Fri", Mechanical: 13, Electrical: 10, WeftYarn: 4 },
    { name: "Sat", Mechanical: 9, Electrical: 5, WeftYarn: 6 },
    { name: "Sun", Mechanical: 14, Electrical: 8, WeftYarn: 7 },
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => {
    StatCard.propTypes = {
      title: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      icon: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      subtitle: PropTypes.string,
    };

    return (
      <Card
        sx={{
          p: 2.5,
          height: "100%",
          background: darkMode 
            ? "linear-gradient(135deg, #1a2332 0%, #2d3748 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)",
          borderRadius: "12px",
          border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: darkMode 
              ? "0 8px 24px rgba(0, 0, 0, 0.6)"
              : "0 8px 24px rgba(0, 0, 0, 0.12)",
          }
        }}
      >
        <ArgonBox display="flex" justifyContent="space-between" alignItems="center">
          <ArgonBox>
            <ArgonTypography variant="caption" color="text" fontWeight="medium">
              {title}
            </ArgonTypography>
            <ArgonTypography variant="h4" fontWeight="bold" color={darkMode ? "white" : "dark"} mt={0.5}>
              {value}
            </ArgonTypography>
            {subtitle ? (
              <ArgonTypography variant="caption" color="text" mt={0.5}>
                {subtitle}
              </ArgonTypography>
            ) : (
              <ArgonTypography variant="caption" color="text" mt={0.5} sx={{ visibility: "hidden" }}>
                placeholder
              </ArgonTypography>
            )}
          </ArgonBox>
          <ArgonBox
            sx={{
              width: 56,
              height: 56,
              borderRadius: "12px",
              background: `linear-gradient(135deg, ${color}20 0%, ${color}40 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color, fontSize: "28px" }}>{icon}</Icon>
          </ArgonBox>
        </ArgonBox>
      </Card>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        {/* Header */}
        <ArgonBox display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
          <ArgonBox display="flex" gap={1}>
            <ArgonButton
              size="small"
              color={timeRange === "day" ? (sidenavColor || "info") : "secondary"}
              variant={timeRange === "day" ? "gradient" : "outlined"}
              onClick={() => setTimeRange("day")}
              sx={{ borderRadius: "8px" }}
            >
              Day
            </ArgonButton>
            <ArgonButton
              size="small"
              color={timeRange === "month" ? (sidenavColor || "info") : "secondary"}
              variant={timeRange === "month" ? "gradient" : "outlined"}
              onClick={() => setTimeRange("month")}
              sx={{ borderRadius: "8px" }}
            >
              Month
            </ArgonButton>
            <ArgonButton
              size="small"
              color={timeRange === "year" ? (sidenavColor || "info") : "secondary"}
              variant={timeRange === "year" ? "gradient" : "outlined"}
              onClick={() => setTimeRange("year")}
              sx={{ borderRadius: "8px" }}
            >
              Year
            </ArgonButton>
          </ArgonBox>
        </ArgonBox>

        {/* Key Metrics Row 1 */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Total Machines"
              value={analytics.totalMachines}
              icon="precision_manufacturing"
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Total Production"
              value={`${analytics.totalProduction.toLocaleString()}m`}
              icon="inventory"
              color="#4caf50"
              subtitle="2 Shifts"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Avg Efficiency"
              value={`${analytics.avgEfficiency}%`}
              icon="insights"
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Avg Current"
              value={`${analytics.avgCurrent}A`}
              icon="bolt"
              color="#9c27b0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Avg RPM"
              value={analytics.avgRPM}
              icon="speed"
              color="#00bcd4"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <StatCard
              title="Avg Pick"
              value={analytics.avgPick}
              icon="straighten"
              color="#e91e63"
            />
          </Grid>
        </Grid>

        {/* Charts Row 1C - Total Production (Stacked by Quality) */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Total Production (Stacked by Quality)
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData} barSize={28} barGap={8} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="SuperSoft" stackId="total" fill="#2196f3" />
                  <Bar dataKey="PrimeWeft" stackId="total" fill="#4caf50" />
                  <Bar dataKey="ComfortWeave" stackId="total" fill="#ff9800" />
                  <Bar dataKey="UltraWeave" stackId="total" fill="#9c27b0" />
                  <Bar dataKey="BasicWeave" stackId="total" fill="#e91e63" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 1 - Production */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={8}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Quality-wise Production (Grouped Bars)
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData} barSize={22} barGap={8} barCategoryGap={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="SuperSoft" fill="#2196f3" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="PrimeWeft" fill="#4caf50" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="ComfortWeave" fill="#ff9800" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="UltraWeave" fill="#9c27b0" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="BasicWeave" fill="#e91e63" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Efficiency Trend
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={efficiencyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} domain={[80, 100]} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="efficiency" stroke="#ff9800" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 1B - Current/RPM/Pick Trends */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Avg Current Trend
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={currentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="current" stroke="#9c27b0" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Avg RPM Trend
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={rpmTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="rpm" stroke="#2196f3" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Avg Pick Trend
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={pickTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="pick" stroke="#4caf50" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 2 - Yarn Usage & Error Analysis */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Yarn Usage by Department
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={yarnUsageData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Warping" stackId="a" fill="#2196f3" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Twisting" stackId="a" fill="#4caf50" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Weft" stackId="a" fill="#ff9800" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Error Analysis (Date-wise)
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={errorAnalysisData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Mechanical" fill="#f44336" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Electrical" fill="#ff9800" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="WeftYarn" fill="#2196f3" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 2B - Totals: Folding vs Delivery Taka */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Total Folding Taka vs Total Delivery Taka
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={foldingDeliveryTotalsData} barSize={24} barGap={10} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="FoldingTaka" fill="#2196f3" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="DeliveryTaka" fill="#00bcd4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3} mb={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Total Folding Meter vs Total Delivery Meter
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={foldingDeliveryMetersData} barSize={24} barGap={10} barCategoryGap={30}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="FoldingMeter" fill="#4caf50" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="DeliveryMeter" fill="#8bc34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        

        {/* Charts Row 3 - Stoppage Analysis (Pie) */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "14px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Stoppage Analysis (Avg 2.0 hrs/machine)
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "10px",
                    }}
                    formatter={(value, name, entry) => [`${value}%`, `${entry?.payload?.hours}h`]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={10}
                    wrapperStyle={{ paddingTop: 6 }}
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: darkMode ? "#e5e7eb" : "#4b5563" }}>{value}</span>
                    )}
                  />
                  <Pie
                    data={stoppageAnalysisData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={90}
                    outerRadius={130}
                    label
                    labelLine={false}
                  >
                    {stoppageAnalysisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "14px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Average Shortage Total (Area)
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={shortageTotalData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 4 - Delivered Taka & Meter */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Quality-wise Delivered Taka
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveredTakaData} barSize={35}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="SuperSoft" stackId="a" fill="#2196f3" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="PrimeWeft" stackId="a" fill="#4caf50" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="ComfortWeave" stackId="a" fill="#ff9800" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="UltraWeave" stackId="a" fill="#9c27b0" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="BasicWeave" stackId="a" fill="#e91e63" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 2.5,
                background: darkMode ? "#1a2332" : "#ffffff",
                borderRadius: "12px",
                border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Quality-wise Delivered Meter
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveredMeterData} barSize={35}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="SuperSoft" stackId="a" fill="#2196f3" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="PrimeWeft" stackId="a" fill="#4caf50" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="ComfortWeave" stackId="a" fill="#ff9800" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="UltraWeave" stackId="a" fill="#9c27b0" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="BasicWeave" stackId="a" fill="#e91e63" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
