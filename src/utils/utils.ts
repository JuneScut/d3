import { mapExtent } from "./constant";

export const genGridLines = (): Array<Array<Array<number>>> => {
  const gridLines: Array<Array<Array<number>>> = [];
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

export const genXLabels = (): Array<Array<Array<number>>> => {
  const xLabels: Array<Array<Array<number>>> = [];
  for (let x = mapExtent.minX; x <= mapExtent.maxX; x += 1000) {
    xLabels.push([
      [x, mapExtent.minY],
      [x, mapExtent.maxY],
    ]);
  }
  return xLabels;
};

export const genYLabels = (): Array<Array<Array<number>>> => {
  const yLabels: Array<Array<Array<number>>> = [];
  for (let y = 0; y <= mapExtent.maxY; y += 1000) {
    yLabels.push([
      [mapExtent.minX, y],
      [mapExtent.maxX, y],
    ]);
  }
  return yLabels;
};

export function borderObj(extent: {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}) {
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
