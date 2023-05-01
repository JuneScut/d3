import * as d3 from "d3";
import { mapExtent, xScale, yScale } from "./constant";

export const genGridLines = () => {
  const gridLines = [];
  for (let x = mapExtent.minX; x <= mapExtent.maxX; x += 200) {
    gridLines.push([
      [x, mapExtent.minY],
      [x, mapExtent.maxY],
    ]);
  }
  for (let y = mapExtent.minY; y <= mapExtent.maxY; y += 200) {
    gridLines.push([
      [mapExtent.minX, y],
      [mapExtent.maxX, y],
    ]);
  }
  return gridLines;
};

export const genXLabels = () => {
  const xLabels = [];
  for (let x = mapExtent.minX; x <= mapExtent.maxX; x += 1000) {
    xLabels.push([
      [x, mapExtent.minY],
      [x, mapExtent.maxY],
    ]);
  }
  return xLabels;
};

export const genYLabels = () => {
  const yLabels = [];
  for (let y = 0; y <= mapExtent.maxY; y += 1000) {
    yLabels.push([
      [mapExtent.minX, y],
      [mapExtent.maxX, y],
    ]);
  }
  return yLabels;
};

export function borderObj(extent) {
  return {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [extent.minX, extent.minY],
          [extent.maxX, extent.minY],
          [extent.maxX, extent.maxY],
          [extent.minX, extent.maxY],
          [extent.minX, extent.minY],
        ],
      ],
    },
  };
}

export const initZoom = (svgId, width, height) => {
  const svg = d3.select(`#${svgId}`);
  if (!svg) {
    return null;
  }
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
  return zoom;
};

// 把地图直线坐标转为屏幕z坐标
export const transfromLinesCord = ([v1, v2]) => {
  return [
    [xScale(v1[0]), yScale(v1[1])],
    [xScale(v2[0]), yScale(v2[1])],
  ];
};

// 把地图点坐标转为屏幕z坐标
export const transformCordinate = ([x, y, type]) => {
  return [xScale(x), yScale(y), type];
};

export const transformFlowCord = ({ x, y, ...rest }) => {
  return {
    x: xScale(x),
    y: yScale(y),
    ...rest,
  };
};
