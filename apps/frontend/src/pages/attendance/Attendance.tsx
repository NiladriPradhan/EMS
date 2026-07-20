import { useState } from "react";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, CircularProgress, Alert, Chip, Skeleton, MenuItem,
  IconButton,
} from "@mui/material";
import { Plus, Search, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { attendanceApi, type CreateAttendancePayload, type AttendanceStatus } from "../../api/attendanceApi";
import { employeeApi } from "../../api/employeeApi";
import { usePermissions } from "../../hooks/usePermissions";

type FormValues = CreateAttendancePayload;
const statuses: AttendanceStatus[] = ["Present", "Absent", "Late"];
const statusColor = (s: AttendanceStatus) =>
  s === "Present" ? "success" : s === "Late" ? "warning" : "error";

const Attendance = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | "All">("All");
  const { hasPermission } = usePermissions();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendance"],
    queryFn: async () => (await attendanceApi.getAll()).data.data,
  });

  const { data: employees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => (await employeeApi.getAll()).data.data,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { attendance_date: new Date().toISOString().split("T")[0], status: "Present" },
  });

  const createMutation = useMutation({
    mutationFn: attendanceApi.create,
    onSuccess: () => { toast.success("Attendance recorded!"); qc.invalidateQueries({ queryKey: ["attendance"] }); handleClose(); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  const handleClose = () => { setOpen(false); reset(); };
  const onSubmit = (values: FormValues) => createMutation.mutate(values);

  // Filter logic – only by employee name
  const filteredData = data?.filter((att) => {
    const employeeName = (att.employee_name || "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || employeeName.includes(query);
    const matchesStatus = statusFilter === "All" || att.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Attendance</Typography>
          <Typography variant="body2" color="textSecondary">Track daily employee attendance</Typography>
        </Box>
        {hasPermission("attendance.create") && (
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
            Mark Attendance
          </Button>
        )}
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
          onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | "All")}
          sx={{ width: 160 }}
        >
          <MenuItem value="All">All</MenuItem>
          {statuses.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        {(searchQuery || statusFilter !== "All") && (
          <Typography variant="caption" color="textSecondary">
            {filteredData?.length || 0} result{filteredData?.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load attendance.</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>#</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Check In</TableCell>
              <TableCell>Check Out</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
              : filteredData?.map((att, idx) => (
                <TableRow key={att.attendance_id} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{att.employee_name || `EMP#${att.employee_id}`}</TableCell>
                  <TableCell>{new Date(att.attendance_date).toLocaleDateString()}</TableCell>
                  <TableCell><Chip label={att.status} size="small" color={statusColor(att.status) as any} /></TableCell>
                  <TableCell>{att.check_in || "—"}</TableCell>
                  <TableCell>{att.check_out || "—"}</TableCell>
                </TableRow>
              ))}
            {!isLoading && filteredData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  {searchQuery || statusFilter !== "All"
                    ? "No attendance records match your search/filter criteria."
                    : "No attendance records found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>Mark Attendance</DialogTitle>
          <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller name="employee_id" control={control} rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField {...field} select label="Employee" fullWidth error={!!errors.employee_id} helperText={errors.employee_id?.message}>
                  {employees?.map(e => <MenuItem key={e.employee_id} value={e.employee_id}>{e.first_name} {e.last_name}</MenuItem>)}
                </TextField>
              )}
            />
            <Controller name="attendance_date" control={control} rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Date"
                  type="date"
                  fullWidth
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller name="status" control={control}
              render={({ field }) => (
                <TextField {...field} select label="Status" fullWidth>
                  {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              )}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <Controller name="check_in" control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Check In"
                    type="time"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              <Controller name="check_out" control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Check Out"
                    type="time"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={createMutation.isPending}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createMutation.isPending}>
              {createMutation.isPending ? <CircularProgress size={20} /> : "Submit"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Attendance;