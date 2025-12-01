import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Icon from "@mui/material/Icon";
import { useTheme } from "@mui/material/styles";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { DataGrid } from "@mui/x-data-grid";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";

import { machinesData } from "../machine-management/data";
import { useArgonController } from "context";
import { getTableStyles } from "utils/tableStyles";

function ProductionEntry({ qualities }) {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  
  // Page header state (persistent across entries)
  const [pageNo, setPageNo] = useState("1");
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [selectedQuality, setSelectedQuality] = useState("");
  const [lastMachineNo, setLastMachineNo] = useState("");

  // Track total entries across all pages for continuous Taka numbering
  const [totalEntriesCount, setTotalEntriesCount] = useState(0);
  
  // Current page starting Taka number
  const [currentPageStartTaka, setCurrentPageStartTaka] = useState(1);

  // Table rows - start with 1 row, add more dynamically
  const [entries, setEntries] = useState([
    {
      takaNo: 1,
      meter: "",
      tp: "",
    }
  ]);

  // All saved entries
  const [savedEntries, setSavedEntries] = useState([]);
  const [openPagesDialog, setOpenPagesDialog] = useState(false);
  const [editingPageNo, setEditingPageNo] = useState(null);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifySeverity, setNotifySeverity] = useState("info");

  // Refs for fast navigation
  const inputRefs = useRef({});

  useEffect(() => {
    // Set initial quality if available
    if (qualities.length > 0 && !selectedQuality) {
      setSelectedQuality(qualities[0].qualityName);
    }
  }, [qualities, selectedQuality]);

  const handleInputChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    
    // If Taka No. is changed, update all subsequent rows
    if (field === "takaNo") {
      const startTaka = Number(value);
      for (let i = index; i < newEntries.length; i++) {
        newEntries[i].takaNo = startTaka + (i - index);
      }
    }
    
    setEntries(newEntries);

    // Add new row if this is the last row and user is entering data (not for takaNo field)
    if (index === entries.length - 1 && value && field !== "takaNo") {
      const nextTakaNo = newEntries[index].takaNo + 1;
      setEntries([
        ...newEntries,
        {
          takaNo: nextTakaNo,
          meter: "",
          tp: "",
        }
      ]);
    }
  };

  const handleKeyDown = (e, rowIndex, field) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      
      const fields = ["meter", "tp"];
      const currentFieldIndex = fields.indexOf(field);
      
      if (currentFieldIndex < fields.length - 1) {
        // Move to next field in same row
        const nextField = fields[currentFieldIndex + 1];
        const nextRef = inputRefs.current[`${rowIndex}-${nextField}`];
        if (nextRef) nextRef.focus();
      } else {
        // Move to first field of next row (will be created if doesn't exist)
        setTimeout(() => {
          const nextRef = inputRefs.current[`${rowIndex + 1}-meter`];
          if (nextRef) nextRef.focus();
        }, 100);
      }
    }
  };

  const handleSaveEntry = () => {
    // Filter out empty rows
    const filledEntries = entries.filter(entry => entry.meter || entry.tp);
    
    if (filledEntries.length === 0) {
      setNotifyMessage("Please fill at least one entry");
      setNotifySeverity("error");
      setNotifyOpen(true);
      return;
    }

    if (!selectedQuality) {
      setNotifyMessage("Please select a quality");
      setNotifySeverity("error");
      setNotifyOpen(true);
      return;
    }

    if (!lastMachineNo) {
      setNotifyMessage("Please select a machine");
      setNotifySeverity("error");
      setNotifyOpen(true);
      return;
    }

    const composedEntries = filledEntries.map((entry, idx) => ({
      id: Date.now() + idx,
      pageNo,
      dateTime,
      qualityName: selectedQuality,
      machineNo: lastMachineNo,
      ...entry,
    }));

    if (editingPageNo !== null) {
      const remaining = savedEntries.filter(e => e.pageNo !== String(editingPageNo) && e.pageNo !== editingPageNo);
      setSavedEntries([...remaining, ...composedEntries]);
      setEditingPageNo(null);
      setNotifyMessage(`Updated page ${pageNo} successfully`);
      setNotifySeverity("success");
      setNotifyOpen(true);
      return;
    }

    setSavedEntries([...savedEntries, ...composedEntries]);

    const newTotalCount = totalEntriesCount + filledEntries.length;
    setTotalEntriesCount(newTotalCount);
    const nextStartTaka = newTotalCount + 1;
    setCurrentPageStartTaka(nextStartTaka);
    setEntries([
      {
        takaNo: nextStartTaka,
        meter: "",
        tp: "",
      }
    ]);
    setPageNo(String(Number(pageNo) + 1));
    setNotifyMessage(`Saved ${filledEntries.length} entries successfully. Next page starts at Taka ${nextStartTaka}`);
    setNotifySeverity("success");
    setNotifyOpen(true);
  };

  const exportCurrentPage = () => {
    const currentPageEntries = savedEntries.filter(entry => entry.pageNo === String(Number(pageNo) - 1));
    
    if (currentPageEntries.length === 0) {
      setNotifyMessage("No entries found for the previous page");
      setNotifySeverity("warning");
      setNotifyOpen(true);
      return;
    }

    exportToExcel(currentPageEntries, `Page_${Number(pageNo) - 1}_Entries`);
  };

  const exportAllPages = () => {
    if (savedEntries.length === 0) {
      setNotifyMessage("No entries to export");
      setNotifySeverity("warning");
      setNotifyOpen(true);
      return;
    }

    exportToExcel(savedEntries, "All_Pages_Entries");
  };

  const exportToExcel = (data, filename) => {
    const headers = ["Page No.", "Taka No.", "Date & Time", "Quality Name", "Machine No.", "Meter", "TP"];
    const csvContent = [
      headers.join(","),
      ...data.map(entry => 
        [entry.pageNo, entry.takaNo, entry.dateTime, entry.qualityName, entry.machineNo, entry.meter || "", entry.tp || ""].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleNewPage = () => {
    // Clear current page but keep the Taka sequence
    setEntries([
      {
        takaNo: currentPageStartTaka,
        meter: "",
        tp: "",
      }
    ]);
  };

  return (
    <ArgonBox>
      {/* Page Header */}
      <ArgonBox 
        p={2.5} 
        mb={2}
        borderRadius="12px"
        sx={{
          background: theme.functions.linearGradient(
            theme.functions.rgba(theme.palette[sidenavColor]?.main || theme.palette.info.main, darkMode ? 0.14 : 0.1),
            theme.functions.rgba(theme.palette.gradients?.[sidenavColor]?.state || theme.palette.gradients.info.state, darkMode ? 0.14 : 0.1),
            135
          ),
          border: `1px solid ${theme.functions.rgba(theme.palette[sidenavColor]?.main || theme.palette.info.main, darkMode ? 0.25 : 0.18)}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={2}>
            <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
              Page No.
            </ArgonTypography>
            <ArgonInput
              type="number"
              value={pageNo}
              onChange={(e) => setPageNo(e.target.value)}
              placeholder="1"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
              Date & Time
            </ArgonTypography>
            <ArgonInput
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
              Quality Name
            </ArgonTypography>
            <FormControl fullWidth>
              <Select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                sx={{ 
                  height: "42px",
                  color: darkMode ? "#fff" : "inherit",
                }}
              >
                {qualities.map((q) => (
                  <MenuItem key={q.id} value={q.qualityName}>
                    {q.qualityName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"}>
              Machine No.
            </ArgonTypography>
            <FormControl fullWidth>
              <Select
                value={lastMachineNo}
                onChange={(e) => {
                  setLastMachineNo(e.target.value);
                }}
                displayEmpty
                sx={{ 
                  height: "42px",
                  color: darkMode ? "#fff" : "inherit",
                }}
              >
                <MenuItem value="">Select Machine</MenuItem>
                {machinesData.map((m) => (
                  <MenuItem key={m.id} value={m.machineNumber}>
                    {m.machineNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <ArgonBox display="flex" gap={1}>
              <ArgonButton
                size="small"
                color="info"
                variant="outlined"
                onClick={handleNewPage}
                fullWidth
                sx={{ borderRadius: "8px" }}
              >
                <Icon sx={{ mr: 0.5 }}>refresh</Icon> Clear
              </ArgonButton>
              <ArgonButton
                size="small"
                color={sidenavColor || "success"}
                variant="gradient"
                onClick={handleSaveEntry}
                fullWidth
                sx={{ borderRadius: "8px" }}
              >
                <Icon sx={{ mr: 0.5 }}>save</Icon> Save
              </ArgonButton>
              <ArgonButton
                size="small"
                color={sidenavColor || "warning"}
                variant="outlined"
                onClick={() => setOpenPagesDialog(true)}
                fullWidth
                sx={{ borderRadius: "8px" }}
              >
                <Icon sx={{ mr: 0.5 }}>view_list</Icon> Pages
              </ArgonButton>
            </ArgonBox>
          </Grid>
        </Grid>
      </ArgonBox>

      {/* Redesigned Entry Grid */}
      <ArgonBox
        sx={{
          borderRadius: "12px",
          border: darkMode ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
          maxHeight: "600px",
          overflowY: "auto",
          width: "100%",
        }}
      >
        <ArgonBox
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: darkMode ? "#1a2332" : "#f8f9fa",
            display: "flex",
            alignItems: "center",
            borderBottom: darkMode ? "1px solid rgba(255,255,255,0.08)" : "1px solid #e5e7eb",
          }}
        >
          <ArgonBox sx={{ width: "15%", padding: "8px", textAlign: "center", fontWeight: "bold", color: darkMode ? "#fff" : "inherit" }}>Taka No.</ArgonBox>
          <ArgonBox sx={{ width: "42.5%", padding: "8px", textAlign: "center", fontWeight: "bold", color: darkMode ? "#fff" : "inherit" }}>Meter</ArgonBox>
          <ArgonBox sx={{ width: "42.5%", padding: "8px", textAlign: "center", fontWeight: "bold", color: darkMode ? "#fff" : "inherit" }}>TP</ArgonBox>
        </ArgonBox>

        {entries.map((entry, index) => (
          <ArgonBox
            key={entry.takaNo}
            sx={{
              display: "flex",
              alignItems: "center",
              "&:hover": {
                background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
              },
            }}
          >
            <ArgonBox sx={{ width: "15%", padding: "8px" }}>
              <ArgonInput
                type="number"
                value={entry.takaNo}
                onChange={(e) => {
                  const newTakaNo = Number(e.target.value);
                  handleInputChange(index, "takaNo", newTakaNo);
                  if (index === 0) {
                    setCurrentPageStartTaka(newTakaNo);
                  }
                }}
                placeholder="1"
                size="small"
                fullWidth
                sx={{ "& input": { textAlign: "center", fontWeight: "bold" } }}
              />
            </ArgonBox>
            <ArgonBox sx={{ width: "42.5%", padding: "8px" }}>
              <ArgonInput
                type="number"
                value={entry.meter}
                onChange={(e) => handleInputChange(index, "meter", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index, "meter")}
                inputRef={(el) => (inputRefs.current[`${index}-meter`] = el)}
                placeholder="0"
                size="small"
                fullWidth
                sx={{ "& input": { textAlign: "center" } }}
              />
            </ArgonBox>
            <ArgonBox sx={{ width: "42.5%", padding: "8px" }}>
              <ArgonInput
                value={entry.tp}
                onChange={(e) => handleInputChange(index, "tp", e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, index, "tp")}
                inputRef={(el) => (inputRefs.current[`${index}-tp`] = el)}
                placeholder="-"
                size="small"
                fullWidth
                sx={{ "& input": { textAlign: "center" } }}
              />
            </ArgonBox>
          </ArgonBox>
        ))}
      </ArgonBox>

      {/* Saved Entries View */}
      {savedEntries.length > 0 && (
        <ArgonBox mt={3}>
      <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <ArgonTypography variant="h6" color={darkMode ? "white" : "dark"}>
          Saved Entries: {savedEntries.length}
        </ArgonTypography>
        <ArgonBox display="flex" gap={1}>
          <ArgonButton
            size="small"
            color={sidenavColor || "warning"}
            variant="outlined"
            onClick={() => setOpenPagesDialog(true)}
            sx={{ borderRadius: "8px" }}
          >
            <Icon sx={{ mr: 0.5 }}>view_list</Icon> Pages
          </ArgonButton>
          <ArgonButton
            size="small"
            color="info"
            variant="gradient"
            onClick={exportCurrentPage}
            sx={{ borderRadius: "8px" }}
          >
            <Icon sx={{ mr: 0.5 }}>file_download</Icon> Export Current Page
          </ArgonButton>
          <ArgonButton
            size="small"
            color={sidenavColor || "success"}
            variant="gradient"
            onClick={exportAllPages}
            sx={{ borderRadius: "8px" }}
          >
            <Icon sx={{ mr: 0.5 }}>file_download</Icon> Export All Pages
          </ArgonButton>
        </ArgonBox>
      </ArgonBox>
          <div style={{ height: 380, width: "100%" }}>
            {(() => {
              const qualityOptions = qualities.map((q) => q.qualityName);
              const machineOptions = (machinesData || []).map((m) => m.machineNumber);
              const renderSelectEditCell = (params, options) => (
                <FormControl fullWidth>
                  <Select
                    value={params.value ?? ""}
                    onChange={(e) => {
                      params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value });
                    }}
                    sx={{ height: 36 }}
                  >
                    {options.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
              return (
                <DataGrid
                  rows={savedEntries}
                  columns={[
                    { field: "pageNo", headerName: "Page No.", width: 110, headerAlign: "center", align: "center", editable: true },
                    { field: "takaNo", headerName: "Taka No.", width: 110, headerAlign: "center", align: "center", editable: true },
                    { 
                      field: "dateTime", 
                      headerName: "Date & Time", 
                      flex: 1, 
                      minWidth: 180, 
                      headerAlign: "center", 
                      align: "center", 
                      editable: true,
                      renderEditCell: (params) => (
                        <ArgonInput 
                          type="datetime-local" 
                          value={params.value ?? ""}
                          onChange={(e) => {
                            params.api.setEditCellValue({ id: params.id, field: params.field, value: e.target.value });
                          }}
                          fullWidth
                        />
                      )
                    },
                    { field: "qualityName", headerName: "Quality", width: 160, headerAlign: "center", align: "center", editable: true, renderEditCell: (p) => renderSelectEditCell(p, qualityOptions) },
                    { field: "machineNo", headerName: "Machine", width: 120, headerAlign: "center", align: "center", editable: true, renderEditCell: (p) => renderSelectEditCell(p, machineOptions) },
                    { field: "meter", headerName: "Meter", width: 120, headerAlign: "center", align: "center", editable: true, type: "number" },
                    { field: "tp", headerName: "TP", width: 120, headerAlign: "center", align: "center", editable: true },
                  ]}
                  disableColumnMenu
                  disableRowSelectionOnClick
                  getRowId={(row) => row.id}
                  rowHeight={48}
                  columnHeaderHeight={52}
                  editMode="cell"
                  onCellEditCommit={(params) => {
                    setSavedEntries((prev) => prev.map((r) => (r.id === params.id ? { ...r, [params.field]: params.value } : r)));
                  }}
                  processRowUpdate={(updatedRow) => {
                    setSavedEntries((prev) => prev.map((r) => (r.id === updatedRow.id ? updatedRow : r)));
                    return updatedRow;
                  }}
                  hideFooter
                  sx={getTableStyles(theme, darkMode, sidenavColor)}
                />
              );
            })()}
          </div>
        </ArgonBox>
      )}

      <Dialog 
        open={openPagesDialog} 
        onClose={() => setOpenPagesDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle>
          <ArgonTypography variant="h5" sx={{ color: darkMode ? "#fff" : "inherit" }}>
            Pages
          </ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <div style={{ height: 360, width: "100%" }}>
            {(() => {
              const qualityOptions = qualities.map((q) => q.qualityName);
              const machineOptions = (machinesData || []).map((m) => m.machineNumber);
              const pagesMap = new Map();
              savedEntries.forEach((e) => {
                if (!pagesMap.has(e.pageNo)) pagesMap.set(e.pageNo, []);
                pagesMap.get(e.pageNo).push(e);
              });
              const rows = Array.from(pagesMap.entries()).map(([page, list]) => ({
                id: page,
                pageNo: page,
                entries: list.length,
                qualityName: list[0]?.qualityName || "",
                machineNo: list[0]?.machineNo || "",
              }));
              const renderSelectEditCell = (params, options) => (
                <FormControl fullWidth>
                  <Select
                    value={params.value ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      params.api.setEditCellValue({ id: params.id, field: params.field, value: val });
                      setSavedEntries((prev) => prev.map((r) => (String(r.pageNo) === String(params.id) ? { ...r, [params.field]: val } : r)));
                    }}
                    sx={{ height: 36 }}
                  >
                    {options.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
              return (
                <DataGrid
                  rows={rows}
                  columns={[
                    { field: "pageNo", headerName: "Page No.", width: 120, headerAlign: "center", align: "center" },
                    { field: "entries", headerName: "Entries", width: 120, headerAlign: "center", align: "center" },
                    { field: "qualityName", headerName: "Quality", width: 180, headerAlign: "center", align: "center", editable: true, renderEditCell: (p) => renderSelectEditCell(p, qualityOptions) },
                    { field: "machineNo", headerName: "Machine", width: 140, headerAlign: "center", align: "center", editable: true, renderEditCell: (p) => renderSelectEditCell(p, machineOptions) },
                  ]}
                  disableColumnMenu
                  disableRowSelectionOnClick
                  getRowId={(row) => row.id}
                  rowHeight={48}
                  columnHeaderHeight={52}
                  onRowClick={(params) => {
                    const pageRows = savedEntries.filter((se) => String(se.pageNo) === String(params.id));
                    const first = pageRows[0];
                    if (!first) return;
                    setPageNo(String(first.pageNo));
                    setDateTime(first.dateTime);
                    setSelectedQuality(first.qualityName);
                    setLastMachineNo(first.machineNo);
                    setEntries(pageRows.map((r) => ({ takaNo: r.takaNo, meter: r.meter, tp: r.tp })));
                    setCurrentPageStartTaka(pageRows[0]?.takaNo || 1);
                    setEditingPageNo(first.pageNo);
                    setOpenPagesDialog(false);
                  }}
                  hideFooter
                  sx={getTableStyles(theme, darkMode, sidenavColor)}
                />
              );
            })()}
          </div>
        </DialogContent>
        <DialogActions>
          <ArgonButton 
            onClick={() => setOpenPagesDialog(false)}
            color="secondary" 
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Close
          </ArgonButton>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={notifyOpen}
        autoHideDuration={3000}
        onClose={() => setNotifyOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setNotifyOpen(false)} severity={notifySeverity} variant="filled" sx={{ borderRadius: 2 }}>
          {notifyMessage}
        </Alert>
      </Snackbar>
    </ArgonBox>
  );
}

ProductionEntry.propTypes = {
  qualities: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      qualityName: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ProductionEntry;
