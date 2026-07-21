import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  Divider,
  Checkbox,
  FormControlLabel,
  alpha,
} from "@mui/material";
import { Eye, EyeOff, Briefcase, Shield, Users, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

interface LoginFormInputs {
  email: string;
  password: string;
}

// Demo credentials with icons
const demoUsers = [
  {
    label: "Admin",
    email: "admin@gmail.com",
    password: "Admin@123",
    icon: Shield,
  },
  { label: "HR", email: "hr@example.com", password: "Hr@123", icon: Users },
  {
    label: "Employee",
    email: "employee@example.com",
    password: "Employee@123",
    icon: User,
  },
];

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleFillDemo = (email: string, pass: string) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", pass, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
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
        background: `linear-gradient(145deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(
          theme.palette.primary.light,
          0.08,
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
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.04)} 0%, transparent 70%)`,
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
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.03)} 0%, transparent 70%)`,
          borderRadius: "50%",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 500,
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          my: 4,
        }}
      >
        <Card
          sx={{
            width: "100%",
            p: { xs: 2, sm: 3 },
            borderRadius: 0,
            boxShadow: "none",
            backdropFilter: "blur(8px)",
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
            position: "relative",
            zIndex: 1,
          }}
        >
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* Brand */}
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: theme.palette.primary.main,
                  mb: 2,
                }}
              >
                <Briefcase size={28} />
              </Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  letterSpacing: "-0.75px",
                  color: theme.palette.primary.main,
                }}
              >
                EMS - system
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ mt: 0.5, fontWeight: 400 }}
              >
                Employee Management System
              </Typography>
            </Box>

            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                textAlign: "center",
                mb: 0.5,
                letterSpacing: "-0.3px",
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{ textAlign: "center", mb: 3 }}
            >
              Enter your credentials to access your account
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                  borderRadius: 0,
                  "& .MuiAlert-icon": { fontSize: 20 },
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Email Address"
                    variant="outlined"
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 0,
                        backgroundColor: alpha(
                          theme.palette.background.default,
                          0.3,
                        ),
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.background.default,
                            0.5,
                          ),
                        },
                        "&.Mui-focused": {
                          backgroundColor: alpha(
                            theme.palette.background.default,
                            0.5,
                          ),
                        },
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="password"
                control={control}
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Password"
                    variant="outlined"
                    margin="normal"
                    type={showPassword ? "text" : "password"}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 0,
                        backgroundColor: alpha(
                          theme.palette.background.default,
                          0.3,
                        ),
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.background.default,
                            0.5,
                          ),
                        },
                        "&.Mui-focused": {
                          backgroundColor: alpha(
                            theme.palette.background.default,
                            0.5,
                          ),
                        },
                      },
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                              sx={{
                                color: theme.palette.text.secondary,
                                "&:hover": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            >
                              {showPassword ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 1,
                  mb: 2,
                }}
              >
                <FormControlLabel
                  control={<Checkbox size="small" sx={{ borderRadius: 0 }} />}
                  label="Remember me"
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      fontSize: "0.875rem",
                      color: theme.palette.text.secondary,
                    },
                  }}
                />
                <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    color="primary"
                    sx={{
                      fontWeight: 500,
                      "&:hover": {
                        textDecoration: "underline",
                      },
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Link>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  mb: 1.5,
                  py: 1.5,
                  borderRadius: 0,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "1rem",
                  boxShadow: "none",
                  "&:hover": {
                    boxShadow: "none",
                    backgroundColor: theme.palette.primary.dark,
                  },
                  transition: "background-color 0.2s ease",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>

              {/* Demo Credentials Buttons with Icons */}
              <Box sx={{ mt: 1, mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{
                    textAlign: "center",
                    mb: 1.5,
                    color: "textSecondary",
                    display: "block",
                  }}
                >
                  Quick Demo Access
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 1.5,
                    flexWrap: "wrap",
                  }}
                >
                  {demoUsers.map((user) => {
                    const IconComponent = user.icon;
                    return (
                      <Button
                        key={user.label}
                        variant="outlined"
                        size="small"
                        onClick={() =>
                          handleFillDemo(user.email, user.password)
                        }
                        startIcon={<IconComponent size={18} />}
                        sx={{
                          borderRadius: 0,
                          textTransform: "none",
                          fontWeight: 500,
                          minWidth: 80,
                          borderColor: alpha(theme.palette.primary.main, 0.3),
                          // color: theme.palette.text.primary,
                          color: "violet",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.04,
                            ),
                          },
                        }}
                      >
                        {user.label}
                      </Button>
                    );
                  })}
                </Box>
              </Box>

              <Divider sx={{ my: 2.5 }}>
                <Typography variant="caption" color="textSecondary">
                  Secure & Encrypted
                </Typography>
              </Divider>

              <Typography
                variant="body2"
                color="textSecondary"
                align="center"
                sx={{
                  fontSize: "0.75rem",
                  "& a": {
                    color: theme.palette.primary.main,
                    textDecoration: "none",
                    fontWeight: 500,
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  },
                }}
              >
                By signing in, you agree to our{" "}
                <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </Typography>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Login;
