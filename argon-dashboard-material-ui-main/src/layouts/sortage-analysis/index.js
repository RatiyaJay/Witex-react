import { useMemo, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { beamsData } from "../beam-flow/data";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

function SortageAnalysis() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Filter only running beams for sortage analysis
  const runningBeams = useMemo(() => {
    return beamsData.filter(beam => beam.status === "running");
  }, []);

  // Calculate sortage percentage
  const beamsWithSortage = useMemo(() => {
    return runningBeams.map(beam => {
      const totalBeamMeter = beam.beamLength;
      const remainingBeamMeter = beam.remainingMeter;
      const usedMeter = totalBeamMeter - remainingBeamMeter;
      const sortagePercentage = totalBeamMeter > 0 
        ? ((usedMeter / totalBeamMeter) * 100).toFixed(2) 
        : 0;
      
      return {
        ...beam,
        sortagePercentage: `${sortagePercentage}%`,
        usedMeter,
      };
    });
  }, [runningBeams]);

  // Filter based on search query
  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return beamsWithSortage;
    
    return beamsWithSortage.filter((beam) =>
      beam.machineNo?.toLowerCase().includes(q) ||
      beam.yarnQuality?.toLowerCase().includes(q) ||
      beam.beamNo?.toLowerCase().includes(q)
    );
  }, [beamsWithSortage, query]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, totalPages]);

  const columns = [
    { 
      field: "machineNo", 
      headerName: "Machine No.", 
      width: 130,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "beamNo", 
      headerName: "Beam No.", 
      width: 120,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "yarnQuality", 
      headerName: "Quality Name", 
      flex: 1,
      minWidth: 180,
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "beamLength", 
      headerName: "Total Beam Meter", 
      width: 150,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => `${params.value}m`,
    },
    { 
      field: "remainingMeter", 
      headerName: "Remaining Beam Meter", 
      width: 180,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => `${params.value}m`,
    },
    { 
      field: "usedMeter", 
      headerName: "Used Meter", 
      width: 120,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => `${params.value}m`,
    },
    { 
      field: "totalFoldingTaka", 
      headerName: "Folding Taka", 
      width: 130,
      type: "number",
      align: "center",
      headerAlign: "center",
    },
    { 
      field: "totalFoldingMeter", 
      headerName: "Folding Meter", 
      width: 140,
      type: "number",
      align: "center",
      headerAlign: "center",
      renderCell: (params) => `${params.value}m`,
    },
    { 
      field: "sortagePercentage", 
      headerName: "Sortage %", 
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const percentage = parseFloat(params.value);
        const color = percentage > 50 ? "#f44336" : percentage > 25 ? "#ff9800" : "#4caf50";
        return (
          <ArgonBox
            sx={{
              background: `${color}20`,
              color: color,
              padding: "4px 12px",
              borderRadius: "6px",
              fontWeight: "bold",
            }}
          >
            {params.value}
          </ArgonBox>
        );
      },
    },
  ];

  const exportCsv = () => {
    const headers = [
      ["Machine No.", "machineNo"],
      ["Beam No.", "beamNo"],
      ["Quality Name", "yarnQuality"],
      ["Total Beam Meter", "beamLength"],
      ["Remaining Beam Meter", "remainingMeter"],
      ["Used Meter", "usedMeter"],
      ["Folding Taka", "totalFoldingTaka"],
      ["Folding Meter", "totalFoldingMeter"],
      ["Sortage %", "sortagePercentage"],
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
    a.download = `sortage_analysis_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate summary statistics
  const summary = useMemo(() => {
    const totalBeams = filteredRows.length;
    const totalBeamMeter = filteredRows.reduce((sum, b) => sum + b.beamLength, 0);
    const totalRemainingMeter = filteredRows.reduce((sum, b) => sum + b.remainingMeter, 0);
    const totalUsedMeter = filteredRows.reduce((sum, b) => sum + b.usedMeter, 0);
    const avgSortage = totalBeams > 0 
      ? ((totalUsedMeter / totalBeamMeter) * 100).toFixed(2) 
      : 0;
    
    return {
      totalBeams,
      totalBeamMeter,
      totalRemainingMeter,
      totalUsedMeter,
      avgSortage,
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
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Total Beams
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                    {summary.totalBeams}
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Total Beam Meter
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                    {summary.totalBeamMeter}m
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Remaining Meter
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="success">
                    {summary.totalRemainingMeter}m
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Used Meter
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="info">
                    {summary.totalUsedMeter}m
                  </ArgonTypography>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
                  <ArgonTypography variant="caption" color="text" fontWeight="medium">
                    Avg Sortage
                  </ArgonTypography>
                  <ArgonTypography variant="h5" fontWeight="bold" color="warning">
                    {summary.avgSortage}%
                  </ArgonTypography>
                </Card>
              </Grid>
            </Grid>

            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
                {/* Search */}
                <ArgonBox display="flex" alignItems="center" gap={1} mb={2}>
                  <Icon color="inherit">search</Icon>
                  <ArgonInput
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by machine, quality, or beam..."
                    size="small"
                    sx={{ minWidth: 300 }}
                  />
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
                    Showing {paginatedRows.length} of {filteredRows.length} beams
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

export default SortageAnalysis;
