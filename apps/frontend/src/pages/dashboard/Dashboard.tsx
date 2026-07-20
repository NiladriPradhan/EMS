import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
  Alert,
  Chip,
} from "@mui/material";
import {
  Users,
  Building2,
  Briefcase,
  CalendarCheck,
  CalendarDays,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { axiosInstance } from "../../api/axios";

interface DashboardStats {
  total_employees: number;
  total_departments: number;
  total_designations: number;
  today_attendance: number;
  present_today: number;
  absent_today: number;
  pending_leaves: number;
  approved_leaves: number;
  rejected_leaves: number;
}

const StatCard = ({
  title,
  value,
  icon: Icon,
  color,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  loading: boolean;
}) => (
  <Card sx={{ height: "100%", borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
    <CardContent>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: `${color}18`,
            color: color,
            display: "flex",
            alignItems: "center",
          }}
        >
          <Icon size={26} />
        </Box>
        <Box sx={{ flex: 1 }} >
          {loading ? (
            <>
              <Skeleton variant="text" width={60} height={36} />
              <Skeleton variant="text" width={100} height={20} />
            </>
          ) : (
            <>
              <Typography variant="h5" sx={{ fontWeight: 700 }} >
                {value}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {title}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: DashboardStats }>(
        "/dashboard",
      );
      return res.data.data;
    },
  });

  const mainStats = [
    { title: "Total Employees", value: data?.total_employees ?? 0, icon: Users, color: "#1976d2" },
    { title: "Departments", value: data?.total_departments ?? 0, icon: Building2, color: "#7b1fa2" },
    { title: "Designations", value: data?.total_designations ?? 0, icon: Briefcase, color: "#0288d1" },
    { title: "Present Today", value: data?.present_today ?? 0, icon: CalendarCheck, color: "#2e7d32" },
  ];

  const leaveStats = [
    { label: "Pending", value: data?.pending_leaves ?? 0, icon: Clock, color: "warning" },
    { label: "Approved", value: data?.approved_leaves ?? 0, icon: CheckCircle, color: "success" },
    { label: "Rejected", value: data?.rejected_leaves ?? 0, icon: XCircle, color: "error" },
  ] as const;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        Welcome back, {user?.username || "User"}! 👋
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }} >
        Here's what's happening with your organization today.
      </Typography>

      {isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard data. Please refresh.
        </Alert>
      )}

      {/* Main Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {mainStats.map((stat) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stat.title}>
            <StatCard {...stat} loading={isLoading} />
          </Grid>
        ))}
      </Grid>

      {/* Leave Overview */}
      <Typography variant="h6" sx={{ fontWeight: 600 }} gutterBottom>
        Leave Overview
      </Typography>
      <Grid container spacing={3}>
        {leaveStats.map((ls) => (
          <Grid size={{ xs: 12, sm: 4 }} key={ls.label}>
            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }} >
                    <ls.icon size={20} />
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {ls.label} Leaves
                    </Typography>
                  </Box>
                  {isLoading ? (
                    <Skeleton variant="rounded" width={48} height={28} />
                  ) : (
                    <Chip label={ls.value} color={ls.color} size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Attendance Today */}
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CalendarDays size={20} />
                  <Typography sx={{ fontWeight: 500 }} variant="body1" >
                    Absent Today
                  </Typography>
                </Box>
                {isLoading ? (
                  <Skeleton variant="rounded" width={48} height={28} />
                ) : (
                  <Chip label={data?.absent_today ?? 0} color="error" size="small" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
