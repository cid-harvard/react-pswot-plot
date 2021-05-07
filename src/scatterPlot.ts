import * as d3 from 'd3';
import {Datum, Dimensions} from './types';
import {appendQuadrantLabel} from './Utils';

function gcd(a: number, b: number): number {
  return (b) ? gcd(b, a % b) : a;
}

const decimalToFraction = function (decimal: number) {
  let top: number | string    = decimal.toString().replace(/\d+[.]/, '');
  const bottom: number  = Math.pow(10, top.length);
  if (decimal > 1) {
    top  = +top + Math.floor(decimal) * bottom;
  }
  const x = gcd(top as number, bottom);
  return {
    top    : (top as number / x),
    bottom  : (bottom / x),
    display  : (top as number / x) + ':' + (bottom / x)
  };
};


const formatTicks = (value: number) => {
  const scaledValue = parseFloat(value.toFixed(6));
  if (scaledValue >= 1) {
    return scaledValue + '×';
  } else {
    const {top, bottom} = decimalToFraction(scaledValue);
    return `
      <tspan
        style="baseline-shift: super;font-size:smaller;"
      >${top}</tspan>⁄<tspan
        style="baseline-shift: sub;font-size:smaller;"
      >${bottom}</tspan><tspan style="baseline-shift: sub;">×</tspan>
    `;
  }
}


interface Input {
  container: d3.Selection<any, unknown, null, undefined>;
  // tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  size: Dimensions;
  chartWidth: number,
  xScale: d3.ScaleLogarithmic<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
  margin: {
    top: number,
    right: number,
    bottom: number,
    left: number,
  }
  axisMinMax: {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number,
  };
  averageLineText?: string;
  quadrantLabels?: {I?: string, II?: string, III?: string, IV?: string};
  quadrantBackgroundColors?: {I?: string, II?: string, III?: string, IV?: string};
  labelFont?: string;
  axisLabelColor: string | undefined;
  quadrantLabelColor: string | undefined;
  onQuadrantLabelMouseMove: undefined | ((quadrant: {id: string, label: string}, coords: {x: number, y: number}) => void);
  onQuadrantLabelMouseLeave: undefined | ((quadrant: {id: string, label: string}) => void);
  radiusAdjuster: (val: number) => number,
  numberOfXAxisTicks: number,
}

const createScatterPlot = (input: Input) => {
  const {
    container, size: {width, height},
    averageLineText, quadrantLabels, labelFont, margin, data, xScale, yScale,
    axisMinMax: {minX, maxX, minY, maxY}, axisLabelColor, quadrantLabelColor,
    quadrantBackgroundColors, onQuadrantLabelMouseLeave, onQuadrantLabelMouseMove,
    chartWidth, radiusAdjuster, numberOfXAxisTicks,
  } = input;

  if (quadrantBackgroundColors) {
    // Add background colors
     container
        .append("rect")
        .attr("x", xScale(1))
        .attr("y", 0)
        .attr("width", xScale(maxX) - xScale(1))
        .attr("height", yScale(0))
        .attr("fill",  quadrantBackgroundColors.I ? quadrantBackgroundColors.I : '#fff')
     container
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", xScale(1))
        .attr("height", yScale(0))
        .attr("fill",  quadrantBackgroundColors.II ? quadrantBackgroundColors.II : '#fff')
     container
        .append("rect")
        .attr("x", 0)
        .attr("y", yScale(0))
        .attr("width", xScale(1))
        .attr("height", yScale(minY) - yScale(0))
        .attr("fill",  quadrantBackgroundColors.III ? quadrantBackgroundColors.III : '#fff')
     container
        .append("rect")
        .attr("x", xScale(1))
        .attr("y", yScale(0))
        .attr("width", xScale(maxX) - xScale(1))
        .attr("height", yScale(minY) - yScale(0))
        .attr("fill",  quadrantBackgroundColors.IV ? quadrantBackgroundColors.IV : '#fff')
  }

  // Add X axis
  const xAxis = container.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3.axisBottom(xScale)
        .ticks(numberOfXAxisTicks)
        .tickFormat(t => formatTicks(t as number) as any)
    )
    xAxis.select('path')
      .attr('stroke', 'none')
    xAxis.selectAll('.tick line')
      .attr('stroke', 'none')
    xAxis.selectAll('text')
      .attr('fill', axisLabelColor ? axisLabelColor : '#333')
      .style('opacity', chartWidth < 300 ? 0 : 0.75)
      .style('font-size', `clamp(7px, ${chartWidth * 0.0175}px, 12px)`)
      .html(d => formatTicks(d as number))

  // gridlines in x axis function
  const makeGridlinesX: any = () => d3.axisBottom(xScale).ticks(numberOfXAxisTicks);


  // gridlines in y axis function
  const makeGridlinesY: any = () => d3.axisLeft(yScale).ticks(10);

  // add the X gridlines
  container.append('g')
      .attr('class', 'grid')
      .attr('transform', 'translate(0,' + height + ')')
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesX()
          .tickSize(-height)
          .tickFormat(''),
      );

  // add the Y gridlines
  container.append('g')
      .attr('class', 'grid')
      .style('opacity', '0.25')
      .style('stroke-dasharray', '3 1')
      .call(makeGridlinesY()
          .tickSize(-width)
          .tickFormat(''),
      );

  // add quadrant lines
  container.append('line')
    .attr('x1',xScale(minX))
    .attr('x2',xScale(maxX))
    .attr('y1',yScale(0))
    .attr('y2',yScale(0))
    .attr('stroke-width', '2px')
    .style('pointer-events', 'none')
    .attr('stroke', '#333');
  container.append('line')
    .attr('x1',xScale(1))
    .attr('x2',xScale(1))
    .attr('y1',yScale(minY))
    .attr('y2',0 - margin.top)
    .attr('stroke-width', '2px')
    .style('pointer-events', 'none')
    .attr('stroke', '#333');

  if (averageLineText) {
    container.append('text')
      .attr('x',xScale(1) + 4)
      .attr('y',-10)
      .attr('fill', axisLabelColor ? axisLabelColor : '#333')
      .style('opacity', 0.8)
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .style('font-size', `clamp(9px, ${chartWidth * 0.0155}px, 15px)`)
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(averageLineText);

  }

  if (quadrantLabels !== undefined) {
    const getLabel = appendQuadrantLabel(
      container,
      labelFont,
      `clamp(8px, ${chartWidth * 0.025}px, 16px)`,
      quadrantLabelColor,
      onQuadrantLabelMouseMove,
      onQuadrantLabelMouseLeave,
    );
    if (quadrantLabels.I !== undefined) {
      const xVal = width - 4;
      const yVal = yScale(maxY) + 20;
      const textParts = (quadrantLabels.I as string).split('\n');
      getLabel(xVal, yVal, textParts, 'end', 'I');
    }
    if (quadrantLabels.II !== undefined) {
      const xVal = xScale(minX) + 4;
      const yVal = yScale(maxY) + 20;
      const textParts = (quadrantLabels.II as string).split('\n');
      getLabel(xVal, yVal, textParts, 'start', 'II');
    }
    if (quadrantLabels.III !== undefined) {
      const textParts = (quadrantLabels.III as string).split('\n');
      const xVal = xScale(minX) + 4;
      const yVal = yScale(minY) - ((textParts.length - 1) * 15) - 6;
      getLabel(xVal, yVal, textParts, 'start', 'III');
    }
    if (quadrantLabels.IV !== undefined) {
      const textParts = (quadrantLabels.IV as string).split('\n');
      const xVal = width - 4;
      const yVal = yScale(minY) - ((textParts.length - 1) * 15) - 6;
      getLabel(xVal, yVal, textParts, 'end', 'IV');
    }
  }

  // Add dots
  container.append('g')
    .selectAll('dot')
    .data(data)
    .enter()
    .append('circle')
      .attr('cx', ({x}) => xScale(x))
      .attr('cy', ({y}) => yScale(y))
      .attr('r', ({radius}) => radiusAdjuster(radius ? radius : 4))
      .style('fill', ({fill}) => fill ? fill : '#69b3a2')
      .style('stroke', ({stroke}) => stroke ? stroke : '#333')
      .style('stroke-width', '0.5px')
      .style('opacity', ({faded}) => faded ? 0.1 : 1)
      .style('cursor', ({onClick}) => onClick ? 'pointer' : 'default')
      .on('mouseover', onMouseEnter)
      .on('mousemove', d => {
          if (d.onMouseMove) {
            d.onMouseMove(d, {x: (d3 as any).event.pageX, y: (d3 as any).event.pageY})
          }
        })
      .on('mouseout', d => {
        onMouseLeave();
        if (d.onMouseLeave) {
          d.onMouseLeave(d)
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

  function onMouseEnter(d: Datum) {
    hoveredBackground
      .attr('cx', xScale(d.x))
      .attr('cy', yScale(d.y))
      .attr('r', radiusAdjuster(d.radius ? d.radius * 4 : 16))
      .style('fill', d.fill ? d.fill : '#69b3a2')
      .style('opacity', '0.2')

    hoveredForeground
      .attr('cx', xScale(d.x))
      .attr('cy', yScale(d.y))
      .attr('r', radiusAdjuster(d.radius ? d.radius : 4))
      .style('fill', d.fill ? d.fill : '#69b3a2')
      .style('stroke', d.stroke ? d.stroke : '#333')
      .style('stroke-width', '0.5px')
  }

  const onMouseLeave = () => {
    hoveredBackground.style('fill', 'none');
    hoveredForeground
      .style('fill', 'none')
      .style('stroke', 'none')
  }

  const highlighted = data.find(d => d.highlighted);
  if (highlighted) {
    // Add highlighted dot background
    container.append('g')
      .selectAll('dot')
      .data([highlighted])
      .enter()
      .append('circle')
        .attr('cx', ({x}) => xScale(x))
        .attr('cy', ({y}) => yScale(y))
        .attr('r', ({radius}) => radiusAdjuster(radius ? radius * 4 : 16))
        .style('fill', ({fill}) => fill ? fill : '#69b3a2')
        .style('opacity', '0.2')
        .style('pointer-events', 'none');
    // Add highlighted dot over to top
    container.append('g')
      .selectAll('dot')
      .data([highlighted])
      .enter()
      .append('circle')
        .attr('cx', ({x}) => xScale(x))
        .attr('cy', ({y}) => yScale(y))
        .attr('r', ({radius}) => radiusAdjuster(radius ? radius : 4))
        .style('fill', ({fill}) => fill ? fill : '#69b3a2')
        .style('stroke', ({stroke}) => stroke ? stroke : '#333')
        .style('stroke-width', '0.5px')
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
}

export default createScatterPlot;
