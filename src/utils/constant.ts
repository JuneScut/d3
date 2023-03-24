import * as d3 from "d3";

export const buildingTypeColors = {
  Commercial: "rgba(200, 199, 200, 0.8)",
  Residential: "rgba(233, 201, 157, 0.8)",
  School: "rgba(154, 169, 244, 1)",
  none: "none",
};
export const width = 800,
  height = 860;
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

export const mapExtent = { minX: -5000, minY: -200, maxX: 2800, maxY: 8000 };
export const viewExtent = {
  minX: -5000,
  minY: -400,
  maxX: 3000,
  maxY: 8200,
};

export const xScale = d3
  .scaleLinear()
  .domain([viewExtent.minX, viewExtent.maxX])
  .range([0, width]);
export const yScale = d3
  .scaleLinear()
  .domain([viewExtent.maxY, viewExtent.minY])
  .range([0, height]);
