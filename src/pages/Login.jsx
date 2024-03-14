import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`http://localhost:6004/users/login`, {
        email,
        password,
      });
      const userData = response?.data?.data?.userData;
      console.log(userData, "userdata");
      for (const key in userData) {
        sessionStorage.setItem(key, userData[key]);
      }
      sessionStorage.setItem("authToken", response?.data?.data?.authToken);
      setSnackbarOpen(true);
      setSnackbarMessage(response?.data?.message);
      setSeverity("success");
      navigate("/");
    } catch (error) {
      setSnackbarOpen(true);
      setSnackbarMessage(
        error?.response?.data?.message
          ? error?.response?.data?.message.join(", ")
          : "Invalid email or password"
      );
      setSeverity("error");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
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
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          zIndex: 1000,
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{ padding: 20, border: "1px solid #ddd", borderRadius: 5 }}
        >
          <TextField
            label="Email"
            variant="outlined"
            margin="normal"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            helperText={
              email.length > 0 && !/^[^@]+@[^@]+\.[^@]+$/.test(email)
                ? "Invalid email format"
                : ""
            }
            error={email.length > 0 && !/^[^@]+@[^@]+\.[^@]+$/.test(email)}
          />
          <TextField
            label="Password"
            variant="outlined"
            margin="normal"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            variant="contained"
            type="submit"
            color="primary"
            fullWidth
            style={{ marginTop: 10 }}
          >
            Login
          </Button>
        </form>

        <Snackbar
          open={snackbarOpen}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity={severity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default Login;
