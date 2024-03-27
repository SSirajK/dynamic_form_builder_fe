import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { Button } from "@mui/material";

const Navbar = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = () => {
    setIsLoading(true);
    sessionStorage.clear();
    window.location.replace("/login");
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
        <nav style={styles.navbar}>
          <div style={styles.navbarContainer}>
            <span style={styles.navbarText}>Nu10 Workflow Builder</span>
            <Button
              variant="contained"
              color="warning"
              onClick={handleLogout}
              style={{ marginLeft: "10px" }}
            >
              Logout
            </Button>
          </div>
        </nav>
      )}
    </>
  );
};

const styles = {
  navbar: {
    backgroundColor: "#000",
    color: "#fff",
    padding: "30px 30px",
    width: "100%",
    boxSizing: "border-box", // Ensure padding and border are included in the width
  },
  navbarContainer: {
    display: "flex",
    justifyContent: "space-between",
  },
  navbarText: {
    fontSize: "28px",
    fontWeight: "bold",
  },
};

export default Navbar;
