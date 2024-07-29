import React from 'react';
import ReactDOM from 'react-dom';
import CharacterOverlay from './CharacterOverlay';

const root = document.createElement('div');
root.id = 'chrome-extension-root';
root.style.position = 'fixed';
root.style.top = '0';
root.style.left = '0';
root.style.width = '100%';
root.style.height = '100%';
root.style.zIndex = '9999';
root.style.pointerEvents = 'none';
document.body.appendChild(root);

ReactDOM.render(<CharacterOverlay />, root);
