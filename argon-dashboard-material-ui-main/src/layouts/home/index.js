// This is the Home page - moved from Dashboard
// Contains machine cards and TV view functionality

import { useEffect, useMemo, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
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
} from "recharts";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { machinesData } from "../machine-management/data";
import { beamsData } from "../beam-flow/data";
import { useArgonController } from "context";

function Home() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  const navigate = useNavigate();
  const [view, setView] = useState("home");
  const [tvSection, setTvSection] = useState("charts");
  const tvContainerRef = useRef(null);
  const scrollIntervalRef = useRef(null);
  const machinesTimerRef = useRef(null);
  useEffect(() => {
    if (view !== "tv") {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      if (machinesTimerRef.current) clearTimeout(machinesTimerRef.current);
      return;
    }
    if (tvSection === "charts") {
      const el = tvContainerRef.current;
      if (!el) return;
      el.scrollTop = 0;
      if (machinesTimerRef.current) clearTimeout(machinesTimerRef.current);
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = setInterval(() => {
        if (!el) return;
        const atBottom = Math.ceil(el.scrollTop + el.clientHeight) >= el.scrollHeight;
        if (atBottom) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
          setTvSection("machines");
        } else {
          el.scrollTop = el.scrollTop + 2;
        }
      }, 20);
    } else if (tvSection === "machines") {
      const el = tvContainerRef.current;
      if (el) el.scrollTop = 0;
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
      if (machinesTimerRef.current) clearTimeout(machinesTimerRef.current);
      machinesTimerRef.current = setTimeout(() => {
        setTvSection("charts");
      }, 15000);
    }
    return () => {
      if (scrollIntervalRef.current) clearInterval(scrollIntervalRef.current);
    };
  }, [view, tvSection]);

  const productionData = [
    { name: "Mon", SuperSoft: 2800, PrimeWeft: 2100, ComfortWeave: 1900, UltraWeave: 1500, BasicWeave: 1200 },
    { name: "Tue", SuperSoft: 2600, PrimeWeft: 1900, ComfortWeave: 2100, UltraWeave: 1700, BasicWeave: 1100 },
    { name: "Wed", SuperSoft: 2900, PrimeWeft: 2200, ComfortWeave: 1800, UltraWeave: 1600, BasicWeave: 1300 },
    { name: "Thu", SuperSoft: 2700, PrimeWeft: 2000, ComfortWeave: 2000, UltraWeave: 1550, BasicWeave: 1150 },
    { name: "Fri", SuperSoft: 2850, PrimeWeft: 2150, ComfortWeave: 1950, UltraWeave: 1650, BasicWeave: 1250 },
    { name: "Sat", SuperSoft: 2750, PrimeWeft: 2050, ComfortWeave: 2050, UltraWeave: 1600, BasicWeave: 1200 },
    { name: "Sun", SuperSoft: 2800, PrimeWeft: 2100, ComfortWeave: 1900, UltraWeave: 1580, BasicWeave: 1220 },
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
  const foldingDeliveryTotalsData = [
    { name: "Mon", FoldingTaka: 7800, DeliveryTaka: 10400 },
    { name: "Tue", FoldingTaka: 7600, DeliveryTaka: 10100 },
    { name: "Wed", FoldingTaka: 8100, DeliveryTaka: 10700 },
    { name: "Thu", FoldingTaka: 7900, DeliveryTaka: 10350 },
    { name: "Fri", FoldingTaka: 8050, DeliveryTaka: 10600 },
    { name: "Sat", FoldingTaka: 7950, DeliveryTaka: 10450 },
    { name: "Sun", FoldingTaka: 8000, DeliveryTaka: 10500 },
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
  const stoppageAnalysisData = [
    { name: "Filler Stop", value: 35, hours: 0.7, color: "#f44336" },
    { name: "Machine Stop", value: 30, hours: 0.6, color: "#ff9800" },
    { name: "Sensor Stop", value: 20, hours: 0.4, color: "#2196f3" },
    { name: "Other Stop", value: 15, hours: 0.3, color: "#9c27b0" },
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
  const yarnUsageData = [
    { name: "Mon", Warping: 320, Twisting: 280, Weft: 250 },
    { name: "Tue", Warping: 310, Twisting: 270, Weft: 240 },
    { name: "Wed", Warping: 330, Twisting: 290, Weft: 260 },
    { name: "Thu", Warping: 315, Twisting: 275, Weft: 245 },
    { name: "Fri", Warping: 325, Twisting: 285, Weft: 255 },
  ];
  const errorAnalysisData = [
    { name: "Mon", Mechanical: 12, Electrical: 8, WeftYarn: 5 },
    { name: "Tue", Mechanical: 10, Electrical: 6, WeftYarn: 7 },
    { name: "Wed", Mechanical: 15, Electrical: 9, WeftYarn: 6 },
    { name: "Thu", Mechanical: 11, Electrical: 7, WeftYarn: 8 },
    { name: "Fri", Mechanical: 13, Electrical: 10, WeftYarn: 4 },
  ];

  const getBeamForMachine = (machineNo) => {
    return beamsData.find(b => b.machineNo === machineNo && b.status === "running");
  };

  const getCauseOfErrorIcon = (cause) => {
    switch(cause) {
      case "Mechanical": return "build";
      case "Electrical": return "bolt";
      case "Weft Yarn": return "texture";
      default: return "check_circle";
    }
  };

  const MachineCard = ({ machine }) => {
    const beam = getBeamForMachine(machine.machineNumber);
    const hasError = machine.causeOfError && machine.causeOfError !== "None";
    const themeAccent = theme.palette[sidenavColor]?.main || theme.palette.info.main;
    const leftBorderColor = themeAccent;
    const getCardBg = () => {
      if (machine.causeOfError === "Machine Stop") return "#7B2C36";
      if (machine.causeOfError && machine.causeOfError.toLowerCase().includes("bhidan")) return "#FFD230";
      const eff = machine.efficiency || 0;
      if (eff < 50) return "#550000";
      if (eff < 65) return "#FF5F1F";
      if (eff < 80) return "#C81CDE";
      if (eff < 90) return "#2B6FFF";
      return "#31C950";
    };
    
    MachineCard.propTypes = {
      machine: PropTypes.shape({
        machineNumber: PropTypes.string.isRequired,
        causeOfError: PropTypes.string,
        efficiency: PropTypes.number.isRequired,
        rpm: PropTypes.number.isRequired,
        qualityName: PropTypes.string.isRequired,
        pick: PropTypes.number.isRequired,
        current: PropTypes.number.isRequired,
        totalStop: PropTypes.number.isRequired,
        runningTime: PropTypes.string.isRequired,
        productionShift: PropTypes.number.isRequired,
        productionDay: PropTypes.number.isRequired,
        powerOnTime: PropTypes.string.isRequired,
      }).isRequired,
    };
    
    return (
      <Card
        sx={{
          height: "100%",
          minHeight: "240px",
          display: "flex",
          flexDirection: "column",
          background: getCardBg(),
          borderRadius: "12px",
          boxShadow: darkMode
            ? "0 4px 16px rgba(0, 0, 0, 0.4)"
            : "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: darkMode
            ? "1px solid rgba(255, 255, 255, 0.15)"
            : "1px solid #d0d7de",
          borderLeft: `4px solid ${leftBorderColor}`,
          p: 1.25,
          pb: 1.75,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: darkMode
              ? "0 8px 24px rgba(0, 0, 0, 0.6)"
              : "0 8px 24px rgba(0, 0, 0, 0.12)",
          },
          color: "#fff",
        }}
      >
        <ArgonBox mb={1}>
          <ArgonBox display="flex" justifyContent="flex-start" alignItems="center">
            <ArgonBox
              sx={{
                background: "rgba(255, 255, 255, 0.22)",
                border: "1px solid rgba(255, 255, 255, 0.35)",
                borderRadius: "10px",
                px: 1.25,
                py: 0.75,
                minWidth: { xs: "auto", sm: "115px" },
                backdropFilter: "saturate(180%) blur(2px)",
              }}
            >
              <ArgonTypography variant="h5" fontWeight="bold" color="white" mt={0.25}>
                {machine.machineNumber}
              </ArgonTypography>
              <ArgonBox mt={0.5} display="flex" gap={0.75} alignItems="center">
                <Tooltip title="WiFi" arrow placement="top">
                  <Icon sx={{ color: "#e0f2fe", fontSize: "18px" }}>wifi</Icon>
                </Tooltip>
                {beam && (
                  <Tooltip title={`Beam ${beam.beamNo}`} arrow placement="top">
                    <Icon sx={{ color: "#e0f2fe", fontSize: "18px" }}>settings_input_antenna</Icon>
                  </Tooltip>
                )}
                {hasError && (
                  <Tooltip title={machine.causeOfError} arrow placement="top">
                    <Icon sx={{ color: "#f44336", fontSize: "18px" }}>{getCauseOfErrorIcon(machine.causeOfError)}</Icon>
                  </Tooltip>
                )}
              </ArgonBox>
            </ArgonBox>
            <ArgonBox ml={1} display="flex" alignItems="flex-end" flexDirection="column" gap={0.6}>
              <ArgonBox
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  background: "rgba(255,255,255,0.22)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "10px",
                  px: 0.75,
                  py: 0.25,
                  width: { xs: "100%", sm: 110 },
                }}
              >
                <Icon sx={{ color: "#ffffff", opacity: 0.95, fontSize: "18px" }}>trending_up</Icon>
                <ArgonTypography variant="h6" fontWeight="bold" color="white" fontSize="0.95rem">
                  {machine.efficiency}%
                </ArgonTypography>
              </ArgonBox>
              <ArgonBox
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{
                  background: "rgba(255,255,255,0.22)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  borderRadius: "10px",
                  px: 0.75,
                  py: 0.25,
                  width: { xs: "100%", sm: 110 },
                }}
              >
                <Icon sx={{ color: "#ffffff", fontSize: "18px" }}>speed</Icon>
                <ArgonTypography variant="h6" fontWeight="bold" color="white" fontSize="0.95rem">
                  {machine.rpm}
                </ArgonTypography>
              </ArgonBox>
            </ArgonBox>
          </ArgonBox>
        </ArgonBox>

        <Grid container spacing={0.8}>
          <Grid item xs={12}>
            <Tooltip title="Quality Name" arrow placement="top">
              <ArgonBox
                p={0.4}
                borderRadius="8px"
                sx={{ cursor: "pointer" }}
              >
                <ArgonTypography variant="body2" fontWeight="bold" color="white" fontSize="0.9rem" textAlign="center">
                  {machine.qualityName}
                </ArgonTypography>
              </ArgonBox>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Pick" arrow placement="top">
              <ArgonBox
                p={0.4}
                borderRadius="8px"
                sx={{ cursor: "pointer" }}
              >
                <ArgonTypography variant="h6" fontWeight="bold" color="white" fontSize="0.95rem" textAlign="center">
                  {machine.pick}
                </ArgonTypography>
              </ArgonBox>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Current / Total Stoppage" arrow placement="top">
              <ArgonBox
                p={0.4}
                borderRadius="8px"
                sx={{ cursor: "pointer" }}
              >
                <ArgonTypography variant="h6" fontWeight="bold" color="white" fontSize="0.95rem" textAlign="center">
                  {machine.current}/{machine.totalStop}
                </ArgonTypography>
              </ArgonBox>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Running Time" arrow placement="top">
              <ArgonBox
                p={0.4}
                borderRadius="8px"
                sx={{ cursor: "pointer" }}
              >
                <ArgonTypography variant="body2" fontWeight="bold" color="white" fontSize="0.85rem" textAlign="center">
                  {machine.runningTime}
                </ArgonTypography>
              </ArgonBox>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Shift Production" arrow placement="top">
              <ArgonBox
                p={0.4}
                borderRadius="8px"
                sx={{ cursor: "pointer" }}
              >
                <ArgonTypography variant="h6" fontWeight="bold" color="white" fontSize="0.95rem" textAlign="center">
                  {machine.productionShift.toFixed(1)}
                </ArgonTypography>
              </ArgonBox>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Day Production" arrow placement="top">
              <ArgonBox
                p={0.4}
                borderRadius="8px"
                sx={{ cursor: "pointer" }}
              >
                <ArgonTypography variant="h6" fontWeight="bold" color="white" fontSize="0.95rem" textAlign="center">
                  {machine.productionDay.toFixed(1)}
                </ArgonTypography>
              </ArgonBox>
            </Tooltip>
          </Grid>
          <Grid item xs={6}>
            <Tooltip title="Power On Time" arrow placement="top">
              <ArgonBox
                p={0.4}
                borderRadius="8px"
                sx={{ cursor: "pointer" }}
              >
                <ArgonTypography variant="body2" fontWeight="bold" color="white" fontSize="0.85rem" textAlign="center">
                  {machine.powerOnTime}
                </ArgonTypography>
              </ArgonBox>
            </Tooltip>
          </Grid>
        </Grid>
      </Card>
    );
  };

  if (view === "tv") {
    return (
      <ArgonBox
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          minHeight: "100vh",
          width: "100vw",
          background: darkMode 
            ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
            : "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
          p: 3,
          overflow: "auto",
          zIndex: 9999,
        }}
        ref={tvContainerRef}
      >
        <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <ArgonTypography variant="h3" fontWeight="bold" color={darkMode ? "white" : "dark"}>
            Machine Monitor - TV View
          </ArgonTypography>
          <IconButton
            onClick={() => setView("home")}
            sx={{
              background: "#f44336",
              color: "white",
              "&:hover": { background: "#d32f2f" },
              width: 40,
              height: 40,
              borderRadius: "8px",
            }}
          >
            <Icon fontSize="large">close</Icon>
          </IconButton>
        </ArgonBox>
        {tvSection === "charts" ? (
          <ArgonBox>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "14px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Total Production (Stacked by Quality)</ArgonTypography>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={productionData} barSize={28} barGap={8} barCategoryGap={30}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="SuperSoft" stackId="total" fill="#2196f3" />
                      <Bar dataKey="PrimeWeft" stackId="total" fill="#4caf50" />
                      <Bar dataKey="ComfortWeave" stackId="total" fill="#ff9800" />
                      <Bar dataKey="UltraWeave" stackId="total" fill="#9c27b0" />
                      <Bar dataKey="BasicWeave" stackId="total" fill="#e91e63" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} lg={8}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "14px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Quality-wise Production (Grouped Bars)</ArgonTypography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={productionData} barSize={22} barGap={8} barCategoryGap={28}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="SuperSoft" fill="#2196f3" radius={[6,6,0,0]} />
                      <Bar dataKey="PrimeWeft" fill="#4caf50" radius={[6,6,0,0]} />
                      <Bar dataKey="ComfortWeave" fill="#ff9800" radius={[6,6,0,0]} />
                      <Bar dataKey="UltraWeave" fill="#9c27b0" radius={[6,6,0,0]} />
                      <Bar dataKey="BasicWeave" fill="#e91e63" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "14px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Efficiency Trend</ArgonTypography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={efficiencyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} domain={[80, 100]} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="efficiency" stroke="#ff9800" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "12px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Avg Current Trend</ArgonTypography>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={currentTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="current" stroke="#9c27b0" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "12px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Avg RPM Trend</ArgonTypography>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={rpmTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="rpm" stroke="#2196f3" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "12px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Avg Pick Trend</ArgonTypography>
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={pickTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Line type="monotone" dataKey="pick" stroke="#4caf50" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "12px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Yarn Usage by Department</ArgonTypography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={yarnUsageData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="Warping" stackId="a" fill="#2196f3" />
                      <Bar dataKey="Twisting" stackId="a" fill="#4caf50" />
                      <Bar dataKey="Weft" stackId="a" fill="#ff9800" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "12px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Error Analysis (Date-wise)</ArgonTypography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={errorAnalysisData} barSize={40}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="Mechanical" fill="#f44336" radius={[4,4,0,0]} />
                      <Bar dataKey="Electrical" fill="#ff9800" radius={[4,4,0,0]} />
                      <Bar dataKey="WeftYarn" fill="#2196f3" radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "12px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Total Folding Taka vs Total Delivery Taka</ArgonTypography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={foldingDeliveryTotalsData} barSize={24} barGap={10} barCategoryGap={30}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="FoldingTaka" fill="#2196f3" radius={[6,6,0,0]} />
                      <Bar dataKey="DeliveryTaka" fill="#00bcd4" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "12px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Total Folding Meter vs Total Delivery Meter</ArgonTypography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={foldingDeliveryMetersData} barSize={24} barGap={10} barCategoryGap={30}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Legend />
                      <Bar dataKey="FoldingMeter" fill="#4caf50" radius={[6,6,0,0]} />
                      <Bar dataKey="DeliveryMeter" fill="#8bc34a" radius={[6,6,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "14px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Stoppage Analysis</ArgonTypography>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "10px" }} />
                      <Legend iconType="circle" iconSize={10} wrapperStyle={{ paddingTop: 6 }} />
                      <Pie data={stoppageAnalysisData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={90} outerRadius={130} label labelLine={false}>
                        {stoppageAnalysisData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} lg={6}>
                <Card sx={{ p: 2.5, background: darkMode ? "#1a2332" : "#ffffff", borderRadius: "14px", border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)" }}>
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>Average Shortage Total (Area)</ArgonTypography>
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
                      <RechartsTooltip contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#ffffff", border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`, borderRadius: "8px" }} />
                      <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="url(#colorTotal)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          </ArgonBox>
        ) : (
          <Grid container spacing={3}>
            {machinesData.map((machine) => (
              <Grid item xs={12} sm={6} md={4} lg={2} key={machine.id}>
                <MachineCard machine={machine} />
              </Grid>
            ))}
          </Grid>
        )}
      </ArgonBox>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <ArgonBox display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
          <ArgonBox display="flex" gap={1}>
            <ArgonButton
              color={sidenavColor || "info"}
              variant="gradient"
              onClick={() => setView("tv")}
              sx={{
                borderRadius: "8px",
                transition: "all 0.2s ease-in-out",
                "&:hover": { transform: "scale(1.03)" },
              }}
            >
              <Icon sx={{ mr: 1 }}>tv</Icon> TV View
            </ArgonButton>
          </ArgonBox>
        </ArgonBox>

        <Grid container spacing={3}>
          {machinesData.map((machine) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={machine.id}>
              <MachineCard machine={machine} />
            </Grid>
          ))}
        </Grid>
      </ArgonBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Home;
