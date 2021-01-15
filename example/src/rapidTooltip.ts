import styled from 'styled-components/macro';

interface Input {
  title: string;
  color: string;
  rows: string[][];
  boldColumns?: number[];
  additionalHTML?: string;
}

export const RapidTooltipRoot = styled.div`
  position: fixed;
  z-index: 3000;
  max-width: 16rem;
  padding-bottom: 0.5rem;
  font-size: 0.7rem;
  line-height: 1.4;
  text-transform: none;
  transition: opacity 0.15s ease;
  color: #333;
  background-color: #fff;
  border: 1px solid #dfdfdf;
  border-radius: 4px;
  box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transform: translate(-50%, calc(-100% - 1.5rem));
  display: none;
  
  .rapid-tooltip-title {
    padding: 0.5rem;
  }

  .rapid-tooltip-subsection-grid {
    display: grid;
    grid-gap: 0.5rem;
    padding: 0.5rem;
  }

  .rapid-tooltip-cell {
    display: flex;
  }

  .rapid-tooltip-arrow-container {
    width: 100%;
    height: 0.5rem;
    display: flex;
    justify-content: center;
    position: absolute;
    transform: translate(0, 100%);
  }

  .rapid-tooltip-arrow {
    width: 0.5rem;
    height: 0.5rem;
    position: relative;
    display: flex;
    justify-content: center;
    left: -0.25rem;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      border-left: 9px solid transparent;
      border-right: 9px solid transparent;
      border-top: 9px solid #dfdfdf;
    }

    &:after {
      content: '';
      position: absolute;
      top: 0;
      left: 1px;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid #fff;
    }
  }
`;

export const getStandardTooltip = (input: Input) => {
  const columnCount = input.rows.length && input.rows[0].length ? input.rows[0].length : 1;

  let rows: string = '';
  input.rows.forEach(r => {
    let row = '';
    r.forEach((c, i) => {
      const alignment = i === 0
        ? 'justify-content: flex-start; text-align: left;'
        : 'justify-content: flex-end; text-align: right;';
      const style = input.boldColumns && input.boldColumns.includes(i)
        ? `style="font-weight: 600;${alignment}"` : '';
      row = row + `<div class="rapid-tooltip-cell" ${style}>${c}</div>`;
    });
    rows = rows + row;
  });

  const additionalContent = input.additionalHTML ? `<div>${input.additionalHTML}</div>` : '';

  return `
    <div>
      <div class="rapid-tooltip-title" style="background-color: ${input.color};">
        ${input.title}
      </div>
      <div
        class="rapid-tooltip-subsection-grid"
        style="display: grid; grid-template-columns: repeat(${columnCount}, auto);"
      >
        ${rows}
      </div>
      ${additionalContent}
    </div>
    <div class="rapid-tooltip-arrow-container">
      <div class="rapid-tooltip-arrow"></div>
    </div>
  `;
};