import React, { Component } from 'react';

const SIZE = 60,
  STROKE = 1,
  GRID_SIZE = SIZE + 2*STROKE,
  LARGE_GRID = 300,
  SMALL_GRID = 300/9,
  KEY_PADDING = 4,
  TEXT_SIZE = 7,
  KEY_HEIGHT = 11,
  SVG_WIDTH = GRID_SIZE,
  SVG_HEIGHT = GRID_SIZE + KEY_PADDING + KEY_HEIGHT,
  EPSILON = 0.001
;

export default class GridView extends Component {
  render() {
    const { position, xLabel, yLabel, isTarget } = this.props;


    let counter = 0,
      isZoomed = position[2] < SMALL_GRID,
      X,
      Y,
      GS,
      S
    ;


    if (isZoomed) {
      X = (position[0] % SMALL_GRID) / SMALL_GRID;
      Y = (position[1] % SMALL_GRID) / SMALL_GRID;

      GS = SMALL_GRID;

      S = position[2] / SMALL_GRID;

      X = X > 1-EPSILON ? 0 : X;
      Y = Y > 1-EPSILON ? 0 : Y;
    } else {
      X = (position[0] % LARGE_GRID) / LARGE_GRID;
      Y = (position[1] % LARGE_GRID) / LARGE_GRID;

      GS = LARGE_GRID;

      S = position[2] / LARGE_GRID;
    }

    function zoomedOut() {
      return (
        <g>
          {Array(6).fill()
            .map((_,i) => {
              return (
                <line
                  key={'h1' + i}
                  x1="0"
                  y1={(() => {
                    let j = Math.floor(i/2);
                    return (i + j + 1) / 9 * SIZE;
                  })()}
                  x2={SIZE}
                  y2={(() => {
                    let j = Math.floor(i/2);
                    return (i + j + 1) / 9 * SIZE;
                  })()}
                  className="grid-view-ls"
                />
              );
            })
          }
          {Array(6).fill()
            .map((_,i) => {
              return (
                <line
                  key={'v1' + i}
                  x1={(() => {
                    let j = Math.floor(i/2);
                    return (i + j + 1) / 9 * SIZE;
                  })()}
                  y1="0"
                  x2={(() => {
                    let j = Math.floor(i/2);
                    return (i + j + 1) / 9 * SIZE;
                  })()}
                  y2={SIZE}
                  className="grid-view-ls"
                />
              );
            })
          }
          {Array(2).fill()
            .map((_,i) => {
              return (
                <line
                  key={'h0' + i}
                  x1="0"
                  y1={(i + 1) / 3 * SIZE}
                  x2={SIZE}
                  y2={(i + 1) / 3 * SIZE}
                  className="grid-view-lm"
                />
              );
            })
          }
          {Array(2).fill()
            .map((_,i) => {
              return (
                <line
                  key={'v0' + i}
                  x1={(i + 1) / 3 * SIZE}
                  y1="0"
                  x2={(i + 1) / 3 * SIZE}
                  y2={SIZE}
                  className="grid-view-lm"
                />
              );
            })
          }
          <rect
            x={X * SIZE}
            y={Y * SIZE}
            width={S * SIZE}
            height={S * SIZE}
            className={(() => {
              return isTarget ? 'grid-view-target' : 'grid-view-mortar';
            })()}
          />
        </g>
      );
    }

    function titleTextHtml() {
    }

    function keyTextHtml() {
      let styleTop = {
        transform: `translate(0, ${GRID_SIZE + 1}px)`,
        fontSize: TEXT_SIZE,
      };

      let styleBottom = {
        transform: `translate(0, ${GRID_SIZE + TEXT_SIZE + 1}px)`,
        fontSize: TEXT_SIZE,
      };

      let secondaryKeyText;

      if (S !== 1) {
        secondaryKeyText = (
          <div className="key-text-wrap" style={styleBottom}>
            <div className="key-text">
              {`${Math.floor(S*GS)}m`}
            </div>
          </div>
        );
      }

      return (
        <div>
          <div className="key-text-wrap" style={styleTop}>
            <div className="key-text">
              {`${Math.floor(GS)}m`}
            </div>
          </div>
          {secondaryKeyText}
        </div>
      );
    }

    function keyLines() {
      let secondaryKeyLine;

      if (S !== 1) {
        //let start = SIZE - (S * SIZE),
        //  end = SIZE
        //;

        let start = SIZE/3 - S*SIZE,
          end = SIZE/3
        ;


        secondaryKeyLine = (
          <g transform={`translate(0,${KEY_HEIGHT-4})`}>
            <line
              className="key-line"
              x1={start}
              y1="1"
              x2={end}
              y2="1"
            />
            <line
              className="key-line"
              x1={start}
              y1="0"
              x2={start}
              y2="2"
            />
            <line
              className="key-line"
              x1={end}
              y1="0"
              x2={end}
              y2="2"
            />
          </g>
        );
      }

      return (
        <g>
          <g>
            <line
              className="key-line"
              x1="0"
              y1="1"
              x2={SIZE}
              y2="1"
            />
            <line
              className="key-line"
              x1="0"
              y1="0"
              x2="0"
              y2="2"
            />
            <line
              className="key-line"
              x1={SIZE}
              y1="0"
              x2={SIZE}
              y2="2"
            />
          </g>
          {secondaryKeyLine}
        </g>
      );
    }

    function zoomedIn() {
      return (
        <g>
          <rect
            x={X * SIZE}
            y={Y * SIZE}
            width={S * SIZE}
            height={S * SIZE}
            className={(() => {
              return isTarget ? 'grid-view-target' : 'grid-view-mortar';
            })()}
          />
        </g>
      );
    }

    let style = {
      position: 'relative',
      width: GRID_SIZE
    };

    return (
      <div style={style}>
        <div className="title-text">
          {(() => titleTextHtml())()}
        </div>
        {(() => keyTextHtml())()}
        <svg width={SVG_WIDTH} height={SVG_HEIGHT}>
          <g transform={`translate(${STROKE}, ${STROKE})`}>
            <rect
              x="0"
              y="0"
              width={SIZE}
              height={SIZE}
              className="grid-view-bg"
            />
            {(() => isZoomed ? zoomedIn() : zoomedOut())()}
          </g>
          <g transform={`translate(${STROKE}, ${GRID_SIZE + KEY_PADDING})`}>
            {(() => keyLines())()}
          </g>
        </svg>
      </div>
    );
  }
}

