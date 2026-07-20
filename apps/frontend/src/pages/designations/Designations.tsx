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
} from "@mui/material";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { designationApi, type CreateDesignationPayload, type Designation } from "../../api/designationApi";
import { departmentApi } from "../../api/departmentApi";
import { usePermissions } from "../../hooks/usePermissions";

type FormValues = CreateDesignationPayload;

const Designations = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Designation | null>(null);
  const [editTarget, setEditTarget] = useState<Designation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState<number | "">("");
  const { hasPermission } = usePermissions();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["designations"],
    queryFn: async () => (await designationApi.getAll()).data.data,
  });

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => (await departmentApi.getAll()).data.data,
  });

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const createMutation = useMutation({
    mutationFn: designationApi.create,
    onSuccess: () => { toast.success("Designation created!"); qc.invalidateQueries({ queryKey: ["designations"] }); handleClose(); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<FormValues> }) => designationApi.update(id, data),
    onSuccess: () => { toast.success("Designation updated!"); qc.invalidateQueries({ queryKey: ["designations"] }); handleClose(); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: designationApi.delete,
    onSuccess: () => { toast.success("Designation deleted!"); qc.invalidateQueries({ queryKey: ["designations"] }); setDeleteTarget(null); },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const handleOpen = (desig?: Designation) => {
    setEditTarget(desig || null);
    reset({ designation_name: desig?.designation_name || "", department_id: desig?.department_id || "" });
    setOpen(true);
  };
  const handleClose = () => { setOpen(false); setEditTarget(null); reset(); };

  const onSubmit = (values: FormValues) => {
    if (editTarget) updateMutation.mutate({ id: editTarget.designation_id, data: values });
    else createMutation.mutate(values);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Filter logic
  const filteredData = data?.filter((desig) => {
    const name = (desig.designation_name ?? "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || name.includes(query);
    const matchesDept = filterDepartment === "" || desig.department_id === Number(filterDepartment);
    return matchesSearch && matchesDept;
  });

  return (
    <Box>
      <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }} >Designations</Typography>
          <Typography variant="body2" color="textSecondary">Manage job designations by department</Typography>
        </Box>
        {hasPermission("designation.create") && (
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => handleOpen()}>
            Add Designation
          </Button>
        )}
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by name..."
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
        {searchQuery && (
          <Typography variant="caption" color="textSecondary">
            {filteredData?.length || 0} result{filteredData?.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Failed to load designations.</Alert>}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>#</TableCell>
              <TableCell>Designation Name</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton /></TableCell>)}</TableRow>
              ))
              : filteredData?.map((desig, idx) => (
                <TableRow key={desig.designation_id} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>
                    <Chip label={desig.designation_name} size="small" color="secondary" variant="outlined" />
                  </TableCell>
                  <TableCell>{desig.department_name || "—"}</TableCell>
                  <TableCell>{desig.created_at ? new Date(desig.created_at).toLocaleDateString() : "—"}</TableCell>
                  <TableCell align="right">
                    {hasPermission("designation.update") && (
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(desig)}><Pencil size={16} /></IconButton>
                      </Tooltip>
                    )}
                    {hasPermission("designation.delete") && (
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setDeleteTarget(desig)}><Trash2 size={16} /></IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && filteredData?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  {searchQuery || filterDepartment
                    ? "No designations match your search/filter criteria."
                    : "No designations found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editTarget ? "Edit Designation" : "Add Designation"}</DialogTitle>
          <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Controller
              name="designation_name"
              control={control}
              rules={{ required: "Designation name is required" }}
              render={({ field }) => (
                <TextField {...field} label="Designation Name" fullWidth error={!!errors.designation_name} helperText={errors.designation_name?.message} />
              )}
            />
            <Controller
              name="department_id"
              control={control}
              rules={{ required: "Department is required", validate: v => !!v || "Please select a department" }}
              render={({ field }) => (
                <TextField {...field} select label="Department" fullWidth error={!!errors.department_id} helperText={errors.department_id?.message}>
                  {departments?.map(d => (
                    <MenuItem key={d.department_id} value={d.department_id}>{d.department_name}</MenuItem>
                  ))}
                </TextField>
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isPending}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? <CircularProgress size={20} /> : editTarget ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Designation</DialogTitle>
        <DialogContent>
          <Typography>Delete <strong>{deleteTarget?.designation_name}</strong>? This cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.designation_id)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Designations;