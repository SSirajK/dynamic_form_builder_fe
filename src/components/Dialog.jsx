import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";

const DynamicDialog = ({
  title,
  initialValues,
  onSubmit,
  onClose,
  submitButtonLabel,
  isOpen,
  disabled,
  children,
  sx,
  noSubmit,
}) => {
  const [open, setOpen] = useState(isOpen);
  console.log(sx, "children", disabled);
  const [values, setValues] = useState(initialValues || {});
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onClose?.(); // Call onClose function if provided
  };

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  // Define your form fields based on initialValues
  const formFields = Object.entries(initialValues || {}).map(
    ([name, value]) => {
      if (typeof value === "string") {
        return (
          <TextField
            key={name}
            name={name}
            label={name}
            value={values[name] || ""}
            onChange={handleChange}
            margin="dense"
            fullWidth
            disabled={disabled}
          />
        );
      } else if (Array.isArray(value)) {
        return (
          <Select
            key={name}
            name={name}
            label={name}
            value={values[name] || ""}
            onChange={handleChange}
            margin="dense"
            fullWidth
          >
            {value.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        );
      } else {
        // Handle other data types if needed
        return null;
      }
    }
  );

  return (
    <div>
      {/* <Button variant="outlined" onClick={handleOpen}>
                Open Dialog
            </Button> */}
      <Dialog
        sx={{ maxWidth: "100vw", maxHeight: '90vh', alignItems: 'center' }}
        open={open}
        onClose={handleClose}
        disableEscapeKeyDown={true}
        disableBackdropClick={true}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent sx={sx}>{children || formFields}</DialogContent>
        <DialogActions>
          <Button variant="outlined" color="error" onClick={handleClose}>Cancel</Button>
          {!noSubmit && <Button variant="contained" color="primary" onClick={handleSubmit}>
            {submitButtonLabel || "Submit"}
          </Button>}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default DynamicDialog;
