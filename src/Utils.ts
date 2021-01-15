import * as d3 from 'd3';

export const appendQuadrantLabel =
  (container: d3.Selection<any, unknown, null, undefined>,
   labelFont: string | undefined,
   color: string | undefined,
   onMouseMove: undefined | ((quadrant: {id: string, label: string}, coords: {x: number, y: number}) => void),
   onMouseLeave: undefined | ((quadrant: {id: string, label: string}) => void),
 ) =>
    (xVal: number, yVal: number, textParts: string[], textAnchor: string, id: string) => {
      const label = container.append('text')
          .style('text-anchor', textAnchor)
          .style('opacity', 0.8)
          .style('font-family', labelFont ? labelFont : "'Source Sans Pro',sans-serif")
          .style('font-size', 'clamp(12px, 1.65vw, 18px)')
          .style('font-weight', '600')
          .style('text-transform', 'uppercase')
          .style('dominant-baseline', 'bottom')
          .attr('fill', color ? color : '#333')
          .attr('x', xVal)
          .attr('y', yVal)
          .on('mousemove', () => {
            if (onMouseMove) {
              onMouseMove({id, label: textParts.join(' ')}, {x: (d3 as any).event.pageX, y: (d3 as any).event.pageY})
            }
          })
          .on('mouseleave', () => {
            if (onMouseLeave) {
              onMouseLeave({id, label: textParts.join(' ')})
            }
          })

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
