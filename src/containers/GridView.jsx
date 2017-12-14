import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  SIZE,
  STROKE,
  GRID_SIZE,
  CIRCLE_RADIUS,
  LARGE_GRID,
  SMALL_GRID,
  KEY_PADDING,
  TEXT_SIZE,
  KEY_HEIGHT,
  SVG_WIDTH,
  SVG_HEIGHT,
  EPSILON,
  MORTAR_ID,
  TARGET_ID,
  GRID_VIEW_HEIGHT
} from '../const';

import { epsilonEquals, cludgeLt } from '../helpers';

const style = {
  width: GRID_SIZE
};

/* titleTextHtml:
 *    returns an HTML element with classes for styling. HTML element is used
 *    because it is a lot easier to work with than SVG text elements;
 *    centering, styling, translations, etc., are much easier with HTML+CSS
 *
 *    params:
 *      position: a position object
 *      isSubKey: bool, whether or not this should be a subkey title,
 *        ex: `A2-3-4` if isSubKey=false, `555` if isSubKey=true
 */
function titleTextHtml(position, isSubKey) {
  isSubKey = !!isSubKey;

  let kpa = position.kpa,
    kpMinor
  ;

  if (!isSubKey) {
    let kpMajor = (
      kpa
        .slice(0,2)
        .map((kp,i) => (
          <span key={kp.toString()+i.toString()}>
            <span className="title-text-item title-text-dash">-</span>
            <span className="title-text-item title-text-kp-major">{kp}</span>
          </span>
        ))
    );

    return (
      <div className="title-text">
        <span className="title-text-item title-text-x">
          {position.xString()}
        </span>
        <span className="title-text-item title-text-y">
          {position.yString()}
        </span>
        {kpMajor}
      </div>
    );
  }

  if (kpa.length > 2) {
    kpMinor = (
      kpa
        .slice(2)
        .map((kp,i) => (
          <span
            key={kp.toString()+i.toString()+'m'}
            className="title-text-item title-text-kp-minor"
          >
            {kp}
          </span>
        ))
    );
  }


  return (
    <div className="title-text">
      {/*<span className="title-text-item title-text-subkey">sub:</span>*/}
      {kpMinor}
    </div>
  );
}

/* keyTextHtml:
 *    returns an HTML element for the key text (300m, 33m, etc).
 *    params:
 *      S: the error-size (the highlighted grid size; 300,100,33,11,3,1)
 *      GS: the grid-size (300 or 33)
 */
function keyTextHtml(S,GS) {
  let styleTop = {
    transform: `translate(0, ${GRID_SIZE}px)`,
    fontSize: TEXT_SIZE,
  };

  let styleBottom = {
    transform: `translate(0, ${GRID_SIZE + TEXT_SIZE}px)`,
    fontSize: TEXT_SIZE,
  };

  let secondaryKeyText;

  if (!epsilonEquals(S,1)) {
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

/* keyLines:
 *    returns SVG elements for the key at the bottom
 *
 *    params:
 *      S: the error size (the colored-in grid)
 *      isZoomed: whether or not this is the sub-key zoomed-in SVG box
 */
function keyLines(S, isZoomed) {
  let secondaryKeyLine;

  if (!epsilonEquals(S,1)) {
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

const mouseEnterHandler = (positionId, scale) => (e) => {
  console.log('enter', e);
};

const mouseLeaveHandler = (positionId, scale) => (e) => {
  console.log('leave', e);
};

const mouseMoveHandler = (positionId, scale) => (e) => {
  const offset = e.currentTarget.getBoundingClientRect(),
    { scrollY, scrollX } = window,
    top = offset.top + scrollY,
    left = offset.left + scrollX,
    { width, height } = offset,
    x = Math.min(1, Math.max(0, (e.pageX-left) / width)),
    y = Math.min(1, Math.max(0, (e.pageY-top) / height))
  ;
  console.log('move', x, y);
};

class GridZoomed extends Component {
  render() {
    const { id, position, isTarget } = this.props;


    let X = (position.x % SMALL_GRID) / SMALL_GRID,
      Y = (position.y % SMALL_GRID) / SMALL_GRID,
      GS = SMALL_GRID,
      S = position.error / SMALL_GRID
    ;

    X = X > 1-EPSILON ? 0 : X;
    Y = Y > 1-EPSILON ? 0 : Y;

    let rect = SIZE > 300/243 ? (
      <rect
        x={X * SIZE}
        y={Y * SIZE}
        width={S * SIZE}
        height={S * SIZE}
        className={(() => {
          return isTarget ? 'grid-target' : 'grid-mortar';
        })()}
      />
    ) : null;

    let body = (
      <g>
        {rect}
        <circle
          cx={(X + S/2) * SIZE}
          cy={(Y + S/2) * SIZE}
          r={CIRCLE_RADIUS}
          className={(() => {
            return isTarget ? 'grid-target-circle' : 'grid-mortar-circle';
          })()}
        />
      </g>
    );

    return (
      <div className="grid-wrap">
        {(() => titleTextHtml(position,true))()}
        <div className="grid" style={style}>
          <div className="grid-render">
            {(() => keyTextHtml(S,GS))()}
            <svg
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
            >
              <g
                className="mouse-active"
                transform={`translate(${STROKE}, ${STROKE})`}
                onMouseEnter={mouseEnterHandler(id, SMALL_GRID)}
                onMouseLeave={mouseLeaveHandler(id, SMALL_GRID)}
                onMouseMove={mouseMoveHandler(id, SMALL_GRID)}
              >
                <rect
                  x="0"
                  y="0"
                  width={SIZE}
                  height={SIZE}
                  className="grid-bg"
                />
                { body }
              </g>
              <g transform={`translate(${STROKE}, ${GRID_SIZE + KEY_PADDING})`}>
                {(() => keyLines(S, true))()}
              </g>
            </svg>
          </div>
        </div>
      </div>
    );
  }
}

class Grid extends Component {
  render() {
    const { id, position, xLabel, yLabel, isTarget } = this.props;

    let X = (position.x % LARGE_GRID) / LARGE_GRID,
      Y = (position.y % LARGE_GRID) / LARGE_GRID,
      GS = LARGE_GRID,
      S = position.error / LARGE_GRID
    ;

    let body = (
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
                className="grid-ls"
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
                className="grid-ls"
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
                className="grid-lm"
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
                className="grid-lm"
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
            return isTarget ? 'grid-target' : 'grid-mortar';
          })()}
        />
        <circle
          cx={(X + S/2) * SIZE}
          cy={(Y + S/2) * SIZE}
          r={CIRCLE_RADIUS}
          className={(() => {
            return isTarget ? 'grid-target-circle' : 'grid-mortar-circle';
          })()}
        />
      </g>
    );

    return (
      <div className="grid-wrap">
        {(() => titleTextHtml(position))()}
        <div className="grid" style={style}>
          <div className="grid-render">
            {(() => keyTextHtml(Math.max(S,1/9),GS))()}
            <svg
              width={SVG_WIDTH}
              height={SVG_HEIGHT}
            >
              <g
                className="mouse-active"
                transform={`translate(${STROKE}, ${STROKE})`}
                onMouseEnter={mouseEnterHandler(id, LARGE_GRID)}
                onMouseLeave={mouseLeaveHandler(id, LARGE_GRID)}
                onMouseMove={mouseMoveHandler(id, LARGE_GRID)}
              >
                <rect
                  x="0"
                  y="0"
                  width={SIZE}
                  height={SIZE}
                  className="grid-bg"
                />
                { body }
              </g>
              <g transform={`translate(${STROKE}, ${GRID_SIZE + KEY_PADDING})`}>
                {(() => keyLines(Math.max(S,1/9)))()}
              </g>
            </svg>
          </div>
        </div>
      </div>
    );
  }
}

class GridView extends Component {
  render() {
    let { positions } = this.props;

    const mortarPosition = positions[MORTAR_ID];
    const targetPosition = positions[TARGET_ID];

    let mortarGrid,
      mortarGridZoomed,
      targetGrid,
      targetGridZoomed
    ;

    if (mortarPosition) {
      mortarGrid = <Grid id={MORTAR_ID} position={mortarPosition} />;
      if (mortarPosition.kpa.length >= 2) {
        mortarGridZoomed = <GridZoomed id={MORTAR_ID} position={mortarPosition} />;
      }
    }

    if (targetPosition) {
      targetGrid = <Grid id={TARGET_ID} position={targetPosition} isTarget />;
      if (targetPosition.kpa.length >= 2) {
        targetGridZoomed = <GridZoomed id={TARGET_ID} position={targetPosition} isTarget />;
      }
    }

    return (
      <div className="grid-view-wrap">
        <div className="grid-view">
          { mortarGrid }
          { mortarGridZoomed }
        </div>
        <div className="grid-view">
          { targetGrid }
          { targetGridZoomed }
        </div>
      </div>
    );
  }
}


export default connect(s => s)(GridView);
