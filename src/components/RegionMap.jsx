import React from "react";
import { useEffect } from "react";
import { containerHeight, containerWidth, SVG_IDS } from "../utils/constant";
import * as d3 from "d3";
import * as topojson from "topojson";
import building from "../assets/buildings.json";
import { width, height, margin, xScale, yScale } from "../utils/constant";
import employerLocations from "../assets/locations/employerLocations.json";
import spaceLocations from "../assets/locations/sapceLocations.json";
import apartmentLocations from "../assets/locations/apartmentLocations.json";
import pubLocations from "../assets/locations/pubLocations.json";
import restaurantLocations from "../assets/locations/restaurantLocations.json";
import schoolLocations from "../assets/locations/schoolLocations.json";

const pointsOrig = spaceLocations
  .map(([x, y]) => [x, y, "spa"])
  .concat(apartmentLocations.map(([x, y]) => [x, y, "apa"]))
  .concat(pubLocations.map(([x, y]) => [x, y, "pub"]))
  .concat(restaurantLocations.map(([x, y]) => [x, y, "res"]))
  .concat(schoolLocations.map(([x, y]) => [x, y, "sch"]))
  .concat(employerLocations.map(([x, y]) => [x, y, "emp"]));

const opacity = 0.3;
const colours = (type) => {
  switch (type) {
    case "emp":
      return `rgba(166,93,52,${opacity})`;
    case "apa":
      return `rgba(59,119,175,${opacity})`;
    case "res":
      return `rgba(239,133,51,${opacity})`;
    case "pub":
      return `rgba(209,53,43,${opacity})`;
    case "sch":
      return `rgba(100,65,149,${opacity})`;
    case "spa":
      return `rgba(84,157,63,${opacity})`;
  }
  return "black";
};

const RegionMap = () => {
  // 把地图坐标转为屏幕上 canvas 坐标
  const transformCordinate = ([x, y, type]) => {
    return [xScale(x), yScale(y), type];
  };

  const drawMap = () => {
    let svg = d3
      .select(`#${SVG_IDS.REGION}-container`)
      .append("svg")
      .attr("id", SVG_IDS.REGION)
      .attr("viewbox", `0 0 800 600`)
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .style("padding", "30px")
      .attr("viewbox", `-60 -60 ${width} ${height}`);

    const geoData = topojson.feature(building, building.objects.buildings);
    const projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([width, height], geoData);
    let path = d3.geoPath(projection);

    svg
      .selectAll("path")
      .data(geoData.features)
      .enter() // 指定选择集的 enter 部分, 下一行的 append 会给这些添加足量的元素
      .append("path")
      .attr("d", path)
      .style("fill", "none")
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("class", "building");

    const ellipse = schoolLocations.map(transformCordinate);
    console.log({ ellipse });

    // svg
    //   .selectAll("ellipse")
    //   .data(ellipse)
    //   .enter()
    //   .append("ellipse")
    //   .attr("cx", (d) => d[0])
    //   .attr("cy", (d) => d[1])
    //   .attr("rx", 5)
    //   .attr("ry", 5)
    //   .style("fill", colours("sch"))
    //   .attr("stroke", colours("sch"));

    let vertex = [
      // [-5000 + 5, -200 + 5, "spa"],
      // [2800 - 5, -200 + 5, "spa"],
      // [-5000 + 5, 8000 - 5, "spa"],
      // [2800 - 5, 8000 - 5, "spa"],
      [-4200, -200, "emp"],
      [-4200, 8000, "emp"],
    ];
    vertex = vertex.map(transformCordinate);

    console.log({ vertex });
    svg
      .selectAll("ellipse")
      .data(vertex)
      .enter()
      .append("ellipse")
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .attr("rx", 10)
      .attr("ry", 10)
      .style("fill", (d) => d[2])
      .attr("stroke", (d) => d[2]);
  };

  useEffect(() => {
    const svg = document.getElementById(SVG_IDS.REGION);
    if (!svg) {
      drawMap();
    }
  }, []);

  return (
    <div
      id={`${SVG_IDS.REGION}-container`}
      style={{
        width: containerWidth + margin.left + margin.right,
        height: containerHeight + margin.top + margin.bottm,
        overflow: "hidden",
        border: "1px solid #ccc",
      }}
    />
  );
};

export default RegionMap;
