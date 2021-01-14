import * as d3 from 'd3';

export const appendQuadrantLabel =
  (container: d3.Selection<any, unknown, null, undefined>,
   labelFont: string | undefined,
   color: string | undefined
 ) =>
    (xVal: number, yVal: number, textParts: string[], textAnchor: string) => {
      const label = container.append('text')
          .style('text-anchor', textAnchor)
          .style('opacity', 0.8)
          .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
          .style('font-size', 'clamp(12px, 1.75vw, 20px)')
          .style('font-weight', '600')
          .style('text-transform', 'uppercase')
          .style('pointer-events', 'none')
          .style('dominant-baseline', 'bottom')
          .attr('fill', color ? color : '#333')
          .attr('x', xVal)
          .attr('y', yVal);

        label.selectAll('tspan')
          .data(textParts)
          .enter()
          .append('tspan')
          .text(d => {
            const text = d;
            return text !== undefined ? text : '';
          })
          .attr('x', xVal)
          .attr('dx', 0)
          .attr('dy', (_d, i) => i !== 0 ? 15 : 0);
    };
