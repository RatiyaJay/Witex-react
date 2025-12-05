import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { DataGrid } from "@mui/x-data-grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { useTheme } from "@mui/material/styles";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";

import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ArgonInput from "components/ArgonInput";
import { firmsData } from "./data";
import { useGetFirmsQuery } from "services/graphqlApi";
import { useArgonController } from "context";
import { 
  getTableStyles, 
  getActionButtonStyles, 
  getCardStyles, 
  getPaginationButtonStyles, 
  getExportButtonStyles 
} from "utils/tableStyles";

const initialFirms = firmsData;

function mapGraphqlFirm(f) {
  const addr = f.address || {};
  return {
    id: f.id ?? f._id ?? f.uuid ?? Math.random(),
    companyName: f.name ?? f.companyName ?? "",
    accountYear: f.accountYear ?? "2024-2025",
    gstin: f.gstin ?? "",
    website: f.website ?? "",
    address1: addr.line1 ?? addr.address1 ?? "",
    address2: addr.line2 ?? addr.address2 ?? "",
    address3: addr.line3 ?? addr.address3 ?? "",
    state: addr.state ?? "",
    city: addr.city ?? "",
    pincode: addr.pincode ?? "",
    phone: f.phone ?? "",
  };
}

function mergeFirmsWithStatic(staticList, apiList) {
  if (!Array.isArray(apiList) || apiList.length === 0) return staticList;
  const staticById = new Map(staticList.map((s) => [String(s.id), s]));
  const merged = apiList.map((a) => {
    const mapped = mapGraphqlFirm(a);
    const s = staticById.get(String(mapped.id));
    return s ? { ...s, ...mapped } : mapped;
  });
  staticList.forEach((s) => {
    if (!merged.find((m) => String(m.id) === String(s.id))) merged.push(s);
  });
  return merged;
}

function ManageFirm() {
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const theme = useTheme();
  const navigate = useNavigate();
  const [firms, setFirms] = useState(initialFirms);
  const { data: apiData, isLoading: firmsLoading, isError: firmsError } = useGetFirmsQuery();
  const [page, setPage] = useState(0);
  const pageSize = 10;
  const [openDelete, setOpenDelete] = useState(false);
  const [firmToDelete, setFirmToDelete] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [detailsFirm, setDetailsFirm] = useState(null);

  const handleAddClick = () => {
    navigate("/manage-firm/new");
  };

  const handleEditClick = (firm) => {
    navigate(`/manage-firm/edit/${firm.id}`);
  };

  const handleDeleteClick = (firm) => {
    setFirmToDelete(firm);
    setOpenDelete(true);
  };

  const handleDeleteClose = () => {
    setOpenDelete(false);
    setFirmToDelete(null);
  };

  const handleShowDetails = (firm) => {
    setDetailsFirm(firm);
    setOpenDetails(true);
  };
  
  const handleCloseDetails = () => {
    setOpenDetails(false);
    setDetailsFirm(null);
  };

  const handleConfirmDelete = () => {
    if (firmToDelete) {
      setFirms((prev) => prev.filter((f) => f.id !== firmToDelete.id));
    }
    setOpenDelete(false);
    setFirmToDelete(null);
  };

  const totalPages = Math.max(1, Math.ceil(firms.length / pageSize));
  const paginatedRows = useMemo(() => {
    const clampedPage = Math.min(page, totalPages - 1);
    const start = clampedPage * pageSize;
    return firms.slice(start, start + pageSize);
  }, [firms, page, totalPages]);

  useEffect(() => {
    setPage(0);
  }, []);

  // Integrate GraphQL with static fallback
  useEffect(() => {
    if (apiData && Array.isArray(apiData.firms)) {
      const merged = mergeFirmsWithStatic(firmsData, apiData.firms);
      setFirms(merged);
    } else if (firmsError) {
      setFirms(firmsData);
    }
  }, [apiData, firmsError]);

  const columns = [
    {
      field: "companyName",
      headerName: "Company",
      flex: 0.3,
      minWidth: 220,
    },
    {
      field: "accountYear",
      headerName: "Account Year",
      flex: 0.2,
      minWidth: 120,
    },
    {
      field: "location",
      headerName: "Location",
      flex: 0.4,
      minWidth: 260,
      valueGetter: (params) => `${params.row.city}, ${params.row.state} ${params.row.pincode}`,
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.1,
      minWidth: 140,
      sortable: false,
      filterable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <ArgonBox display="flex" justifyContent="flex-end" width="100%">
          <IconButton title="Yarn Management" size="small" color="success" onClick={() => navigate(`/yarn-management?firmId=${params.row.id}`)}>
            <Icon fontSize="small">inventory</Icon>
          </IconButton>
          <IconButton title="Show all details" size="small" color="info" onClick={() => handleShowDetails(params.row)}>
            <Icon fontSize="small">visibility</Icon>
          </IconButton>
          <IconButton title="Edit" size="small" color="primary" onClick={() => handleEditClick(params.row)}>
            <Icon fontSize="small">edit</Icon>
          </IconButton>
          <IconButton title="Delete" size="small" color="error" onClick={() => handleDeleteClick(params.row)}>
            <Icon fontSize="small">delete</Icon>
          </IconButton>
        </ArgonBox>
      ),
    },
  ];

  const exportCsv = () => {
    const headers = [
      ["Company", "companyName"],
      ["Account Year", "accountYear"],
      ["GSTIN", "gstin"],
      ["Website", "website"],
      ["Address 1", "address1"],
      ["Address 2", "address2"],
      ["Address 3", "address3"],
      ["State", "state"],
      ["City", "city"],
      ["Pincode", "pincode"],
      ["Phone", "phone"],
    ];
    const escape = (v) => {
      const s = String(v ?? "");
      const needsQuotes = /[,"]/.test(s) || /\n/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuotes ? `"${escaped}"` : escaped;
    };
    const csv = [headers.map(([h]) => h).join(","), ...firms.map((r) => headers.map(([, key]) => escape(r[key])).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `firms_export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ArgonTypography variant="h4" fontWeight="bold" color={darkMode ? "white" : "dark"}>Manage Firm</ArgonTypography>
              <ArgonBox display="flex" gap={1}>
                <ArgonButton 
                  color={sidenavColor || "warning"} 
                  variant="gradient" 
                  onClick={handleAddClick}
                  sx={getExportButtonStyles(theme, sidenavColor)}
                >
                  <Icon sx={{ mr: 1 }}>add</Icon> Add Firm
                </ArgonButton>
                <ArgonButton 
                  color={sidenavColor || "warning"} 
                  variant="gradient" 
                  onClick={exportCsv}
                  sx={getExportButtonStyles(theme, sidenavColor)}
                >
                  <Icon sx={{ mr: 1 }}>file_download</Icon> Export CSV
                </ArgonButton>
              </ArgonBox>
            </ArgonBox>
            <Card sx={getCardStyles(darkMode)}>
              <ArgonBox p={2.5}>
                <div style={{ height: 480, width: "100%" }}>
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
                    Showing {paginatedRows.length} of {firms.length} firms
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

      {/* Details Modal (Centered) */}
      <Dialog open={openDetails} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle>
          <ArgonTypography variant="h5">Firm Details</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          {detailsFirm && (
            <ArgonBox>
              <ArgonTypography variant="subtitle2" color="text">Primary Details</ArgonTypography>
              <Divider sx={{ my: 1 }} />
              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Company Name</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsFirm.companyName}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Account Year</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsFirm.accountYear}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">GSTIN</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsFirm.gstin}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Website</TableCell>
                    <TableCell sx={{ border: 0 }} align="left">{detailsFirm.website}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <ArgonBox mt={2}>
                <ArgonTypography variant="subtitle2" color="text">Address Details</ArgonTypography>
                <Divider sx={{ my: 1 }} />
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Address 1</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsFirm.address1}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Address 2</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsFirm.address2}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Address 3</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsFirm.address3}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">State</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsFirm.state}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">City</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsFirm.city}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Pincode</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsFirm.pincode}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, border: 0 }} align="left">Phone Number</TableCell>
                      <TableCell sx={{ border: 0 }} align="left">{detailsFirm.phone}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </ArgonBox>
            </ArgonBox>
          )}
        </DialogContent>
        <DialogActions>
          <ArgonButton onClick={handleCloseDetails} color="secondary" variant="outlined">
            Close
          </ArgonButton>
          {detailsFirm && (
            <ArgonButton onClick={() => navigate(`/manage-firm/edit/${detailsFirm.id}`)} color="primary" variant="gradient">
              <Icon sx={{ mr: 1 }}>edit</Icon> Edit
            </ArgonButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={openDelete} onClose={handleDeleteClose} maxWidth="xs" fullWidth>
        <DialogTitle>
          <ArgonTypography variant="h6">Delete Firm</ArgonTypography>
        </DialogTitle>
        <DialogContent>
          <ArgonTypography variant="body2" color="text">
            Are you sure you want to delete
            {" "}
            <strong>{firmToDelete?.companyName}</strong>
            ? This action cannot be undone.
          </ArgonTypography>
        </DialogContent>
        <DialogActions>
          <ArgonButton variant="outlined" color="dark" onClick={handleDeleteClose}>
            Cancel
          </ArgonButton>
          <ArgonButton color="error" variant="gradient" onClick={handleConfirmDelete}>
            Delete
          </ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}

export default ManageFirm;