import React from "react";
import { useEffect, useState } from "react";
import {
  containerHeight,
  containerWidth,
  mapExtent,
  SVG_IDS,
} from "../utils/constant";
import * as d3 from "d3";
import * as topojson from "topojson";
import building from "../assets/buildings.json";
import { width, height, margin } from "../utils/constant";
import { borderObj, transformCordinate } from "../utils/utils";
import rents from "../assets/buildingCost.json";
import { Layout, Space, Switch } from "antd";
import jobs from "../assets/jobRows.json";
import Sider from "antd/es/layout/Sider";
import { Content } from "antd/es/layout/layout";

const jobsLocations = jobs.map((row) => [row.locationX, row.locationY]);
const jobCounts = jobs.map((row) => row.numJobs);
const jobExtent = d3.extent(jobCounts);
const jobColours = d3
  .scaleSequential(d3.interpolateBlues)
  .domain([0, jobExtent[1]]);
const jobSize = d3.scaleSequentialSqrt().domain(jobExtent).range([3, 10]);

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
  const [showJobs, setShowJobs] = useState(false);

  const geoData = topojson.feature(building, building.objects.buildings);
  const projection = d3
    .geoIdentity()
    .reflectY(true)
    .fitSize([width, height], borderObj(mapExtent));
  let path = d3.geoPath(projection);

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

  const renderGraph = (fillFunc) => {
    const svg = d3.select("#region");
    svg.selectAll(`path.building`).remove();
    const jobsDots = svg.selectAll("ellipse.jobs");
    jobsDots && jobsDots.remove();

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

    if (showJobs) {
      showJobsLocations();
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
      return d3.scaleSequential(d3.interpolateReds).domain([360, 1500])(
        rents[buildingIdNum]
      );
    } else if (showJobHeatMap && buildingJobs[buildingIdNum]) {
      return d3.scaleSequential(d3.interpolateBlues).domain([0, 10])(
        buildingJobs[buildingIdNum]
      );
    } else {
      return "white";
    }
  };

  const showJobsLocations = () => {
    const svg = d3.select("#region");
    const ellipse = jobsLocations.map(transformCordinate);
    svg
      .selectAll("ellipse")
      .data(ellipse)
      .enter()
      .append("ellipse")
      .attr("cx", (d) => d[0])
      .attr("cy", (d) => d[1])
      .attr("rx", (_, i) => {
        return jobSize(jobCounts[i]);
      })
      .attr("class", "jobs")
      .style("fill", (_, i) => {
        return jobColours(jobCounts[i]);
      })
      .attr("stroke", "black")
      .attr("strokeWidth", 0.6);
  };

  const handleShowRents = (checked) => {
    setShowRents(checked);
  };

  const handleShowJobHeatMap = (checked) => {
    setShowJobHeatMap(checked);
  };

  const handleShowJobs = (checked) => {
    setShowJobs(checked);
    if (checked) {
      showJobsLocations();
    } else {
      const svg = d3.select("#region");
      svg.selectAll("ellipse.jobs").remove();
    }
  };

  useEffect(() => {
    if (!showRents && !showJobHeatMap) {
      renderGraph(() => "white");
    } else {
      renderGraph(fillFunc);
    }
  }, [showRents, showJobHeatMap]);

  return (
    <>
      <Layout>
        <Sider theme="light">
          <Space
            direction="vertical"
            style={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
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
            <span>show job opportinities: </span>
            <Switch
              defaultChecked={false}
              checked={showJobs}
              onChange={handleShowJobs}
            />
          </Space>
        </Sider>
        <Content>
          <div
            id={`${SVG_IDS.REGION}-container`}
            style={{
              width: containerWidth + margin.left + margin.right,
              height: containerHeight + margin.top + margin.bottm,
              overflow: "hidden",
              border: "1px solid #ccc",
            }}
          />
        </Content>
      </Layout>
    </>
  );
};

export default Rent;
