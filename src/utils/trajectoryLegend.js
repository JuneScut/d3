import * as d3 from "d3";

function trajectoryLegend(
  efficiencyColorScale,
  svg,
  className,
  {
    legendWidth = 200,
    legendHeight = 10,
    transformX = 0,
    transformY = 0,
    title = "",
  }
) {
  const gradientId = "efficiency-gradient";
  const legendSvg = svg
    .append("g")
    .attr("class", className)
    .attr("transform", `translate(${transformX}, ${transformY})`);

  legendSvg
    .append("defs")
    .append("linearGradient")
    .attr("id", gradientId)
    .selectAll("stop")
    .data(
      efficiencyColorScale.ticks().map((t, i, n) => ({
        offset: `${(100 * i) / n.length}%`,
        color: efficiencyColorScale(t),
      }))
    )
    .enter()
    .append("stop")
    .attr("offset", (d) => d.offset)
    .attr("stop-color", (d) => d.color);

  legendSvg
    .append("rect")
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", `url(#${gradientId})`);

  const legendScale = d3
    .scaleLinear()
    .domain(efficiencyColorScale.domain())
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale).ticks(5);

  legendSvg
    .append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);

  svg.call((g) =>
    g
      .append("text")
      .attr("x", transformX)
      .attr("y", transformY - legendHeight - 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "start")
      .attr("font-size", "10px")
      .attr("font-weight", "bold")
      .attr("class", className)
      .text(title)
  );
}

export default trajectoryLegend;
