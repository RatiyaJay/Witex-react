import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ArgonInput from "components/ArgonInput";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { DataGrid } from "@mui/x-data-grid";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { getToken } from "utils/auth";
import { GRAPHQL_URL } from "config";
import { useArgonController } from "context";
import { getTableStyles, getCardStyles } from "utils/tableStyles";

export default function UserManagement() {
  const theme = useTheme();
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newOrganizationId, setNewOrganizationId] = useState(null);
  const [newContactNo, setNewContactNo] = useState("");
  const [newRole, setNewRole] = useState("USER");
  const [newIsActive, setNewIsActive] = useState(true);
  
  const [openPassword, setOpenPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editForm, setEditForm] = useState({ id: null, email: "", name: "", organization: "", organizationId: null, contactNo: "", role: "USER", isActive: true });
  const [orgOptions, setOrgOptions] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [superAdminCount, setSuperAdminCount] = useState(0);
  
  const [openDelete, setOpenDelete] = useState(false);

  const token = getToken();

  const fetchUsers = async () => {
    const query = `query($page:Int,$pageSize:Int,$search:String){ users(page:$page,pageSize:$pageSize,search:$search){ total page pageSize items{ id email name organization organizationId contactNo role isActive } } }`;
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables: { page: page + 1, pageSize, search: search || null } }),
    });
    const data = await res.json();
    if (data.errors) return;
    const payload = data.data.users;
    setRows(payload.items.map((u) => ({ id: u.id, email: u.email, name: u.name || "", organization: u.organization || "", organizationId: u.organizationId || null, contactNo: u.contactNo || "", role: u.role, isActive: u.isActive })));
    setTotal(payload.total);
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchUsers(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [page, pageSize, search]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const q = `query { organizations(page:1,pageSize:100){ items{ id name } } }`;
      const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
      const data = await res.json();
      if (data.errors) return;
      setOrgOptions(data.data.organizations.items);
    };
    const fetchSuperAdmins = async () => {
      const q = `query { superAdminCount }`;
      const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
      const data = await res.json();
      if (data.errors) return;
      setSuperAdminCount(Number(data.data.superAdminCount || 0));
    };
    fetchOrganizations();
    fetchSuperAdmins();
    // eslint-disable-next-line
  }, []);

  const createUser = async () => {
    const query = `mutation Create($email:String!,$password:String!,$role:Role!,$name:String,$contactNo:String,$isActive:Boolean,$organizationId:ID){ createUser(email:$email,password:$password,role:$role,name:$name,contactNo:$contactNo,isActive:$isActive,organizationId:$organizationId){ id } }`;
    const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { email: newEmail, password: newPassword, role: newRole, name: newName || null, contactNo: newContactNo || null, isActive: newIsActive, organizationId: newOrganizationId || null } }) });
    const data = await res.json();
    if (data.errors) { window.alert(data.errors[0]?.message || "Create failed"); return; }
    setOpenCreate(false);
    setNewEmail("");
    setNewPassword("");
    setNewName("");
    setNewOrganizationId(null);
    setNewContactNo("");
    setNewRole("USER");
    setNewIsActive(true);
    fetchUsers();
    try {
      const q = `query { superAdminCount }`;
      const r = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
      const d = await r.json();
      if (!d.errors) setSuperAdminCount(Number(d.data.superAdminCount || 0));
    } catch (_) {}
  };

  const changePassword = async () => {
    if (!selectedUser) return;
    const q = `mutation { updateUserPassword(userId: ${selectedUser.id}, newPassword: "${newUserPassword}") }`;
    await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
    setOpenPassword(false);
    setSelectedUser(null);
    setNewUserPassword("");
  };

  const openEditDialog = (row) => {
    setEditForm({ id: row.id, email: row.email, name: row.name || "", organizationId: row.organizationId || null, contactNo: row.contactNo || "", role: row.role || "USER", isActive: !!row.isActive });
    setOpenEdit(true);
  };

  const saveEdit = async () => {
    if (!editForm.id) return;
    setSavingEdit(true);
    try {
      const query = `mutation Update($userId:ID!,$input:UpdateUserInput!){ updateUser(userId:$userId,input:$input){ id } }`;
      const input = { email: editForm.email, name: editForm.name || null, organizationId: editForm.organizationId || null, contactNo: editForm.contactNo || null, role: editForm.role, isActive: !!editForm.isActive };
      const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { userId: editForm.id, input } }) });
      const data = await res.json();
      if (data.errors) {
        window.alert(data.errors[0]?.message || "Update failed");
        return;
      }
      setOpenEdit(false);
      fetchUsers();
      try {
        const q = `query { superAdminCount }`;
        const r = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
        const d = await r.json();
        if (!d.errors) setSuperAdminCount(Number(d.data.superAdminCount || 0));
      } catch (_) {}
    } finally {
      setSavingEdit(false);
    }
  };

  const confirmDelete = (row) => { setSelectedUser(row); setOpenDelete(true); };

  const deleteUser = async () => {
    if (!selectedUser) return;
    const query = `mutation Del($userId:ID!){ deleteUser(userId:$userId) }`;
    const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { userId: selectedUser.id } }) });
    const data = await res.json();
    if (data.errors) { window.alert(data.errors[0]?.message || "Delete failed"); return; }
    setOpenDelete(false);
    setSelectedUser(null);
    fetchUsers();
    try {
      const q = `query { superAdminCount }`;
      const r = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
      const d = await r.json();
      if (!d.errors) setSuperAdminCount(Number(d.data.superAdminCount || 0));
    } catch (_) {}
  };

  const columns = [
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "name", headerName: "Name", width: 160 },
    { field: "organization", headerName: "Organization", width: 200, valueGetter: (p) => {
      const id = p.row.organizationId;
      if (id) {
        const found = orgOptions.find((o) => String(o.id) === String(id));
        return found ? found.name : p.row.organization || "";
      }
      return p.row.organization || "";
    } },
    { field: "contactNo", headerName: "Contact No", width: 140 },
    { field: "role", headerName: "Role", width: 140 },
    { field: "isActive", headerName: "Active", width: 120, valueGetter: (p) => (p.row.isActive ? "Yes" : "No") },
    {
      field: "actions",
      headerName: "Actions",
      width: 360,
      sortable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <ArgonBox display="flex" gap={1}>
          <ArgonButton 
            size="small" 
            variant={darkMode ? "outlined" : "gradient"} 
            color={sidenavColor || "warning"} 
            onClick={() => openEditDialog(params.row)}
          >
            <Icon sx={{ mr: 0.5 }} fontSize="small">edit</Icon> Edit
          </ArgonButton>
          <ArgonButton 
            size="small" 
            variant={darkMode ? "outlined" : "gradient"} 
            color={sidenavColor || "info"} 
            onClick={() => { setSelectedUser(params.row); setOpenPassword(true); }}
          >
            <Icon sx={{ mr: 0.5 }} fontSize="small">password</Icon> Password
          </ArgonButton>
          <ArgonButton 
            size="small" 
            variant={darkMode ? "outlined" : "gradient"} 
            color={sidenavColor || "error"} 
            onClick={() => confirmDelete(params.row)}
            disabled={params.row.role === 'SUPER_ADMIN' && superAdminCount === 1}
          >
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
                <ArgonTypography variant="h4" fontWeight="bold" color={darkMode ? "white" : "dark"}>User Management</ArgonTypography>
                <ArgonBox display="flex" alignItems="center" gap={2}>
                  <ArgonInput placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 240 }} />
                  <ArgonButton
                    color={sidenavColor || "warning"}
                    variant={darkMode ? "outlined" : "gradient"}
                    onClick={() => setOpenCreate(true)}
                  >
                    <Icon sx={{ mr: 1 }}>person_add</Icon> Create User
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

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Create User</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Email</ArgonTypography>
            <ArgonInput fullWidth placeholder="Enter email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Password</ArgonTypography>
            <ArgonBox position="relative">
              <ArgonInput 
                type={showCreatePassword ? "text" : "password"} 
                fullWidth 
                placeholder="Enter password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
              />
              <IconButton 
                size="small" 
                onClick={() => setShowCreatePassword((v) => !v)} 
                sx={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", color: darkMode ? "#fff" : "inherit" }}
              >
                <Icon fontSize="small">{showCreatePassword ? "visibility_off" : "visibility"}</Icon>
              </IconButton>
            </ArgonBox>
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Name</ArgonTypography>
            <ArgonInput fullWidth placeholder="Enter name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Contact No</ArgonTypography>
            <ArgonInput fullWidth placeholder="Enter contact no" value={newContactNo} onChange={(e) => setNewContactNo(e.target.value)} />
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Organization</ArgonTypography>
            <Select fullWidth value={newOrganizationId ?? ""} onChange={(e) => setNewOrganizationId(e.target.value)} displayEmpty>
              <MenuItem value=""><em>None</em></MenuItem>
              {orgOptions.map((o) => (<MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>))}
            </Select>
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Role</ArgonTypography>
            <Select 
              fullWidth 
              value={newRole} 
              onChange={(e) => setNewRole(e.target.value)}
            >
              {['SUPER_ADMIN','ADMIN','OWNER','SUPERVISOR','MASTER','CEO','FITTER','OPERATOR','WARPER','USER'].map(r => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </ArgonBox>
          <FormControlLabel control={<Switch checked={newIsActive} onChange={(e) => setNewIsActive(e.target.checked)} />} label="Active" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenCreate(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={createUser} variant="gradient" color={sidenavColor || "warning"}>Create</ArgonButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Edit User</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Email</ArgonTypography>
            <ArgonInput fullWidth placeholder="Enter email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Name</ArgonTypography>
            <ArgonInput fullWidth placeholder="Enter name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Contact No</ArgonTypography>
            <ArgonInput fullWidth placeholder="Enter contact no" value={editForm.contactNo} onChange={(e) => setEditForm({ ...editForm, contactNo: e.target.value })} />
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Organization</ArgonTypography>
            <Select fullWidth value={editForm.organizationId ?? ""} onChange={(e) => setEditForm({ ...editForm, organizationId: e.target.value })} displayEmpty>
              <MenuItem value=""><em>None</em></MenuItem>
              {orgOptions.map((o) => (<MenuItem key={o.id} value={o.id}>{o.name}</MenuItem>))}
            </Select>
          </ArgonBox>
          <ArgonBox mb={2}>
            <ArgonTypography variant="caption" color="text">Role</ArgonTypography>
          <Select 
            fullWidth 
            value={editForm.role} 
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            disabled={editForm.role === 'SUPER_ADMIN' && superAdminCount === 1}
          >
            {['SUPER_ADMIN','ADMIN','OWNER','SUPERVISOR','MASTER','CEO','FITTER','OPERATOR','WARPER','USER'].map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
        </ArgonBox>
          <FormControlLabel control={<Switch checked={!!editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} disabled={editForm.role === 'SUPER_ADMIN' && superAdminCount === 1} />} label="Active" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenEdit(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={saveEdit} disabled={savingEdit} variant="gradient" color={sidenavColor || "warning"}>Save</ArgonButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openPassword} onClose={() => setOpenPassword(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Change Password</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ArgonTypography variant="caption" color="text">{selectedUser?.email}</ArgonTypography>
          <ArgonBox mt={1.5}>
            <ArgonTypography variant="caption" color="text">New Password</ArgonTypography>
            <ArgonBox position="relative">
              <ArgonInput 
                type={showChangePassword ? "text" : "password"} 
                fullWidth 
                placeholder="Enter new password" 
                value={newUserPassword} 
                onChange={(e) => setNewUserPassword(e.target.value)} 
              />
              <IconButton 
                size="small" 
                onClick={() => setShowChangePassword((v) => !v)} 
                sx={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", color: darkMode ? "#fff" : "inherit" }}
              >
                <Icon fontSize="small">{showChangePassword ? "visibility_off" : "visibility"}</Icon>
              </IconButton>
            </ArgonBox>
          </ArgonBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenPassword(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={changePassword} variant="gradient" color={sidenavColor || "warning"}>Save</ArgonButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Delete User</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ArgonTypography variant="body2">{selectedUser ? `Are you sure you want to delete ${selectedUser.email}?` : ""}</ArgonTypography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenDelete(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={deleteUser} variant="gradient" color={sidenavColor || "error"}>Delete</ArgonButton>
        </DialogActions>
      </Dialog>
      <Footer />
    </DashboardLayout>
  );
}
