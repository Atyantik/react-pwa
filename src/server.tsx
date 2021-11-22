import ServerHandler from '@pawjs/pawjs/src/server/handler';
import ReactPWAIcon from './resources/img/react-pwa.png';

export default class Server {
  apply(serverHandler: ServerHandler) {
    serverHandler.setCache({
      max: 104857600,
      maxAge: 86400000,
    });
    serverHandler
      .hooks
      .beforeHtmlRender
      .tapPromise(
        'DSNPreCache',
        async (Application) => {
          const { htmlProps: { head } } = Application;
          head.push(<link key="dns-precache-demo-cdn" rel="preconnect" href="https://demo-cdn.reactpwa.com" />);
          head.push(<link key="dns-precache-google-analytics" rel="preconnect" href="https://www.google-analytics.com" />);
          head.push(<link key="dns-precache-googletagmanager" rel="preconnect" href="https://www.googletagmanager.com" />);
          head.push(<meta key="meta-theme-color" name="theme-color" content="#209cee" />);
          //
        },
      );

    serverHandler
      .hooks
      .beforeHtmlRender
      .tapPromise(
        'AddFavIcon',
        async (Application) => {
          const { htmlProps: { head } } = Application;
          head.push(<link key="favicon" rel="shortcut icon" type="image/png" href={ReactPWAIcon} />);
        },
      );

    serverHandler
      .hooks
      .beforeHtmlRender
      .tapPromise(
        'AddGoogleTracking',
        async (Application) => {
          Application.htmlProps.footer.push(<script async key="googleanalyticslink" src="https://www.googletagmanager.com/gtag/js?id=UA-108804791-2" />);
          Application.htmlProps.footer.push(<script
            key="googleanalyticsscript"
            // eslint-disable-next-line
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
