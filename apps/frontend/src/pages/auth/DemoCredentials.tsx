import { Box, Card, CardContent, Typography, Button, IconButton, Tooltip, Divider, useTheme, alpha } from "@mui/material";
import { Copy, LogIn, Info } from "lucide-react";
import toast from "react-hot-toast";
import { DEMO_CREDENTIALS } from "../../constants/demoCredentials";

interface DemoCredentialsProps {
  onFill: (email: string, pass: string) => void;
}

const DemoCredentials = ({ onFill }: DemoCredentialsProps) => {
  const theme = useTheme();

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copied to clipboard`);
  };

  return (
    <Card
      sx={{
        width: "100%",
        mt: 3,
        borderRadius: 0,
        boxShadow: "none",
        backdropFilter: "blur(8px)",
        backgroundColor: alpha(theme.palette.background.paper, 0.95),
        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        position: "relative",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Info size={20} color={theme.palette.info.main} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Demo Credentials
          </Typography>
        </Box>
        
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          These are demo accounts created for portfolio evaluation only.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {DEMO_CREDENTIALS.map((cred) => (
            <Box 
              key={cred.role}
              sx={{ 
                p: 2, 
                border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                  {cred.role}
                </Typography>
                <Button 
                  size="small" 
                  variant="outlined" 
                  startIcon={<LogIn size={14} />}
                  onClick={() => onFill(cred.email, cred.password)}
                  sx={{ borderRadius: 0, textTransform: "none", py: 0.2 }}
                >
                  Fill Login
                </Button>
              </Box>
              <Divider sx={{ my: 1, opacity: 0.5 }} />
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                  {cred.email}
                </Typography>
                <Tooltip title="Copy Email">
                  <IconButton size="small" onClick={() => handleCopy(cred.email, "Email")}>
                    <Copy size={14} />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontFamily: "monospace", color: "text.secondary" }}>
                  {cred.password}
                </Typography>
                <Tooltip title="Copy Password">
                  <IconButton size="small" onClick={() => handleCopy(cred.password, "Password")}>
                    <Copy size={14} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DemoCredentials;
