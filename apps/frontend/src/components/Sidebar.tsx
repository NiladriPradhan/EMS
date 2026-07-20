import {
  Drawer,
  List,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
  ListItemButton,
  useTheme,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  DollarSign,
  CreditCard,
  FileText,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";

interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  onLogoutRequest?: () => void;
}

const menuItems = [
  {
    text: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    permission: "dashboard.view",
  },
  {
    text: "Employees",
    icon: Users,
    path: "/employees",
    permission: "employee.view",
  },
  {
    text: "Departments",
    icon: Building2,
    path: "/departments",
    permission: "department.view",
  },
  {
    text: "Designations",
    icon: Briefcase,
    path: "/designations",
    permission: "designation.view",
  },
  {
    text: "Attendance",
    icon: CalendarCheck,
    path: "/attendance",
    permission: "attendance.view",
  },
  {
    text: "Leaves",
    icon: CalendarDays,
    path: "/leaves",
    permission: "leave.view",
  },
  {
    text: "Salary Structure",
    icon: DollarSign,
    path: "/salary-structure",
    permission: "salary_structure.view",
  },
  {
    text: "Payroll",
    icon: CreditCard,
    path: "/payroll",
    permission: "payroll.view",
  },
  {
    text: "Payslips",
    icon: FileText,
    path: "/payslips",
    permission: "payslip.view",
  },
  { text: "Profile", icon: User, path: "/profile", permission: "profile.view" },
];

const Sidebar = ({
  drawerWidth,
  mobileOpen,
  handleDrawerToggle,
  onLogoutRequest,
}: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { hasPermission } = usePermissions();

  const handleNavigation = (path: string) => {
    navigate(path);
    if (mobileOpen) handleDrawerToggle();
  };

  const handleLogout = async () => {
    if (onLogoutRequest) {
      onLogoutRequest();
    } else {
      await logout();
      navigate("/login");
    }
  };

  // Determine if the current route matches the item path
  const isActive = (path: string) => location.pathname.startsWith(path);

  const drawerContent = (
    <>
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: "100%",
            justifyContent: "center",
          }}
        >
          {/* <Box
            component="img"
            src="/vite.svg"
            alt="Logo"
            sx={{ height: 32, width: 32 }}
          /> */}
          <Box
            component="span"
            sx={{
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "-0.5px",
              color: theme.palette.primary.main,
            }}
          >
            EMS
          </Box>
        </Box>
      </Toolbar>
      <Divider sx={{ my: 1 }} />
      <List sx={{ px: 1.5 }}>
        {menuItems
          .filter((item) => hasPermission(item.permission))
          .map((item) => {
            const active = isActive(item.path);
            return (
              <ListItemButton
                key={item.text}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1,
                  px: 1.5,
                  transition: "all 0.15s ease",
                  backgroundColor: active
                    ? theme.palette.primary.main + "15"
                    : "transparent",
                  color: active
                    ? theme.palette.primary.main
                    : theme.palette.text.primary,
                  "&:hover": {
                    backgroundColor: active
                      ? theme.palette.primary.main + "25"
                      : theme.palette.action.hover,
                  },
                  "& .MuiListItemIcon-root": {
                    color: active
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    minWidth: 40,
                  },
                }}
              >
                <ListItemIcon>
                  <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  slotProps={{
                    primary: {
                      sx: {
                        fontWeight: active ? 600 : 500,
                        fontSize: "0.9rem",
                      },
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
      </List>
      <Divider sx={{ my: 1 }} />
      <List sx={{ px: 1.5 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1,
            px: 1.5,
            transition: "all 0.15s ease",
            color: theme.palette.error.main,
            "&:hover": {
              backgroundColor: theme.palette.error.main + "15",
            },
            "& .MuiListItemIcon-root": {
              color: theme.palette.error.main,
              minWidth: 40,
            },
          }}
        >
          <ListItemIcon>
            <LogOut size={20} strokeWidth={2} />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            slotProps={{
              primary: {
                sx: {
                  fontWeight: 500,
                  fontSize: "0.9rem",
                },
              },
            }}
          />
        </ListItemButton>
      </List>
    </>
  );

  // Styling for the drawer paper
  const drawerPaperSx = {
    boxSizing: "border-box",
    width: drawerWidth,
    backgroundColor: theme.palette.background.paper,
    borderRight: `1px solid ${theme.palette.divider}`,
    boxShadow: "none",
  };

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      aria-label="sidebar"
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": drawerPaperSx,
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": drawerPaperSx,
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
