import * as d3 from "d3";
import building from "../assets/buildings.json";
import { useEffect } from "react";
import * as topojson from "topojson";
import { buildingTypeColors } from "../utils/constant";

const TopoBuilding = () => {
  const drawMap = () => {
    let width = 800,
      height = 600;

    let svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "geo")
      .attr("viewbox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const geoData = topojson.feature(
      building,
      building.objects.buildings
    );
    // We don't need projection, so use geoIdentity
    // fitSize and fitExtent can help us to scale the map and locate the center
    const projection = d3.geoIdentity().fitSize([width, height], geoData);
    let path = d3.geoPath(projection);

    svg
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", (d) => {
        if (!d || Object.keys.length == 0) {
          d = {
            properties: {
              buildingType: "none",
            },
          };
        }
        const buildingType = d.properties.buildingType;
        return buildingTypeColors[buildingType];
      })
      .attr("stroke-width", 1)
      .attr("class", "building");
    // .attr("transform", "scale(1, -1)");

    svg
      .selectAll(".building")
      .on("mouseover", function (d) {
        console.log({ d });
        // d3.select(this).attr("fill", "#D9F0FF");
      })
      .on("mouseout", function (d) {
        // d3.select(this).attr("fill", "none");
      });

    // 工具条
    const zoom = d3
      .zoom()
      .wheelDelta(0)
      .scaleExtent([0.5, 10]) // 设置缩放范围
      .translateExtent([
        [-width / 2, -height / 2],
        [width / 2, height / 2],
      ])
      .on("zoom", (event) => {
        // 在缩放时更新 SVG 元素的 transform 属性
        svg.attr("transform", event.transform);
      });
    svg.call(zoom);

    // 创建一个缩放控制工具条
    const zoomBar = d3.select("#zoom-bar");
    zoomBar.select("#zoom-in").on("click", () => {
      // 在点击“放大”按钮时进行缩放
      console.log("zoom in");
      svg.transition().call(zoom.scaleBy, 1.2);
    });
    zoomBar.select("#zoom-out").on("click", () => {
      // 在点击“缩小”按钮时进行缩放
      console.log("zoom out");
      svg.transition().call(zoom.scaleBy, 0.8);
    });

    // 坐标轴
    // 定义 x 轴比例尺和坐标轴
    const xScale = d3.scaleLinear().domain([-5000, 2800]).range([0, width]);
    const xAxis = d3.axisBottom(xScale);
    // 定义 y 轴比例尺和坐标轴
    const yScale = d3.scaleLinear().domain([-200, 8000]).range([height, 0]);
    const yAxis = d3.axisLeft(yScale);
    // 添加 x 轴
    // svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);
    // 添加 y 轴
    // svg.append("g").call(yAxis);
    // 添加网格线
    svg
      .append("g")
      .selectAll("line")
      .data(xScale.ticks())
      .join("line")
      .attr("x1", (d) => xScale(d))
      .attr("x2", (d) => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);
    svg
      .append("g")
      .selectAll("line")
      .data(yScale.ticks())
      .join("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);
  };

  useEffect(() => {
    const svg = document.getElementById("geo");
    if (!svg) {
      drawMap();
    }
  }, []);
  return (
    <div id="zoom-bar">
      <button id="zoom-in">放大</button>
      <button id="zoom-out">缩小</button>
    </div>
  );
};

export default TopoBuilding;
