import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
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
} from "@mui/material";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "../../api/auth";
import toast from "react-hot-toast";

interface ResetPasswordFormInputs {
  token: string;
  new_password: string;
  confirm_password: string;
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token") || "";
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    defaultValues: {
      token: tokenParam,
    },
  });

  const newPassword = watch("new_password");

  const onSubmit: SubmitHandler<ResetPasswordFormInputs> = async (data) => {
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword({
        token: data.token,
        new_password: data.new_password,
        confirm_password: data.confirm_password,
      });
      toast.success("Password reset successfully. Please login.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Reset failed");
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
        backgroundColor: "#f4f6f8",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: "100%", p: 2 }}>
        <CardContent>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              textAlign: "center",
            }}
            gutterBottom
          >
            Reset Password
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              textAlign: "center",
              mb: 3,
            }}
          >
            Enter your new password
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              fullWidth
              label="Reset Token"
              variant="outlined"
              margin="normal"
              {...register("token", {
                required: "Token is required",
              })}
              error={!!errors.token}
              helperText={errors.token?.message}
              disabled={!!tokenParam} // disable if token in URL
            />

            <TextField
              fullWidth
              label="New Password"
              variant="outlined"
              margin="normal"
              type={showNewPassword ? "text" : "password"}
              {...register("new_password", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              error={!!errors.new_password}
              helperText={errors.new_password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showNewPassword ? (
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

            <TextField
              fullWidth
              label="Confirm Password"
              variant="outlined"
              margin="normal"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirm_password", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === newPassword || "Passwords do not match",
              })}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.message}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showConfirmPassword ? (
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Reset Password"
              )}
            </Button>

            <Box sx={{ textAlign: "center", mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Remember your password?{" "}
                <Link to="/login" style={{ textDecoration: "none" }}>
                  Login
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ResetPassword;
