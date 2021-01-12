import React from 'react'
import PSwotPlot, {ScatterPlotDatum} from 'react-pswot-plot'
import RawData from './data/hefei_employees.json';
import styled from 'styled-components';

const Root = styled.div`
  width: 100vw;
  height: 100vh;
`;

const App = () => {
  const data: ScatterPlotDatum[] = RawData.map(d => {
    return {
      label: d.naics.toString(),
      x: d.rca_emp,
      y: d.density_emp,
    }
  })

  return (
    <Root>
      <PSwotPlot
        id={'react-pswot-plot-demo'}
        data={data}
      />
    </Root>
  )
}

export default App
