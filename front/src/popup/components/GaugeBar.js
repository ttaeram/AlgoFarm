import React from 'react';
import PropTypes from 'prop-types';
import './GaugeBar.css';

function GaugeBar({ label, value }) {
  return (
    <div className="gauge-bar">
      <div className="gauge-bar__label">{label}</div>
      <div className="gauge-bar__container">
        <div className="gauge-bar__fill" style={{ width: `${value}%` }}></div>
      </div>
      <div className="gauge-bar__value">{value}%</div>
    </div>
  );
}

GaugeBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
};

export default GaugeBar;
