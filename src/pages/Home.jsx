import React, { useEffect, useState } from "react";
import { FormTable } from "../components/Table";
import { Button, Typography, Box, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
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

  return (
    <div style={{ marginTop: "40px" }}>
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
