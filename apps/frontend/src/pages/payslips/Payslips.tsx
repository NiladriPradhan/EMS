import { useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, Divider, Alert, Skeleton, Chip, Tooltip,
} from "@mui/material";
import { FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { payrollApi, getSalaryRecordId } from "../../api/payrollApi";

const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n));
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const PayslipDialog = ({ id, onClose }: { id: number; onClose: () => void }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["payslip", id],
    queryFn: async () => (await payrollApi.getPayslip(id)).data.data,
    enabled: !!id,
  });

  const Row = ({ label, value }: { label: string; value: string }) => (
    <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
      <Typography variant="body2" color="textSecondary">{label}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }} >{value}</Typography>
    </Box>
  );

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Payslip</DialogTitle>
      <DialogContent>
        {isLoading && <Box>{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} sx={{ mb: 1 }} />)}</Box>}
        {isError && <Alert severity="error">Failed to load payslip.</Alert>}
        {data && (
          <Box>
            <Box sx={{ mb: 2 }} >
              <Typography variant="h6" sx={{ fontWeight: 700 }} >{data.first_name} {data.last_name}</Typography>
              <Typography variant="body2" color="textSecondary">{data.designation_name} — {data.department_name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {MONTHS[(data.salary_month ?? 1) - 1]} {data.salary_year}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>Earnings</Typography>
            <Row label="Basic Salary" value={fmt(data.basic_salary)} />
            <Row label="HRA" value={fmt(data.hra)} />
            <Row label="DA" value={fmt(data.da)} />
            <Row label="TA" value={fmt(data.ta)} />
            <Row label="Medical Allowance" value={fmt(data.medical_allowance)} />
            <Row label="Other Allowance" value={fmt(data.other_allowance)} />
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5, fontWeight: 700 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} >Gross Salary</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>{fmt(data.gross_salary)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" gutterBottom>Deductions</Typography>
            <Row label="PF" value={fmt(data.pf)} />
            <Row label="ESI" value={fmt(data.esi)} />
            <Row label="Professional Tax" value={fmt(data.professional_tax)} />
            <Row label="Income Tax" value={fmt(data.income_tax)} />
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }} >Total Deductions</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700 }} >{fmt(data.total_deductions)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: "flex", justifyContent: "space-between", py: 1, bgcolor: "primary.main", color: "primary.contrastText", px: 1 }}>
              <Typography sx={{ fontWeight: 700, color: "inherit" }} >Net Salary</Typography>
              <Typography sx={{ fontWeight: 700, color: "inherit" }} >{fmt(data.net_salary)}</Typography>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog >
  );
};

const Payslips = () => {
  const [viewId, setViewId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["payslips"],
    queryFn: async () => (await payrollApi.getPayslips()).data.data,
  });

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }} >Payslips</Typography>
        <Typography variant="body2" color="textSecondary">View detailed payslips for each salary record</Typography>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load records.</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>#</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Month / Year</TableCell>
              <TableCell>Net Salary</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Payslip</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
              : data?.map((rec, idx) => (
                <TableRow key={getSalaryRecordId(rec)} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{rec.employee_name || `EMP#${rec.employee_id}`}</TableCell>
                  <TableCell>{MONTHS[rec.salary_month - 1]} {rec.salary_year}</TableCell>
                  <TableCell><Typography sx={{ fontWeight: 600 }} >{fmt(rec.net_salary)}</Typography></TableCell>
                  <TableCell>
                    <Chip label={rec.payment_status} size="small"
                      color={rec.payment_status === "Paid" ? "success" : "warning"} />
                  </TableCell>
                  <TableCell sx={{ align: "right" }} >
                    <Tooltip title="View Payslip">
                      <IconButton size="small" color="primary" onClick={() => setViewId(getSalaryRecordId(rec))}>
                        <FileText size={16} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && data?.length === 0 && (
              <TableRow><TableCell colSpan={6} sx={{ py: 4, color: "text.secondary", align: "center" }}>No payslips available.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {viewId && <PayslipDialog id={viewId} onClose={() => setViewId(null)} />}
    </Box>
  );
};

export default Payslips;
