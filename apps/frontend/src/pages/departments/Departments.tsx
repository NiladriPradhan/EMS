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
} from "@mui/material";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import {
  departmentApi,
  type CreateDepartmentPayload,
  type Department,
} from "../../api/departmentApi";
import { usePermissions } from "../../hooks/usePermissions";

type FormValues = CreateDepartmentPayload;

const Departments = () => {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [editTarget, setEditTarget] = useState<Department | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { hasPermission } = usePermissions();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await departmentApi.getAll();
      return res.data.data;
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const createMutation = useMutation({
    mutationFn: departmentApi.create,
    onSuccess: () => {
      toast.success("Department created!");
      qc.invalidateQueries({ queryKey: ["departments"] });
      handleClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<FormValues> }) =>
      departmentApi.update(id, data),
    onSuccess: () => {
      toast.success("Department updated!");
      qc.invalidateQueries({ queryKey: ["departments"] });
      handleClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: departmentApi.delete,
    onSuccess: () => {
      toast.success("Department deleted!");
      qc.invalidateQueries({ queryKey: ["departments"] });
      setDeleteTarget(null);
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const handleOpen = (dept?: Department) => {
    setEditTarget(dept || null);
    reset({
      department_name: dept?.department_name || "",
      description: dept?.description || "",
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTarget(null);
    reset();
  };

  const onSubmit = (values: FormValues) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.department_id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  // Filter departments based on search query
  const filteredData = data?.filter((dept) => {
    const name = (dept.department_name ?? "").toLowerCase();
    const description = (dept.description ?? "").toLowerCase();
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return name.includes(query) || description.includes(query);
  });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Departments
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Manage your organization's departments
          </Typography>
        </Box>
        {hasPermission("department.create") && (
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={() => handleOpen()}
          >
            Add Department
          </Button>
        )}
      </Box>

      {/* Search Bar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
          slotProps={{
            input: {
              startAdornment: (
                <Search size={18} style={{ marginRight: 8, color: "#999" }} />
              ),
              endAdornment: searchQuery && (
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </IconButton>
              ),
            },
          }}
        />
        {searchQuery && (
          <Typography variant="caption" color="textSecondary">
            {filteredData?.length || 0} result
            {filteredData?.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load departments.
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell>#</TableCell>
              <TableCell>Department Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filteredData?.map((dept, idx) => (
                  <TableRow key={dept.department_id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Chip
                        label={dept.department_name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{dept.description || "—"}</TableCell>
                    <TableCell>
                      {dept.created_at
                        ? new Date(dept.created_at).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell align="right">
                      {hasPermission("department.update") && (
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(dept)}
                          >
                            <Pencil size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                      {hasPermission("department.delete") && (
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(dept)}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && filteredData?.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  {searchQuery
                    ? "No departments match your search criteria."
                    : "No departments found. Add one to get started."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {editTarget ? "Edit Department" : "Add Department"}
          </DialogTitle>
          <DialogContent
            sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Controller
              name="department_name"
              control={control}
              rules={{ required: "Department name is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Department Name"
                  fullWidth
                  error={!!errors.department_name}
                  helperText={errors.department_name?.message}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={isPending}>
              {isPending ? (
                <CircularProgress size={20} />
              ) : editTarget ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{deleteTarget?.department_name}</strong>? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() =>
              deleteTarget && deleteMutation.mutate(deleteTarget.department_id)
            }
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <CircularProgress size={20} />
            ) : (
              "Delete"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Departments;
