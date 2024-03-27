import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

const DynamicTable = ({ data, headers, buttonColumn }) => {
  const [tableData, setTableData] = useState([]);
  console.log(data, "data");
  const theme = useTheme();
  const [headerKeys, setHeaderKeys] = useState([]);

  useEffect(() => {
    // Extract keys from all objects in the data array
    const keys = new Set();
    data.forEach((obj) => {
      Object.keys(obj).forEach((key) => keys.add(key));
    });

    // Set headerKeys and normalize data
    setHeaderKeys(Array.from(keys));
    const mappedData = data.map((obj) => ({
      ...obj,
      ...headerKeys.reduce(
        (acc, key) => ({ ...acc, [key]: obj[key] ?? "NA" }),
        {}
      ),
    }));
    setTableData(mappedData);
    console.log(tableData, "table");
  }, [data]);

  const renderTableData = () => {
    if (!tableData.length) {
      return <p className="no-data">No data</p>;
    }

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
            <TableRow>
              {headerKeys.map((key) => (
                <TableCell key={key} sx={{ fontWeight: "700" }} align="center">
                  {key}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row) => (
              <TableRow key={row.id || row._id}>
                {headerKeys.map((key) => (
                  <TableCell key={`${key}-${row.id}`} align="center">
                    {key === buttonColumn && Array.isArray(row[key])
                      ? row[key].map((button) => (
                          <button key={button.id} onClick={button.onClick}>
                            {button.label}
                          </button>
                        ))
                      : row[key]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return <div>{renderTableData()}</div>;
};

export default DynamicTable;
