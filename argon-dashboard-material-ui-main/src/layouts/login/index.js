import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import Icon from "@mui/material/Icon";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonInput from "components/ArgonInput";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";

import { setToken } from "utils/auth";

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "http://localhost:4001/graphql";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const logo = process.env.PUBLIC_URL + "/technotexsolutions.png";

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Enter email and password");
    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: `mutation { login(email: "${email}", password: "${password}") { token user { email role } } }` }),
      });
      const data = await res.json();
      if (data.errors) throw new Error(data.errors[0]?.message || "Login error");
      const { token, user } = data.data.login;
      if (user.role !== "SUPER_ADMIN") throw new Error("Only super admin can access");
      setToken(token);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <DashboardLayout>
      <ArgonBox minHeight="100vh" display="flex" alignItems="center" justifyContent="center" sx={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
      }}>
        <Grid container spacing={3} sx={{ maxWidth: 520, px: 2 }}>
          <Grid item xs={12}>
            <Card sx={{ p: 3, borderRadius: "14px" }}>
              <ArgonBox display="flex" flexDirection="column" alignItems="center" textAlign="center" mb={2}>
                <img src={logo} alt="Technotex Solutions" style={{ width: 120, height: "auto", marginBottom: 8 }} />
                <ArgonTypography variant="h5" fontWeight="bold">Super Admin Login</ArgonTypography>
              </ArgonBox>
              <form onSubmit={submit}>
                <ArgonBox mb={2}>
                  <ArgonTypography variant="caption" color="text">Email</ArgonTypography>
                  <ArgonInput fullWidth value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
                </ArgonBox>
                <ArgonBox mb={2}>
                  <ArgonTypography variant="caption" color="text">Password</ArgonTypography>
                  <ArgonInput type="password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" />
                </ArgonBox>
                {error && (
                  <ArgonTypography variant="caption" color="error" mb={1}>{error}</ArgonTypography>
                )}
                <Button type="submit" variant="contained" color="primary" fullWidth startIcon={<Icon>login</Icon>}>
                  Sign In
                </Button>
              </form>
            </Card>
          </Grid>
        </Grid>
      </ArgonBox>
    </DashboardLayout>
  );
}
