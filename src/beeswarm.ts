import * as d3 from 'd3';
import {Datum, Dimensions} from './types';

interface Input {
  container: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  size: Dimensions;
  xScale: d3.ScaleLogarithmic<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
}

interface ForceDatum extends Datum {
  orginalX: number;
  orginalY: number;
}

const createBeeswarm = (input: Input) => {
  const {
    container, size: {width}, yScale,
  } = input;

  const data: ForceDatum[] = input.data.map(d => ({...d, orginalX: d.x, orginalY: d.y}));

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

}

export default createBeeswarm;
