import TopoBuilding from "./components/TopoBuilding";
import Rent from "./components/Rent";
import React from "react";
import { Divider } from "antd";
import Traffic from "./components/Traffic";

function App() {
  return (
    <>
      <TopoBuilding />
      <Divider />
      <Rent />
      <Divider />
      <Traffic />
    </>
  );
}

export default App;
