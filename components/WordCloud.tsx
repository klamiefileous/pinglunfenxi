
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Keyword } from '../types';

interface WordCloudProps {
  data: Keyword[];
  color: string;
  title: string;
}

const WordCloud: React.FC<WordCloudProps> = ({ data, color, title }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const width = 400;
    const height = 300;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const simulation = d3.forceSimulation<any>(data)
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 2).strength(0.1))
      .force("collide", d3.forceCollide((d: any) => Math.sqrt(d.value) * 12 + 2));

    const nodes = svg.append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g");

    nodes.append("circle")
      .attr("r", (d) => Math.sqrt(d.value) * 12)
      .attr("fill", color)
      .attr("opacity", 0.15);

    nodes.append("text")
      .text((d) => d.text)
      .attr("text-anchor", "middle")
      .attr("dy", ".35em")
      .attr("font-size", (d) => Math.max(10, Math.sqrt(d.value) * 6))
      .attr("font-weight", "600")
      .attr("fill", color);

    simulation.on("tick", () => {
      nodes.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [data, color]);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4">{title}</h3>
      <svg ref={svgRef} width="100%" height="300" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid meet" />
    </div>
  );
};

export default WordCloud;
