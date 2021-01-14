# react-pswot-plot

## by the Growth Lab at Harvard's Center for International Development

React component for creating a SWOT scatterplot with a beeswarm at the zero-axis for Potential

> This package is part of Harvard Growth Lab’s portfolio of software packages, digital products and interactive data visualizations. To browse our entire portfolio, please visit The Viz Hub at [growthlab.app](https://growthlab.app/). To learn more about our research, please visit [Harvard Growth Lab’s](https://growthlab.cid.harvard.edu/) home page.


[![NPM](https://img.shields.io/npm/v/react-pswot-plot.svg)](https://www.npmjs.com/package/react-pswot-plot) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### [View live example ↗](https://cid-harvard.github.io/react-pswot-plot/)

## Install

```bash
npm install --save react-pswot-plot
```

## Usage

```tsx
import React from 'react'
import PSwotPlot from 'react-pswot-plot'

const App = () => {

  ...

  return (
    <Root>
      <PSwotPlot
        id={'react-pswot-plot-demo'}
        data={data}
      />
    </Root>
  )
}
```


<a name="props"/>

#### Props

The PSwotPlot component takes the following props:

- **id**: `string`
- **data**: [`Datum[]`](#datum)
- **axisLabels** *(optional)*:
  - **left** *(optional)*: `string`
  - **leftUp** *(optional)*: `string`
  - **leftDown** *(optional)*: `string`
  - **bottomLeft** *(optional)*: `string`
  - **bottomRight** *(optional)*: `string`
- **axisMinMax** *(optional)*:
  - **minX** *(optional)*: `number`
  - **maxX** *(optional)*: `number`
  - **minY** *(optional)*: `number`
  - **maxY** *(optional)*: `number`
- **averageLineText** *(optional)*: `string`
- **zeroAxisLabel** *(optional)*: `string`
- **quadrantLabels** *(optional)*:
  - **I** *(optional)*: `string`
  - **II** *(optional)*: `string`
  - **III** *(optional)*: `string`
  - **IV** *(optional)*: `string`
  - **V** *(optional)*: `string`
- **axisLabelColor** *(optional)*: `string`
- **quadrantLabelColor** *(optional)*: `string`
- **quadrantBackgroundColors** *(optional)*:
  - **I** *(optional)*: `string`
  - **II** *(optional)*: `string`
  - **III** *(optional)*: `string`
  - **IV** *(optional)*: `string`
  - **V** *(optional)*: `string`
- **onQuadrantLabelMouseMove** *(optional)*: `(quadrant: {id: string, label: string}, coords: {x: number, y: number}) => void`
- **onQuadrantLabelMouseLeave** *(optional)*: `(quadrant: {id: string, label: string}) => void`

<a name="datum"/>

#### Datum

The Datum type is an interface of the following values:

- **label**: `string`
- **x**: `number`
- **y**: `number`
- **fill** *(optional)*: `string`
- **radius** *(optional)*: `number`
- **onClick** *(optional)*: `(datum: Datum) => void`
- **onMouseMove** *(optional)*: `(datum: Datum, coords: {x: number, y: number}) => void`
- **onMouseLeave** *(optional)*: `(datum: Datum) => void`
- **highlighted** *(optional)*: `boolean`
- **faded** *(optional)*: `boolean`

## License

MIT © [The President and Fellows of Harvard College](https://www.harvard.edu/)
