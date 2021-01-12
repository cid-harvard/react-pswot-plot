import { select } from 'd3';
import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import createScatterPlot, {Datum as ScatterPlotDatum} from './scatterPlot';
import debounce from 'lodash/debounce';

const Root = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;
`;

const SizingElm = styled.div`
  height: 100%;
  width: 100%;

  svg {
    width: 100%;
    height: 100%;
  }
`;

interface Props {
  id: string;
  data: ScatterPlotDatum[];
  axisLabels?: {left?: string, bottom?: string};
  axisMinMax?: {
    minX?: number,
    maxX?: number,
    minY?: number,
    maxY?: number,
  };
  showAverageLines?: boolean;
  averageLineText?: {left?: string, bottom?: string};
  quadrantLabels?: {I?: string, II?: string, III?: string, IV?: string};
}

export const PSwotPlot = (props: Props) => {
  const {
    id, data, axisLabels, axisMinMax, showAverageLines, averageLineText, quadrantLabels,
  } = props;

  const sizingNodeRef = useRef<HTMLDivElement | null>(null);
  const svgNodeRef = useRef<any>(null);

  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);

  useEffect(() => {
    const updateWindowWidth = debounce(() => {
      setWindowWidth(window.innerWidth);
    }, 500);
    window.addEventListener('resize', updateWindowWidth);
    return () => {
      window.removeEventListener('resize', updateWindowWidth);
    };
  }, []);


  useEffect(() => {
    let svgNode: HTMLDivElement | null = null;
    if (svgNodeRef && svgNodeRef.current && sizingNodeRef && sizingNodeRef.current) {
      const sizingNode = sizingNodeRef.current;
      svgNode = svgNodeRef.current;
      const svg = select(svgNode);
      createScatterPlot({
        svg, data, size: {
          width: sizingNode.clientWidth, height: sizingNode.clientHeight,
        },
        axisLabels,
        axisMinMax,
        showAverageLines,
        averageLineText,
        quadrantLabels,
      });
    }
    return () => {
      if (svgNode) {
        svgNode.innerHTML = '';
      }
    };
  }, [svgNodeRef, sizingNodeRef, windowWidth, props]);

  return (
    <Root>
      <SizingElm ref={sizingNodeRef}>
        <svg ref={svgNodeRef} key={id + windowWidth + 'svg'} className={'react-fast-charts-root-svg'} />
      </SizingElm>
    </Root>
  );
};

export {ScatterPlotDatum};

export default PSwotPlot;
