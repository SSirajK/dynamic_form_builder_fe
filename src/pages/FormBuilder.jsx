import { ReactFormBuilder } from "react-form-builder2";
import Demobar from "../components/demobar";
import { useLocation, useNavigate } from "react-router-dom";
import FormElementsEdit from "../components/FormElementsEdit";

const Form = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const props = location?.state;

  const handleGoBack = () => {
    navigate("/");
  };

  return (
    <div style={{ marginTop: "40px" }}>
      <div style={{ marginLeft: "auto", marginRight: "auto", maxWidth: "70%" }}>
        <Demobar state={props} />

        <ReactFormBuilder
          saveUrl="http://localhost:3000/form-data/data"
          locale="en"
          saveAlways={false}
          renderEditForm={props => <FormElementsEdit {...props} />}
        />
      </div>
    </div>
  );
};

export default Form;
