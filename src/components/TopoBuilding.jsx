import * as d3 from "d3";
import building from "../assets/buildings.json";
import { useEffect } from "react";
import * as topojson from "topojson";
import { buildingTypeColors, width, height, margin } from "../utils/constant";

const TopoBuilding = () => {
  const containerWidth = width + margin.left + margin.right;
  const containerHeight = height + margin.top + margin.bottm;
  const addToolTip = () => {
    const tooltip = d3
      .select("#map-container")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    const svg = d3.select("#geo");
    svg
      .selectAll(".building")
      .on("mouseover", function (d) {
        const data = d.srcElement.__data__;
        tooltip.transition().duration(200).style("opacity", 0.9);
        tooltip
          .html(
            `buildingId: ${data.properties.buildingId}; buildingType: ${data.properties.buildingType}`
          )
          .style("left", d.offsetX + 10 + "px")
          .style("top", d.offsetY - 28 + "px");
      })
      .on("mouseout", function (d) {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  };

  const addZoomBar = () => {
    const svg = d3.select("#geo");
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
        // svg.attr("transform", event.transform);
        const { transform } = event;
        const scale = transform.k;
        const x = transform.x;
        const y = transform.y;

        const maxX = ((scale - 1) * width) / 2;
        const minX = -maxX;
        const maxY = ((scale - 1) * height) / 2;
        const minY = -maxY;

        const tx = Math.max(Math.min(x, maxX), minX);
        const ty = Math.max(Math.min(y, maxY), minY);

        svg.attr("transform", `translate(${tx},${ty}) scale(${scale})`);
      });
    svg.call(zoom);

    // 创建一个缩放控制工具条
    const zoomBar = d3.select("#zoom-bar");
    zoomBar.select("#zoom-in").on("click", () => {
      // 在点击“放大”按钮时进行缩放
      svg.transition().call(zoom.scaleBy, 1.2);
    });
    zoomBar.select("#zoom-out").on("click", () => {
      // 在点击“缩小”按钮时进行缩放
      svg.transition().call(zoom.scaleBy, 0.8);
    });
  };

  const drawMap = () => {
    let svg = d3
      .select("#map-container")
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .attr("id", "geo")
      .attr("viewbox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const geoData = topojson.feature(building, building.objects.buildings);
    // We don't need projection, so use geoIdentity
    // fitSize and fitExtent can help us to scale the map and locate the center
    const projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([width, height], geoData);
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

    // 坐标轴
    // 定义 x 轴比例尺和坐标轴
    const xScale = d3
      .scaleLinear()
      .domain([-5000, 2800])
      .range([margin.left, width - margin.right]);
    const xAxis = d3.axisBottom(xScale);
    // 定义 y 轴比例尺和坐标轴
    const yScale = d3
      .scaleLinear()
      .domain([-200, 8000])
      .range([height - margin.top, margin.bottm]);
    const yAxis = d3.axisRight(yScale);
    // 添加 x 轴
    svg
      .append("g")
      .attr("transform", `translate(0, ${height + margin.bottm})`)
      .call(xAxis);
    // 添加 y 轴
    svg.append("g").attr("transform", `translate(${width}, 0)`).call(yAxis);
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
      .attr("stroke", "#ccc")
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
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1);
  };

  useEffect(() => {
    const svg = document.getElementById("geo");
    if (!svg) {
      drawMap();
      addToolTip();
      addZoomBar();
    }
  }, []);
  return (
    <>
      <div id="zoom-bar">
        <button id="zoom-in">zoom in</button>
        <button id="zoom-out">zoom out</button>
      </div>
      <div
        id="map-container"
        style={{
          width: containerWidth,
          height: containerHeight,
          overflow: "hidden",
          border: "1px solid #ccc",
        }}
      />
    </>
  );
};

export default TopoBuilding;
