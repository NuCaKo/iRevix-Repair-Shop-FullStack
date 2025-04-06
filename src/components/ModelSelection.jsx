import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const ModelSelection = ({ deviceModels, selectedDevice, selectedModel, handleModelSelect }) => {
    if (!selectedDevice || !deviceModels[selectedDevice]) {
        return null;
    }

    return (
        <div className="selection-section">
            <h3>Select Model</h3>
            <div className="model-buttons">
                {deviceModels[selectedDevice].map(model => (
                    <button
                        key={model}
                        className={`model-button ${selectedModel === model ? 'selected' : ''}`}
                        onClick={() => handleModelSelect(model)}
                    >
                        <span className="model-name">{model}</span>
                        <span className="model-selection-indicator">
              {selectedModel === model && (
                  <FontAwesomeIcon icon={faCheck} size="xs" style={{ color: '#fff' }} />
              )}
            </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ModelSelection;