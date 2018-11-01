import React from 'react';
import ReactPWAIcon from './resources/img/react-pwa.png';

export default class Server {

  // eslint-disable-next-line
  apply(serverHandler) {
    serverHandler.hooks.beforeHtmlRender.tapPromise('AddFavIcon', async (Application) => {
      const { htmlProps: { head } } = Application;
      head.push(<link key="favicon" rel="shortcut icon" type="image/png" href={ReactPWAIcon} />);
      return true;
    });

    serverHandler.hooks.beforeHtmlRender.tapPromise('AddCodeFundScript', async (Application) => {
      Application.htmlProps.footer.push(<script key="codefund" href="https://codefund.io/scripts/19b66788-7093-4d4e-b75a-79d3a7b68f3a/embed.js" />);
    });
  }
}
