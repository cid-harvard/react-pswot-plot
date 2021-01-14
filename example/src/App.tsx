import React, {useRef, useCallback} from 'react'
import PSwotPlot, {Datum} from 'react-pswot-plot'
import RawData from './data/hefei_employees.json';
import styled from 'styled-components';
import {getStandardTooltip, RapidTooltipRoot} from './rapidTooltip';

const Root = styled.div`
  width: 100vw;
  height: 100vh;
`;

const App = () => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);


  const setHovered = (datum: Datum, coords: {x: number, y: number}) => {
    const node = tooltipRef.current;
    if (node) {
      node.innerHTML = getStandardTooltip({
        title: datum.label,
        color: datum.fill ? datum.fill : 'gray',
        rows: [
          ['Code', datum.label ],
        ],
        boldColumns: [2],
      });
      node.style.top = coords.y + 'px';
      node.style.left = coords.x + 'px';
      // node.style.display = 'block';
    }
  };

  const removeHovered = useCallback(() => {
    const node = tooltipRef.current;
    if (node) {
      node.style.display = 'none';
    }
  }, [tooltipRef]);

  const data: Datum[] = RawData.map((d) => {
    return {
      label: d.naics.toString(),
      x: d.rca_emp,
      y: d.density_emp,
      onMouseMove: setHovered,
      onMouseLeave: removeHovered,
    }
  })

  return (
    <Root>
      <PSwotPlot
        id={'react-pswot-plot-demo'}
        data={data}
        averageLineText={'Relative Advantage = 1'}
        quadrantLabels={{
          I: 'Strength',
          II: 'Opportunity',
          III: 'Threat',
          IV: 'Weakness',
          V: 'Potential',
        }}
        quadrantBackgroundColors={{
          I: '#dadbdd',
          II: '#e6e7e8',
          III: '#f2f3f3',
          IV: '#fafafb',
          V: '#edf6f4',
        }}
        zeroAxisLabel={'Relative Advantage = 0'}
        axisLabels={{
          left: 'Predicted Density Change',
          leftUp: 'Growing',
          leftDown: 'Decreasing',
          bottomLeft: 'Low Relative Advantage',
          bottomRight: 'High Relative Advantage',
        }}
        axisLabelColor={'#333'}
        quadrantLabelColor={'#f69c7c'}
      />
      <RapidTooltipRoot ref={tooltipRef} />
    </Root>
  )
}

export default App
