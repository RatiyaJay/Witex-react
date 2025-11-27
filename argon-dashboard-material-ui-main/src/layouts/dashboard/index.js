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

  const efficiencyTrendData = [
    { name: "Mon", efficiency: 88.5 },
    { name: "Tue", efficiency: 90.2 },
    { name: "Wed", efficiency: 87.8 },
    { name: "Thu", efficiency: 92.1 },
    { name: "Fri", efficiency: 89.5 },
    { name: "Sat", efficiency: 91.3 },
    { name: "Sun", efficiency: 93.2 },
  ];

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

        {/* Key Metrics Row 2 */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Breakdown"
              value={`${analytics.avgBreakdown} stops`}
              icon="report_problem"
              color="#f44336"
              subtitle="Per Machine"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Starting Time"
              value="8.5 min"
              icon="timer"
              color="#ff5722"
              subtitle="Stop to Running"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Folding Taka"
              value="45,280"
              icon="receipt_long"
              color="#3f51b5"
              subtitle="From Mending"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Folding Meter"
              value="38,450m"
              icon="straighten"
              color="#009688"
              subtitle="From Mending"
            />
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
                Quality-wise Production (Stacked Bar)
              </ArgonTypography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productionData} barSize={35}>
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

        {/* Charts Row 3 - Stoppage Analysis */}
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
                Stoppage Analysis (Avg 2.0 hrs/machine)
              </ArgonTypography>
              <ArgonBox mt={3}>
                {stoppageAnalysisData.map((item, index) => (
                  <ArgonBox key={index} mb={2.5}>
                    <ArgonBox display="flex" justifyContent="space-between" mb={0.5}>
                      <ArgonTypography variant="body2" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                        {item.name}
                      </ArgonTypography>
                      <ArgonBox display="flex" gap={2}>
                        <ArgonTypography variant="body2" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                          {item.hours}h
                        </ArgonTypography>
                        <ArgonTypography variant="body2" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                          {item.value}%
                        </ArgonTypography>
                      </ArgonBox>
                    </ArgonBox>
                    <ArgonBox
                      sx={{
                        width: "100%",
                        height: "12px",
                        borderRadius: "6px",
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
                          borderRadius: "6px",
                        }}
                      />
                    </ArgonBox>
                  </ArgonBox>
                ))}
              </ArgonBox>
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
