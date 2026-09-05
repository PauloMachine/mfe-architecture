import React from 'react';
import singleSpaReact from 'single-spa-react';
import SettingsApp from './SettingsApp';

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient: require('react-dom/client'),
  rootComponent: SettingsApp,
  domElementGetter: () => document.getElementById('single-spa-application:settings'),
});

export const { bootstrap, mount, unmount } = lifecycles;
