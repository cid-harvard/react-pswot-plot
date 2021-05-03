import * as d3 from 'd3';
import partition from 'lodash/partition';
import createScatterPlot from './scatterPlot';
import createBeeswarm, {
  maxBeeswarmWidth,
  minBeeswarmWidth,
} from './beeswarm';
import {Datum, Dimensions} from './types';

const minExpectedScreenSize = 820;

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  // tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  size: Dimensions;
  axisLabels?: {
    left?: string,
    leftUp?: string
    leftDown?: string
    bottom?: string
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

  const margin = {top: 30, right: 15, bottom: 60, left: 50};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;
  const beeswarmWidth = Math.max(minBeeswarmWidth, Math.min(width * 0.19, maxBeeswarmWidth))
  const scatterplotWidth = width - beeswarmWidth;

  const smallerSize = width < height ? width : height;
  const radiusAdjuster = (radius: number) => (smallerSize / minExpectedScreenSize) * radius;

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

  const allXValues = scatterplotData.map(({x}) => x);

  let minX = axisMinMax && axisMinMax.minX !== undefined ? axisMinMax.minX : d3.min(allXValues) as number;
  let maxX = axisMinMax && axisMinMax.maxX !== undefined ? axisMinMax.maxX : d3.max(allXValues) as number;


  const tickMarksForMinMax = (min: number, max: number) => {
    const digits = min.toString().length + max.toString().length;
    return digits - 3;
  }

  if (maxX < 100 || isNaN(maxX)) {
    maxX = 100;
  }
  if (minX >= 0.01 || isNaN(minX)) {
    minX = 0.01;
  }
  const xScale = d3.scaleLog()
    .domain([minX, maxX])
    .range([ 0, scatterplotWidth ])
    .nice();
  const numberOfXAxisTicks = tickMarksForMinMax(
    parseFloat(xScale.invert(0).toFixed(5)),
    parseFloat(xScale.invert(scatterplotWidth).toFixed(5))
  );
  minX = xScale.invert(0);
  maxX = xScale.invert(scatterplotWidth);

  const allYValues = [...scatterplotData, ...beeswarmData].map(({y}) => y);

  const rawMinY = axisMinMax && axisMinMax.minY !== undefined ? axisMinMax.minY : d3.min(allYValues);
  const rawMaxY = axisMinMax && axisMinMax.maxY !== undefined ? axisMinMax.maxY : d3.max(allYValues);

  let minY = rawMinY && !isNaN(rawMinY) ? Math.floor(rawMinY) : -1;
  let maxY = rawMaxY && !isNaN(rawMaxY) ? Math.ceil(rawMaxY) : 1;

  const largerAbsY = Math.abs(minY) > Math.abs(maxY) ? Math.abs(minY) : Math.abs(maxY);
  if (Math.abs(maxY) < largerAbsY / 2) {
    maxY = largerAbsY / 2;
  }
  if (Math.abs(minY) < largerAbsY / 2) {
    minY = largerAbsY / -2;
  }

  const yScale = d3.scaleLinear()
    .domain([minY, maxY])
    .range([ height, 0]);
  
  // append X axis label
  const bottomClassName = 'pswot-plot-bottom-label';
  const axistFontSize = `clamp(0.75rem, ${width * 0.015}px, 1rem)`;
  const axisSmallTextFontSize = `clamp(0.75rem, ${width * 0.015}px, 0.875rem)`;
  const arrowRight = ' →';
  const arrowLeft = '← ';
  const arrowPadding = width > 600 ? 5 : 1;

  const bottomAxisLabel = scatterplot
    .append('text')
      .attr('y', height + (margin.top * 1.5))
      .attr('x', width > 400 ? xScale(1) : 0)
      .attr('fill', axisLabelColor ? axisLabelColor : '#333')
      .style('text-anchor', 'middle')
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .style('font-size', axistFontSize)
      .style('text-transform', 'uppercase')

  bottomAxisLabel.append('tspan')
      .attr('dx', arrowPadding * 3)
      .style('font-size', axisSmallTextFontSize)
      .text(axisLabels && axisLabels.bottomLeft ? axisLabels.bottomLeft : '');

  bottomAxisLabel.append('tspan')
      .attr('class', bottomClassName)
      .style('font-size', axistFontSize)
      .style('font-weight', '600')
      .attr('dx', arrowPadding * 4.5)
      .text(axisLabels && axisLabels.bottom ? arrowLeft + axisLabels.bottom + arrowRight : '');

  bottomAxisLabel.append('tspan')
      .attr('dx', arrowPadding * 4.5)
      .style('font-size', axisSmallTextFontSize)
      .text(axisLabels && axisLabels.bottomRight ? axisLabels.bottomRight : '');

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
      .style('font-size', axisSmallTextFontSize)
      .text(axisLabels && axisLabels.leftDown ? axisLabels.leftDown : '');

  leftAxisLabel.append('tspan')
      .attr('class', leftAxisClassName)
      .style('font-size', axistFontSize)
      .style('font-weight', '600')
      .attr('dx', arrowPadding * 4.5)
      .text(axisLabels && axisLabels.left ? arrowLeft + axisLabels.left + arrowRight : '');

  leftAxisLabel.append('tspan')
      .attr('dx', arrowPadding * 4.5)
      .style('font-size', axisSmallTextFontSize)
      .text(axisLabels && axisLabels.leftUp ? axisLabels.leftUp : '');

  createBeeswarm({
    container: beeswarm,
    data: [...beeswarmData],
    size: {width: beeswarmWidth - margin.right, height},
    xScale, yScale,
    label: quadrantLabels ? quadrantLabels.V : undefined,
    labelFont, maxY,
    zeroAxisLabel,
    margin, axisLabelColor,
    quadrantLabelColor,
    quadrantBackgroundColors,
    onQuadrantLabelMouseMove, onQuadrantLabelMouseLeave,
    chartWidth: width,
    radiusAdjuster,
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
    chartWidth: width,
    radiusAdjuster,
    numberOfXAxisTicks,
  });
};
