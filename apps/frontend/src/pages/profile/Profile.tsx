import {
  Box, Typography, Card, CardContent, Avatar, Divider,
  CircularProgress, Alert, Chip,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../../api/axios";

const ROLE_LABELS: Record<number, string> = {
  1: "Admin",
  2: "HR",
  3: "Employee",
};

const Profile = () => {
  const { user } = useAuth();

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosInstance.get<{ success: boolean; data: any }>("/auth/me");
      return res.data.data;
    },
  });

  const displayUser = profile ?? user;

  return (
    <Box sx={{ maxWidth: 600 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }} >My Profile</Typography>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Could not refresh profile from server.</Alert>}

      <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <CardContent>
          {isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
          ) : (
            <>
              <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 3 }}>
                <Avatar sx={{ width: 72, height: 72, bgcolor: "primary.main", fontSize: 28 }}>
                  {displayUser?.username?.[0]?.toUpperCase() ?? "U"}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{displayUser?.username}</Typography>
                  <Typography variant="body2" color="textSecondary">{displayUser?.email}</Typography>
                  <Chip
                    label={ROLE_LABELS[displayUser?.role_id] ?? `Role ${displayUser?.role_id}`}
                    size="small"
                    color="primary"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {[
                ["User ID", displayUser?.user_id],
                ["Username", displayUser?.username],
                ["Email", displayUser?.email],
                ["Role", ROLE_LABELS[displayUser?.role_id] ?? displayUser?.role_id],
                ["Status", displayUser?.status ?? "active"],
              ].map(([label, value]) => (
                <Box key={String(label)} sx={{ display: "flex", gap: 2, py: 0.75 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 110 }} >{label}:</Typography>
                  <Typography variant="body2" color="textSecondary">{String(value ?? "—")}</Typography>
                </Box>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile;
