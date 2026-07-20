import { useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Chip, Tooltip, Skeleton, MenuItem,
} from "@mui/material";
import { Plus, Trash2, CreditCard } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { payrollApi, type GenerateSalaryPayload, type SalaryRecord, getSalaryRecordId } from "../../api/payrollApi";
import { employeeApi } from "../../api/employeeApi";
import { usePermissions } from "../../hooks/usePermissions";

type FormValues = GenerateSalaryPayload;
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const Payroll = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SalaryRecord | null>(null);
  const { hasPermission } = usePermissions();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["salaries"],
    queryFn: async () => (await payrollApi.getAll()).data.data,
  });
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await employeeApi.getAll()).data.data,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { salary_month: new Date().getMonth() + 1, salary_year: new Date().getFullYear() },
  });

  const generateMutation = useMutation({
    mutationFn: payrollApi.generate,
    onSuccess: () => { toast.success("Salary generated!"); qc.invalidateQueries({ queryKey: ["salaries"] }); handleClose(); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });
  const payMutation = useMutation({
    mutationFn: payrollApi.markAsPaid,
    onSuccess: () => { toast.success("Marked as paid!"); qc.invalidateQueries({ queryKey: ["salaries"] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });
  const deleteMutation = useMutation({
    mutationFn: payrollApi.delete,
    onSuccess: () => { toast.success("Deleted!"); qc.invalidateQueries({ queryKey: ["salaries"] }); setDeleteTarget(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleClose = () => { setOpen(false); reset(); };
  const onSubmit = (values: FormValues) => generateMutation.mutate(values);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Payroll</Typography>
          <Typography variant="body2" color="textSecondary">Generate and manage monthly salary records</Typography>
        </Box>
        {hasPermission("payroll.generate") && (
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Generate Salary
          </Button>
        )}
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load payroll.</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>#</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Month/Year</TableCell>
              <TableCell>Gross</TableCell>
              <TableCell>Deductions</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 8 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
                ))
              : data?.map((rec, idx) => (
                  <TableRow key={getSalaryRecordId(rec)} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{rec.employee_name || `EMP#${rec.employee_id}`}</TableCell>
                    <TableCell>{MONTHS[rec.salary_month - 1]} {rec.salary_year}</TableCell>
                    <TableCell>{fmt(rec.gross_salary)}</TableCell>
                    <TableCell>{fmt(rec.total_deductions)}</TableCell>
                    <TableCell><Typography sx={{ fontWeight: 600 }}>{fmt(rec.net_salary)}</Typography></TableCell>
                    <TableCell>
                      <Chip label={rec.payment_status} size="small"
                        color={rec.payment_status === "Paid" ? "success" : "warning"} />
                    </TableCell>
                    <TableCell align="right">
                      {rec.payment_status === "Pending" && hasPermission("payroll.pay") && (
                        <Tooltip title="Mark as Paid">
                          <IconButton size="small" color="success" onClick={() => payMutation.mutate(getSalaryRecordId(rec))}>
                            <CreditCard size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {hasPermission("payroll.delete") && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setDeleteTarget(rec)}>
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && data?.length === 0 && (
              <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>No salary records yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Generate Salary</DialogTitle>
          <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller name="employee_id" control={control} rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField {...field} select label="Employee" fullWidth error={!!errors.employee_id} helperText={errors.employee_id?.message}>
                  {employees?.map(e => <MenuItem key={e.employee_id} value={e.employee_id}>{e.first_name} {e.last_name}</MenuItem>)}
                </TextField>
              )}
            />
            <Controller name="salary_month" control={control} rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField {...field} select label="Month" fullWidth>
                  {MONTHS.map((m, i) => <MenuItem key={i + 1} value={i + 1}>{m}</MenuItem>)}
                </TextField>
              )}
            />
            <Controller name="salary_year" control={control} rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField {...field} label="Year" type="number" fullWidth
                  error={!!errors.salary_year} helperText={errors.salary_year?.message} />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={generateMutation.isPending}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? <CircularProgress size={20} /> : "Generate"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Salary Record</DialogTitle>
        <DialogContent><Typography>Delete this salary record? This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteTarget && deleteMutation.mutate(getSalaryRecordId(deleteTarget))} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payroll;
