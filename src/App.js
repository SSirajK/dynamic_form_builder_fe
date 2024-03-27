import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Form from "./pages/FormBuilder";
import ViewForm from "./pages/ViewForm";
import EditForm from "./pages/EditForm";
import Login from "./pages/Login";
import PrivateRoutes from "./pages/PrivateRoutes";
import ViewFormData from "./pages/ViewFormData";

const App = () => {
  // useEffect(() => {
  //   sessionStorage.clear();
  // }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoutes />}>
            <Route path="/" exact element={<Home />} />
            <Route path="/form" element={<Form />} />
            <Route
              path="/forms/:form_metadata_tbl_name"
              element={<ViewForm />}
            />
            <Route
              path="/forms/edit/:form_metadata_tbl_name"
              element={<EditForm />}
            />
            <Route
              path="/table-data/:form_metadata_tbl_name"
              element={<ViewFormData />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App;
