import React, { Component } from 'react';
import { connect } from 'react-redux';

import { MORTAR_ID, TARGET_ID } from '../const';

import {
  loadPosition,
  deleteSavedPosition
} from '../actions';

import {
  ROCKET
} from '../const';

class SavedPosition extends Component {
  render() {
    const {
      savedPosition,
      loadMortarHandler,
      loadTargetHandler,
      deleteHandler,
      isRocket
    } = this.props;

    const artyName = isRocket ? 'Rocket' : 'Mortar';

    const { name, position } = savedPosition;

    return (
      <tr className="saved-item">
        <td className="saved-item-position">{position.toElement()}</td>
        <td className="saved-item-mnemonic">{name}</td>
        <td className="saved-item-controls">
          <button
            className="load-mortar"
            onClick={loadMortarHandler}
          >
            {artyName}
          </button>
          <button
            className="load-target"
            onClick={loadTargetHandler}
          >
            Target
          </button>
        </td>
        <td className="saved-item-delete-wrap">
          <button
            className="saved-item-delete"
            onClick={deleteHandler}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }
}

class LoadView extends Component {
  render() {
    const { saved, values, dispatch, meta } = this.props;
    const { type } = meta;

    if (!saved.length) return null;

    const handleLoadMortar = (position, index) => () => {
      dispatch(loadPosition(MORTAR_ID, position));
    };

    const handleLoadTarget = (position, index) => () => {
      dispatch(loadPosition(TARGET_ID, position));
    };

    const handleDelete = index => () => {
      dispatch(deleteSavedPosition(index));
    };

    const isRocket = type === ROCKET;

    const savedComponents = (
      saved.map((s, index) => (
        <SavedPosition
          key={s.position.toString() + s.name}
          isRocket={isRocket}
          savedPosition={s}
          loadMortarHandler={handleLoadMortar(s.position, index)}
          loadTargetHandler={handleLoadTarget(s.position, index)}
          deleteHandler={handleDelete(index)}
        />
      ))
    );

    return (
      <table className="saved-items">
        <tbody>
          <tr>
            <th>Position</th>
            <th>Name</th>
            <th>Load</th>
            <th></th>
          </tr>
          {savedComponents}
        </tbody>
      </table>
    );
  }
}
export default connect(s => s)(LoadView);
