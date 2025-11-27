// Analytics Dashboard with comprehensive charts and metrics

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
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
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
  const accentMain = theme.palette[sidenavColor]?.main || theme.palette.info.main;
  const accentState = theme.palette.gradients?.[sidenavColor]?.state || theme.palette.gradients.info.state;
  const successMain = theme.palette.success.main;
  const warningMain = theme.palette.warning.main;
  const secondaryMain = theme.palette.secondary.main;
  
  const [timeRange, setTimeRange] = useState("day"); // day, month, year

  // Calculate analytics from machine data
  const analytics = useMemo(() => {
    const totalMachines = machinesData.length;
    
    // Total Production
    const totalProduction = machinesData.reduce((sum, m) => sum + m.productionDay, 0);
    
    // Average Efficiency
    const avgEfficiency = (machinesData.reduce((sum, m) => sum + m.efficiency, 0) / totalMachines).toFixed(2);
    
    // Average Current
    const avgCurrent = (machinesData.reduce((sum, m) => sum + m.current, 0) / totalMachines).toFixed(2);
    
    // Average RPM
    const avgRPM = Math.round(machinesData.reduce((sum, m) => sum + m.rpm, 0) / totalMachines);
    
    // Average Pick
    const avgPick = Math.round(machinesData.reduce((sum, m) => sum + m.pick, 0) / totalMachines);
    
    // Average Breakdown (Total Stop)
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

  // Sample data for charts (in real app, this would come from API based on timeRange)
  const productionData = [
    { name: "Mon", SuperSoft: 4000, PrimeWeft: 2400, ComfortWeave: 2400, UltraWeave: 1800 },
    { name: "Tue", SuperSoft: 3000, PrimeWeft: 1398, ComfortWeave: 2210, UltraWeave: 2000 },
    { name: "Wed", SuperSoft: 2000, PrimeWeft: 9800, ComfortWeave: 2290, UltraWeave: 2200 },
    { name: "Thu", SuperSoft: 2780, PrimeWeft: 3908, ComfortWeave: 2000, UltraWeave: 1900 },
    { name: "Fri", SuperSoft: 1890, PrimeWeft: 4800, ComfortWeave: 2181, UltraWeave: 2100 },
    { name: "Sat", SuperSoft: 2390, PrimeWeft: 3800, ComfortWeave: 2500, UltraWeave: 2300 },
    { name: "Sun", SuperSoft: 3490, PrimeWeft: 4300, ComfortWeave: 2100, UltraWeave: 2400 },
  ];

  const yarnUsageData = [
    { name: "Mon", Warping: 400, Twisting: 240, Weft: 240 },
    { name: "Tue", Warping: 300, Twisting: 139, Weft: 221 },
    { name: "Wed", Warping: 200, Twisting: 980, Weft: 229 },
    { name: "Thu", Warping: 278, Twisting: 390, Weft: 200 },
    { name: "Fri", Warping: 189, Twisting: 480, Weft: 218 },
    { name: "Sat", Warping: 239, Twisting: 380, Weft: 250 },
    { name: "Sun", Warping: 349, Twisting: 430, Weft: 210 },
  ];

  const efficiencyTrendData = [
    { name: "Mon", efficiency: 88 },
    { name: "Tue", efficiency: 90 },
    { name: "Wed", efficiency: 87 },
    { name: "Thu", efficiency: 92 },
    { name: "Fri", efficiency: 89 },
    { name: "Sat", efficiency: 91 },
    { name: "Sun", efficiency: 93 },
  ];

  const stoppageAnalysisData = [
    { name: "Mechanical", value: 45, color: theme.palette.error.main },
    { name: "Electrical", value: 30, color: warningMain },
    { name: "Weft Yarn", value: 25, color: accentMain },
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
        borderLeft: `4px solid ${accentMain}`,
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
          {subtitle && (
            <ArgonTypography variant="caption" color="text" mt={0.5}>
              {subtitle}
            </ArgonTypography>
          )}
        </ArgonBox>
        <ArgonBox
          sx={{
            width: 56,
            height: 56,
            borderRadius: "12px",
            background: theme.functions.linearGradient(
              theme.functions.rgba(accentMain, 0.18),
              theme.functions.rgba(accentState || accentMain, 0.35),
              135
            ),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon sx={{ color: accentMain, fontSize: "28px" }}>{icon}</Icon>
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

        {/* Key Metrics */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Total Machines"
              value={analytics.totalMachines}
              icon="precision_manufacturing"
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Total Production"
              value={`${analytics.totalProduction.toLocaleString()}m`}
              icon="inventory"
              color="#4caf50"
              subtitle="Today"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Avg Efficiency"
              value={`${analytics.avgEfficiency}%`}
              icon="insights"
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Avg Current"
              value={`${analytics.avgCurrent}A`}
              icon="bolt"
              color="#9c27b0"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <StatCard
              title="Avg RPM"
              value={analytics.avgRPM}
              icon="speed"
              color="#00bcd4"
            />
          </Grid>
        </Grid>

        {/* Charts Row 1 */}
        <Grid container spacing={3} mb={3}>
          {/* Quality-wise Production */}
          <Grid item xs={12} lg={8}>
            <Card
              sx={{
                p: 2.5,
                background: theme.functions.linearGradient(
                  theme.functions.rgba(accentMain, darkMode ? 0.10 : 0.06),
                  theme.functions.rgba(accentState || accentMain, darkMode ? 0.16 : 0.10),
                  135
                ),
                borderRadius: "14px",
                border: `1px solid ${theme.functions.rgba(accentMain, darkMode ? 0.25 : 0.18)}`,
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Quality-wise Production (Stacked Bar Chart)
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={productionData} barCategoryGap="12%">
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "10px",
                    }}
                  />
                  <Legend 
                    iconType="circle" 
                    iconSize={10} 
                    wrapperStyle={{ paddingTop: 6 }}
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: darkMode ? "#e5e7eb" : "#4b5563" }}>{value}</span>
                    )}
                  />
                  <Bar dataKey="SuperSoft" stackId="a" fill={accentMain} radius={[0,0,8,8]} />
                  <Bar dataKey="PrimeWeft" stackId="a" fill={successMain} radius={[0,0,0,0]} />
                  <Bar dataKey="ComfortWeave" stackId="a" fill={warningMain} radius={[0,0,0,0]} />
                  <Bar dataKey="UltraWeave" stackId="a" fill={secondaryMain} radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Efficiency Trend */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                p: 2.5,
                background: theme.functions.linearGradient(
                  theme.functions.rgba(accentMain, darkMode ? 0.10 : 0.06),
                  theme.functions.rgba(accentState || accentMain, darkMode ? 0.16 : 0.10),
                  135
                ),
                borderRadius: "14px",
                border: `1px solid ${theme.functions.rgba(accentMain, darkMode ? 0.25 : 0.18)}`,
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Efficiency Trend
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={efficiencyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} domain={[80, 100]} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "10px",
                    }}
                  />
                  <Legend 
                    iconType="circle" 
                    iconSize={10} 
                    wrapperStyle={{ paddingTop: 6 }}
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: darkMode ? "#e5e7eb" : "#4b5563" }}>{value}</span>
                    )}
                  />
                  <Line type="monotone" dataKey="efficiency" stroke={accentMain} strokeWidth={3} strokeLinecap="round" dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>

        {/* Charts Row 2 */}
        <Grid container spacing={3}>
          {/* Yarn Usage by Department */}
          <Grid item xs={12} lg={6}>
            <Card
              sx={{
                p: 2.5,
                background: theme.functions.linearGradient(
                  theme.functions.rgba(accentMain, darkMode ? 0.10 : 0.06),
                  theme.functions.rgba(accentState || accentMain, darkMode ? 0.16 : 0.10),
                  135
                ),
                borderRadius: "14px",
                border: `1px solid ${theme.functions.rgba(accentMain, darkMode ? 0.25 : 0.18)}`,
              }}
            >
              <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                Yarn Usage by Department
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={yarnUsageData} barCategoryGap="12%">
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                  <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                      border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "10px",
                    }}
                  />
                  <Legend 
                    iconType="circle" 
                    iconSize={10} 
                    wrapperStyle={{ paddingTop: 6 }}
                    formatter={(value) => (
                      <span style={{ fontSize: 12, color: darkMode ? "#e5e7eb" : "#4b5563" }}>{value}</span>
                    )}
                  />
                  <Bar dataKey="Warping" stackId="a" fill={accentMain} radius={[0,0,8,8]} />
                  <Bar dataKey="Twisting" stackId="a" fill={successMain} radius={[0,0,0,0]} />
                  <Bar dataKey="Weft" stackId="a" fill={warningMain} radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>

          {/* Stoppage Analysis */}
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
                Stoppage Analysis
              </ArgonTypography>
              <ArgonBox mt={3}>
                {stoppageAnalysisData.map((item, index) => (
                  <ArgonBox key={index} mb={2}>
                    <ArgonBox display="flex" justifyContent="space-between" mb={0.5}>
                      <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {item.name}
                      </ArgonTypography>
                      <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {item.value}%
                      </ArgonTypography>
                    </ArgonBox>
                    <ArgonBox
                      sx={{
                        width: "100%",
                        height: "8px",
                        borderRadius: "4px",
                        background: darkMode ? "#374151" : "#e5e7eb",
                        overflow: "hidden",
                      }}
                    >
                      <ArgonBox
                        sx={{
                          width: `${item.value}%`,
                          height: "100%",
                          background: item.color,
                          transition: "width 0.5s ease",
                        }}
                      />
                    </ArgonBox>
                  </ArgonBox>
                ))}
              </ArgonBox>
              <ArgonBox mt={3} p={2} borderRadius="8px" sx={{ background: darkMode ? "rgba(255,152,0,0.1)" : "rgba(255,152,0,0.05)" }}>
                <ArgonTypography variant="caption" color="text">
                  Average Breakdown Time
                </ArgonTypography>
                <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                  {analytics.avgBreakdown} stops/machine
                </ArgonTypography>
              </ArgonBox>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
