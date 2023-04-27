import * as d3 from "d3";

export const buildingTypeColors = {
  Commercial: "rgba(161,186,208,0.8)",
  Residential: "rgba(233, 201, 157, 0.8)",
  School: "rgba(154, 169, 244, 1)",
};
export const width = 800,
  height = 860;
export const margin = {
  top: 30,
  bottm: 30,
  right: 30,
  left: 30,
};
export const containerWidth = width + margin.left + margin.right + 50;
export const containerHeight = height + margin.top + margin.bottm;

export const SVG_IDS = {
  BUILDING: "building-map",
  REGION: "region",
};

export const mapExtent = { minX: -5000, minY: -200, maxX: 2800, maxY: 8000 };
export const viewExtent = {
  minX: -5000,
  minY: -400,
  maxX: 3000,
  maxY: 8200,
};
export const buildingExent = {
  minX: -4762.19066918826,
  minY: -30.08359080145072,
  maxX: 2650,
  maxY: 7850.037195143702,
};

export const xScale = d3
  .scaleLinear()
  .domain([viewExtent.minX, viewExtent.maxX])
  .range([0, width]);

export const yScale = d3
  .scaleLinear()
  .domain([viewExtent.maxY, viewExtent.minY])
  .range([0, height]);

export const BUILDING_TYPES = {
  EMP: "employer",
  // APA: "apartment",
  RES: "restaurant",
  PUB: "pub",
  SCH: "school",
  // SPA: "space",
};

export const opacity = 0.6;
export const dotsCoulors = (type) => {
  switch (type) {
    case "EMP":
      return `rgba(112, 191, 229,${opacity})`;
    case "APA":
      return `rgba(59,119,175,${opacity})`;
    case "RES":
      return `rgba(235,92,47,${opacity})`;
    case "PUB":
      return `rgba(169,76,175,${opacity})`;
    case "SCH":
      return `rgba(100,65,149,${opacity})`;
    case "SPA":
      return `rgba(84,157,63,${opacity})`;
  }
  return "black";
};
