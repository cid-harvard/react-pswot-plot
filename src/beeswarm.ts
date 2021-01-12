import * as d3 from 'd3';
import {Datum, Dimensions} from './types';
import {appendQuadrantLabel} from './Utils';

interface Input {
  container: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  size: Dimensions;
  xScale: d3.ScaleLogarithmic<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
  label: string | undefined;
  zeroAxisLabel: string | undefined;
  labelFont: string | undefined;
  maxY: number;
  margin: {
    top: number,
    right: number,
    bottom: number,
    left: number,
  }
  axisLabelColor: string | undefined;
  quadrantLabelColor: string | undefined;
}

interface ForceDatum extends Datum {
  orginalX: number;
  orginalY: number;
}

const createBeeswarm = (input: Input) => {
  const {
    container, size: {width, height}, yScale, label, labelFont, maxY, zeroAxisLabel,
    margin, axisLabelColor, quadrantLabelColor,
  } = input;

  const data: ForceDatum[] = input.data.map(d => ({...d, orginalX: d.x, orginalY: d.y}));


  const makeGridlinesY: any = () => d3.axisLeft(yScale).ticks(10);
  // add the Y gridlines
  container.append('g')
      .attr('class', 'grid')
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesY()
          .tickSize(-width)
          .tickFormat(''),
      );
  container.append('line')
    .attr('x1', width)
    .attr('x2', width)
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', '#333')
    .style('pointer-events', 'none')
    .style('opacity', '0.25')
    .style('stroke-dasharray', '3 1')
  if (zeroAxisLabel !== undefined) {
    container.append('text')
      .attr('x', 0)
      .attr('y', height + (margin.top * 1.5))
      .attr('fill', axisLabelColor ? axisLabelColor : '#333')
      .style('opacity', 0.8)
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .style('font-size', 'clamp(12px, 1.5vw, 16px)')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(zeroAxisLabel);
  }

  const simulation = d3.forceSimulation(data)
      .force('x', d3.forceX(width / 2).strength(1))
      .force("y", d3.forceY(d => yScale(d.y ? d.y + 0 : 0 )))
      .force("collide", d3.forceCollide(6.5))
      .stop();

  for (let i = 0; i < 120; ++i) simulation.tick();

  container
    .selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
      .attr('r', ({radius}) => radius ? radius : 4)
      .style("fill", "#69b3a2")
      .attr("cx", d => d.x)
      .attr("cy", d => yScale(d.orginalY));

  if (label !== undefined) {
    const getLabel = appendQuadrantLabel(container, labelFont, quadrantLabelColor);

    const textParts = (label as string).split('\n');
    const xVal = width / 2;
    const yVal = yScale(maxY) + 20;
    getLabel(xVal, yVal, textParts, 'middle');
  }

}

export default createBeeswarm;
