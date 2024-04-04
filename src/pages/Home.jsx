import React, { useEffect, useState } from "react";
import { Table } from "../components/Table";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const admin = sessionStorage.getItem("isAdmin");

    // Correctly convert admin value to boolean
    const isAdminBool = admin === "true"; // Strict comparison

    setUserIsAdmin(isAdminBool);
    console.log(userIsAdmin, "userIsAdmin"); // Log for verification
  }, []);

  const handleRouteLink = () => {
    navigate("/form");
  };

  return (
    <div style={{ marginLeft: "35px", marginTop: "40px", maxWidth: "70%" }}>
      {userIsAdmin ? (
        <div>
          <div style={{ marginBottom: "40px" }}>
            <h4>Build Form Template</h4>
            <div style={{ display: "flex", alignItems: "center" }}>
              <button
                onClick={handleRouteLink}
                style={{
                  backgroundColor: "#0073CF",
                  color: "white",
                  fontWeight: "bold",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Build Form
              </button>
            </div>
          </div>
          <div style={{ marginBottom: "40px" }}>
            <h4>Form Templates Available</h4>
            <div style={{ display: "flex", alignItems: "center" }}>
              <div>
                <Table viewMetadata={true} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h4>Form Available To Fill</h4>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div>
              <Table viewMetadata={false} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
