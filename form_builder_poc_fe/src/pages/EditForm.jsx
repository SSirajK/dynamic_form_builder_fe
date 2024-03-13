import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axios from "axios";
import { ReactFormBuilder, FormElementsEdit } from "react-form-builder2";
import CircularProgress from "@mui/material/CircularProgress";
import Demobar from "../components/demobar";

const EditForm = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const selectedForm = location.state?.selectedForm;
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
          value.toLocaleLowerCase() === "null"
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
      setFormData(parsedData);
    } catch (error) {
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

  useEffect(() => {
    const fetchDataToRender = async () => {
      if (!formData) {
        await getFormData();
        setIsLoading(false);
      }
    };
    fetchDataToRender();
  }, []);
  const handleSubmit = async (formData) => {
    console.log(formData, "formdetails");
  };

  return isLoading && !formData ? (
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
    <div style={{ marginTop: "40px" }}>
      <div style={{ marginLeft: "auto", marginRight: "auto", maxWidth: "70%" }}>
        <Demobar
          data={formData}
          form_title={selectedForm?.form_title}
          form_id={selectedForm?.id}
        />
        <ReactFormBuilder
          editMode
          saveUrl="http://localhost:3000/form-data/data"
          locale="en"
          saveAlways={false}
          onSubmit={handleSubmit}
          form_action="/"
          form_method="POST"
          data={formData}
        />
      </div>
    </div>
  );
};

export default EditForm;
