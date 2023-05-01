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
  TRAFFIC: "traffic",
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
      return `rgba(102,102,51,${opacity})`;
    case "SCH":
      return `rgba(100,65,149,${opacity})`;
    case "SPA":
      return `rgba(84,157,63,${opacity})`;
  }
  return "black";
};

export const boundaries = {
  1: [
    [-5000, 8000],
    [-2450, 8000],
    [-2450, 5800],
    [-3000, 5800],
    [-3000, 4500],
    [-5000, 4500],
  ],
  2: [
    [-2450, 6450],
    [600, 6450],
    [600, 4600],
    [-400, 4600],
    [-400, 4000],
    [-2800, 4000],
    [-2800, 5400],
    [-2450, 5400],
  ],
  3: [
    [580, 5500],
    [3000, 5500],
    [3000, 3000],
    [580, 3000],
  ],
  4: [
    [-400, 4600],
    [580, 4600],
    [580, 3200],
    [-750, 3200],
    [-750, 4000],
    [-400, 4000],
  ],
  5: [
    [-2800, 4000],
    [-750, 4000],
    [-750, 2300],
    [-2800, 2300],
  ],
  6: [
    [-2200, 2300],
    [-50, 2300],
    [-50, 500],
    [-2200, 500],
  ],
  7: [
    [-50, 3000],
    [1500, 3000],
    [1500, -50],
    [-50, -50],
  ],
};

export const boundaryTextPosition = {
  1: [-4600, 6000],
  2: [-2000, 5500],
  3: [1000, 5000],
  4: [-200, 3300],
  5: [-1700, 3000],
  6: [-1000, 800],
  7: [500, 200],
};

export const LEGEND = {
  RENTS: "rents-legend",
  JOBS: "jobs-legend",
};

export const rentsDomain = [360, 1500];
export const jobsDomain = [0, 10];
