import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import { Link } from "react-router-dom";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";
import { KeyRound, ArrowLeft } from "lucide-react";

interface ForgotPasswordFormInputs {
  email: string;
  new_password: string;
  confirm_password: string;
}

const ForgotPassword = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>();

  const onSubmit: SubmitHandler<ForgotPasswordFormInputs> = async (data) => {
    if (data.new_password !== data.confirm_password) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authApi.directResetPassword({
        email: data.email,
        new_password: data.new_password,
        confirm_password: data.confirm_password
      });
      setSuccess(true);
      toast.success("Password updated successfully.");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha(
          theme.palette.primary.light,
          0.12
        )} 100%)`,
        p: 2,
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-20%",
          right: "-15%",
          width: "50%",
          height: "70%",
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.06)} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: "-30%",
          left: "-15%",
          width: "55%",
          height: "60%",
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.04)} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        },
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: "100%",
          p: { xs: 2, sm: 3 },
          // borderRadius: 4,
          boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 2px 12px rgba(0,0,0,0.02)",
          backdropFilter: "blur(12px)",
          backgroundColor: alpha(theme.palette.background.paper, 0.92),
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          position: "relative",
          zIndex: 1,
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 24px 72px rgba(0,0,0,0.12), 0 2px 12px rgba(0,0,0,0.02)",
          },
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          {/* Brand */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                // borderRadius: "50%",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mb: 1.5,
              }}
            >
              <KeyRound size={32} />
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                letterSpacing: "-0.75px",
                color: theme.palette.primary.main,
              }}
            >
              Reset Password
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ mt: 0.5, fontWeight: 500 }}
            >
              Enter your email and new password
            </Typography>
          </Box>

          {success ? (
            <>
              <Alert
                severity="success"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  "& .MuiAlert-icon": { fontSize: 20 },
                }}
              >
                Password updated successfully. You can now login.
              </Alert>
              <Button
                fullWidth
                variant="contained"
                component={Link}
                to="/login"
                startIcon={<ArrowLeft size={18} />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
                  "&:hover": {
                    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Back to Login
              </Button>
            </>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <TextField
                fullWidth
                label="Email Address"
                variant="outlined"
                margin="normal"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Invalid email address",
                  },
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    // borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    "&.Mui-focused": {
                      backgroundColor: theme.palette.background.default,
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="New Password"
                type="password"
                variant="outlined"
                margin="normal"
                {...register("new_password", {
                  required: "New password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                error={!!errors.new_password}
                helperText={errors.new_password?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    // borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    "&.Mui-focused": {
                      backgroundColor: theme.palette.background.default,
                    },
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirm Password"
                type="password"
                variant="outlined"
                margin="normal"
                {...register("confirm_password", {
                  required: "Please confirm your password",
                })}
                error={!!errors.confirm_password}
                helperText={errors.confirm_password?.message}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    // borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.default, 0.5),
                    transition: "background-color 0.2s",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                    },
                    "&.Mui-focused": {
                      backgroundColor: theme.palette.background.default,
                    },
                  },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
                  "&:hover": {
                    boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.35)}`,
                    transform: "translateY(-2px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Reset Password"
                )}
              </Button>

              <Divider sx={{ my: 2 }}>
                <Typography variant="caption" color="textSecondary">
                  Remember your password?
                </Typography>
              </Divider>

              <Button
                fullWidth
                variant="text"
                component={Link}
                to="/login"
                startIcon={<ArrowLeft size={18} />}
                sx={{
                  color: theme.palette.text.secondary,
                  fontWeight: 500,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    color: theme.palette.primary.main,
                  },
                }}
              >
                Back to Login
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPassword;