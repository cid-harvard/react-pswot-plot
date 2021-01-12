import * as d3 from 'd3';
import partition from 'lodash/partition';
import createScatterPlot from './scatterPlot';
import createBeeswarm from './beeswarm';
import {Datum, Dimensions} from './types';

interface Input {
  svg: d3.Selection<any, unknown, null, undefined>;
  // tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  size: Dimensions;
  axisLabels?: {left?: string, bottom?: string};
  axisMinMax?: {
    minX?: number,
    maxX?: number,
    minY?: number,
    maxY?: number,
  };
  averageLineText?: string;
  quadrantLabels?: {I?: string, II?: string, III?: string, IV?: string};
  labelFont?: string;
}

export default (input: Input) => {
  const {
    svg, data, size, axisLabels, axisMinMax,
    averageLineText, quadrantLabels, labelFont,
  } = input;

  const [scatterplotData, beeswarmData] = partition(data, (d) => d.x > 0);

  const filteredBeeswarmData = beeswarmData.filter(d => d.y > 0);

  const margin = {top: 30, right: 30, bottom: 60, left: 60};
  const width = size.width - margin.left - margin.right;
  const height = size.height - margin.bottom - margin.top;
  const beeswarmWidth = width * 0.15;
  const scatterplotWidth = width - beeswarmWidth;

  // append the svg object to the body of the page
  svg
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

  const scatterplot = svg
    .append('g')
      .attr('transform',
            'translate(' + (margin.left + beeswarmWidth) + ',' + margin.top + ')');

  const beeswarm = svg
    .append('g')
      .attr('transform',
            'translate(' + (margin.left) + ',' + margin.top + ')');

  const allYValues = data.map(({y}) => y);

  // const rawMaxX = axisMinMax && axisMinMax.maxX !== undefined ? axisMinMax.maxX : d3.max(allXValues);
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

  createScatterPlot({
    container: scatterplot,
    data: [...scatterplotData],
    size: {width: scatterplotWidth, height},
    axisLabels, margin,
    averageLineText, quadrantLabels, labelFont,
    xScale, yScale,
    axisMinMax: {minX, maxX, minY, maxY}
  });

  createBeeswarm({
    container: beeswarm,
    data: [...filteredBeeswarmData],
    size: {width: beeswarmWidth - margin.right, height},
    xScale, yScale,
  })


};
