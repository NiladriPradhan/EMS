import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Chip,
  Tooltip,
  Skeleton,
  MenuItem,
  Avatar,
} from "@mui/material";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { employeeApi, type CreateEmployeePayload, type Employee } from "../../api/employeeApi";
import { departmentApi } from "../../api/departmentApi";
import { designationApi } from "../../api/designationApi";
import { usePermissions } from "../../hooks/usePermissions";

type FormValues = CreateEmployeePayload;

const statusColor = (s?: string) =>
  s === "active" ? "success" : s === "inactive" ? "error" : "default";

const Employees = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState<Employee | null>(null);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<number | "">("");
  const { hasPermission } = usePermissions();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await employeeApi.getAll()).data.data,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await departmentApi.getAll()).data.data,
  });

  const { data: designations } = useQuery({
    queryKey: ["designations"],
    queryFn: async () => (await designationApi.getAll()).data.data,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      username: "", email: "", password: "", first_name: "", last_name: "",
      phone: "", address: "", date_of_birth: "", hire_date: "",
      department_id: "", designation_id: "", role_id: 3,
    }
  });

  const createMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => { toast.success("Employee created!"); qc.invalidateQueries({ queryKey: ["employees"] }); handleClose(); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<FormValues> }) => employeeApi.update(id, data),
    onSuccess: () => { toast.success("Employee updated!"); qc.invalidateQueries({ queryKey: ["employees"] }); handleClose(); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => { toast.success("Employee deleted!"); qc.invalidateQueries({ queryKey: ["employees"] }); setDeleteTarget(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const handleOpen = (emp?: Employee) => {
    setEditTarget(emp || null);
    reset({
      username: emp?.username || "",
      email: emp?.email || "",
      password: "",
      first_name: emp?.first_name || "",
      last_name: emp?.last_name || "",
      phone: emp?.phone || "",
      address: emp?.address || "",
      date_of_birth: emp?.date_of_birth || "",
      hire_date: emp?.hire_date || "",
      department_id: emp?.department_id || "",
      designation_id: emp?.designation_id || "",
      role_id: emp?.role_id || 3,
    });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditTarget(null); reset(); };

  const onSubmit = (values: FormValues) => {
    if (editTarget) updateMutation.mutate({ id: editTarget.employee_id, data: values });
    else createMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const filteredData = data?.filter((emp) => {
    const fullName = `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.toLowerCase();
    const email = (emp.email ?? '').toLowerCase();
    const username = (emp.username ?? '').toLowerCase();
    const search = searchQuery.toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      email.includes(search) ||
      username.includes(search);

    const matchesDept = filterDepartment
      ? emp.department_id === Number(filterDepartment)
      : true;

    return matchesSearch && matchesDept;
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} >Employees</Typography>
          <Typography variant="body2" color="textSecondary">Manage all employee records</Typography>
        </Box>
        {hasPermission("employee.create") && (
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => handleOpen()}>
            Add Employee
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by name, email, or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
        <TextField
          select
          size="small"
          label="Filter by Department"
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value as number | "")}
          sx={{ width: 220 }}
        >
          <MenuItem value="">All Departments</MenuItem>
          {departments?.map((d) => (
            <MenuItem key={d.department_id} value={d.department_id}>
              {d.department_name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load employees.</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>#</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Designation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 7 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
              : filteredData?.map((emp, idx) => (
                <TableRow key={emp.employee_id} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: 13 }}>
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }} >{emp.first_name} {emp.last_name}</Typography>
                        <Typography variant="caption" color="textSecondary">@{emp.username}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.department_name || "—"}</TableCell>
                  <TableCell>{emp.designation_name || "—"}</TableCell>
                  <TableCell>
                    <Chip label={emp.status || "active"} size="small" color={statusColor(emp.status) as any} />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View"><IconButton size="small" onClick={() => setViewTarget(emp)}><Eye size={16} /></IconButton></Tooltip>
                    {hasPermission("employee.update") && (
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpen(emp)}><Pencil size={16} /></IconButton></Tooltip>
                    )}
                    {hasPermission("employee.delete") && (
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(emp)}><Trash2 size={16} /></IconButton></Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && filteredData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  {data?.length === 0 ? "No employees found. Add one to get started." : "No employees match your search criteria."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editTarget ? "Edit Employee" : "Add Employee"}</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }} >
              <Controller name="first_name" control={control} rules={{ required: "Required" }}
                render={({ field }) => <TextField {...field} label="First Name" fullWidth error={!!errors.first_name} helperText={errors.first_name?.message} />}
              />
              <Controller name="last_name" control={control} rules={{ required: "Required" }}
                render={({ field }) => <TextField {...field} label="Last Name" fullWidth error={!!errors.last_name} helperText={errors.last_name?.message} />}
              />
              <Controller name="username" control={control} rules={{ required: "Required" }}
                render={({ field }) => <TextField {...field} label="Username" fullWidth error={!!errors.username} helperText={errors.username?.message} />}
              />
              <Controller name="email" control={control} rules={{ required: "Required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } }}
                render={({ field }) => <TextField {...field} label="Email" fullWidth error={!!errors.email} helperText={errors.email?.message} />}
              />
              {!editTarget && (
                <Controller name="password" control={control} rules={{ required: "Required", minLength: { value: 6, message: "Min 6 chars" } }}
                  render={({ field }) => <TextField {...field} label="Password" type="password" fullWidth error={!!errors.password} helperText={errors.password?.message} />}
                />
              )}
              <Controller name="phone" control={control}
                render={({ field }) => <TextField {...field} label="Phone" fullWidth />}
              />
              <Controller name="date_of_birth" control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Date of Birth"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              <Controller name="hire_date" control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Hire Date"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              <Controller name="department_id" control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Department" fullWidth>
                    <MenuItem value="">— None —</MenuItem>
                    {departments?.map(d => <MenuItem key={d.department_id} value={d.department_id}>{d.department_name}</MenuItem>)}
                  </TextField>
                )}
              />
              <Controller name="designation_id" control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Designation" fullWidth>
                    <MenuItem value="">— None —</MenuItem>
                    {designations?.map(d => <MenuItem key={d.designation_id} value={d.designation_id}>{d.designation_name}</MenuItem>)}
                  </TextField>
                )}
              />
              <Controller name="role_id" control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Role" fullWidth>
                    <MenuItem value={1}>Admin</MenuItem>
                    <MenuItem value={2}>HR</MenuItem>
                    <MenuItem value={3}>Employee</MenuItem>
                  </TextField>
                )}
              />
              <Box sx={{ gridColumn: "1 / -1" }}>
                <Controller name="address" control={control}
                  render={({ field }) => <TextField {...field} label="Address" fullWidth multiline rows={2} />}
                />
              </Box>
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

      {/* View Dialog */}
      <Dialog open={!!viewTarget} onClose={() => setViewTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Employee Details</DialogTitle>
        <DialogContent>
          {viewTarget && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, pt: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontSize: 20 }}>
                  {viewTarget.first_name?.[0]}{viewTarget.last_name?.[0]}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{viewTarget.first_name} {viewTarget.last_name}</Typography>
                  <Typography variant="body2" color="textSecondary">@{viewTarget.username}</Typography>
                </Box>
              </Box>
              {[
                ["Email", viewTarget.email],
                ["Phone", viewTarget.phone || "—"],
                ["Department", viewTarget.department_name || "—"],
                ["Designation", viewTarget.designation_name || "—"],
                ["Role", viewTarget.role_id === 1 ? "Admin" : viewTarget.role_id === 2 ? "HR" : "Employee"],
                ["Hire Date", viewTarget.hire_date ? new Date(viewTarget.hire_date).toLocaleDateString() : "—"],
                ["Address", viewTarget.address || "—"],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 110 }}>{label}:</Typography>
                  <Typography variant="body2" color="textSecondary">{value}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewTarget(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Employee</DialogTitle>
        <DialogContent>
          <Typography>Delete <strong>{deleteTarget?.first_name} {deleteTarget?.last_name}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.employee_id)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Employees;
