import React from 'react';
import singleSpaReact from 'single-spa-react';
import DashboardApp from './DashboardApp';

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient: require('react-dom/client'),
  rootComponent: DashboardApp,
  domElementGetter: () => document.getElementById('single-spa-application:dashboard'),
});

export const { bootstrap, mount, unmount } = lifecycles;
