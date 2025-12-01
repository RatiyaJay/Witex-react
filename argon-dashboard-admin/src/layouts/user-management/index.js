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
  const [openCreate, setOpenCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [openPassword, setOpenPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserPassword, setNewUserPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  const token = getToken();

  const fetchUsers = async () => {
    const query = `query { users(page: ${page + 1}, pageSize: ${pageSize}) { total page pageSize items { id email role isActive } } }`;
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (data.errors) return;
    const payload = data.data.users;
    setRows(payload.items.map((u) => ({ id: u.id, email: u.email, role: u.role, isActive: u.isActive })));
    setTotal(payload.total);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [page, pageSize]);

  const createUser = async () => {
    const q = `mutation { createUser(email: "${newEmail}", password: "${newPassword}", role: USER) { id } }`;
    await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
    setOpenCreate(false);
    setNewEmail("");
    setNewPassword("");
    fetchUsers();
  };

  const changePassword = async () => {
    if (!selectedUser) return;
    const q = `mutation { updateUserPassword(userId: ${selectedUser.id}, newPassword: "${newUserPassword}") }`;
    await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
    setOpenPassword(false);
    setSelectedUser(null);
    setNewUserPassword("");
  };

  const columns = [
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "role", headerName: "Role", width: 140 },
    { field: "isActive", headerName: "Active", width: 120, valueGetter: (p) => (p.row.isActive ? "Yes" : "No") },
    {
      field: "actions",
      headerName: "Actions",
      width: 220,
      sortable: false,
      align: "right",
      headerAlign: "right",
      renderCell: (params) => (
        <ArgonBox display="flex" gap={1}>
          <ArgonButton 
            size="small" 
            variant={darkMode ? "outlined" : "gradient"} 
            color={sidenavColor || "warning"} 
            onClick={() => { setSelectedUser(params.row); setOpenPassword(true); }}
          >
            <Icon sx={{ mr: 0.5 }} fontSize="small">password</Icon> Change
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
                <ArgonTypography variant="h4">User Management</ArgonTypography>
                <ArgonButton
                  color={sidenavColor || "warning"}
                  variant={darkMode ? "outlined" : "gradient"}
                  onClick={() => setOpenCreate(true)}
                >
                  <Icon sx={{ mr: 1 }}>person_add</Icon> Create User
                </ArgonButton>
              </ArgonBox>
              <div style={{ width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pagination
                  paginationMode="client"
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
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenCreate(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={createUser} variant="gradient" color={sidenavColor || "warning"}>Create</ArgonButton>
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
      <Footer />
    </DashboardLayout>
  );
}
