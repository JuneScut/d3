import React from "react";
import { useEffect, useState } from "react";
import {
  boundaries,
  boundaryTextPosition,
  containerHeight,
  containerWidth,
  mapExtent,
  SVG_IDS,
  LEGEND,
  rentsDomain,
  jobsDomain,
} from "../utils/constant";
import * as d3 from "d3";
import * as topojson from "topojson";
import building from "../assets/buildings.json";
import { width, height, margin } from "../utils/constant";
import { borderObj, transformCordinate } from "../utils/utils";
import rents from "../assets/buildingCost.json";
import jobs from "../assets/jobRows.json";
import Space from "antd/es/space";
import Switch from "antd/es/switch";
import Layout from "antd/es/layout";
import BarGraph from "./BarGraph";
import avgRent from "../assets/avgRents.json";
import avgJobNums from "../assets/avgJobNum.json";

const { Sider, Content } = Layout;

// const jobsLocations = jobs.map((row) => [row.locationX, row.locationY]);
// const jobCounts = jobs.map((row) => row.numJobs);
// const jobExtent = d3.extent(jobCounts);
// const jobColours = d3
//   .scaleSequential(d3.interpolateBlues)
//   .domain([0, jobExtent[1]]);
// const jobSize = d3.scaleSequentialSqrt().domain(jobExtent).range([3, 10]);

// job heat map
const buildingJobs = [];
let minJobNum = Number.MAX_VALUE;
let maxJobNum = Number.MIN_VALUE;
jobs.forEach((o) => {
  minJobNum = Math.min(minJobNum, o.numJobs);
  maxJobNum = Math.max(maxJobNum, o.numJobs);
  buildingJobs[o.buildingId] = o.numJobs;
});

// rents: 0-1486
const Rent = () => {
  const [showRents, setShowRents] = useState(false);
  const [showJobHeatMap, setShowJobHeatMap] = useState(false);
  const [showBoundary, setShowBoundary] = useState(true);

  const geoData = topojson.feature(building, building.objects.buildings);
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize([width, height], borderObj(mapExtent));
  let path = d3.geoPath(projection);

  const showRegionBoundaries = () => {
    const svg = d3.select("#region");
    for (const key of Object.keys(boundaries)) {
      const region = boundaries[key];
      const cords = region.map((o) => transformCordinate(o));
      const textPosition = transformCordinate(boundaryTextPosition[key]);
      let boundary = "";
      for (let i = 0; i < cords.length; i++) {
        if (i === 0) {
          boundary += `M ${cords[i][0]} ${cords[i][1]} `;
        } else {
          boundary += `L ${cords[i][0]} ${cords[i][1]} `;
        }
      }
      boundary += "Z";
      svg
        .append("path")
        .attr("d", boundary)
        .attr("stroke", "black")
        .attr("fill", "none")
        .attr("class", "boundary");
      svg
        .append("text")
        .attr("x", textPosition[0])
        .attr("y", textPosition[1])
        .attr("class", "boundary-text")
        .attr("font-size", "16px")
        .text(key);
    }
  };

  const hideBoundaries = () => {
    const svg = d3.select("#region");
    svg.selectAll(`path.boundary`).remove();
    svg.selectAll(`text.boundary-text`).remove();
  };

  const drawMap = () => {
    d3.select(`#${SVG_IDS.REGION}-container`)
      .append("svg")
      .attr("width", containerWidth)
      .attr("height", containerHeight)
      .style("padding", "30px")
      .attr("id", "region")
      .attr("viewbox", `-60 -60 ${width} ${height}`);
    renderGraph(() => "white");
  };

  const showColorLegend = (className, transform, domain, position) => {
    const svg = d3.select("#region");
    const legendWidth = 150;
    const legendHeight = 20;

    const legend = svg
      .append("g")
      .attr("class", className)
      .attr("transform", `translate(${position[0]}, ${position[1]})`);

    legend
      .selectAll("rect")
      .data(d3.range(0, legendWidth))
      .enter()
      .append("rect")
      .attr("x", (d, i) => i)
      .attr("y", 0)
      .attr("width", 1)
      .attr("height", legendHeight)
      .attr("fill", transform);

    legend.append("text").attr("x", 0).attr("y", 35).text(domain[0]);
    legend
      .append("text")
      .attr("x", legendWidth - 20)
      .attr("y", 35)
      .text(domain[1]);
  };

  const hideColorLegend = (className) => {
    const svg = d3.select("#region");
    svg.selectAll(`g.${className}`).remove();
  };

  const renderGraph = (fillFunc) => {
    const svg = d3.select("#region");
    svg.selectAll(`path.building`).remove();

    svg
      .selectAll("path")
      .data(geoData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("fill", fillFunc)
      .attr("stroke", "#ccc")
      .attr("stroke-width", 1)
      .attr("class", "building");

    if (showRents) {
      const legendScale = d3
        .scaleSequential(d3.interpolateReds)
        .domain(rentsDomain);

      showColorLegend(
        LEGEND.RENTS,
        (d) => legendScale(d * 12 + 360),
        rentsDomain,
        [20, 700]
      );
    } else {
      hideColorLegend(LEGEND.RENTS);
    }

    if (showJobHeatMap) {
      const legendScale = d3
        .scaleSequential(d3.interpolateBlues)
        .domain(jobsDomain);
      showColorLegend(
        LEGEND.JOBS,
        (d) => legendScale(d * 0.1),
        jobsDomain,
        [20, 750]
      );
    } else {
      hideColorLegend(LEGEND.JOBS);
    }
  };

  useEffect(() => {
    const svg = document.getElementById(SVG_IDS.REGION);
    if (!svg) {
      drawMap();
    }
  }, []);

  const fillFunc = (d) => {
    const { buildingId } = d.properties;
    const buildingIdNum = +buildingId;
    if (showRents && rents[buildingIdNum]) {
      return d3.scaleSequential(d3.interpolateReds).domain(rentsDomain)(
        rents[buildingIdNum]
      );
    } else if (showJobHeatMap && buildingJobs[buildingIdNum]) {
      return d3.scaleSequential(d3.interpolateBlues).domain(jobsDomain)(
        buildingJobs[buildingIdNum]
      );
    } else {
      return "white";
    }
  };

  // const showJobsLocations = () => {
  //   const svg = d3.select("#region");
  //   const ellipse = jobsLocations.map(transformCordinate);
  //   svg
  //     .selectAll("ellipse")
  //     .data(ellipse)
  //     .enter()
  //     .append("ellipse")
  //     .attr("cx", (d) => d[0])
  //     .attr("cy", (d) => d[1])
  //     .attr("rx", (_, i) => {
  //       return jobSize(jobCounts[i]);
  //     })
  //     .attr("class", "jobs")
  //     .style("fill", (_, i) => {
  //       return jobColours(jobCounts[i]);
  //     })
  //     .attr("stroke", "black")
  //     .attr("strokeWidth", 0.6);
  // };

  const handleShowRents = (checked) => {
    setShowRents(checked);
  };

  const handleShowJobHeatMap = (checked) => {
    setShowJobHeatMap(checked);
  };

  // const handleShowJobs = (checked) => {
  //   setShowJobs(checked);
  //   if (checked) {
  //     showJobsLocations();
  //   } else {
  //     const svg = d3.select("#region");
  //     svg.selectAll("ellipse.jobs").remove();
  //   }
  // };

  useEffect(() => {
    if (!showRents && !showJobHeatMap) {
      renderGraph(() => "white");
    } else {
      renderGraph(fillFunc);
    }
  }, [showRents, showJobHeatMap]);

  useEffect(() => {
    if (showBoundary) {
      showRegionBoundaries();
    } else {
      hideBoundaries();
    }
  }, [showBoundary]);

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
            }}
          >
            <span>show region boundary: </span>
            <Switch
              defaultChecked={showBoundary}
              checked={showBoundary}
              onChange={() => {
                setShowBoundary((show) => !show);
              }}
            />
            <span>show residental rents heatmap: </span>
            <Switch
              defaultChecked={false}
              checked={showRents}
              onChange={handleShowRents}
            />
            <span>show jobs opportunites heatmap: </span>
            <Switch
              defaultChecked={false}
              checked={showJobHeatMap}
              onChange={handleShowJobHeatMap}
            />
            {/* <span>show job opportinities: </span>
            <Switch
              defaultChecked={false}
              checked={showJobs}
              onChange={handleShowJobs}
            /> */}
            {showRents && (
              <BarGraph
                containerId={"rents-container"}
                title={"Average rent for each region"}
                avgRent={avgRent}
                color={"#ca3e47"}
              />
            )}
            {showJobHeatMap && (
              <BarGraph
                containerId={"jobs-container"}
                title={"Average job opportunities for each region"}
                avgRent={avgJobNums}
                color={"#79BEDB"}
              />
            )}
          </Space>
        </Sider>
        <Content>
          <div
            id={`${SVG_IDS.REGION}-container`}
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

export default Rent;
