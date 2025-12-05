import { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
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
import ArgonInput from "components/ArgonInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

import { GRAPHQL_URL } from "config";
import { getToken } from "utils/auth";
import { useArgonController } from "context";
import { getTableStyles, getCardStyles } from "utils/tableStyles";

export default function WhatsappManagement() {
  const theme = useTheme();
  const [controller] = useArgonController();
  const { darkMode, sidenavColor } = controller;
  const token = getToken();

  const [orgOptions, setOrgOptions] = useState([]);
  const [orgId, setOrgId] = useState("");

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [openCreate, setOpenCreate] = useState(false);
  const [entries, setEntries] = useState([{ phoneNumber: "", name: "", isActive: true }]);
  const addEntry = () => setEntries((e) => [...e, { phoneNumber: "", name: "", isActive: true }]);
  const removeEntry = (idx) => setEntries((e) => e.filter((_, i) => i !== idx));
  const resetEntries = () => setEntries([{ phoneNumber: "", name: "", isActive: true }]);

  const [openEdit, setOpenEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const q = `query { organizations(page:1,pageSize:100){ items{ id name } } }`;
      const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query: q }) });
      const data = await res.json();
      if (data.errors) return;
      setOrgOptions(data.data.organizations.items);
      if (!orgId && data.data.organizations.items.length) setOrgId(String(data.data.organizations.items[0].id));
    };
    fetchOrganizations();
    // eslint-disable-next-line
  }, []);

  const fetchContacts = async () => {
    if (!orgId) return;
    const query = `query($organizationId:ID!,$page:Int,$pageSize:Int,$search:String){ organizationWhatsappContacts(organizationId:$organizationId,page:$page,pageSize:$pageSize,search:$search){ total items{ id organizationId phoneNumber name isActive } } }`;
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables: { organizationId: orgId, page: page + 1, pageSize, search: search || null } }),
    });
    const data = await res.json();
    if (data.errors) return;
    const payload = data.data.organizationWhatsappContacts;
    setRows(payload.items.map((c) => ({ id: c.id, organizationId: c.organizationId, phoneNumber: c.phoneNumber, name: c.name || "", isActive: c.isActive })));
    setTotal(payload.total);
  };

  useEffect(() => {
    const t = setTimeout(() => { fetchContacts(); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [orgId, page, pageSize, search]);

  const createContacts = async () => {
    if (!orgId) return;
    const clean = entries.filter((e) => e.phoneNumber && e.phoneNumber.trim());
    if (!clean.length) return;
    const query = `mutation($organizationId:ID!,$entries:[CreateWhatsappContactInput!]!){ createWhatsappContacts(organizationId:$organizationId,entries:$entries){ id } }`;
    const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { organizationId: orgId, entries: clean } }) });
    const data = await res.json();
    if (data.errors) { window.alert(data.errors[0]?.message || "Create failed"); return; }
    setOpenCreate(false);
    setEntries([{ phoneNumber: "", name: "", isActive: true }]);
    fetchContacts();
  };

  const openEditDialog = (row) => { setEditItem({ ...row }); setOpenEdit(true); };
  const saveEdit = async () => {
    const query = `mutation($contactId:ID!,$input:UpdateWhatsappContactInput!){ updateWhatsappContact(contactId:$contactId,input:$input){ id } }`;
    const input = { phoneNumber: editItem.phoneNumber, name: editItem.name || null, isActive: !!editItem.isActive };
    const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { contactId: editItem.id, input } }) });
    const data = await res.json();
    if (data.errors) { window.alert(data.errors[0]?.message || "Update failed"); return; }
    setOpenEdit(false);
    fetchContacts();
  };

  const confirmDelete = (row) => { setSelected(row); setOpenDelete(true); };
  const deleteContact = async () => {
    const query = `mutation($contactId:ID!){ deleteWhatsappContact(contactId:$contactId) }`;
    const res = await fetch(GRAPHQL_URL, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ query, variables: { contactId: selected.id } }) });
    const data = await res.json();
    if (data.errors) { window.alert(data.errors[0]?.message || "Delete failed"); return; }
    setOpenDelete(false);
    setSelected(null);
    fetchContacts();
  };

  const columns = [
    { field: "phoneNumber", headerName: "WhatsApp Number", flex: 1, minWidth: 180 },
    { field: "name", headerName: "Name", width: 180 },
    { field: "isActive", headerName: "Active", width: 120, valueGetter: (p) => (p.row.isActive ? "Yes" : "No") },
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
                <ArgonTypography variant="h4" fontWeight="bold" color={darkMode ? "white" : "dark"}>WhatsApp Management</ArgonTypography>
                <ArgonBox display="flex" alignItems="center" gap={2}>
                  <Select value={orgId} onChange={(e) => setOrgId(e.target.value)} sx={{ minWidth: 240 }}>
                    {orgOptions.map((o) => (<MenuItem key={o.id} value={String(o.id)}>{o.name}</MenuItem>))}
                  </Select>
                  <ArgonInput placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ minWidth: 240 }} />
                  <ArgonButton color={sidenavColor || "warning"} variant={darkMode ? "outlined" : "gradient"} onClick={() => { resetEntries(); setOpenCreate(true); }}>
                    <Icon sx={{ mr: 1 }}>add</Icon> Add Contacts
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

      <Dialog open={openCreate} onClose={() => { setOpenCreate(false); resetEntries(); }} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Add WhatsApp Contacts</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {entries.map((entry, idx) => (
            <Grid key={idx} container spacing={2} alignItems="center" mb={0.5}>
              <Grid item xs={12} sm={5}>
                <ArgonTypography variant="caption" color="text">Number</ArgonTypography>
                <ArgonInput fullWidth placeholder="WhatsApp number" value={entry.phoneNumber} onChange={(e) => setEntries((arr) => arr.map((x, i) => i === idx ? { ...x, phoneNumber: e.target.value } : x))} />
              </Grid>
              <Grid item xs={12} sm={5}>
                <ArgonTypography variant="caption" color="text">Name (optional)</ArgonTypography>
                <ArgonInput fullWidth placeholder="Name (optional)" value={entry.name} onChange={(e) => setEntries((arr) => arr.map((x, i) => i === idx ? { ...x, name: e.target.value } : x))} />
              </Grid>
              <Grid item xs={6} sm={1} display="flex" alignItems="center" justifyContent="center">
                <FormControlLabel labelPlacement="end" control={<Switch checked={entry.isActive} onChange={(e) => setEntries((arr) => arr.map((x, i) => i === idx ? { ...x, isActive: e.target.checked } : x))} />} label="Active" />
              </Grid>
              <Grid item xs={6} sm={1} display="flex" alignItems="center" justifyContent="center">
                <IconButton onClick={() => removeEntry(idx)} aria-label="remove"><Icon>remove_circle</Icon></IconButton>
              </Grid>
            </Grid>
          ))}
          <ArgonBox display="flex" alignItems="center" gap={1} mt={1}>
            <ArgonButton variant={darkMode ? "outlined" : "gradient"} color={sidenavColor || "info"} onClick={addEntry}>
              <Icon sx={{ mr: 1 }}>add_circle</Icon> Add Row
            </ArgonButton>
            <ArgonButton variant={darkMode ? "outlined" : "text"} color={sidenavColor || "warning"} onClick={resetEntries}>
              <Icon sx={{ mr: 1 }}>refresh</Icon> Reset
            </ArgonButton>
          </ArgonBox>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenCreate(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={createContacts} variant="gradient" color={sidenavColor || "warning"}>Save</ArgonButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => { setOpenEdit(false); setEditItem(null); }} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Edit Contact</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ArgonBox mb={2}><ArgonTypography variant="caption" color="text">Number</ArgonTypography><ArgonInput fullWidth value={editItem?.phoneNumber || ""} onChange={(e) => setEditItem({ ...editItem, phoneNumber: e.target.value })} /></ArgonBox>
          <ArgonBox mb={2}><ArgonTypography variant="caption" color="text">Name (optional)</ArgonTypography><ArgonInput fullWidth value={editItem?.name || ""} onChange={(e) => setEditItem({ ...editItem, name: e.target.value })} /></ArgonBox>
          <FormControlLabel labelPlacement="end" control={<Switch checked={!!editItem?.isActive} onChange={(e) => setEditItem({ ...editItem, isActive: e.target.checked })} />} label="Active" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenEdit(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={saveEdit} variant="gradient" color={sidenavColor || "warning"}>Save</ArgonButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openDelete} onClose={() => setOpenDelete(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle>
          <ArgonTypography variant="h6" fontWeight="bold">Delete Contact</ArgonTypography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <ArgonTypography variant="body2">{selected ? `Delete ${selected.phoneNumber}?` : ""}</ArgonTypography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <ArgonButton variant="outlined" color="dark" onClick={() => setOpenDelete(false)}>Cancel</ArgonButton>
          <ArgonButton onClick={deleteContact} variant="gradient" color={sidenavColor || "error"}>Delete</ArgonButton>
        </DialogActions>
      </Dialog>

      <Footer />
    </DashboardLayout>
  );
}
