import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const root = document.getElementById('root');

// scripts/prerender.js writes real markup into #root for every route, so in
// production we attach to it instead of throwing it away and painting again.
// During the prerender pass itself (and in `npm start`) #root is empty.
if (root.hasChildNodes()) {
  ReactDOM.hydrate(<App />, root);
} else {
  ReactDOM.render(<App />, root);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
