import React, { useEffect, useState } from "react";
import DynamicTable from "../components/DynamicTable";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import { Grid, Typography, Box, Button } from "@mui/material";
import { MdArrowBackIosNew } from "react-icons/md";

const ViewFormData = () => {
  const location = useLocation();
  const selectedForm = location.state?.selectedForm;
  const viewMetadata = location.state?.viewMetadata;
  const viewUserData = location.state?.viewUserData;
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(null);
  const [formUserData, setFormUserData] = useState(null);
  console.log(selectedForm);
  const getUsersFilledData = async () => {
    const token = sessionStorage.getItem("authToken");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.get(
        `http://localhost:6004/form-builder/master-view/${selectedForm.form_data_tbl_name}`,
        config
      );
      console.log(response?.data?.data, "boolean");
      if (response?.data?.data?.length <= 0) {
        // setSnackbarOpen(true);
        // setSnackbarMessage(
        //   `No metadata found for form ${selectedForm.form_metadata_tbl_name}`
        // );
        // setSeverity("error");
        // navigate("/");
      }
      //   setIsLoading(false);
      const responseData = response?.data?.data;
      const transformedData = Object.keys(responseData).map((email) => {
        const dataObject = responseData[email].reduce((acc, current) => {
          acc[current.label.trim()] = current.value;
          return acc;
        }, {});
        return { ...dataObject, ["Filled By"]: email }; // Spread & add Filled By at last
      });
      setFormUserData(transformedData);
    } catch (error) {
      //   setSnackbarOpen(true);
      //   setSnackbarMessage("Failed to fetch form metadata");
      //   setSeverity("error");
      navigate("/");
      console.log(error);
    }
  };
  useEffect(() => {
    const getData = async () => {
      await getUsersFilledData();
      setIsLoading(false);
    };
    getData();
  }, []);

  const gotoHome = () => {
    navigate("/");
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
        <Box p={4} spacing={3}>
          <Button
            className="btn btn-default float-left"
            variant="text"
            style={{ display: "flex", width: "90px", alignItems: "center" }}
            onClick={gotoHome}
          >
            <MdArrowBackIosNew />
            Back
          </Button>
          <Grid
            container
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Grid item>
              <Typography variant="h4" component="h1">
                Form Data
              </Typography>
            </Grid>
          </Grid>
          <DynamicTable data={formUserData} />
        </Box>
      )}
    </>
  );
};

export default ViewFormData;
