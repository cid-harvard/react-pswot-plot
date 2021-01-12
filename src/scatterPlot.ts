import * as d3 from 'd3';
import {Datum, Dimensions} from './types';
import {appendQuadrantLabel} from './Utils';

interface Input {
  container: d3.Selection<any, unknown, null, undefined>;
  // tooltip: d3.Selection<any, unknown, null, undefined>;
  data: Datum[];
  size: Dimensions;
  xScale: d3.ScaleLogarithmic<number, number, never>;
  yScale: d3.ScaleLinear<number, number, never>;
  axisLabels?: {left?: string, bottom?: string};
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
  labelFont?: string;
}

const createScatterPlot = (input: Input) => {
  const {
    container, axisLabels, size: {width, height},
    averageLineText, quadrantLabels, labelFont, margin, data, xScale, yScale,
    axisMinMax: {minX, maxX, minY, maxY},
  } = input;

  // Add X axis
  const xAxis = container.append('g')
    .attr('transform', 'translate(0,' + height + ')')
    .call(
      d3.axisBottom(xScale)
        .ticks(10)
        .tickFormat(t => parseFloat((t as number).toFixed(3)) as any)
    )
    xAxis.select('path')
      .attr('stroke', 'none')
    xAxis.selectAll('.tick line')
      .attr('stroke', 'none')
    xAxis.selectAll('text')
      .style('opacity', '0.75')
      .style('font-size', 'clamp(7px, 1.25vw, 12px)')



  // Add Y axis
  // container.append('g')
  //   .call(d3.axisLeft(yScale));

  // gridlines in x axis function
  const makeGridlinesX: any = () => d3.axisBottom(xScale).ticks(10);


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
      .style('opacity', 0.8)
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .style('font-size', 'clamp(12px, 1.5vw, 16px)')
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(averageLineText);

  }

  if (quadrantLabels !== undefined) {
    const getLabel = appendQuadrantLabel(container, labelFont);
    if (quadrantLabels.I !== undefined) {
      const xVal = width - 4;
      const yVal = yScale(maxY) + 20;
      const textParts = (quadrantLabels.I as string).split('\n');
      getLabel(xVal, yVal, textParts, 'end');
    }
    if (quadrantLabels.II !== undefined) {
      const xVal = xScale(minX) + 4;
      const yVal = yScale(maxY) + 20;
      const textParts = (quadrantLabels.II as string).split('\n');
      getLabel(xVal, yVal, textParts, 'start');
    }
    if (quadrantLabels.III !== undefined) {
      const textParts = (quadrantLabels.III as string).split('\n');
      const xVal = xScale(minX) + 4;
      const yVal = yScale(minY) - ((textParts.length - 1) * 15) - 6;
      getLabel(xVal, yVal, textParts, 'start');
    }
    if (quadrantLabels.IV !== undefined) {
      const textParts = (quadrantLabels.IV as string).split('\n');
      const xVal = width - 4;
      const yVal = yScale(minY) - ((textParts.length - 1) * 15) - 6;
      getLabel(xVal, yVal, textParts, 'end');
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
      .attr('r', ({radius}) => radius ? radius : 4)
      .style('fill', ({fill}) => fill ? fill : '#69b3a2')
      .style('cursor', ({onClick}) => onClick ? 'pointer' : 'default')
      // .on('mousemove', ({label, tooltipContent, tooltipContentOnly}) => {
      //   if (tooltipContentOnly && tooltipContent && tooltipContent.length) {
      //     tooltip.html(tooltipContent);
      //   } else {
      //     const content = tooltipContent === undefined || tooltipContent.length === 0
      //       ? '' : `:<br />${tooltipContent}`;
      //     tooltip.html(`<strong>${label}</strong>${content}`);

      //   }
      //   tooltip
      //     .style('display', 'block')
      //     .style('left', (d3.event.pageX + 4) + 'px')
      //     .style('top', (d3.event.pageY - 4) + 'px');
      //   })
      // .on('mouseout', () => {
      //   tooltip
      //       .style('display', 'none');
      // })
      .on('click', ({onClick}) => onClick ? onClick() : undefined);

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
        .attr('r', 16)
        .style('fill', ({fill}) => fill ? fill : '#69b3a2')
        .style('opacity', '0.4')
        .style('pointer-events', 'none');
    // Add highlighted dot over to top
    container.append('g')
      .selectAll('dot')
      .data([highlighted])
      .enter()
      .append('circle')
        .attr('cx', ({x}) => xScale(x))
        .attr('cy', ({y}) => yScale(y))
        .attr('r', ({radius}) => radius ? radius : 4)
        .style('fill', ({fill}) => fill ? fill : '#69b3a2')
        .style('cursor', ({onClick}) => onClick ? 'pointer' : 'default')
        // .on('mousemove', ({label, tooltipContent, tooltipContentOnly}) => {
        //   if (tooltipContentOnly && tooltipContent && tooltipContent.length) {
        //     tooltip.html(tooltipContent);
        //   } else {
        //     const content = tooltipContent === undefined || tooltipContent.length === 0
        //       ? '' : `:<br />${tooltipContent}`;
        //     tooltip.html(`<strong>${label}</strong>${content}`);

        //   }
        //   tooltip
        //     .style('display', 'block')
        //     .style('left', (d3.event.pageX + 4) + 'px')
        //     .style('top', (d3.event.pageY - 4) + 'px');
        //   })
        // .on('mouseout', () => {
        //   tooltip
        //       .style('display', 'none');
        // });
  }


  // append X axis label
  container
    .append('text')
    .attr('transform', `translate(${width / 2 + margin.left}, ${height + margin.bottom + (margin.top / 2)})`)
      .style('text-anchor', 'middle')
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .text(axisLabels && axisLabels.bottom ? axisLabels.bottom : '');

  // append Y axis label
  container
    .append('text')
    .attr('transform', 'rotate(-90)')
      .attr('y', margin.right / 2)
      .attr('x', 0 - (height / 2 + margin.top))
      .attr('dy', '0.75em')
      .style('text-anchor', 'middle')
      .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
      .text(axisLabels && axisLabels.left ? axisLabels.left : '');
}

export default createScatterPlot;
