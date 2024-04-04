import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormTable } from "../components/Table";
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  CircularProgress,
  Button,
  Paper,
  Typography,
  Box,
  TextField,
  Snackbar,
  Alert,
  Grid,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonAddAltSharpIcon from "@mui/icons-material/PersonAddAltSharp";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import DynamicDialog from "../components/Dialog";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [workflowData, setWorkflowData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [openAssignDialog, setOpenAssignDialog] = useState(false);
  const [assignedTo, setAssignedTo] = useState("");
  const [deletion, setDeletion] = useState(false);
  const [assignedToOptions, setAssignedToOptions] = useState([]);
  const navigate = useNavigate();
  const theme = useTheme();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const isAdmin = sessionStorage.getItem("isAdmin");

  useEffect(() => {
    const admin = sessionStorage.getItem("isAdmin");

    // Correctly convert admin value to boolean
    const isAdminBool = admin === "true"; // Strict comparison

    setUserIsAdmin(isAdminBool);
    console.log(userIsAdmin, "userIsAdmin"); // Log for verification
  }, []);

  const handleRouteLink = () => {
    navigate("/form");
  };
  const handleCreateWorkflow = () => {
    navigate("/create-workflow");
  };
  const handleView = (workflow) => {
    userIsAdmin ? navigate(`/workflow/${workflow.id}`, {
      state: {
        workflow: workflow,
        viewData: true,
      },
    }) : navigate(`workflow-forms/${workflow.id}`, {
      state: {
        workflow: workflow,
      }
    })
  };
  const handleAssignClick = async (workflow) => {
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
    setSelectedWorkflow(workflow);
    setOpenAssignDialog(true);
  };
  const handleAssign = async () => {
    console.log("assign", assignedTo);
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const response = await axios.post(
        `http://localhost:6004/workflow-revised/user-mapping/${selectedWorkflow.id}`,
        {
          userMapping: [{ userId: assignedTo }],
        },
        config
      );

      setSnackbarSeverity("success");
      setOpenAssignDialog(false);
      setSnackbarMessage(
        `${selectedWorkflow?.workflow_title} ${response?.data?.message.join(
          ", "
        )}` ||
        `${selectedWorkflow?.workflow_title} Workflow assigned Successfully`
      );
      setOpenSnackbar(true);
      setIsLoading(false);
      setSelectedWorkflow(null);
    } catch (error) {
      console.error("Error assigning option:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error?.response?.data?.message ||
        "Error assigning workflow. Please try again."
      );
      setOpenSnackbar(true);
      setIsLoading(false);
    }
  };

  const handleEdit = (workflow) => {
    navigate(`/workflow/${workflow.id}`, {
      state: {
        workflow: workflow,
        viewData: false,
      },
    });
  };
  const handleDeleteConfirmation = (workflow) => {
    setSelectedWorkflow(workflow);
    setDeletion(true);
  };
  const handleDeleteClose = () => {
    setSelectedWorkflow(null);
    setDeletion(false);
  };
  const handleDelete = async () => {
    // Call the API to delete the workflow
    if (
      !selectedWorkflow?.confirmation ||
      selectedWorkflow?.confirmation.length <= 0 ||
      selectedWorkflow?.confirmation !== "DELETE"
    ) {
      setOpenSnackbar(true);
      setSnackbarMessage("Please type 'DELETE' to proceed");
      setSnackbarSeverity("error");
    } else {
      if (selectedWorkflow) {
        setIsLoading(true);
        const token = sessionStorage.getItem("authToken");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        try {
          const response = await axios.delete(
            `http://localhost:6004/workflow-revised/${selectedWorkflow.id}`,
            config
          );
          setSnackbarSeverity("success");
          setSnackbarMessage(
            `${selectedWorkflow?.workflow_title} ${response?.data?.message.join(
              ", "
            )}` || "Workflow Deleted Successfully"
          );
          setOpenSnackbar(true);
          setSelectedWorkflow(null);
          setDeletion(false);
          getWorkflow();
          setIsLoading(false);
        } catch (error) {
          setSnackbarSeverity("error");
          setSnackbarMessage(
            error?.response?.data?.message ||
            "Error deleting workflow. Please try again."
          );
          setOpenSnackbar(true);
          setIsLoading(false);
        }
      }
    }
  };

  const getWorkflow = async () => {
    const token = sessionStorage.getItem("authToken");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.get(
        "http://localhost:6004/workflow-revised",
        config
      );
      setWorkflowData(response?.data || []);
      setIsLoading(false);
    } catch (error) {
      setError(error.message);
      setOpenSnackbar(true);
      setSnackbarMessage(
        error?.response?.data?.message || "Error fetching workflows"
      );
      setSnackbarSeverity("error");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getWorkflow();
  }, []);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <div style={{ marginLeft: "35px", marginTop: "40px" }}>
      <Box p={4} spacing={3}>
        <Grid
          container
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Grid item>
            <Typography variant="h4" component="h1">
              Workflow
            </Typography>
          </Grid>
          <Grid item>
            {isAdmin === "true" && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateWorkflow}
              >
                Create Workflow
              </Button>
            )}
          </Grid>
        </Grid>
        {isLoading ? (
          <CircularProgress />
        ) : error ? (
          <Typography variant="body1" color="error">
            Error: {error}
          </Typography>
        ) : (
          <Paper>
            <TableContainer sx={{ borderCollapse: "collapse" }}>
              <Table>
                <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableRow>
                    <TableCell align="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Workflow Title
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Workflow Id
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {isAdmin === "true" ? "Created By" : "Assigned By"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        {isAdmin === "true" ? "Created At" : "Assigned At"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="subtitle1" fontWeight="bold">
                        Actions
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {workflowData.map((workflow) => {
                    const { id, workflow_title, createdBy, createdAt } =
                      workflow;
                    return (
                      <TableRow
                        key={id}
                        sx={{
                          "&:nth-child(odd)": {
                            backgroundColor: theme.palette.action.hover,
                          },
                        }}
                      >
                        <TableCell align="center">{workflow_title}</TableCell>
                        <TableCell align="center">{id}</TableCell>
                        <TableCell align="center">{createdBy}</TableCell>
                        <TableCell align="center">
                          {new Date(createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          {isAdmin === "true" ? (
                            <div>
                              <IconButton onClick={() => handleEdit(workflow)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                onClick={() =>
                                  handleDeleteConfirmation(workflow)
                                }
                              >
                                <DeleteIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleAssignClick(workflow)}
                              >
                                <PersonAddAltSharpIcon />
                              </IconButton>
                              <IconButton onClick={() => handleView(workflow)}>
                                <VisibilityIcon />
                              </IconButton>
                            </div>
                          ) : (
                            <IconButton onClick={() => handleView(workflow)}>
                              <VisibilityIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        {selectedWorkflow && deletion && (
          <DynamicDialog
            title="Delete Confirmation"
            initialValues={{ confirmation: "" }}
            onSubmit={handleDelete}
            onClose={handleDeleteClose}
            submitButtonLabel="Delete"
            isOpen={!!selectedWorkflow}
          >
            <Typography variant="body1">
              Are you sure you want to delete this workflow? Please type
              "DELETE" to confirm.
            </Typography>
            <TextField
              name="confirmation"
              label="Confirmation"
              value={selectedWorkflow ? selectedWorkflow.confirmation : ""}
              onChange={(e) =>
                setSelectedWorkflow({
                  ...selectedWorkflow,
                  confirmation: e.target.value,
                })
              }
              margin="dense"
              fullWidth
              error={
                selectedWorkflow && selectedWorkflow.confirmation !== "DELETE"
              }
              helperText={
                selectedWorkflow &&
                selectedWorkflow.confirmation !== "DELETE" &&
                "Please type 'DELETE' to confirm."
              }
            />
          </DynamicDialog>
        )}

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Dialog
          open={openAssignDialog}
          onClose={() => setOpenAssignDialog(false)}
          sx={{ minWidth: "400px" }}
        >
          <DialogTitle>Assign Workflow</DialogTitle>
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
            <Button variant="outlined" color="error" onClick={() => setOpenAssignDialog(false)}>Cancel</Button>
            <Button variant="contained" color="primary" onClick={handleAssign}>Assign</Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box p={4} spacing={3}>
        {userIsAdmin ? (
          <Box>
            <Grid
              container
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Grid item>
                <Typography variant="h4" component="h1">
                  Form
                </Typography>
              </Grid>
              <Grid item>
                {isAdmin === "true" && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleRouteLink}
                  >
                    Build Form
                  </Button>
                )}
              </Grid>
            </Grid>
            <h4>Form Templates Available</h4>
            <FormTable viewMetadata={true} />
          </Box>
        ) : (
          <Box>
            <h4>Form Available To Fill</h4>
            <FormTable viewMetadata={false} />
          </Box>
        )}
      </Box>
    </div>
  );
};

export default Home;
