import * as d3 from "d3";
import building from "../assets/buildings.json";
import React, { useEffect, useState } from "react";
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
  SVG_IDS,
  BUILDING_TYPES,
  dotsCoulors,
} from "../utils/constant";
import {
  borderObj,
  genGridLines,
  genXLabels,
  genYLabels,
  transfromLinesCord,
  transformCordinate,
  showRegionBoundaries,
  hideBoundaries,
} from "../utils/utils";
import { Layout, Checkbox, Row, Col, Space } from "antd";
import employerLocations from "../assets/locations/employerLocations.json";
import spaceLocations from "../assets/locations/sapceLocations.json";
import apartmentLocations from "../assets/locations/apartmentLocations.json";
import pubLocations from "../assets/locations/pubLocations.json";
import restaurantLocations from "../assets/locations/restaurantLocations.json";
import schoolLocations from "../assets/locations/schoolLocations.json";
import Sider from "antd/es/layout/Sider";
import Switch from "antd/es/switch";
import { Content } from "antd/es/layout/layout";

const buildingTypes = Object.entries(BUILDING_TYPES).map(([k, v]) => ({
  label: v,
  value: k,
}));

// TODO: 把过程化变成封装为 OOP
const TopoBuilding = () => {
  const [bType, setBType] = useState([]);
  const [showBoundary, setShowBoundary] = useState(false);

  const addToolTip = () => {
    const tooltip = d3
      .select(`#${SVG_IDS.BUILDING}-container`)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
    const svg = d3.select(`#${SVG_IDS.BUILDING}`);
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
      .on("mouseout", function () {
        tooltip.transition().duration(200).style("opacity", 0);
      });
  };

  // const handleZoomAction = (event) => {
  //   const action = event.target.value;
  //   setZoomAction(action);
  //   const svg = d3.select(`#${SVG_IDS.BUILDING}`);
  //   if (action == "in") {
  //     svg.transition().call(zoom.scaleBy, 0.8);
  //   } else {
  //     svg.transition().call(zoom.scaleBy, 1.2);
  //   }
  // };

  const handleShowBuildingType = (value) => {
    let points = [];
    const svg = d3.select(`#${SVG_IDS.BUILDING}`);
    switch (value) {
      case "APA":
        points = apartmentLocations;
        break;
      case "EMP":
        points = employerLocations;
        break;
      case "SPA":
        points = spaceLocations;
        break;
      case "PUB":
        points = pubLocations;
        break;
      case "RES":
        points = restaurantLocations;
        break;
      case "SCH":
        points = schoolLocations;
        break;
      default:
        // 清除
        svg.selectAll("ellipse").remove();
    }
    points = points.map(([x, y]) => [x, y, value]);
    const ellipse = points.map(transformCordinate);
    svg
      .selectAll("ellipse")
      .data(ellipse)
      .enter()
      .append("ellipse")
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("class", "buildings")
      .style("fill", (d) => dotsCoulors(d[2]))
      .attr("stroke", (d) => dotsCoulors(d[2]));
  };

  const handleChangeBType = (values) => {
    const svg = d3.select(`#${SVG_IDS.BUILDING}`);
    svg.selectAll("ellipse").remove();
    setBType(values);
    values.forEach((value) => handleShowBuildingType(value));
  };

  const addLegend = () => {
    const legendData = [];
    for (let [key, value] of Object.entries(buildingTypeColors)) {
      legendData.push({ name: key, color: value });
    }
    const svg = d3.select(`#${SVG_IDS.BUILDING}`);
    const legend = svg
      .selectAll(".legend")
      .data(legendData)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", function (d, i) {
        return "translate(-30," + (i * 20 + 30) + ")";
      }); //transform属性便是整个图例的坐标

    //绘制文字后方的颜色框或线
    legend
      .append("rect")
      .attr("x", width - 25)
      .attr("y", 8)
      .attr("width", 40)
      .attr("height", 3)
      .style("fill", function (d) {
        return d.color;
      });

    legend
      .append("text")
      .attr("x", width - 30)
      .attr("y", 15)
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .text(function (d) {
        return d.name;
      });
  };

  const drawMap = () => {
    let svg = d3
      .select(`#${SVG_IDS.BUILDING}-container`)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .style("padding", "30px")
      .attr("id", SVG_IDS.BUILDING)
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
    if (showBoundary) {
      showRegionBoundaries(SVG_IDS.BUILDING);
    } else {
      hideBoundaries(SVG_IDS.BUILDING);
    }
  }, [showBoundary]);

  useEffect(() => {
    const svg = document.getElementById(SVG_IDS.BUILDING);
    if (!svg) {
      drawMap();
      addToolTip();
      // zoom = initZoom(SVG_IDS.BUILDING, width, height);
      addLegend();
    }
  }, []);

  return (
    <>
      <Layout>
        <Sider theme="light" width={360}>
          <Space
            direction="vertical"
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "start",
              marginTop: "150px",
            }}
          >
            <Space>
              <span>show region boundary </span>
              <Switch
                defaultChecked={showBoundary}
                checked={showBoundary}
                onChange={() => {
                  setShowBoundary((show) => !show);
                }}
              />
            </Space>
            <span>Buildings:</span>
            <Checkbox.Group
              style={{ width: "100%" }}
              defaultValue={[""]}
              onChange={handleChangeBType}
              value={bType}
            >
              <Row>
                {buildingTypes.map((item) => {
                  return (
                    <Col key={`show-buildings-type-${item.value}`} span={16}>
                      <Checkbox
                        value={item.value}
                        style={{
                          direction: "rtl",
                        }}
                      >
                        {item.label}

                        <span
                          style={{
                            width: "10px",
                            height: "10px",
                            backgroundColor: dotsCoulors(item.value),
                            borderRadius: "50%",
                            display: "inline-block",
                            marginRight: "10px",
                          }}
                        ></span>
                      </Checkbox>
                    </Col>
                  );
                })}
              </Row>
            </Checkbox.Group>
          </Space>
        </Sider>
        <Content>
          <div
            id="building-map-container"
            style={{
              width: containerWidth + margin.left + margin.right,
              height: containerHeight + margin.top + margin.bottm,
              overflow: "hidden",
            }}
          />
        </Content>
      </Layout>
    </>
  );
};

export default TopoBuilding;
