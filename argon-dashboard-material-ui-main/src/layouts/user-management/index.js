import { useEffect, useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Icon from "@mui/material/Icon";
import { DataGrid } from "@mui/x-data-grid";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import { getToken } from "utils/auth";

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "http://localhost:4001/graphql";

export default function UserManagement() {
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
      renderCell: (params) => (
        <ArgonBox display="flex" gap={1}>
          <Button size="small" variant="outlined" onClick={() => { setSelectedUser(params.row); setOpenPassword(true); }} startIcon={<Icon>password</Icon>}>Change</Button>
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
            <Card sx={{ p: 2 }}>
              <ArgonBox display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <ArgonTypography variant="h5" fontWeight="bold">User Management</ArgonTypography>
                <Button variant="contained" color="primary" startIcon={<Icon>person_add</Icon>} onClick={() => setOpenCreate(true)}>Create User</Button>
              </ArgonBox>
              <div style={{ width: "100%" }}>
                <DataGrid rows={rows} columns={columns} pagination paginationMode="client" rowCount={total} page={page} pageSize={pageSize} onPageChange={(p) => setPage(p)} onPageSizeChange={(s) => setPageSize(s)} autoHeight />
              </div>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <TextField label="Email" fullWidth margin="dense" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <TextField label="Password" type="password" fullWidth margin="dense" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={createUser} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openPassword} onClose={() => setOpenPassword(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <ArgonTypography variant="caption" color="text">{selectedUser?.email}</ArgonTypography>
          <TextField label="New Password" type="password" fullWidth margin="dense" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPassword(false)}>Cancel</Button>
          <Button onClick={changePassword} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </DashboardLayout>
  );
}
