import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BsFillTrashFill,
  BsFillPencilFill,
  BsChevronDown,
  BsChevronRight,
  BsPersonPlusFill,
  BsFillEyeFill,
  BsDatabaseFillDown,
} from "react-icons/bs";
import {
  Button,
  TextField,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
  Typography,
  TableRow,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";
import "./index.css";

export const FormTable = ({ viewMetadata = true }) => {
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openDeleteFormDialog, setOpenDeleteFormDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dataRefreshed, setDataRefreshed] = useState(false);
  const [deeleteConfirmationError, setDeleteConfirmationError] =
    useState(false);
  const theme = useTheme();
  const [assignedToOptions, setAssignedToOptions] = useState([]);
  const [viewDataOfOptions, setViewDataOfOptions] = useState([]);
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [openViewDataDialog, setOpenViewDataDialog] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [viewDataOf, setViewDataOf] = useState("");
  const isAdmin = sessionStorage.getItem("isAdmin");
  const navigate = useNavigate();
  const getFormBuilder = async () => {
    const token = sessionStorage.getItem("authToken");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.get(
        "http://localhost:6004/form-builder",
        config
      );
      setIsLoading(false);
      console.log(response?.data?.data);
      setFormData(response?.data?.data);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };
  useEffect(() => {
    setIsLoading(true);
    getFormBuilder();
  }, [dataRefreshed]);
  const handleClick = (form) => {
    navigate(`/forms/${form.form_metadata_tbl_name}?id=${form.id}`, {
      state: {
        selectedForm: form,
        viewMetadata: isAdmin === "true",
        viewUserData: false,
      },
    });
  };
  const handleEyeClick = (form) => {
    navigate(`/forms/${form.form_metadata_tbl_name}?id=${form.id}`, {
      state: {
        selectedForm: form,
        viewMetadata: isAdmin === "true",
        viewUserData: true,
      },
    });
  };
  const handleEditClick = (form) => {
    navigate(`/forms/edit/${form.id}`, { state: { selectedForm: form } });
  };
  const deleteForm = async (form) => {
    setIsLoading(true);
    const token = sessionStorage.getItem("authToken");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.delete(
        `http://localhost:6004/form-builder/${form.id}`,
        config
      );
      setIsLoading(false);
      setFormData(response?.data?.data);
      setSnackbarOpen(true);
      setSnackbarMessage(
        response?.data?.message || "deleted form successfully"
      );
      setSeverity("success");
      setDataRefreshed(true);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
      setSnackbarOpen(true);
      setSnackbarMessage(error?.response?.data?.message || "deletion failure");
      setSeverity("error");
      setDataRefreshed(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  const handleAssignClick = async (form) => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.get(
        "http://localhost:6004/form-builder/users-list",
        config
      );
      // const users = response.data.filter((user) => user.email); // Filter for users with email
      setAssignedToOptions(
        response.data.data.map((user) => ({
          value: user.id,
          label: user.email,
        }))
      );
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
      // Handle API call errors (e.g., show a snackbar)
    }
    setSelected(form);
    setOpenAssignDialog(true);
  };

  //needs to be worked on
  const handleViewFilledUsers = async (form) => {
    setSelected(form);
    navigate(`/table-data/${form.form_metadata_tbl_name}?id=${form.id}`, {
      state: {
        selectedForm: form,
        viewMetadata: isAdmin === "true",
        viewUserData: true,
      },
    });
    // setOpenViewDataDialog(true);
  };

  const handleAssignSubmit = async () => {
    if (!assignedTo) {
      setSnackbarOpen(true);
      setSnackbarMessage("Select a user to assign to");
      setSeverity("error");
      return;
    }
    console.log(assignedToOptions, "assignedTO");
    const selectedUser = assignedToOptions.find(
      (user) => user.value === assignedTo
    );
    console.log(selectedUser);
    if (!selectedUser) {
      console.error("Selected user not found in options");
      setIsLoading(false);
      setOpenAssignDialog(false);
      setSnackbarOpen(true);
      setSnackbarMessage("An error occurred during assignment");
      setSeverity("error");
      return;
    }
    const userId = selectedUser.value;
    const name = selectedUser.label;
    setIsLoading(true);

    const token = sessionStorage.getItem("authToken");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const userMapping = [
      {
        userId: userId,
        // name: name,
      },
    ];
    const form_title = selected.form_title;
    try {
      const response = await axios.post(
        `http://localhost:6004/form-builder/user-mapping/${selected.id}`,
        { form_title, userMapping },
        config
      );
      setIsLoading(false);
      setOpenAssignDialog(false);
      setSnackbarOpen(true);
      setSnackbarMessage(
        response?.data?.message
          ? response?.data?.message
          : `Form ${form_title} assigned to ${name}`
      );
      setSeverity("success");
    } catch (error) {
      setIsLoading(false);
      console.error(error); // Handle API call errors
      setOpenAssignDialog(false);
      setSnackbarOpen(true);
      setSnackbarMessage(
        error?.response?.data?.message
          ? error?.response?.data?.message
          : "Form assign failure"
      );
      setSeverity("error");
    }
  };

  // needs to be worked on
  // const handleViewDataSubmit = async () => {
  //   if (!viewDataOf) {
  //     setSnackbarOpen(true);
  //     setSnackbarMessage("Select a user to view data of");
  //     setSeverity("error");
  //     return;
  //   }
  //   const selectedUser = viewDataOfOptions.find(
  //     (user) => user.value === viewDataOf
  //   );
  //   console.log(selectedUser);
  //   if (!selectedUser) {
  //     console.error("Selected user not found in options");
  //     setIsLoading(false);
  //     setOpenAssignDialog(false);
  //     setSnackbarOpen(true);
  //     setSnackbarMessage("An error occurred during selection");
  //     setSeverity("error");
  //     return;
  //   }
  //   const userId = selectedUser.value;
  //   const name = selectedUser.label;
  //   setIsLoading(true);

  //   const token = sessionStorage.getItem("authToken");
  //   const config = {
  //     headers: { Authorization: `Bearer ${token}` },
  //   };
  //   const userMapping = [
  //     {
  //       userId: userId,
  //       // name: name,
  //     },
  //   ];
  //   selected.userId = userId;
  //   handleEyeClick(selected);
  // };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      {isLoading ? (
        <div
          hidden={!isLoading}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
            cursor: "wait",
          }}
        >
          <CircularProgress size={100} />
        </div>
      ) : (
        <div>
          <TableContainer sx={{ borderCollapse: "collapse" }}>
            <Table>
              <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                <TableRow>
                  <TableCell align="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Form Name
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Form Id
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Description
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      Action
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {isAdmin === "true" ? "Created By" : "Assigned By"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {isAdmin === "true" ? "Created At" : "Assigned At"}{" "}
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData?.map((form) => (
                  <TableRow
                    key={form.id}
                    sx={{
                      "&:nth-child(odd)": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    {/* Access form data using object properties */}
                    <TableCell align="center">{form.form_title}</TableCell>
                    <TableCell align="center">{form.id}</TableCell>
                    <TableCell align="center">
                      {form?.formDescription ? form?.formDescription : "NA"}
                    </TableCell>
                    <TableCell align="center">
                      {isAdmin && isAdmin === "true" ? (
                        <span className="actions">
                          <BsFillTrashFill
                            className="delete-btn"
                            style={{
                              cursor: "pointer",
                              marginRight: "2px",
                            }}
                            onClick={() => {
                              setOpenDeleteFormDialog({ open: true });
                              setSelected(form);
                            }}
                          />
                          <BsFillPencilFill
                            style={{
                              cursor: "pointer",
                              marginRight: "2px",
                            }}
                            onClick={() => handleEditClick(form)}
                          />
                          <BsPersonPlusFill
                            style={{
                              cursor: "pointer",
                              marginRight: "2px",
                            }}
                            onClick={() => handleAssignClick(form)}
                          />
                          <BsFillEyeFill
                            style={{
                              cursor: "pointer",
                              marginRight: "2px",
                            }}
                            onClick={() => handleClick(form)}
                          />
                          <BsDatabaseFillDown
                            style={{
                              cursor: "pointer",
                              marginRight: "2px",
                            }}
                            onClick={() => handleViewFilledUsers(form)}
                          />
                        </span>
                      ) : (
                        <span className="actions">
                          <BsFillPencilFill
                            onClick={() => handleClick(form)}
                            style={{
                              cursor: "pointer",
                              marginRight: "2px",
                            }}
                          />
                          <BsFillEyeFill
                            style={{
                              cursor: "pointer",
                              marginRight: "2px",
                            }}
                            onClick={() => handleEyeClick(form)}
                          />
                        </span>
                      )}
                    </TableCell>
                    <TableCell align="center">{form.createdBy}</TableCell>
                    <TableCell align="center">
                      {formatDate(form.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      <Dialog
        open={openDeleteFormDialog?.open} // Check for nullish value before accessing open property
        onClose={() => setOpenDeleteFormDialog({ open: false })}
      >
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <p>
            Are you sure you want to delete the form "
            {selected && selected.form_title}"
          </p>
          <p>Enter "DELETE" to proceed</p>
          <TextField
            autoFocus
            margin="dense"
            label="Confirmation"
            type="text"
            fullWidth
            value={deleteConfirmation}
            onChange={(event) => setDeleteConfirmation(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteFormDialog({ open: false })}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const edgeId = openDeleteFormDialog?.edgeId;
              if (deleteConfirmation === "DELETE") {
                deleteForm(selected);
                setOpenDeleteFormDialog({ open: false });
              } else {
                setDeleteConfirmationError(true);
                setSnackbarOpen(true);
                setSnackbarMessage("Delete unsuccessful");
                setSeverity("error");
              }
            }}
            color="error"
          >
            PROCEED
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openAssignDialog}
        onClose={() => setOpenAssignDialog(false)}
        sx={{ minWidth: "400px" }}
      >
        <DialogTitle>Assign Form</DialogTitle>
        <DialogContent sx={{ paddingY: "10px", marginY: "10px" }}>
          <FormControl fullWidth sx={{ marginTop: "10px" }}>
            <InputLabel id="assign-to-label">Assign To</InputLabel>
            <Select
              labelId="assign-to-label"
              id="assign-to"
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
              label="Assign To"
            >
              {assignedToOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
          <Button onClick={handleAssignSubmit}>Assign</Button>
        </DialogActions>
      </Dialog>
      {/* <Dialog
        open={openViewDataDialog}
        onClose={() => setOpenViewDataDialog(false)}
        sx={{ minWidth: "400px" }}
      >
        <DialogTitle>View Data Of</DialogTitle>
        <DialogContent sx={{ paddingY: "10px", marginY: "10px" }}>
          <FormControl fullWidth sx={{ marginTop: "10px" }}>
            <InputLabel id="assign-to-label">User's Email</InputLabel>
            <Select
              labelId="view-data-label"
              id="view-data"
              value={viewDataOf}
              onChange={(event) => setViewDataOf(event.target.value)}
              label="View data of:"
            >
              {viewDataOfOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDataDialog(false)}>Cancel</Button>
          <Button onClick={handleViewDataSubmit}>Submit</Button>
        </DialogActions>
      </Dialog> */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={severity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
