import { Box, Typography, alpha, useTheme, keyframes } from "@mui/material";
import { Briefcase } from "lucide-react";

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.25); }
  50% { transform: scale(1.04); box-shadow: 0 0 0 12px rgba(25, 118, 210, 0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const dotBounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-6px); opacity: 1; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
`;

const AppLoader = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(
          theme.palette.primary.light,
          0.1,
        )} 50%, ${alpha(theme.palette.background.default, 1)} 100%)`,
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: "45%",
          height: "65%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-25%",
          left: "-10%",
          width: "50%",
          height: "55%",
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          animation: `${fadeIn} 0.5s ease-out`,
        }}
      >
        {/* Spinner ring + logo */}
        <Box sx={{ position: "relative", width: 88, height: 88, mb: 3 }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `3px solid ${alpha(theme.palette.primary.main, 0.12)}`,
              borderTopColor: theme.palette.primary.main,
              animation: `${spin} 1s linear infinite`,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              color: theme.palette.primary.main,
              animation: `${pulse} 2s ease-in-out infinite`,
            }}
          >
            <Briefcase size={32} strokeWidth={2} />
          </Box>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            letterSpacing: "-0.75px",
            color: theme.palette.primary.main,
            mb: 0.5,
          }}
        >
          EMS
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, fontWeight: 400 }}
        >
          Employee Management System
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Loading your workspace
          </Typography>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: theme.palette.primary.main,
                animation: `${dotBounce} 1.2s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </Box>

        {/* Progress bar */}
        <Box
          sx={{
            width: 220,
            height: 4,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              width: "50%",
              background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
              animation: `${shimmer} 1.5s ease-in-out infinite`,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AppLoader;
