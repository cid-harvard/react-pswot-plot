import * as d3 from 'd3';
import {Datum, Dimensions} from './types';
import {appendQuadrantLabel} from './Utils';

export const maxBeeswarmWidth = 180;
export const minBeeswarmWidth = 110;

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
  quadrantBackgroundColors?: {V?: string};
  onQuadrantLabelMouseMove: undefined | ((quadrant: {id: string, label: string}, coords: {x: number, y: number}) => void);
  onQuadrantLabelMouseLeave: undefined | ((quadrant: {id: string, label: string}) => void);
}

interface ForceDatum extends Datum {
  orginalX: number;
  orginalY: number;
}

const createBeeswarm = (input: Input) => {
  const {
    container, size: {width, height}, yScale, label, labelFont, maxY, zeroAxisLabel,
    margin, axisLabelColor, quadrantLabelColor, quadrantBackgroundColors,
    onQuadrantLabelMouseMove, onQuadrantLabelMouseLeave,
  } = input;

  const data: ForceDatum[] = input.data.map(d => ({...d, orginalX: d.x, orginalY: d.y}));

  if (quadrantBackgroundColors) {
    // Add background colors
     container
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", yScale(0))
        .attr("fill",  quadrantBackgroundColors.V ? quadrantBackgroundColors.V : '#fff')
  }


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
      .style('font-size', 'clamp(12px, 1vw, 16px)')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(zeroAxisLabel);
  }

  const multiplier = 1 - ((maxBeeswarmWidth - (width + 30)) / (maxBeeswarmWidth - minBeeswarmWidth));
  const force = 7 * (1 + multiplier);

  const simulation = d3.forceSimulation(data)
      .force('x', d3.forceX(width / 2).strength(1))
      .force("y", d3.forceY(d => yScale(d.y ? d.y + 0 : 0 )))
      .force("collide", d3.forceCollide(force))
      .stop();

  for (let i = 0; i < 120; ++i) simulation.tick();

  container
    .selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
      .attr('r', ({radius}) => radius ? radius : 4)
      .style('fill', ({fill}) => fill ? fill : '#69b3a2')
      .attr("cx", d => d.x)
      .attr("cy", d => yScale(d.orginalY))
      .style('opacity', ({faded}) => faded ? 0.25 : 1)
      .on('mouseover', onMouseEnter)
      .on('mousemove', d => {
          if (d.onMouseMove) {
            d.onMouseMove(
              {...d, x: d.orginalX},
              {x: (d3 as any).event.pageX, y: (d3 as any).event.pageY}
            )
          }
        })
      .on('mouseout', d => {
        onMouseLeave();
        if (d.onMouseLeave) {
          d.onMouseLeave({...d, x: d.orginalX})
        }
      })
      .on('click', d => d.onClick ? d.onClick(d) : undefined);

  const hoveredBackground = container
    .append('circle')
      .style('pointer-events', 'none')
      .style('fill', 'none');

  const hoveredForeground = container
    .append('circle')
      .style('pointer-events', 'none')
      .style('fill', 'none');

  function onMouseEnter(d: ForceDatum) {
    hoveredBackground
      .attr('cx', d.x)
      .attr("cy", yScale(d.orginalY))
      .attr('r', d.radius ? d.radius * 4 : 16)
      .style('fill', d.fill ? d.fill : '#69b3a2')
      .style('opacity', '0.2')

    hoveredForeground
      .attr('cx', d.x)
      .attr("cy", yScale(d.orginalY))
      .attr('r', d.radius ? d.radius : 4)
      .style('fill', d.fill ? d.fill : '#69b3a2')
  }

  const onMouseLeave = () => {
    hoveredBackground.style('fill', 'none');
    hoveredForeground.style('fill', 'none');
  }

  const highlighted = data.find(d => d.highlighted);
    if (highlighted) {
      // Add highlighted dot background
      container.append('g')
        .selectAll('dot')
        .data([highlighted])
        .enter()
        .append('circle')
          .attr("cx", d => d.x)
          .attr("cy", d => yScale(d.orginalY))
          .attr('r', ({radius}) => radius ? radius * 4 : 16)
          .style('fill', ({fill}) => fill ? fill : '#69b3a2')
          .style('opacity', '0.4')
          .style('pointer-events', 'none');
      // Add highlighted dot over to top
      container.append('g')
        .selectAll('dot')
        .data([highlighted])
        .enter()
        .append('circle')
          .attr("cx", d => d.x)
          .attr("cy", d => yScale(d.orginalY))
          .attr('r', ({radius}) => radius ? radius : 4)
          .style('fill', ({fill}) => fill ? fill : '#69b3a2')
          .style('cursor', ({onClick}) => onClick ? 'pointer' : 'default')
          .on('mousemove', d => {
            if (d.onMouseMove) {
              d.onMouseMove(d, {x: (d3 as any).event.pageX, y: (d3 as any).event.pageY})
            }
          })
          .on('mouseout', d => {
            if (d.onMouseLeave) {
              d.onMouseLeave(d)
            }
          })
          .on('click', d => d.onClick ? d.onClick(d) : undefined);
    }

  if (label !== undefined) {
    const getLabel = appendQuadrantLabel(
      container,
      labelFont,
      quadrantLabelColor,
      onQuadrantLabelMouseMove,
      onQuadrantLabelMouseLeave,
    );

    const textParts = (label as string).split('\n');
    const xVal = width / 2;
    const yVal = yScale(maxY) + 20;
    getLabel(xVal, yVal, textParts, 'middle', 'V');
  }

}

export default createBeeswarm;
