// AnimatedBarChart.js
import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const AnimatedBarChart = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Set up dimensions
    const width = 800;
    const height = 500;
    const margin = { top: 50, right: 30, bottom: 30, left: 100 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    // Create scales
    const xScale = d3.scaleLinear().range([margin.left, width - margin.right]);
    const yScale = d3
      .scaleBand()
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    // Create axes
    const xAxis = (g) =>
      g
        .attr("transform", `translate(0,${margin.top})`)
        .call(d3.axisTop(xScale).ticks(width / 80, "s"));

    const yAxis = (g) =>
      g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickSizeOuter(0));

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    let currentYear = 1950;

    const updateChart = () => {
      // Filter data for current year
      const yearData = data.map((d) => ({
        country: d.country,
        population: d.population[currentYear - 1950],
      }));

      // Update scales
      xScale.domain([0, d3.max(yearData, (d) => d.population)]);
      yScale.domain(yearData.map((d) => d.country));

      svg.selectAll(".x-axis").transition().duration(500).call(xAxis);
      svg.selectAll(".y-axis").transition().duration(500).call(yAxis);

      // Bind data to rectangles
      const bars = svg.selectAll(".bar").data(yearData, (d) => d.country);

      bars
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", xScale(0))
        .attr("y", (d) => yScale(d.country))
        .attr("width", (d) => xScale(d.population) - xScale(0))
        .attr("height", yScale.bandwidth())
        .style("fill", "#69b3a2")
        .merge(bars)
        .transition()
        .duration(500)
        .attr("y", (d) => yScale(d.country))
        .attr("width", (d) => xScale(d.population) - xScale(0));

      bars.exit().remove();

      // Update year
      currentYear++;
      if (currentYear > 2021) currentYear = 1950;
    };

    // Start animation loop
    const interval = d3.interval(updateChart, 1000);

    // Clean up interval on component unmount
    return () => {
      interval.stop();
    };
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default AnimatedBarChart;
