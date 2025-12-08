import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";

import { useArgonController } from "context";
import { setToken, setUser, setOrganization } from "utils/auth";

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
        name
        role
        isActive
        organizationId
        organization {
          id
          name
        }
      }
    }
  }
`;

function Login() {
  const [controller] = useArgonController();
  const { darkMode } = controller;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      const { token, user } = data.login;
      
      if (user.role === 'SUPER_ADMIN') {
        setError("Super Admin users cannot login here. Please use the admin portal.");
        return;
      }

      setToken(token);
      setUser(user);
      
      // Store organization name separately if available
      if (user.organization?.name) {
        setOrganization(user.organization.name);
      }
      
      navigate("/home");
    },
    onError: (err) => {
      setError(err.message || "Login failed. Please check your credentials.");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    login({ variables: { email, password } });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: darkMode
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          : "linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: "420px",
          width: "100%",
          p: 4,
          borderRadius: "20px",
          boxShadow: darkMode
            ? "0 24px 48px rgba(0, 0, 0, 0.7)"
            : "0 24px 48px rgba(0, 0, 0, 0.12)",
          background: darkMode ? "#1a2332" : "#ffffff",
        }}
      >
        <ArgonBox textAlign="center" mb={4}>
          <ArgonBox
            component="img"
            src={process.env.PUBLIC_URL + "/technotexsolutions.png"}
            alt="Technotex Solutions"
            sx={{
              maxWidth: "160px",
              height: "auto",
              mb: 3,
            }}
          />
          <ArgonTypography variant="h4" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={0.5}>
            Welcome Back
          </ArgonTypography>
          <ArgonTypography variant="body2" color="text">
            Sign in to access your dashboard
          </ArgonTypography>
        </ArgonBox>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: "12px" }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <ArgonBox mb={2.5}>
            <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={0.5} display="block">
              Email
            </ArgonTypography>
            <TextField
              fullWidth
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              InputProps={{
                style: { 
                  color: darkMode ? "#fff" : "inherit",
                  borderRadius: "10px",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon sx={{ color: darkMode ? "#9ca3af" : "#6b7280", fontSize: "20px" }}>email</Icon>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  paddingRight: "14px",
                  "& fieldset": {
                    borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0ea5e9",
                  },
                  "& input": {
                    paddingLeft: "8px",
                    paddingRight: "0",
                  },
                },
              }}
            />
          </ArgonBox>

          <ArgonBox mb={3}>
            <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={0.5} display="block">
              Password
            </ArgonTypography>
            <TextField
              fullWidth
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                style: { 
                  color: darkMode ? "#fff" : "inherit",
                  borderRadius: "10px",
                },
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon sx={{ color: darkMode ? "#9ca3af" : "#6b7280", fontSize: "20px" }}>lock</Icon>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ position: "absolute", right: "4px" }}>
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                      sx={{ 
                        color: darkMode ? "#9ca3af" : "#6b7280",
                        padding: "8px",
                      }}
                    >
                      <Icon sx={{ fontSize: "20px" }}>{showPassword ? "visibility_off" : "visibility"}</Icon>
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  position: "relative",
                  paddingRight: "48px",
                  "& fieldset": {
                    borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                  },
                  "&:hover fieldset": {
                    borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#0ea5e9",
                  },
                  "& input": {
                    paddingLeft: "8px",
                    paddingRight: "0",
                  },
                },
              }}
            />
          </ArgonBox>

          <ArgonButton
            type="submit"
            color="info"
            variant="gradient"
            fullWidth
            size="large"
            disabled={loading}
            sx={{
              borderRadius: "10px",
              py: 1.5,
              fontSize: "1rem",
              fontWeight: "bold",
              textTransform: "none",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </ArgonButton>
        </form>

        <ArgonBox mt={3} textAlign="center">
          <ArgonTypography variant="caption" color="text">
            © 2024 Technotex Solutions. All rights reserved.
          </ArgonTypography>
        </ArgonBox>
      </Card>
    </Box>
  );
}

export default Login;
