import { select } from 'd3';
import React, {useState, useEffect, useRef} from 'react';
import styled from 'styled-components';
import createChart from './createChart';
import debounce from 'lodash/debounce';
import {Datum} from './types';

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
  data: Datum[];
  chartTitle: string;
  axisLabels?: {
    left?: string,
    leftUp?: string
    leftDown?: string
    bottom?: string
    bottomLeft?: string
    bottomRight?: string
  };
  axisMinMax?: {
    minX?: number,
    maxX?: number,
    minY?: number,
    maxY?: number,
  };
  averageLineText?: string;
  yLineText?: string;
  zeroAxisLabel?: string;
  quadrantLabels?: {I?: string, II?: string, III?: string, IV?: string, V?: string};
  axisLabelColor?: string;
  quadrantLabelColor?: string;
  quadrantBackgroundColors?: {I?: string, II?: string, III?: string, IV?: string, V?: string};
  onQuadrantLabelMouseMove?: (quadrant: {id: string, label: string}, coords: {x: number, y: number}) => void;
  onQuadrantLabelMouseLeave?: (quadrant: {id: string, label: string}) => void;
}

export const PSwotPlot = (props: Props) => {
  const {
    id, data, axisLabels, axisMinMax, averageLineText, quadrantLabels,
    zeroAxisLabel, axisLabelColor, quadrantLabelColor, quadrantBackgroundColors,
    onQuadrantLabelMouseMove, onQuadrantLabelMouseLeave, yLineText, chartTitle,
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
      createChart({
        svg, data: [...data], size: {
          width: sizingNode.clientWidth, height: sizingNode.clientHeight,
        },
        axisLabels,
        axisMinMax,
        averageLineText,
        quadrantLabels,
        zeroAxisLabel,
        axisLabelColor,
        quadrantLabelColor,
        quadrantBackgroundColors,
        onQuadrantLabelMouseMove,
        onQuadrantLabelMouseLeave,
        yLineText, chartTitle,
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

export {Datum};

export default PSwotPlot;
