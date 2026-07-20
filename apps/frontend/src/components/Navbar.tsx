import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Box,
  useTheme,
} from "@mui/material";
import { Menu as MenuIcon, LogOut, User } from "lucide-react";
import { useState, type MouseEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  drawerWidth: number;
  handleDrawerToggle: () => void;
  onLogoutRequest?: () => void;
}

const Navbar = ({ drawerWidth, handleDrawerToggle, onLogoutRequest }: NavbarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    if (onLogoutRequest) {
      onLogoutRequest();
    } else {
      await logout();
      navigate("/login");
    }
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ minHeight: 64 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{
            mr: 2,
            display: { sm: "none" },
            color: theme.palette.text.secondary,
          }}
        >
          <MenuIcon size={24} />
        </IconButton>

        <Typography
          variant="h6"
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: "1.2rem",
            letterSpacing: "-0.5px",
            color: theme.palette.primary.main,
          }}
        >
          EMS
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography
            variant="body2"
            sx={{
              display: { xs: "none", sm: "block" },
              fontWeight: 500,
              color: theme.palette.text.secondary,
            }}
          >
            {user?.username || "User"}
          </Typography>

          <IconButton
            onClick={handleMenuClick}
            size="small"
            sx={{
              p: 0.5,
              border: `2px solid ${theme.palette.primary.main}20`,
              borderRadius: "50%",
              transition: "border-color 0.2s",
              "&:hover": {
                borderColor: theme.palette.primary.main,
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: theme.palette.primary.main,
                fontSize: "0.9rem",
                fontWeight: 600,
              }}
            >
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            slotProps={{
              paper: {
                elevation: 2,
                sx: {
                  mt: 1.5,
                  minWidth: 180,
                  borderRadius: 2,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                  "& .MuiMenuItem-root": {
                    py: 1.2,
                    px: 2,
                    gap: 1.5,
                    fontSize: "0.9rem",
                    transition: "background-color 0.15s",
                  },
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleProfile}>
              <User size={18} />
              Profile
            </MenuItem>
            <MenuItem
              onClick={handleLogout}
              sx={{
                color: theme.palette.error.main,
                "&:hover": {
                  backgroundColor: theme.palette.error.main + "15",
                },
              }}
            >
              <LogOut size={18} />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;