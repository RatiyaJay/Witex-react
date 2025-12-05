import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Icon from "@mui/material/Icon";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { DataGrid } from "@mui/x-data-grid";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import ArgonInput from "components/ArgonInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { GRAPHQL_URL } from "config";
import { getToken } from "utils/auth";
import { useArgonController } from "context";
import { getTableStyles, getCardStyles } from "utils/tableStyles";

const SERVICE_TYPES = ["MACHINE_MONITORING", "BUSINESS_MANAGEMENT", "BOTH"];
const MACHINE_TYPES = ["WATER_JET","RAPIER","AIR_JET","CIRCULAR","TFO","POWER_LOOM","JACQUARD"];

export default function OrganizationManagement() {
  const theme = useTheme();
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const token = getToken();

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [newOrg, setNewOrg] = useState({
    name: "",
    email: "",
    gstNo: "",
    ownerName: "",
    contactNo: "",
    address: "",
    startingDate: "",
    endingDate: "",
    ipAddress: "",
    totalDevice: "",
    totalEmployee: "",
    demo: false,
    serviceType: "MACHINE_MONITORING",
    machineType: "WATER_JET",
  });

  const [openEdit, setOpenEdit] = useState(false);
  const [editOrg, setEditOrg] = useState({ id: null });
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  const fetchOrganizations = async () => {
    const query = `query($page:Int,$pageSize:Int,$search:String){ organizations(page:$page,pageSize:$pageSize,search:$search){ total items{ id name email gstNo ownerName contactNo address startingDate endingDate ipAddress totalDevice totalEmployee demo serviceType machineType } } }`;
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables: { page: page + 1, pageSize, search: search || null } }),
    });
    const data = await res.json();
    if (data.errors) return;
    const payload = data.data.organizations;
    setRows(
      payload.items.map((o) => ({
        id: o.id,
        name: o.name,
        email: o.email || "",
        gstNo: o.gstNo || "",
        ownerName: o.ownerName || "",
        contactNo: o.contactNo || "",
        address: o.address || "",
        startingDate: o.startingDate || "",
        endingDate: o.endingDate || "",
        ipAddress: o.ipAddress || "",
        totalDevice: o.totalDevice,
        totalEmployee: o.totalEmployee,
        demo: !!o.demo,
        serviceType: o.serviceType,
        machineType: o.machineType,
      }))
    );
    setTotal(payload.total);
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchOrganizations(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [page, pageSize, search]);

  const createOrganization = async () => {
    const query = `mutation($input:CreateOrganizationInput!){ createOrganization(input:$input){ id } }`;
    const input = {
      ...newOrg,
      totalDevice: newOrg.totalDevice ? Number(newOrg.totalDevice) : 0,
      totalEmployee: newOrg.totalEmployee ? Number(newOrg.totalEmployee) : 0,
      startingDate: newOrg.startingDate || null,
      endingDate: newOrg.endingDate || null,
    };
    await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { input } }) });
    setOpenCreate(false);
    setNewOrg({ name: "", email: "", gstNo: "", ownerName: "", contactNo: "", address: "", startingDate: "", endingDate: "", ipAddress: "", totalDevice: "", totalEmployee: "", demo: false, serviceType: "MACHINE_MONITORING", machineType: "WATER_JET" });
    fetchOrganizations();
  };

  const openEditDialog = (row) => { setEditOrg({ ...row }); setOpenEdit(true); };

  const saveEdit = async () => {
    const query = `mutation($id:ID!,$input:UpdateOrganizationInput!){ updateOrganization(organizationId:$id,input:$input){ id } }`;
    const input = {
      name: editOrg.name,
      email: editOrg.email || null,
      gstNo: editOrg.gstNo || null,
      ownerName: editOrg.ownerName || null,
      contactNo: editOrg.contactNo || null,
      address: editOrg.address || null,
      startingDate: editOrg.startingDate || null,
      endingDate: editOrg.endingDate || null,
      ipAddress: editOrg.ipAddress || null,
      totalDevice: typeof editOrg.totalDevice === "number" ? editOrg.totalDevice : Number(editOrg.totalDevice || 0),
      totalEmployee: typeof editOrg.totalEmployee === "number" ? editOrg.totalEmployee : Number(editOrg.totalEmployee || 0),
      demo: !!editOrg.demo,
      serviceType: editOrg.serviceType,
      machineType: editOrg.machineType,
    };
    await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { id: editOrg.id, input } }) });
    setOpenEdit(false);
    fetchOrganizations();
  };

  const confirmDelete = (row) => { setSelectedOrg(row); setOpenDelete(true); };
  const deleteOrg = async () => {
    const query = `mutation($id:ID!){ deleteOrganization(organizationId:$id) }`;
    await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { id: selectedOrg.id } }) });
    setOpenDelete(false);
    setSelectedOrg(null);
    fetchOrganizations();
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1, minWidth: 180 },
    { field: "email", headerName: "Email", width: 180 },
    { field: "gstNo", headerName: "GST No", width: 140 },
    { field: "ownerName", headerName: "Owner", width: 140 },
    { field: "contactNo", headerName: "Contact No", width: 140 },
    { field: "serviceType", headerName: "Service Type", width: 180 },
    { field: "machineType", headerName: "Machine Type", width: 180 },
    { field: "totalDevice", headerName: "Devices", width: 120 },
    { field: "totalEmployee", headerName: "Employees", width: 130 },
    { field: "demo", headerName: "Demo", width: 100, valueGetter: (p) => (p.row.demo ? "Yes" : "No") },
    {
      field: "actions",
      headerName: "Actions",
      width: 280,
      sortable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <ArgonBox display="flex" gap={1}>
          <ArgonButton size="small" variant={darkMode ? "outlined" : "gradient"} color={sidenavColor || "warning"} onClick={() => openEditDialog(params.row)}>
            <Icon sx={{ mr: 0.5 }} fontSize="small">edit</Icon> Edit
          </ArgonButton>
          <ArgonButton size="small" variant={darkMode ? "outlined" : "gradient"} color={sidenavColor || "error"} onClick={() => confirmDelete(params.row)}>
            <Icon sx={{ mr: 0.5 }} fontSize="small">delete</Icon> Delete
          </ArgonButton>
        </ArgonBox>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <ArgonBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ p: 2, ...getCardStyles(darkMode) }}>
              <ArgonBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <ArgonTypography variant="h4" fontWeight="bold" color={darkMode ? "white" : "dark"}>Organization Management</ArgonTypography>
                <ArgonBox display="flex" alignItems="center" gap={2}>
                  <ArgonInput placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 240 }} />
                  <ArgonButton color={sidenavColor || "warning"} variant={darkMode ? "outlined" : "gradient"} onClick={() => setOpenCreate(true)}>
                    <Icon sx={{ mr: 1 }}>domain_add</Icon> Create Organization
                  </ArgonButton>
                </ArgonBox>
              </ArgonBox>
              <div style={{ width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pagination
                  paginationMode="server"
                  rowCount={total}
                  page={page}
                  pageSize={pageSize}
                  onPageChange={(p) => setPage(p)}
                  onPageSizeChange={(s) => setPageSize(s)}
                  autoHeight
                  disableColumnMenu
                  disableRowSelectionOnClick
                  rowHeight={56}
                  columnHeaderHeight={52}
                  sx={getTableStyles(theme, darkMode, sidenavColor)}
                />
              </div>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Add Organization</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Organization Name</ArgonTypography><ArgonInput fullWidth placeholder="Organization Name" value={newOrg.name} onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Owner Name</ArgonTypography><ArgonInput fullWidth placeholder="Owner Name" value={newOrg.ownerName} onChange={(e) => setNewOrg({ ...newOrg, ownerName: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Email</ArgonTypography><ArgonInput fullWidth placeholder="Email" value={newOrg.email} onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Contact No.</ArgonTypography><ArgonInput fullWidth placeholder="Contact No" value={newOrg.contactNo} onChange={(e) => setNewOrg({ ...newOrg, contactNo: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">GST No.</ArgonTypography><ArgonInput fullWidth placeholder="GST No" value={newOrg.gstNo} onChange={(e) => setNewOrg({ ...newOrg, gstNo: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">IPv4 Address</ArgonTypography><ArgonInput fullWidth placeholder="IPv4 Address" value={newOrg.ipAddress} onChange={(e) => setNewOrg({ ...newOrg, ipAddress: e.target.value })} /></Grid>
            <Grid item xs={12}><ArgonTypography variant="caption" color="text">Address</ArgonTypography><ArgonInput fullWidth placeholder="Address" value={newOrg.address} onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Starting Date</ArgonTypography><ArgonInput type="date" fullWidth value={newOrg.startingDate} onChange={(e) => setNewOrg({ ...newOrg, startingDate: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Ending Date</ArgonTypography><ArgonInput type="date" fullWidth value={newOrg.endingDate} onChange={(e) => setNewOrg({ ...newOrg, endingDate: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Total Device</ArgonTypography><ArgonInput fullWidth placeholder="Total Device" value={newOrg.totalDevice} onChange={(e) => setNewOrg({ ...newOrg, totalDevice: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Total Employee</ArgonTypography><ArgonInput fullWidth placeholder="Total Employee" value={newOrg.totalEmployee} onChange={(e) => setNewOrg({ ...newOrg, totalEmployee: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Service Type</ArgonTypography><Select fullWidth value={newOrg.serviceType} onChange={(e) => setNewOrg({ ...newOrg, serviceType: e.target.value })}>{SERVICE_TYPES.map((s) => (<MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>))}</Select></Grid>
            <Grid item xs={12} md={6}><FormControlLabel control={<Switch checked={newOrg.demo} onChange={(e) => setNewOrg({ ...newOrg, demo: e.target.checked })} />} label="Demo" /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Machine Type</ArgonTypography><Select fullWidth value={newOrg.machineType} onChange={(e) => setNewOrg({ ...newOrg, machineType: e.target.value })}>{MACHINE_TYPES.map((s) => (<MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>))}</Select></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenCreate(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={createOrganization} variant="gradient" color={sidenavColor || "warning"}>Create</ArgonButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Edit Organization</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Organization Name</ArgonTypography><ArgonInput fullWidth value={editOrg.name || ""} onChange={(e) => setEditOrg({ ...editOrg, name: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Owner Name</ArgonTypography><ArgonInput fullWidth value={editOrg.ownerName || ""} onChange={(e) => setEditOrg({ ...editOrg, ownerName: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Email</ArgonTypography><ArgonInput fullWidth value={editOrg.email || ""} onChange={(e) => setEditOrg({ ...editOrg, email: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Contact No.</ArgonTypography><ArgonInput fullWidth value={editOrg.contactNo || ""} onChange={(e) => setEditOrg({ ...editOrg, contactNo: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">GST No.</ArgonTypography><ArgonInput fullWidth value={editOrg.gstNo || ""} onChange={(e) => setEditOrg({ ...editOrg, gstNo: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">IPv4 Address</ArgonTypography><ArgonInput fullWidth value={editOrg.ipAddress || ""} onChange={(e) => setEditOrg({ ...editOrg, ipAddress: e.target.value })} /></Grid>
            <Grid item xs={12}><ArgonTypography variant="caption" color="text">Address</ArgonTypography><ArgonInput fullWidth value={editOrg.address || ""} onChange={(e) => setEditOrg({ ...editOrg, address: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Starting Date</ArgonTypography><ArgonInput type="date" fullWidth value={editOrg.startingDate || ""} onChange={(e) => setEditOrg({ ...editOrg, startingDate: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Ending Date</ArgonTypography><ArgonInput type="date" fullWidth value={editOrg.endingDate || ""} onChange={(e) => setEditOrg({ ...editOrg, endingDate: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Total Device</ArgonTypography><ArgonInput fullWidth value={String(editOrg.totalDevice ?? "")} onChange={(e) => setEditOrg({ ...editOrg, totalDevice: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Total Employee</ArgonTypography><ArgonInput fullWidth value={String(editOrg.totalEmployee ?? "")} onChange={(e) => setEditOrg({ ...editOrg, totalEmployee: e.target.value })} /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Service Type</ArgonTypography><Select fullWidth value={editOrg.serviceType || "MACHINE_MONITORING"} onChange={(e) => setEditOrg({ ...editOrg, serviceType: e.target.value })}>{SERVICE_TYPES.map((s) => (<MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>))}</Select></Grid>
            <Grid item xs={12} md={6}><FormControlLabel control={<Switch checked={!!editOrg.demo} onChange={(e) => setEditOrg({ ...editOrg, demo: e.target.checked })} />} label="Demo" /></Grid>
            <Grid item xs={12} md={6}><ArgonTypography variant="caption" color="text">Machine Type</ArgonTypography><Select fullWidth value={editOrg.machineType || "WATER_JET"} onChange={(e) => setEditOrg({ ...editOrg, machineType: e.target.value })}>{MACHINE_TYPES.map((s) => (<MenuItem key={s} value={s}>{s.replace(/_/g, " ")}</MenuItem>))}</Select></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenEdit(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={saveEdit} variant="gradient" color={sidenavColor || "warning"}>Save</ArgonButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Delete Organization</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ArgonTypography variant="body2">{selectedOrg ? `Are you sure you want to delete ${selectedOrg.name}?` : ""}</ArgonTypography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenDelete(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={deleteOrg} variant="gradient" color={sidenavColor || "error"}>Delete</ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}
