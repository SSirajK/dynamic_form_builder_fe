import { ReactFormBuilder } from "react-form-builder2";
import Demobar from "../components/demobar";
import { useNavigate } from "react-router-dom";

const Form = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <div style={{ marginLeft: "auto", marginRight: "auto", maxWidth: "70%" }}>
        <Demobar />

        <ReactFormBuilder
          saveUrl="http://localhost:3000/form-data/data"
          locale="en"
          saveAlways={false}
        />
      </div>
    </div>
  );
};

export default Form;
