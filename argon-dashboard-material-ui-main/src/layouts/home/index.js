// This is the Home page - moved from Dashboard
// Contains machine cards and TV view functionality

import { useEffect, useMemo, useState } from "react";
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
  const [tvSection, setTvSection] = useState("machines");
  useEffect(() => {
    if (view !== "tv") return;
    const interval = setInterval(() => {
      setTvSection((s) => (s === "machines" ? "charts" : "machines"));
    }, 10000);
    return () => clearInterval(interval);
  }, [view]);

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
          minHeight: "260px",
          maxHeight: "260px",
          display: "flex",
          flexDirection: "column",
          background: darkMode
            ? "linear-gradient(135deg, #1a2332 0%, #2d3748 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f7fafc 100%)",
          borderRadius: "12px",
          boxShadow: darkMode
            ? "0 4px 16px rgba(0, 0, 0, 0.4)"
            : "0 4px 16px rgba(0, 0, 0, 0.08)",
          border: darkMode
            ? "1px solid rgba(255, 255, 255, 0.15)"
            : "1px solid #d0d7de",
          borderLeft: `4px solid ${leftBorderColor}`,
          p: 1.5,
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: darkMode
              ? "0 8px 24px rgba(0, 0, 0, 0.6)"
              : "0 8px 24px rgba(0, 0, 0, 0.12)",
          },
        }}
      >
        <ArgonBox mb={1}>
          <ArgonBox display="flex" justifyContent="flex-start" alignItems="center">
            <ArgonBox
              sx={{
                background: darkMode ? "rgba(244, 143, 177, 0.18)" : "rgba(244, 143, 177, 0.28)",
                border: darkMode ? "1px solid rgba(244, 143, 177, 0.3)" : "1px solid rgba(244, 143, 177, 0.4)",
                borderRadius: "10px",
                px: 1.25,
                py: 0.75,
                minWidth: "115px",
              }}
            >
              <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"} mt={0.25}>
                {machine.machineNumber}
              </ArgonTypography>
              <ArgonBox mt={0.5} display="flex" gap={0.75} alignItems="center">
                <Tooltip title="WiFi" arrow placement="top">
                  <Icon sx={{ color: "#0891b2", fontSize: "18px" }}>wifi</Icon>
                </Tooltip>
                {beam && (
                  <Tooltip title={`Beam ${beam.beamNo}`} arrow placement="top">
                    <Icon sx={{ color: "#0891b2", fontSize: "18px" }}>settings_input_antenna</Icon>
                  </Tooltip>
                )}
                {hasError && (
                  <Tooltip title={machine.causeOfError} arrow placement="top">
                    <Icon sx={{ color: "#f44336", fontSize: "18px" }}>{getCauseOfErrorIcon(machine.causeOfError)}</Icon>
                  </Tooltip>
                )}
              </ArgonBox>
            </ArgonBox>
          </ArgonBox>
        </ArgonBox>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <ArgonBox
              p={0.9}
              borderRadius="8px"
              sx={{ background: darkMode ? "rgba(33, 150, 243, 0.08)" : "rgba(33, 150, 243, 0.06)" }}
            >
              <ArgonBox display="flex" alignItems="center" gap={0.75}>
                <Icon sx={{ color: "#2196f3", fontSize: "18px" }}>trending_up</Icon>
                <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} fontSize="1rem">
                  {machine.efficiency}%
                </ArgonTypography>
              </ArgonBox>
            </ArgonBox>
          </Grid>
          <Grid item xs={6}>
            <ArgonBox
              p={0.9}
              borderRadius="8px"
              sx={{ background: darkMode ? "rgba(76, 175, 80, 0.08)" : "rgba(76, 175, 80, 0.06)" }}
            >
              <ArgonBox display="flex" alignItems="center" gap={0.75}>
                <Icon sx={{ color: "#4caf50", fontSize: "18px" }}>speed</Icon>
                <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} fontSize="1rem">
                  {machine.rpm}
                </ArgonTypography>
              </ArgonBox>
            </ArgonBox>
          </Grid>
          <Grid item xs={6}>
            <ArgonBox
              p={0.9}
              borderRadius="8px"
              sx={{ background: darkMode ? "rgba(255, 152, 0, 0.08)" : "rgba(255, 152, 0, 0.06)" }}
            >
              <ArgonBox display="flex" alignItems="center" gap={0.75}>
                <Icon sx={{ color: "#ff9800", fontSize: "18px" }}>format_list_numbered</Icon>
                <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} fontSize="1rem">
                  {machine.pick}
                </ArgonTypography>
              </ArgonBox>
            </ArgonBox>
          </Grid>
          <Grid item xs={6}>
            <ArgonBox
              p={0.9}
              borderRadius="8px"
              sx={{ background: darkMode ? "rgba(156, 39, 176, 0.08)" : "rgba(156, 39, 176, 0.06)" }}
            >
              <ArgonBox display="flex" alignItems="center" gap={0.75}>
                <Icon sx={{ color: "#9c27b0", fontSize: "18px" }}>inventory_2</Icon>
                <ArgonTypography variant="body2" fontWeight="bold" color={darkMode ? "white" : "dark"} fontSize="0.9rem">
                  {machine.qualityName}
                </ArgonTypography>
              </ArgonBox>
            </ArgonBox>
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
              <Grid item xs={12} lg={8}>
                <Card
                  sx={{
                    p: 2.5,
                    background: darkMode ? "#1a2332" : "#ffffff",
                    borderRadius: "14px",
                    border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                    Production Overview
                  </ArgonTypography>
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={machinesData.map((m, i) => ({ name: m.machineNumber, prod: m.productionDay }))}>
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
                      <Legend />
                      <Bar dataKey="prod" fill={theme.palette[sidenavColor]?.main || theme.palette.info.main} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card
                  sx={{
                    p: 2.5,
                    background: darkMode ? "#1a2332" : "#ffffff",
                    borderRadius: "14px",
                    border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                  }}
                >
                  <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={2}>
                    Efficiency Trend
                  </ArgonTypography>
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={machinesData.map((m) => ({ name: m.machineNumber, eff: m.efficiency }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#e5e7eb"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} />
                      <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} domain={[0, 100]} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: darkMode ? "#1f2937" : "#ffffff",
                          border: `1px solid ${darkMode ? "#374151" : "#e5e7eb"}`,
                          borderRadius: "10px",
                        }}
                      />
                      <Line type="monotone" dataKey="eff" stroke={theme.palette[sidenavColor]?.main || theme.palette.info.main} strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </Grid>
            </Grid>
          </ArgonBox>
        ) : (
          <Grid container spacing={3}>
            {machinesData.map((machine) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={machine.id}>
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
            <Grid item xs={12} sm={6} md={4} lg={3} key={machine.id}>
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
