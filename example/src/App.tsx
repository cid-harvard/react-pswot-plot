import React, {useRef, useCallback} from 'react'
import PSwotPlot, {Datum} from 'react-pswot-plot'
import RawData from './data/hefei_employees.json';
import IndustryData from './data/naics_2017.json';
import styled from 'styled-components';
import {getStandardTooltip, RapidTooltipRoot} from './rapidTooltip';
import {rgba} from 'polished';

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  width: 100%;
  height: 100%;  
`;

const colorMap = [
  { id: '0', color: '#A973BE' },
  { id: '1', color: '#F1866C' },
  { id: '2', color: '#FFC135' },
  { id: '3', color: '#93CFD0' },
  { id: '4', color: '#488098' },
  { id: '5', color: '#77C898' },
  { id: '6', color: '#6A6AAD' },
  { id: '7', color: '#D35162' },
  { id: '8', color: '#F28188' },
]

const App = () => {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const setHovered = (datum: {label: string, fill?: string, id?: string, x?: number, y?: number}, coords: {x: number, y: number}) => {
    const node = tooltipRef.current;
    const industry = IndustryData.find(n => n.code === datum.id);
    if (node) {
      const rows: string[][] = [];
      if (industry && industry.code) {
        rows.push(
          ['Code', industry.code],
        )
      } else {
        rows.push(
          ['Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.']
        )
      }
      if (datum.x !== undefined) {
        rows.push(
          ['RCA', parseFloat(datum.x.toFixed(3)).toString() ],
        )
      }
      if (datum.y) {
        rows.push(
          ['Density', parseFloat(datum.y.toFixed(3)).toString() ],
        )
      }
      node.innerHTML = getStandardTooltip({
        title: datum.label,
        color: datum.fill ? rgba(datum.fill, 0.5) : '#f69c7c',
        rows,
        boldColumns: [1],
      });
      node.style.top = coords.y + 'px';
      node.style.left = coords.x + 'px';
      node.style.display = 'block';
    }
  };

  const removeHovered = useCallback(() => {
    const node = tooltipRef.current;
    if (node) {
      node.style.display = 'none';
    }
  }, [tooltipRef]);

  const data: Datum[] = RawData.map((d) => {
    const industry = IndustryData.find(n => n.code === d.naics.toString());
    const naics_id = industry ? industry.naics_id : '';
    let topLevelParentId: string = naics_id.toString();
    let current = IndustryData.find(datum => datum.naics_id === naics_id);
    while(current && current.parent_id !== null) {
      // eslint-disable-next-line
      current = IndustryData.find(datum => datum.naics_id === (current as any).parent_id);
      if (current && current.parent_id !== null) {
        topLevelParentId = current.parent_id.toString();
      } else if (current && current.naics_id !== null) {
        topLevelParentId = current.naics_id.toString();
      }
    }
    if (parseInt(topLevelParentId, 10) > 8) {
      console.error(current);
      throw new Error('Parent out of range')
    }
    const parentColor = colorMap.find(c => c.id === topLevelParentId);
    return {
      id: d.naics.toString(),
      label: industry ? industry.name : d.naics.toString(),
      x: d.rca_emp,
      y: d.density_emp,
      fill: parentColor ? parentColor.color : undefined,
      // highlighted: !Math.round(Math.random()),
      // faded: !Math.round(Math.random()),
      onMouseMove: setHovered,
      onMouseLeave: removeHovered,
    }
  })

  return (
    <Root>
      <Container>
        <PSwotPlot
          id={'react-pswot-plot-demo'}
          data={data}
          averageLineText={'Relative Advantage = 1'}
          yLineText={'Technological Fit = 0'}
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
            bottom: 'Relative Advantage',
            bottomLeft: 'Lower',
            bottomRight: 'Higher',
          }}
          axisLabelColor={'#333'}
          quadrantLabelColor={'#f69c7c'}
          onQuadrantLabelMouseMove={setHovered}
          onQuadrantLabelMouseLeave={removeHovered}
        />
        <RapidTooltipRoot ref={tooltipRef} />
      </Container>
    </Root>
  )
}

export default App
