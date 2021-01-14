import * as d3 from 'd3';
import partition from 'lodash/partition';
import createScatterPlot from './scatterPlot';
import createBeeswarm, {
  maxBeeswarmWidth,
  minBeeswarmWidth,
} from './beeswarm';
import {Datum, Dimensions} from './types';

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  // tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  size: Dimensions;
  axisLabels?: {
    left?: string,
    leftUp?: string
    leftDown?: string
    bottomLeft?: string
    bottomRight?: string
  };
  axisMinMax?: {
    minX?: number,
    maxX?: number,
    minY?: number,
    maxY?: number,
  };
  averageLineText?: string;
  quadrantLabels?: {I?: string, II?: string, III?: string, IV?: string, V?: string};
  quadrantBackgroundColors?: {I?: string, II?: string, III?: string, IV?: string, V?: string};
  labelFont?: string;
  zeroAxisLabel?: string;
  axisLabelColor?: string;
  quadrantLabelColor?: string;
  onQuadrantLabelMouseMove?: (quadrant: {id: string, label: string}, coords: {x: number, y: number}) => void;
  onQuadrantLabelMouseLeave?: (quadrant: {id: string, label: string}) => void;
}

export default (input: Input) => {
  const {
    svg, data, size, axisLabels, axisMinMax,
    averageLineText, quadrantLabels, labelFont,
    zeroAxisLabel, axisLabelColor, quadrantLabelColor,
    quadrantBackgroundColors,
    onQuadrantLabelMouseMove, onQuadrantLabelMouseLeave,
  } = input;

  const [scatterplotData, beeswarmData] = partition(data, (d) => d.x > 0);

  const filteredBeeswarmData = beeswarmData.filter(d => d.y > 0);

  const margin = {top: 30, right: 15, bottom: 60, left: 50};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;
  const beeswarmWidth = Math.max(minBeeswarmWidth, Math.min(width * 0.15, maxBeeswarmWidth))
  const scatterplotWidth = width - beeswarmWidth;

  // append the svg object to the body of the page
  svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  svg.append("defs").append("marker")
    .attr("id", "arrowhead")
    .attr("viewBox", "0 -5 10 10")
    .attr("refY", 2)
    .attr("markerWidth", 4)
    .attr("markerHeight", 4)
    .attr("orient", "auto-start-reverse")
  .append("path")
    .attr("d", "M0,0 L4,2 0,4")
    .attr('fill', axisLabelColor ? axisLabelColor : '#333333');

  const scatterplot = svg
    .append('g')
      .attr('transform',
            'translate(' + (margin.left + beeswarmWidth) + ',' + margin.top + ')');

  const beeswarm = svg
    .append('g')
      .attr('transform',
            'translate(' + (margin.left) + ',' + margin.top + ')');

  const allYValues = scatterplotData.map(({y}) => y);

  const rawMinY = axisMinMax && axisMinMax.minY !== undefined ? axisMinMax.minY : d3.min(allYValues);
  const rawMaxY = axisMinMax && axisMinMax.maxY !== undefined ? axisMinMax.maxY : d3.max(allYValues);

  const minX = 0.001;
  const maxX = 256;
  const minY = rawMinY ? Math.floor(rawMinY) : 0;
  const maxY = rawMaxY ? Math.ceil(rawMaxY) : 0;

  const xScale = d3.scaleLog()
    .domain([minX, maxX])
    .range([ 0, scatterplotWidth ])
    .base(2)
    .nice()

  const yScale = d3.scaleLinear()
    .domain([minY, maxY])
    .range([ height, 0]);
  
  // append X axis label
  const bottomLeftClassName = 'pswot-plot-bottom-left-label';
  const bottomRightClassName = 'pswot-plot-bottom-right-label';
  const bottomAxisSpacing = width * 0.015;
  scatterplot
    .append('text')
      .attr('class', bottomLeftClassName)
      .attr('y', height + (margin.top * 1.5))
      .attr('x', xScale(1) - bottomAxisSpacing)
      .attr('fill', axisLabelColor ? axisLabelColor : '#333')
      .style('text-anchor', 'end')
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .style('font-size', `clamp(14px, ${width * 0.015}px, 18px)`)
      .style('font-weight', '600')
      .style('text-transform', 'uppercase')
      .text(axisLabels && axisLabels.bottomLeft ? axisLabels.bottomLeft : '');
  scatterplot
    .append('text')
      .attr('class', bottomRightClassName)
      .attr('y', height + (margin.top * 1.5))
      .attr('x', xScale(1) + bottomAxisSpacing)
      .attr('fill', axisLabelColor ? axisLabelColor : '#333')
      .style('text-anchor', 'start')
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .style('font-size', `clamp(14px, ${width * 0.015}px, 18px)`)
      .style('font-weight', '600')
      .style('text-transform', 'uppercase')
      .text(axisLabels && axisLabels.bottomRight ? axisLabels.bottomRight : '');

  const arrowPadding = 10;
  const bottomLeftNode = d3.select('.' + bottomLeftClassName).node()
  const bottomRightNode = d3.select('.' + bottomRightClassName).node()
  if (bottomLeftNode && bottomRightNode) {
    const start = (bottomLeftNode as any).getBBox().x - arrowPadding;
    const rightLabelBbox = (bottomRightNode as any).getBBox();
    const end = rightLabelBbox.x + rightLabelBbox.width  + arrowPadding;
    scatterplot.append('line')
      .attr('x1',start)
      .attr('x2',end)
      .attr('y1',height + (margin.top * 1.3))
      .attr('y2',height + (margin.top * 1.3))
      .attr('stroke-width', '10px')
      .attr('stroke', 'none')
      .style('pointer-events', 'none')
      .attr("marker-end", "url(#arrowhead)")
      .attr("marker-start", "url(#arrowhead)");
  }

  // append Y axis label
  const leftAxisClassName = 'pswot-plot-left-axis-label';
  const leftAxisLabel = svg
    .append('text')
    .attr('transform', 'rotate(-90)')
      .attr('y', margin.right / 2)
      .attr('x', 0 - (height / 2 + margin.top + margin.bottom))
      .attr('fill', axisLabelColor ? axisLabelColor : '#333')
      .attr('dy', '1.25em')
      .style('text-anchor', 'middle')
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .style('text-transform', 'uppercase')

  leftAxisLabel.append('tspan')
      .attr('dx', arrowPadding * 3)
      .style('font-size', `clamp(10px, ${width * 0.015}px, 14px)`)
      .text(axisLabels && axisLabels.leftDown ? axisLabels.leftDown : '');

  leftAxisLabel.append('tspan')
      .attr('class', leftAxisClassName)
      .style('font-size', `clamp(14px, ${width * 0.015}px, 18px)`)
      .style('font-weight', '600')
      .attr('dx', arrowPadding * 4.5)
      .text(axisLabels && axisLabels.left ? axisLabels.left : '');

  leftAxisLabel.append('tspan')
      .attr('dx', arrowPadding * 4.5)
      .style('font-size', `clamp(10px, ${width * 0.015}px, 14px)`)
      .text(axisLabels && axisLabels.leftUp ? axisLabels.leftUp : '');

  const leftAxisLabelNode = d3.select('.' + leftAxisClassName).node()
  if (leftAxisLabelNode) {
    const bbox = (leftAxisLabelNode as any).getBoundingClientRect();
    const start = bbox.y - arrowPadding - 5;
    const end = bbox.y + bbox.height + arrowPadding + 5;
    svg.append('line')
      .attr('x1',bbox.x + arrowPadding + 2)
      .attr('x2',bbox.x + arrowPadding + 2)
      .attr('y1',start)
      .attr('y2',end)
      .attr('stroke-width', '10px')
      .attr('stroke', 'none')
      .style('pointer-events', 'none')
      .attr("marker-end", "url(#arrowhead)")
      .attr("marker-start", "url(#arrowhead)")
  }

  createBeeswarm({
    container: beeswarm,
    data: [...filteredBeeswarmData],
    size: {width: beeswarmWidth - (margin.right * 2), height},
    xScale, yScale,
    label: quadrantLabels ? quadrantLabels.V : undefined,
    labelFont, maxY,
    zeroAxisLabel,
    margin, axisLabelColor,
    quadrantLabelColor,
    quadrantBackgroundColors,
    onQuadrantLabelMouseMove, onQuadrantLabelMouseLeave,
  });

  createScatterPlot({
    container: scatterplot,
    data: [...scatterplotData],
    size: {width: scatterplotWidth, height},
    margin,
    averageLineText, quadrantLabels, labelFont,
    xScale, yScale,
    axisMinMax: {minX, maxX, minY, maxY}, axisLabelColor,
    quadrantLabelColor,
    quadrantBackgroundColors,
    onQuadrantLabelMouseMove, onQuadrantLabelMouseLeave,
  });


};
