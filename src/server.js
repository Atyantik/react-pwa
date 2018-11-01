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
      Application.htmlProps.footer.push(<script async key="codefund" src="https://codefund.io/scripts/19b66788-7093-4d4e-b75a-79d3a7b68f3a/embed.js" />);
    });

    serverHandler.hooks.beforeHtmlRender.tapPromise('AddGoogleTracking', async (Application) => {
      Application.htmlProps.footer.push(<script async key="googleanalyticslink" src="https://www.googletagmanager.com/gtag/js?id=UA-108804791-2" />);
      Application.htmlProps.footer.push(<script
        key="googleanalyticsscript"
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-108804791-2');`,
        }}
      />);
    });
  }
}
