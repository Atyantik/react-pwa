import React from 'react';
import ReactPWAIcon from './resources/img/react-pwa.png';

export default class Server {
  apply(serverHandler) {
    serverHandler.hooks.beforeHtmlRender.tapPromise('AddFavIcon', async (Application) => {
      const { htmlProps: { head } } = Application;
      head.push(<link key="favicon" rel="shortcut icon" type="image/png" href={ReactPWAIcon} />);
      return true;
    });
  }
}
