import { Box, Toolbar, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const drawerWidth = 240;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const confirmLogout = async () => {
    setLogoutModalOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar
        drawerWidth={drawerWidth}
        handleDrawerToggle={handleDrawerToggle}
        onLogoutRequest={() => setLogoutModalOpen(true)}
      />
      <Sidebar
        drawerWidth={drawerWidth}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        onLogoutRequest={() => setLogoutModalOpen(true)}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "#f4f6f8",
        }}
      >
        <Toolbar /> {/* Spacer for fixed navbar */}
        <Outlet />
      </Box>

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setLogoutModalOpen(false)}>Cancel</Button>
          <Button onClick={confirmLogout} variant="contained" color="error">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Layout;
