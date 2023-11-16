import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

export const Welcome = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/create");
  };
  return (
    <div>
      <button onClick={handleClick}> Create a Bastion</button>
      <button onClick={()=>{
        navigate("./import")
      }}> Import a Bastion</button>
    </div>
  );
};
