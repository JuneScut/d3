import TopoBuilding from "./components/TopoBuilding";
import Rent from "./components/Rent";
import React from "react";
import { Divider } from "antd";

function App() {
  return (
    <>
      <TopoBuilding />
      <Divider />
      <Rent />
    </>
  );
}

export default App;
