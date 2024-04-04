import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { ReactFormGenerator } from "react-form-builder2";
import { Snackbar, Alert, Typography, Button } from "@mui/material";
import axios from "axios";
import { MdArrowBackIosNew } from "react-icons/md";
import CircularProgress from "@mui/material/CircularProgress";

const ViewForm = (state) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const selectedForm = state?.selectedForm && state?.selectedForm || location.state?.selectedForm;
  const viewMetadata = state?.viewUserData && state?.viewMetadata || location.state?.viewMetadata || false;
  const viewUserData = state?.viewUserData && state?.viewUserData || location.state?.viewUserData || false;
  const userId = state?.selectedForm?.userId && state?.selectedForm?.userId || location?.state?.selectedForm?.userId;
  const formName = state?.selectedForm?.form_title && state?.selectedForm?.form_title || location?.state?.selectedForm?.form_title;
  const handleSubmitView = state?.handleSubmitView || null;
  const formId = searchParams.get("id");
  const [formData, setFormData] = useState(null);
  const [formUserData, setFormUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const navigate = useNavigate();
  const [populatedFormData, setPopulatedFormData] = useState(null);
  const props = {};
  console.log("viewmetadata", viewMetadata, viewUserData);

  const booleanConversion = (conversionData) => {
    return conversionData.map((obj) => {
      return Object.keys(obj).reduce((acc, key) => {
        const value = obj[key];
        if (typeof value === "string" && value.toLowerCase() === "true") {
          acc[key] = true;
        } else if (
          typeof value === "string" &&
          value.toLowerCase() === "false"
        ) {
          acc[key] = false;
        } else if (
          typeof value === "string" &&
          value.toLowerCase() === "null"
        ) {
          acc[key] = null;
        } else {
          acc[key] = value;
        }
        return acc;
      }, {});
    });
  };
  const getFormData = async () => {
    const token = sessionStorage.getItem("authToken");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    try {
      const response = await axios.get(
        `http://localhost:6004/form-builder/${selectedForm.form_metadata_tbl_name}?id=${selectedForm.id}`,
        config
      );
      const responseBooleanConversion = booleanConversion(response?.data?.data);
      if (response?.data?.data?.length <= 0) {
        setSnackbarOpen(true);
        setSnackbarMessage(
          `No metadata found for form ${selectedForm.form_metadata_tbl_name}`
        );
        setSeverity("error");
        !state?.selectedForm && navigate("/");
      }
      const parsedData = responseBooleanConversion.map((item) => {
        // Create a new object to hold parsed values
        const parsedItem = {};

        // Iterate over each key-value pair in the item
        for (const [key, value] of Object.entries(item)) {
          if (isJson(value)) {
            try {
              // Parse JSON if it's a string and valid JSON
              parsedItem[key] = JSON.parse(value);
            } catch (error) {
              // Handle parsing errors or leave as original value
              parsedItem[key] = value;
              console.error(
                `Error parsing JSON for key ${key}: ${error.message}`
              );
            }
          } else {
            parsedItem[key] = value;
          }
        }

        return parsedItem;
      });
      setFormData(parsedData);
      console.log(formData);
    } catch (error) {
      setSnackbarOpen(true);
      setSnackbarMessage("Failed to fetch form metadata");
      setSeverity("error");
      !state?.selectedForm && navigate("/");
      console.log(error);
    }
  };

  const isJson = (item) => {
    let value = typeof item !== "string" ? JSON.stringify(item) : item;
    try {
      value = JSON.parse(value);
    } catch (e) {
      return false;
    }

    return typeof value === "object" && value !== null;
  };

  const getFormUserData = async () => {
    const token = sessionStorage.getItem("authToken");
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    if (userId) {
      try {
        const response = await axios.get(
          `http://localhost:6004/form-builder/${selectedForm?.form_data_tbl_name}?userId=${userId}`,
          config
        );
        const responseBooleanConversion = booleanConversion(
          response?.data?.data
        );
        const parsedData = responseBooleanConversion.map((item) => {
          // Create a new object to hold parsed values
          const parsedItem = {};

          // Iterate over each key-value pair in the item
          for (const [key, value] of Object.entries(item)) {
            if (isJson(value)) {
              try {
                // Parse JSON if it's a string and valid JSON
                parsedItem[key] = JSON.parse(value);
              } catch (error) {
                // Handle parsing errors or leave as original value
                parsedItem[key] = value;
                console.error(
                  `Error parsing JSON for key ${key}: ${error.message}`
                );
              }
            } else {
              parsedItem[key] = value; // Keep non-JSON values as is
            }
          }

          return parsedItem; // Return the updated object with parsed values
        });
        setFormUserData(parsedData);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const response = await axios.get(
          `http://localhost:6004/form-builder/${selectedForm?.form_data_tbl_name}`,
          config
        );
        const responseBooleanConversion = booleanConversion(
          response?.data?.data
        );
        const parsedData = responseBooleanConversion.map((item) => {
          // Create a new object to hold parsed values
          const parsedItem = {};

          // Iterate over each key-value pair in the item
          for (const [key, value] of Object.entries(item)) {
            if (isJson(value)) {
              try {
                // Parse JSON if it's a string and valid JSON
                parsedItem[key] = JSON.parse(value);
              } catch (error) {
                // Handle parsing errors or leave as original value
                parsedItem[key] = value;
                console.error(
                  `Error parsing JSON for key ${key}: ${error.message}`
                );
              }
            } else {
              parsedItem[key] = value; // Keep non-JSON values as is
            }
          }

          return parsedItem; // Return the updated object with parsed values
        });
        setFormUserData(parsedData);
      } catch (error) {
        console.log(error);
      }
    }
  };
  useEffect(() => {
    const fetchDataToRender = async () => {
      if (!formData || !formUserData) {
        await getFormData();
        await getFormUserData();
        setIsLoading(false);
      }
    };
    fetchDataToRender();
  }, []);

  const gotoHome = () => {
    !state?.selectedForm && navigate("/");
  };
  useEffect(() => {
    if (formData && formUserData) {
      setPopulatedFormData(populateFormData());
    }
  }, [formData, formUserData]);

  const onSubmit = async (formData) => {
    console.log("came into this");
    if (populatedFormData && !viewMetadata && populatedFormData.length > 0) {
      setIsLoading(true);
      const formDataWithInfo = {
        formStructure: formData,
      };
      const token = sessionStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      try {
        axios
          .patch(
            `http://localhost:6004/form-builder/update-data/${selectedForm?.form_data_tbl_name}`,
            formDataWithInfo,
            config
          )
          .then(
            (response) => {
              console.log(response);
              setIsLoading(false);
              setSnackbarOpen(true);
              setSnackbarMessage(response?.data?.message);
              setSeverity("success");
              !state?.selectedForm && navigate("/");
              state?.selectedForm && handleSubmitView()
            },
            (error) => {
              console.log(error);
            }
          );
        // Handle the response or do something after successful submission
      } catch (error) {
        setIsLoading(false);
        console.error("Error occurred:", error);
        setSnackbarOpen(true);
        setSnackbarMessage(error?.response?.data?.message);
        setSeverity("error");
        // Handle errors or display an error message
      }
      console.log(formDataWithInfo);
    } else if (!viewMetadata) {
      setIsLoading(true);
      const formDataWithInfo = {
        formStructure: formData,
      };
      const token = sessionStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      try {
        axios
          .post(
            `http://localhost:6004/form-builder/${selectedForm?.form_data_tbl_name}`,
            formDataWithInfo,
            config
          )
          .then(
            (response) => {
              console.log(response);
              setIsLoading(false);
              setSnackbarOpen(true);
              setSnackbarMessage(response?.data?.message);
              setSeverity("success");
              !state?.selectedForm && navigate("/");
              handleSubmitView()
            },
            (error) => {
              console.log(error);
            }
          );
        // Handle the response or do something after successful submission
      } catch (error) {
        setIsLoading(false);
        setSnackbarOpen(true);
        setSnackbarMessage(error?.response?.data?.message);
        setSeverity("error");
        console.error("Error occurred:", error);
        // Handle errors or display an error message
      }
      console.log(formDataWithInfo);
    } else {
      setSnackbarOpen(true);
      setSnackbarMessage("Submit Success for Preview purpose");
      setSeverity("success");
    }
  };
  const capitalizeLetters = (str) => {
    // Split the string into an array of characters
    const chars = str.split("");

    // Map over each character and convert it to uppercase
    const capitalizedChars = chars.map((char) => char.toUpperCase());

    // Join the characters back together into a string
    const capitalizedStr = capitalizedChars.join("");

    return capitalizedStr;
  };

  const populateFormData = () => {
    if (!formData && formData?.length < 0) return [];
    return formUserData.map((element) => {
      const elementKey = selectedForm?.form_metadata_tbl_name;
      const tableNameId = `${elementKey}_id`;
      const capitalizedEachId = capitalizeLetters(element[tableNameId]);
      const name = formData.find(
        (item) => item.id === capitalizedEachId
      )?.field_name;

      return {
        id: capitalizedEachId,
        value: element.value,
        name: name,
        custom_name: name,
      };
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleChangeFormSubmit = (e) => {
    console.log(e, "event")
    console.log(e?.target?.value, "value in the target")
  }

  return isLoading ? (
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
  ) : !isLoading && populatedFormData ? (
    <div style={{ margin: "20px" }}>
      {!state?.selectedForm && <Button
        variant="text"
        className="btn btn-default p-0"
        style={{ display: "flex", alignItems: "center" }}
        onClick={gotoHome}
      >
        <MdArrowBackIosNew />
        Back
      </Button>}
      <Typography variant="h4" component="h1">
        {formName}
      </Typography>
      <ReactFormGenerator
        download_path=""
        // back_action="/"
        // back_name="Back"
        answer_data={
          viewMetadata && userId
            ? populatedFormData
            : !viewMetadata
              ? populatedFormData
              : {}
        }
        action_name={
          !viewMetadata && populatedFormData && populatedFormData?.length > 0
            ? "Save"
            : "Submit"
        }
        form_action="/"
        form_method="POST"
        onSubmit={onSubmit}
        onChange={(e)=>handleChangeFormSubmit(e)}
        // submitButton={<Button
        //   variant="contained"
        //   color="primary"
        //   style={{ marginLeft: "10px" }}
        // >
        //   Submit
        // </Button>}
        variables={props}
        read_only={viewUserData ? true : false}
        hide_actions={viewUserData}
        data={formData}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={severity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  ) : (
    <div style={{ margin: "20px auto", maxWidth: "70%" }}>

      {!state && <Button
        className="btn btn-default float-right"
        variant="text"
        style={{ marginRight: "10px" }}
        onClick={gotoHome}
      >
        <MdArrowBackIosNew />
        Back
      </Button>}
      <Typography variant="h4" component="h1">
        {formName}
      </Typography>
      <ReactFormGenerator
        download_path=""
        // back_action="/"
        // back_name="Back"
        answer_data={{}}
        action_name="Save"
        form_action="/"
        form_method="POST"
        onSubmit={onSubmit}
        variables={props}
        // submitButton={<Button
        //   variant="contained"
        //   color="primary"
        //   style={{ marginLeft: "10px" }}
        // >
        //   Submit
        // </Button>}
        hide_actions={viewMetadata}
        data={formData}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={severity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ViewForm;
