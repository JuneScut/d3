import { useEffect } from "react";
import PropTypes from "prop-types";
import * as d3 from "d3";

BarGraph.protoTypes = {
  title: PropTypes.string.isRequired,
  avgRent: PropTypes.array.isRequired,
};

// eslint-disable-next-line react/prop-types
function BarGraph({ containerId, title, color, avgRent = [] }) {
  const margin = { left: 30, bottom: 30, right: 10, top: 10 };
  const width = 340 - margin.left - margin.right;
  const height = 340 - margin.top - margin.bottom;
  const xScale = d3
    .scaleBand()
    .range([0, width])
    .domain(avgRent.map((d) => d.name))
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(avgRent, (d) => d.value)]);

  function update(data) {
    const chart = d3.select(`g.${containerId}-chart`);
    const bars = chart.selectAll(".bar").data(data, (d) => d.name);

    bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.name))
      .attr("y", () => yScale(0))
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .merge(bars)
      .transition()
      .duration(1000)
      .attr("x", (d) => xScale(d.name))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => height - yScale(d.value))
      .attr("fill", color);

    bars.exit().remove();
  }

  useEffect(() => {
    const container = d3.select(`#${containerId}`);
    const svgDom = document.getElementById(`${containerId}-svg`);
    if (!svgDom) {
      const svg = container
        .append("svg")
        .attr("id", `${containerId}-svg`)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.left + margin.right);
      // .attr("transform", `translate(${margin.left},${margin.top})`);

      const chart = svg
        .append("g")
        .attr("class", `${containerId}-chart`)
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // 绘制 X 轴和 Y 轴
      const xAxis = d3
        .axisBottom()
        .scale(xScale)
        .tickFormat((d) => d);
      chart
        .append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
      const yAxis = d3
        .axisLeft()
        .scale(yScale)
        .tickFormat((d) => d);
      chart.append("g").attr("class", "y-axis").call(yAxis);
    }
    update(avgRent);
  }, []);
  return (
    <div
      id={containerId}
      style={{
        width: "350px",
        height: "350px",
      }}
    >
      <h4
        style={{
          textAlign: "center",
        }}
      >
        {title}
      </h4>
    </div>
  );
}

export default BarGraph;
