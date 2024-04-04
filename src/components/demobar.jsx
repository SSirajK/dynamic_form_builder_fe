import React from "react";
import { ReactFormGenerator, ElementStore } from "react-form-builder2";
import axios from "axios";
import { Snackbar, Alert, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdArrowBackIosNew } from "react-icons/md";

function Demobar(props) {
  const [data, setData] = useState(props && props?.data ? props?.data : []);
  console.log(props, "create form props")
  const [previewVisible, setPreviewVisible] = useState(false);
  const [shortPreviewVisible, setShortPreviewVisible] = useState(false);
  const [roPreviewVisible, setRoPreviewVisible] = useState(false);
  const [name, setName] = useState(props?.form_title ? props?.form_title : "");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState();
  const form_id = props?.form_id && props?.form_id;
  let navigate = useNavigate();
  const workflow = props?.state?.workflow && props?.state?.workflow;
  const node_id = props?.state?.node && props?.state?.node;

  const onUpdate = (newData) => {
    setData(newData);
  };

  useEffect(() => {
    ElementStore.subscribe((state) => onUpdate(state.data));
  }, []);

  const showPreview = () => {
    setPreviewVisible(true);
  };

  const showShortPreview = () => {
    setShortPreviewVisible(true);
  };

  const showRoPreview = () => {
    setRoPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
    setShortPreviewVisible(false);
    setRoPreviewVisible(false);
  };

  const onSubmit = async (formData) => {
    // const formDataWithInfo = {
    //   formName: name,
    //   formDescription: description,
    //   formStructure: formData,
    // };

    // try {
    //   axios
    //     .post(
    //       "http://localhost:3000/form-data/createFormStruct",
    //       formDataWithInfo
    //     )
    //     .then(
    //       (response) => {
    //         console.log(response);
    //       },
    //       (error) => {
    //         console.log(error);
    //       }
    //     );
    // Handle the response or do something after successful submission
    // } catch (error) {
    //   console.error("Error occurred:", error);
    //   // Handle errors or display an error message
    // }
    setSnackbarOpen(true);
    setSeverity("success");
    setSnackbarMessage("Submitted Successfully");
    console.log(formData);
  };

  const onSave = async () => {
    if (name) {
      const formDataWithInfo = {
        form_title: name,
        form_description: props?.form_description
          ? props?.form_description
          : description,
        task_data: data,
      };
      const token = sessionStorage.getItem("authToken");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      console.log("formData", formDataWithInfo);

      try {
        if (props.data) {
          formDataWithInfo.task_data.forEach((task) => {
            if ("form_builder_master_table_id" in task) {
              delete task.form_builder_master_table_id;
            }
            if ("deletedat" in task) {
              delete task.deletedat;
            }
            if ("createdat" in task) {
              delete task.createdat;
            }
            if ("updatedat" in task) {
              delete task.updatedat;
            }
            if ("elementid" in task) {
              delete task.elementid;
            }
          });
          const response = await axios.patch(
            `http://localhost:6004/form-builder/${form_id}`,
            formDataWithInfo,
            config
          );
          if (response) {
            setSnackbarOpen(true);
            setSnackbarMessage(response?.data?.message);
            setSeverity("success");
            console.log(response?.data?.message);
            closePreview();
            navigate("/");
          }
        } else {
          const response = await axios.post(
            "http://localhost:6004/form-builder/create-form",
            formDataWithInfo,
            config
          );
          const responseData = await response?.data?.data;
          console.log(responseData)
          if (responseData) {
            console.log(response?.data?.message);
            setSnackbarOpen(true);
            setSnackbarMessage(response?.data?.message);
            setSeverity("success");
            closePreview();
            if (workflow && node_id) {
              try {
                const token = sessionStorage.getItem("authToken");

                const config = {
                  headers: { Authorization: `Bearer ${token}` },
                };
                const response = await axios.post(`http://localhost:6004/workflow-revised/mapping`, { workflow_id: workflow, node_id: node_id, form_builder_id: responseData?.id }, config);
                const data = response?.data?.data;
                console.log(data, "data")
                setSnackbarOpen(true)
                setSnackbarMessage(response?.data?.message || "form assigned to workflow")
                setSeverity("success")
              } catch (error) {
                setSnackbarOpen(true)
                setSnackbarMessage(error?.response?.data?.message || "failed to assign form")
                setSeverity("error")
                console.error('Error fetching forms:', error);
              }
            }
            navigate("/");
          }
        }
      } catch (error) {
        console.error("Error occurred:", error);

        setSnackbarOpen(true);
        setSnackbarMessage(
          error?.response?.data?.message || "Failed to save the form"
        );
        setSeverity("error");
        closePreview();
      }
    } else {
      setSnackbarOpen(true);
      setSeverity("error");
      setSnackbarMessage("Enter the Form Name to Save");
    }

    // setDescription("");
    // setName("");
    console.log(data);
  };
  const gotoHome = () => {
    navigate("/");
  };

  let modalClass = "modal";
  if (previewVisible) {
    modalClass += " show d-block";
  }

  let shortModalClass = "modal short-modal";
  if (shortPreviewVisible) {
    shortModalClass += " show d-block";
  }

  let roModalClass = "modal ro-modal";
  if (roPreviewVisible) {
    roModalClass += " show d-block";
  }
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <Button
        className="btn btn-default float-left"
        style={{ display: "flex", width: "90px", alignItems: "center" }}
        onClick={gotoHome}
        variant="text"
      >
        <MdArrowBackIosNew />
        Back
      </Button>
      <div className="clearfix" style={{ margin: "10px", width: "70%" }}>
        <h4 className="float-left">
          {props?.form_title ? props?.form_title : "Form Builder"}{" "}
        </h4>

        <Button
          className="btn btn-primary float-right"
          variant="contained"
          color="primary"
          style={{ marginRight: "10px" }}
          onClick={showShortPreview}
        >
          Save Template
        </Button>
        {/* <button
        className="btn btn-default float-right"
        style={{ marginRight: "10px" }}
        onClick={showRoPreview}
      >
        Save Template Draft
      </button> */}
        <Button
          className="btn btn-default float-right"
          style={{ marginRight: "10px" }}
          variant="outlined"
          color="secondary"
          onClick={showPreview}
        >
          Preview Form
        </Button>
        {/*jdjdjdjdj*/}

        {previewVisible && (
          <div className={modalClass} style={{ overflowY: "auto" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <ReactFormGenerator
                  // download_path=""
                  // back_action=""
                  // back_name=""
                  // answer_data={{}}
                  // action_name="Save"
                  // form_action=""
                  // form_method=""
                  onSubmit={onSubmit}
                  variables={props.variables}
                  hide_actions={false}
                  // submitButton={<Button
                  //   variant="contained"
                  //   color="primary"
                  //   style={{ margin: "10px" }}
                  // >
                  //   Submit
                  // </Button>}
                  data={data}
                />

                <div className="modal-footer">
                  <form
                  // className="form"
                  // onSubmit={(e) => {
                  //     e.preventDefault();
                  //     if (!name) {
                  //         alert("Oops You Did not Enter Anything");
                  //         return;
                  //     }
                  //     const userId = Date.now();
                  //     const userObject = { id: userId, name };
                  //     const updatedUsers = [...users, userObject];
                  //     setUsers(updatedUsers);
                  // }}
                  >
                    {/* <div>
                    <label htmlFor="name">Form Name:</label>
                    <input
                      type="text"
                      className="form-input"
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        e.preventDefault();
                      }}
                    />
                    <br />
                    <label htmlFor="name">Form description:</label>
                    <input
                      type="text"
                      className="form-input"
                      id="name"
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        e.preventDefault();
                      }}
                    />
                  </div> */}

                    <Button
                      type="button"
                      className="btn btn-default"
                      data-dismiss="modal"
                      variant="outlined"
                      color="error"
                      onClick={closePreview}
                    >
                      Close
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {roPreviewVisible && (
          <div className={roModalClass}>
            <div className="modal-dialog">
              <div className="modal-content">
                <ReactFormGenerator
                  download_path=""
                  back_action="/"
                  back_name="Back"
                  answer_data={{}}
                  action_name="Save"
                  form_action="/"
                  form_method="POST"
                  read_only={true}
                  variables={props.variables}
                  // submitButton={<Button
                  //   variant="contained"
                  //   color="primary"
                  //   style={{ marginLeft: "10px" }}
                  // >
                  //   Submit
                  // </Button>}
                  hide_actions={true}
                  data={data}
                />

                <div className="modal-footer">
                  <Button
                    type="button"
                    className="btn btn-default"
                    data-dismiss="modal"
                    color="error"
                    variant="outlined"
                    onClick={closePreview}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {shortPreviewVisible && (
          <div className={shortModalClass} style={{ overflowY: "auto" }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-content-wrapper">
                  <ReactFormGenerator
                    // download_path=""
                    // back_action=""
                    // back_name="Back"
                    // answer_data={{}}
                    // action_name="Save"
                    // form_action="/create"
                    // form_method="POST"
                    read_only={true}
                    variables={props.variables}
                    hide_actions={true}
                    // submitButton={<Button
                    //   variant="contained"
                    //   color="primary"
                    //   style={{ marginLeft: "10px" }}
                    // >
                    //   Submit
                    // </Button>}
                    data={data}
                  />
                  {/* <ReactFormGenerator
                    download_path=""
                    back_action=""
                    back_name="Back"
                    answer_data={{}}
                    action_name="Save"
                    form_action="/create"
                    form_method="POST"
                    data={data}
                    display_short={true}
                    onSubmit={onSave}
                    variables={props.variables}
                    hide_actions={false}
                  /> */}
                  <div
                    className="modal-footer"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "start",
                    }}
                  >
                    <div>
                      <label htmlFor="name">Form Name:&nbsp;</label>
                      <input
                        type="text"
                        className="form-input"
                        id="name"
                        readOnly={props?.form_title}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          e.preventDefault();
                        }}
                      />
                      <br />
                      <label htmlFor="name">Form description:&nbsp;</label>
                      <input
                        type="text"
                        className="form-input"
                        id="name"
                        readOnly={props?.description}
                        value={
                          props?.description ? props?.description : description
                        }
                        onChange={(e) => {
                          setDescription(e.target.value);
                          e.preventDefault();
                        }}
                      />
                    </div>
                    <div
                      style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Button
                        type="button"
                        className="btn btn-default"
                        // data-dismiss="modal"
                        onClick={onSave}
                        variant="contained"
                        color="primary"
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        className="btn btn-default"
                        data-dismiss="modal"
                        variant="outlined"
                        onClick={closePreview}
                        color="error"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
}

export default Demobar;
