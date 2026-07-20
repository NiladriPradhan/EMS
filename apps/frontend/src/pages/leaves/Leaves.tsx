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
  Checkbox,
  Stack,
} from "@mui/material";
import { Plus, Trash2, Check, X, RefreshCw, Ban, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import {
  leaveApi,
  type CreateLeavePayload,
  type Leave,
  type LeaveStatus,
} from "../../api/leaveApi";
import { employeeApi } from "../../api/employeeApi";
import { usePermissions } from "../../hooks/usePermissions";

type FormValues = CreateLeavePayload;
const leaveTypes = ["Sick", "Casual", "Annual", "Other"] as const;
const statusOptions: (LeaveStatus | "All")[] = [
  "All",
  "Pending",
  "Approved",
  "Rejected",
  "Cancelled",
];

const statusColor = (s: LeaveStatus) => {
  switch (s) {
    case "Approved":
      return "success";
    case "Rejected":
      return "error";
    case "Cancelled":
      return "default";
    default:
      return "warning";
  }
};

const Leaves = () => {
  const qc = useQueryClient();
  // const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Leave | null>(null);
  const [reRequestSource, setReRequestSource] = useState<Leave | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "All">("All");
  const { hasPermission } = usePermissions();

  const isHR = hasPermission("leave.approve");
  const canDelete = hasPermission("leave.delete");

  // ── Data ───────────────────────────────────────────────────────────────
  const {
    data: leaves = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      const response = await leaveApi.getAll();
      return response.data?.data ?? [];
    },
    retry: false,
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await employeeApi.getAll();
        return response.data?.data ?? [];
      } catch {
        return [];
      }
    },
  });

  // ── Form ───────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const handleOpen = (prefill?: Leave) => {
    if (prefill) {
      setReRequestSource(prefill);
      reset({
        leave_type: prefill.leave_type,
        start_date: prefill.start_date,
        end_date: prefill.end_date,
        reason: prefill.reason ?? "",
        ...(isHR ? { employee_id: prefill.employee_id } : {}),
      } as any);
    } else {
      setReRequestSource(null);
      reset({});
    }
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setReRequestSource(null);
    reset();
  };

  // ── Mutations ──────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: leaveApi.create,
    onSuccess: () => {
      toast.success("Leave request submitted!");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      handleClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to submit"),
  });

  const reopenMutation = useMutation({
    mutationFn: (params: { id: number; data: Partial<CreateLeavePayload> }) =>
      leaveApi.reopen(params.id, params.data),
    onSuccess: () => {
      toast.success("Leave re-requested successfully!");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      handleClose();
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to re-request"),
  });

  const cancelMutation = useMutation({
    mutationFn: leaveApi.cancel,
    onSuccess: () => {
      toast.success("Leave cancelled.");
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (err: any) =>
      toast.error(err.response?.data?.message || "Failed to cancel"),
  });

  const approveMutation = useMutation({
    mutationFn: leaveApi.approve,
    onSuccess: () => {
      toast.success("Leave approved!");
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  const rejectMutation = useMutation({
    mutationFn: leaveApi.reject,
    onSuccess: () => {
      toast.success("Leave rejected.");
      qc.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: leaveApi.delete,
    onSuccess: () => {
      toast.success("Deleted!");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setDeleteTarget(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
  });

  // ── Bulk Delete ────────────────────────────────────────────────────────
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const results = await Promise.allSettled(
        ids.map((id) => leaveApi.delete(id)),
      );
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        throw new Error(
          `${failures.length} of ${ids.length} deletions failed.`,
        );
      }
      return results;
    },
    onSuccess: () => {
      toast.success("Selected leave requests deleted.");
      qc.invalidateQueries({ queryKey: ["leaves"] });
      setSelectedIds([]);
      setBulkDeleteConfirmOpen(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Bulk delete failed.");
      setBulkDeleteConfirmOpen(false);
    },
  });

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(leaves.map((l) => l.leave_id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id],
    );
  };

  const onSubmit = (values: FormValues) => {
    if (reRequestSource) {
      reopenMutation.mutate({ id: reRequestSource.leave_id, data: values });
    } else {
      createMutation.mutate(values);
    }
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedIds.length === 0) return;
    bulkDeleteMutation.mutate(selectedIds);
  };

  const numSelected = selectedIds.length;

  // ── Filter Logic ──────────────────────────────────────────────────────
  const filteredLeaves = leaves.filter((leave) => {
    const search = searchQuery.toLowerCase().trim();
    const employeeName = (leave.employee_name || "").toLowerCase();
    const leaveType = leave.leave_type.toLowerCase();
    const matchesSearch =
      search === "" ||
      employeeName.includes(search) ||
      leaveType.includes(search);
    const matchesStatus =
      statusFilter === "All" || leave.status === statusFilter;
    return matchesSearch && matchesStatus;
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
            Leave Management
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {isHR
              ? "Review and manage employee leave requests"
              : "View and manage your leave requests"}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {canDelete && numSelected > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={16} />}
              onClick={handleBulkDeleteClick}
              disabled={bulkDeleteMutation.isPending}
            >
              Delete Selected ({numSelected})
            </Button>
          )}
          {hasPermission("leave.create") && (
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              onClick={() => handleOpen()}
            >
              New Request
            </Button>
          )}
        </Stack>
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <TextField
          size="small"
          placeholder="Search by employee or leave type..."
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
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as LeaveStatus | "All")
          }
          sx={{ width: 160 }}
        >
          {statusOptions.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>
        {(searchQuery || statusFilter !== "All") && (
          <Typography variant="caption" color="textSecondary">
            {filteredLeaves.length} result
            {filteredLeaves.length !== 1 ? "s" : ""}
          </Typography>
        )}
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load leaves:{" "}
          {(error as any)?.response?.data?.message ||
            (error as any)?.message ||
            "Unknown error"}
        </Alert>
      )}

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              {canDelete && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      numSelected > 0 && numSelected < filteredLeaves.length
                    }
                    checked={
                      filteredLeaves.length > 0 &&
                      numSelected === filteredLeaves.length
                    }
                    onChange={handleSelectAll}
                    disabled={filteredLeaves.length === 0}
                  />
                </TableCell>
              )}
              <TableCell>#</TableCell>
              <TableCell>Employee</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {canDelete && (
                      <TableCell padding="checkbox">
                        <Skeleton
                          variant="rectangular"
                          width={20}
                          height={20}
                        />
                      </TableCell>
                    )}
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : filteredLeaves.map((leave) => {
                  const isSelected = selectedIds.includes(leave.leave_id);
                  return (
                    <TableRow
                      key={leave.leave_id}
                      hover
                      selected={isSelected}
                      sx={{ cursor: canDelete ? "pointer" : "default" }}
                      onClick={() =>
                        canDelete && handleSelectOne(leave.leave_id)
                      }
                    >
                      {canDelete && (
                        <TableCell
                          padding="checkbox"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={isSelected}
                            onChange={() => handleSelectOne(leave.leave_id)}
                          />
                        </TableCell>
                      )}
                      <TableCell>{filteredLeaves.indexOf(leave) + 1}</TableCell>
                      <TableCell>
                        {leave.employee_name || `EMP#${leave.employee_id}`}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={leave.leave_type}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(leave.start_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(leave.end_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{leave.total_days}</TableCell>
                      <TableCell>
                        <Chip
                          label={leave.status}
                          size="small"
                          color={statusColor(leave.status) as any}
                          variant={
                            leave.status === "Cancelled" ? "outlined" : "filled"
                          }
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* HR: Approve / Reject pending leaves */}
                        {leave.status === "Pending" && isHR && (
                          <>
                            <Tooltip title="Approve">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() =>
                                  approveMutation.mutate(leave.leave_id)
                                }
                              >
                                <Check size={16} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reject">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() =>
                                  rejectMutation.mutate(leave.leave_id)
                                }
                              >
                                <X size={16} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}

                        {/* Employee: Cancel pending leave */}
                        {leave.status === "Pending" &&
                          !isHR &&
                          hasPermission("leave.create") && (
                            <Tooltip title="Cancel this request">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() =>
                                  cancelMutation.mutate(leave.leave_id)
                                }
                              >
                                <Ban size={16} />
                              </IconButton>
                            </Tooltip>
                          )}

                        {/* Employee: Re-request if Rejected or Cancelled */}
                        {(leave.status === "Rejected" ||
                          leave.status === "Cancelled") &&
                          !isHR &&
                          hasPermission("leave.create") && (
                            <Tooltip title="Re-request this leave">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpen(leave)}
                              >
                                <RefreshCw size={16} />
                              </IconButton>
                            </Tooltip>
                          )}

                        {/* HR: Delete any leave */}
                        {hasPermission("leave.delete") && (
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteTarget(leave)}
                            >
                              <Trash2 size={16} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            {!isLoading && filteredLeaves.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={canDelete ? 9 : 8}
                  align="center"
                  sx={{ py: 4, color: "text.secondary" }}
                >
                  {searchQuery || statusFilter !== "All"
                    ? "No leave requests match your search/filter criteria."
                    : "No leave requests found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create / Re-request Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {reRequestSource ? "Re-request Leave" : "New Leave Request"}
          </DialogTitle>
          {reRequestSource && (
            <Alert severity="info" sx={{ mx: 3 }}>
              Re-submitting a {reRequestSource.status.toLowerCase()} leave. You
              can adjust the details below.
            </Alert>
          )}
          <DialogContent
            sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
          >
            {isHR && employees.length > 0 && (
              <Controller
                name="employee_id"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Employee"
                    fullWidth
                    error={!!errors.employee_id}
                    helperText={errors.employee_id?.message}
                  >
                    {employees.map((e) => (
                      <MenuItem key={e.employee_id} value={e.employee_id}>
                        {e.first_name} {e.last_name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            )}
            <Controller
              name="leave_type"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Leave Type"
                  fullWidth
                  error={!!errors.leave_type}
                  helperText={errors.leave_type?.message}
                >
                  {leaveTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
            >
              <Controller
                name="start_date"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Start Date"
                    type="date"
                    fullWidth
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              <Controller
                name="end_date"
                control={control}
                rules={{ required: "Required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="End Date"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Box>
            <Controller
              name="reason"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Reason"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              onClick={handleClose}
              disabled={createMutation.isPending || reopenMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createMutation.isPending || reopenMutation.isPending}
            >
              {createMutation.isPending || reopenMutation.isPending ? (
                <CircularProgress size={20} />
              ) : reRequestSource ? (
                "Re-submit"
              ) : (
                "Submit"
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Single Delete Confirm */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Leave Request</DialogTitle>
        <DialogContent>
          <Typography>
            Delete this leave request? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() =>
              deleteTarget && deleteMutation.mutate(deleteTarget.leave_id)
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

      {/* Bulk Delete Confirmation */}
      <Dialog
        open={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Selected Leave Requests</DialogTitle>
        <DialogContent>
          <Typography>
            You are about to delete <strong>{numSelected}</strong> selected
            leave request{numSelected > 1 ? "s" : ""}. This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setBulkDeleteConfirmOpen(false)}
            disabled={bulkDeleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmBulkDelete}
            disabled={bulkDeleteMutation.isPending}
            startIcon={
              bulkDeleteMutation.isPending ? (
                <CircularProgress size={20} />
              ) : undefined
            }
          >
            {bulkDeleteMutation.isPending ? "Deleting..." : "Delete All"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Leaves;
