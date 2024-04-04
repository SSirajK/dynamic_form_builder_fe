import React, { useEffect, useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

const AssignFormTab = ({ values, setValues, forms }) => {
    console.log(values, "values")

    return (
        <Select
            label="Select Form"
            name="selectedForm"
            value={values.selectedForm}
            onChange={(e) => setValues({ ...values, selectedForm: e.target.value })}
        >
            {forms.map((form) => (
                <MenuItem key={form.id} value={form.id}>
                    {form.name}
                </MenuItem>
            ))}
        </Select>
    );
};

export default AssignFormTab;
