import * as d3 from "d3";

export const buildingTypeColors = {
  Commercial: "rgba(200, 199, 200, 0.8)",
  Residential: "rgba(233, 201, 157, 0.8)",
  School: "rgba(154, 169, 244, 1)",
  none: "none",
};
export const width = 800,
  height = 600;
export const margin = {
  top: 30,
  bottm: 30,
  right: 30,
  left: 30,
};
export const containerWidth = width + margin.left + margin.right;
export const containerHeight = height + margin.top + margin.bottm;

export const SVG_IDS = {
  BUILDING: "building-map",
  REGION: "region-map",
};

export const xScale = d3.scaleLinear().domain([-5000, 3000]).range([0, width]);
export const yScale = d3.scaleLinear().domain([8000, -400]).range([0, height]);
