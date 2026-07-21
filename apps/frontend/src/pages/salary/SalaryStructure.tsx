import { useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Chip, Tooltip, Skeleton, MenuItem,
} from "@mui/material";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { salaryApi, type CreateSalaryStructurePayload, type SalaryStructure } from "../../api/salaryApi";
import { employeeApi } from "../../api/employeeApi";
import { usePermissions } from "../../hooks/usePermissions";

type FormValues = CreateSalaryStructurePayload;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const SalaryStructurePage = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SalaryStructure | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SalaryStructure | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Inactive">("All");
  const { hasPermission } = usePermissions();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["salary-structures"],
    queryFn: async () => (await salaryApi.getAll()).data.data,
  });
  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await employeeApi.getAll()).data.data,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const createMutation = useMutation({
    mutationFn: salaryApi.create,
    onSuccess: () => { toast.success("Salary structure created!"); qc.invalidateQueries({ queryKey: ["salary-structures"] }); handleClose(); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<FormValues> }) => salaryApi.update(id, data),
    onSuccess: () => { toast.success("Updated!"); qc.invalidateQueries({ queryKey: ["salary-structures"] }); handleClose(); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });
  const deleteMutation = useMutation({
    mutationFn: salaryApi.delete,
    onSuccess: () => { toast.success("Deleted!"); qc.invalidateQueries({ queryKey: ["salary-structures"] }); setDeleteTarget(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleOpen = (item?: SalaryStructure) => {
    setEditTarget(item || null);
    reset(item ? {
      employee_id: item.employee_id?._id || item.employee_id, basic_salary: item.basic_salary,
      hra: item.hra, da: item.da, ta: item.ta,
      medical_allowance: item.medical_allowance, other_allowance: item.other_allowance,
      pf: item.pf, esi: item.esi, professional_tax: item.professional_tax,
      income_tax: item.income_tax, status: item.status,
    } : { status: "Active" });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditTarget(null); reset(); };
  const onSubmit = (values: FormValues) => {
    if (editTarget) updateMutation.mutate({ id: editTarget._id || editTarget.salary_structure_id!, data: values });
    else createMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const numField = (name: keyof FormValues, label: string) => (
    <Controller name={name} control={control} rules={{ required: "Required" }}
      render={({ field }) => (
        <TextField {...field} label={label} type="number" fullWidth size="small"
          error={!!(errors as any)[name]} helperText={(errors as any)[name]?.message} />
      )}
    />
  );

  // Filter logic
  const filteredData = data?.filter((item) => {
    const empName = item.employee_id?.first_name 
      ? `${item.employee_id.first_name} ${item.employee_id.last_name}` 
      : item.employee_name || "";
    const employeeName = empName.toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || employeeName.includes(query);
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }} >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Salary Structures</Typography>
          <Typography variant="body2" color="textSecondary">Define salary components per employee</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {hasPermission("salary_structure.create") && (
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => handleOpen()}>
              Add Structure
            </Button>
          )}
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by employee name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 280 }}
          slotProps={{
            input: {
              startAdornment: <Search size={18} style={{ marginRight: 8, color: "#999" }} />,
              endAdornment: searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </IconButton>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "All" | "Active" | "Inactive")}
          sx={{ width: 160 }}
        >
          <MenuItem value="All">All</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Inactive">Inactive</MenuItem>
        </TextField>
        {(searchQuery || statusFilter !== "All") && (
          <Typography variant="caption" color="textSecondary">
            {filteredData?.length || 0} result{filteredData?.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load salary structures.</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>#</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Basic Salary</TableCell>
              <TableCell>Gross (Est.)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
              : filteredData?.map((s, idx) => {
                const gross = s.basic_salary + s.hra + s.da + s.ta + s.medical_allowance + s.other_allowance;
                return (
                  <TableRow key={s._id || s.salary_structure_id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{s.employee_id?.first_name ? `${s.employee_id.first_name} ${s.employee_id.last_name}` : s.employee_name || `EMP#${s.employee_id}`}</TableCell>
                    <TableCell>{fmt(s.basic_salary)}</TableCell>
                    <TableCell>{fmt(gross)}</TableCell>
                    <TableCell>
                      <Chip label={s.status} size="small" color={s.status === "Active" ? "success" : "default"} />
                    </TableCell>
                    <TableCell align="right">
                      {hasPermission("salary_structure.update") && (
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(s)}><Pencil size={16} /></IconButton></Tooltip>
                      )}
                      {hasPermission("salary_structure.delete") && (
                        <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(s)}><Trash2 size={16} /></IconButton></Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            {!isLoading && filteredData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  {searchQuery || statusFilter !== "All"
                    ? "No salary structures match your search/filter criteria."
                    : "No salary structures found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editTarget ? "Edit Salary Structure" : "Add Salary Structure"}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }} >
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Controller name="employee_id" control={control} rules={{ required: "Required" }}
                  render={({ field }) => (
                    <TextField {...field} select label="Employee" fullWidth error={!!errors.employee_id} helperText={errors.employee_id?.message}>
                      {employees?.map(e => <MenuItem key={e.employee_id} value={e.employee_id}>{e.first_name} {e.last_name}</MenuItem>)}
                    </TextField>
                  )}
                />
              </Box>
              <Typography variant="subtitle2" sx={{ gridColumn: "1 / -1", color: "textSecondary" }}>Earnings</Typography>
              {numField("basic_salary", "Basic Salary")}
              {numField("hra", "HRA")}
              {numField("da", "DA")}
              {numField("ta", "TA")}
              {numField("medical_allowance", "Medical Allowance")}
              {numField("other_allowance", "Other Allowance")}
              <Typography variant="subtitle2" sx={{ gridColumn: "1 / -1", color: "textSecondary" }}>Deductions</Typography>
              {numField("pf", "PF")}
              {numField("esi", "ESI")}
              {numField("professional_tax", "Professional Tax")}
              {numField("income_tax", "Income Tax")}
              <Controller name="status" control={control} rules={{ required: "Required" }}
                render={({ field }) => (
                  <TextField {...field} select label="Status" fullWidth size="small">
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? <CircularProgress size={20} /> : editTarget ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Salary Structure</DialogTitle>
        <DialogContent><Typography>Delete this structure? This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget._id || deleteTarget.salary_structure_id!)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaryStructurePage;