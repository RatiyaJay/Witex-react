import { useState } from "react";
import PropTypes from "prop-types";
import { gql, useQuery, useMutation } from "@apollo/client";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Alert from "@mui/material/Alert";

import ArgonBox from "components/ArgonBox";
import ArgonTypography from "components/ArgonTypography";
import ArgonButton from "components/ArgonButton";
import { useArgonController } from "context";

const GET_SHIFTS = gql`
  query GetShifts {
    shifts {
      id
      shiftType
      startTime
      endTime
      createdAt
    }
  }
`;

const CREATE_SHIFT = gql`
  mutation CreateShift($input: CreateShiftInput!) {
    createShift(input: $input) {
      id
      shiftType
      startTime
      endTime
    }
  }
`;

const UPDATE_SHIFT = gql`
  mutation UpdateShift($shiftId: ID!, $input: UpdateShiftInput!) {
    updateShift(shiftId: $shiftId, input: $input) {
      id
      shiftType
      startTime
      endTime
    }
  }
`;

const DELETE_SHIFT = gql`
  mutation DeleteShift($shiftId: ID!) {
    deleteShift(shiftId: $shiftId)
  }
`;

function ShiftManagement({ open, onClose }) {
  const [controller] = useArgonController();
  const { darkMode } = controller;

  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [shiftType, setShiftType] = useState("DAY");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  const { data, loading, refetch } = useQuery(GET_SHIFTS);
  const [createShift, { loading: creating }] = useMutation(CREATE_SHIFT);
  const [updateShift, { loading: updating }] = useMutation(UPDATE_SHIFT);
  const [deleteShift] = useMutation(DELETE_SHIFT);

  const shifts = data?.shifts || [];

  const handleClose = () => {
    setShowForm(false);
    setEditingShift(null);
    setError("");
    onClose();
  };

  const handleAddNew = () => {
    setEditingShift(null);
    setShiftType("DAY");
    setStartTime("");
    setEndTime("");
    setError("");
    setShowForm(true);
  };

  const handleEdit = (shift) => {
    setEditingShift(shift);
    setShiftType(shift.shiftType);
    setStartTime(shift.startTime.substring(0, 5));
    setEndTime(shift.endTime.substring(0, 5));
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setError("");

    if (!startTime || !endTime) {
      setError("Please fill in all fields");
      return;
    }

    try {
      if (editingShift) {
        await updateShift({
          variables: {
            shiftId: editingShift.id,
            input: { shiftType, startTime, endTime },
          },
        });
      } else {
        await createShift({
          variables: {
            input: { shiftType, startTime, endTime },
          },
        });
      }
      
      await refetch();
      setShowForm(false);
      setEditingShift(null);
    } catch (err) {
      setError(err.message || "Failed to save shift");
    }
  };

  const handleDelete = async (shiftId) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;

    try {
      await deleteShift({ variables: { shiftId } });
      await refetch();
    } catch (err) {
      setError(err.message || "Failed to delete shift");
    }
  };

  const formatTime12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getShiftTypeColor = (type) => {
    switch (type) {
      case "DAY":
        return "info";
      case "NIGHT":
        return "dark";
      case "EXTRA":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: darkMode ? "#1a2332" : "#ffffff",
          borderRadius: "16px",
        },
      }}
    >
      <DialogTitle>
        <ArgonBox display="flex" justifyContent="space-between" alignItems="center">
          <ArgonTypography variant="h5" fontWeight="bold" color={darkMode ? "white" : "dark"}>
            Shift Management
          </ArgonTypography>
          <IconButton onClick={handleClose} size="small">
            <Icon sx={{ color: darkMode ? "#fff" : "#000" }}>close</Icon>
          </IconButton>
        </ArgonBox>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        {!showForm ? (
          <ArgonBox>
            <ArgonBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <ArgonTypography variant="body2" color="text">
                Manage your organization shifts (Max 24 hours total)
              </ArgonTypography>
              <ArgonButton
                color="info"
                size="small"
                onClick={handleAddNew}
                disabled={shifts.length >= 3}
              >
                <Icon sx={{ mr: 0.5 }}>add</Icon>
                Add Shift
              </ArgonButton>
            </ArgonBox>

            {loading ? (
              <ArgonTypography variant="body2" color="text" textAlign="center" py={4}>
                Loading shifts...
              </ArgonTypography>
            ) : shifts.length === 0 ? (
              <ArgonBox
                textAlign="center"
                py={6}
                sx={{
                  border: darkMode ? "2px dashed rgba(255,255,255,0.2)" : "2px dashed rgba(0,0,0,0.1)",
                  borderRadius: "12px",
                }}
              >
                <Icon sx={{ fontSize: "48px", color: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)", mb: 2 }}>
                  schedule
                </Icon>
                <ArgonTypography variant="h6" color="text" mb={1}>
                  No shifts configured
                </ArgonTypography>
                <ArgonTypography variant="body2" color="text">
                  Click &quot;Add Shift&quot; to create your first shift
                </ArgonTypography>
              </ArgonBox>
            ) : (
              <ArgonBox>
                {shifts.map((shift) => (
                  <ArgonBox
                    key={shift.id}
                    mb={2}
                    p={2}
                    sx={{
                      background: darkMode
                        ? "linear-gradient(195deg, rgba(73, 163, 241, 0.1), rgba(26, 115, 232, 0.1))"
                        : "linear-gradient(195deg, rgba(73, 163, 241, 0.05), rgba(26, 115, 232, 0.05))",
                      borderRadius: "12px",
                      border: darkMode ? "1px solid rgba(73, 163, 241, 0.2)" : "1px solid rgba(26, 115, 232, 0.15)",
                    }}
                  >
                    <ArgonBox display="flex" justifyContent="space-between" alignItems="center">
                      <ArgonBox display="flex" alignItems="center" gap={2}>
                        <ArgonBox
                          sx={{
                            background: `linear-gradient(195deg, ${
                              shift.shiftType === "DAY"
                                ? "#49a3f1, #1a73e8"
                                : shift.shiftType === "NIGHT"
                                ? "#344767, #1a2332"
                                : "#fb8c00, #f57c00"
                            })`,
                            borderRadius: "8px",
                            padding: "8px 16px",
                            minWidth: "80px",
                            textAlign: "center",
                          }}
                        >
                          <ArgonTypography variant="caption" fontWeight="bold" color="white">
                            {shift.shiftType}
                          </ArgonTypography>
                        </ArgonBox>
                        <ArgonBox>
                          <ArgonTypography variant="h6" fontWeight="bold" color={darkMode ? "white" : "dark"}>
                            {formatTime12Hour(shift.startTime)} - {formatTime12Hour(shift.endTime)}
                          </ArgonTypography>
                        </ArgonBox>
                      </ArgonBox>
                      <ArgonBox display="flex" gap={1}>
                        <IconButton size="small" onClick={() => handleEdit(shift)}>
                          <Icon sx={{ color: darkMode ? "#49a3f1" : "#1a73e8" }}>edit</Icon>
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(shift.id)}>
                          <Icon sx={{ color: "#f44336" }}>delete</Icon>
                        </IconButton>
                      </ArgonBox>
                    </ArgonBox>
                  </ArgonBox>
                ))}
              </ArgonBox>
            )}
          </ArgonBox>
        ) : (
          <ArgonBox>
            <ArgonBox mb={2}>
              <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={0.5} display="block">
                Shift Type
              </ArgonTypography>
              <Select
                fullWidth
                value={shiftType}
                onChange={(e) => setShiftType(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                  },
                  "& .MuiSelect-select": {
                    color: darkMode ? "#fff" : "inherit",
                  },
                }}
              >
                <MenuItem value="DAY">Day Shift</MenuItem>
                <MenuItem value="NIGHT">Night Shift</MenuItem>
                <MenuItem value="EXTRA">Extra Shift</MenuItem>
              </Select>
            </ArgonBox>

            <ArgonBox mb={2}>
              <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={0.5} display="block">
                Start Time
              </ArgonTypography>
              <TextField
                fullWidth
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                InputProps={{
                  style: { color: darkMode ? "#fff" : "inherit" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0ea5e9",
                    },
                  },
                }}
              />
            </ArgonBox>

            <ArgonBox mb={2}>
              <ArgonTypography variant="caption" fontWeight="bold" color={darkMode ? "white" : "dark"} mb={0.5} display="block">
                End Time
              </ArgonTypography>
              <TextField
                fullWidth
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                InputProps={{
                  style: { color: darkMode ? "#fff" : "inherit" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                    },
                    "&:hover fieldset": {
                      borderColor: darkMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.25)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#0ea5e9",
                    },
                  },
                }}
              />
            </ArgonBox>

            <ArgonBox display="flex" gap={2} mt={3}>
              <ArgonButton
                color="secondary"
                variant="outlined"
                fullWidth
                onClick={() => setShowForm(false)}
              >
                Cancel
              </ArgonButton>
              <ArgonButton
                color="info"
                variant="gradient"
                fullWidth
                onClick={handleSave}
                disabled={creating || updating}
              >
                {creating || updating ? "Saving..." : editingShift ? "Update" : "Create"}
              </ArgonButton>
            </ArgonBox>
          </ArgonBox>
        )}
      </DialogContent>
    </Dialog>
  );
}

ShiftManagement.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ShiftManagement;
