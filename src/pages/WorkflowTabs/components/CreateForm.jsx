import React from 'react';
import TextField from '@mui/material/TextField';

const CreateFormTab = ({ values, setValues }) => {
    return (
        <TextField
            label="Form Name"
            name="formName"
            value={values.formName}
            onChange={(e) => setValues({ ...values, formName: e.target.value })}
            margin="dense"
            fullWidth
        />
    );
};

export default CreateFormTab;
