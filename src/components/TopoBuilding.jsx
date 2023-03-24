import * as d3 from "d3";
import building from "../assets/buildings.json";
import { useEffect } from "react";
import * as topojson from "topojson";
import {
  buildingTypeColors,
  width,
  height,
  margin,
  containerHeight,
  containerWidth,
  xScale,
  yScale,
  viewExtent,
  mapExtent,
  SVG_IDS,
} from "../utils/constant";
import {
  borderObj,
  genGridLines,
  genXLabels,
  genYLabels,
} from "../utils/utils";
import schoolLocations from "../assets/locations/schoolLocations.json";

const buildingExent = {
  minX: -4762.19066918826,
  minY: -30.08359080145072,
  maxX: 2650,
  maxY: 7850.037195143702,
};
const transfromLinesCord = ([v1, v2]) => {
  return [
    [xScale(v1[0]), yScale(v1[1])],
    [xScale(v2[0]), yScale(v2[1])],
  ];
};

// TODO: 需要统一配置坐标
const TopoBuilding = () => {
  const addToolTip = () => {
    const tooltip = d3
      .select(`#${SVG_IDS.BUILDING}-container`)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    const svg = d3.select("#geo");
    svg
      .selectAll(".building")
      .on("mouseover", function (d) {
        const data = d.srcElement.__data__;
        console.log(data);
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
      .wheelDelta(0) // 禁止鼠标滑动
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
      .select(`#${SVG_IDS.BUILDING}-container`)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .style("padding", "30px")
      .attr("id", "geo")
      .attr("viewbox", `-60 -60 ${width} ${height}`);

    const geoData = topojson.feature(building, building.objects.buildings);
    // We don't need projection, so use geoIdentity
    // fitSize and fitExtent can help us to scale the map and locate the center
    const projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([width, height], borderObj(viewExtent));
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

    const grids = genGridLines().map(transfromLinesCord);

    svg
      .append("g")
      .selectAll("line")
      .data(grids)
      .enter()
      .append("line")
      .attr("x1", (d) => d[0][0])
      .attr("y1", (d) => d[0][1])
      .attr("x2", (d) => d[1][0])
      .attr("y2", (d) => d[1][1])
      .attr("stroke-width", 0.2)
      .attr("stroke", "#ccc");

    const xLabels = genXLabels();
    const yLabels = genYLabels();
    let labels = xLabels.concat(yLabels);
    labels = labels.map(transfromLinesCord);
    const lineGroup = svg.append("g");
    lineGroup
      .selectAll("line")
      .data(labels)
      .enter()
      .append("line")
      .attr("x1", (d) => d[0][0])
      .attr("y1", (d) => d[0][1])
      .attr("x2", (d) => d[1][0])
      .attr("y2", (d) => d[1][1])
      .attr("stroke-width", 0.2)
      .attr("stroke", "black");

    lineGroup
      .selectAll("text.xLabel")
      .data(xLabels)
      .enter()
      .append("text")
      .attr("class", "xLabel")
      .style("font-size", "12px")
      .attr("x", (d) => xScale(d[0][0]))
      .attr("y", (d) => yScale(d[0][1]) + 20)
      .text((d) => d[0][0])
      .attr("text-anchor", "middle");

    lineGroup
      .selectAll("text.yLabel")
      .data(yLabels)
      .enter()
      .append("text")
      .attr("class", "yLabel")
      .style("font-size", "12px")
      .attr("x", (d) => xScale(d[1][0]) + 30)
      .attr("y", (d) => yScale(d[1][1]))
      .text((d) => d[0][1])
      .attr("text-anchor", "middle");
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
        id="building-map-container"
        style={{
          width: containerWidth + margin.left + margin.right,
          height: containerHeight + margin.top + margin.bottm,
          overflow: "hidden",
          border: "1px solid #ccc",
        }}
      />
    </>
  );
};

export default TopoBuilding;
