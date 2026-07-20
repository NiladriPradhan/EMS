import { Box, Typography, Button, Container } from "@mui/material";
import { ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermissions";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { permissions } = usePermissions();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <ShieldAlert size={80} color="#d32f2f" strokeWidth={1.5} />
        <Typography variant="h3" sx={{ fontWeight: 700 }} color="error.main">
          Access Denied
        </Typography>
        <Typography variant="h6" color="textSecondary" sx={{ maxWidth: 500 }}>
          You don't have permission to access this page. Please contact your
          administrator if you believe this is a mistake.
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Debug - Your Permissions: {JSON.stringify(permissions)}
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate("/dashboard")}
          sx={{ mt: 2 }}
        >
          Return to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
