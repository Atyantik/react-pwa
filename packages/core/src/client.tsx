const rootElement = document.getElementsByTagName('app-content')?.[0];
const ssrEnabled = true;
if (rootElement) {
  (async () => {
    const [
      { createRoot, hydrateRoot },
      { CookiesProvider },
      { default: Routes },
      { BrowserRouter },
      { ReactStrictMode },
      { App },
      { DataProvider },
      { HeadProvider },
    ] = await Promise.all([
      import('react-dom/client'),
      import('react-cookie'),
      // @ts-ignore
      import('@currentProject/routes'),
      // import('./components/browser-router.js')
      import('react-router-dom'),
      import('./components/strict.js'),
      import('./components/app.js'),
      import('./components/data.js'),
      import('./components/head.js'),
    ]);
    let routes = Routes;
    if (!Routes) {
      routes = [];
    }
    if (typeof Routes === 'function') {
      const { userAgent } = window.navigator;
      routes = await Routes({
        getLocation: async () => new URL(window.location.href),
        browserDetect: async () => {
          const { parse } = await import('bowser');
          try {
            return parse(userAgent);
          } catch {
            // Cannot parse useragent
          }
          return {
            browser: { name: '', version: '' },
            os: { name: '', version: '', versionName: '' },
            platform: { type: '' },
            engine: { name: '', version: '' },
          };
        },
        userAgent,
        isbot: async () => {
          const { default: isBot } = await import('isbot');
          isBot.exclude(['chrome-lighthouse']);
          return isBot(userAgent);
        },
      });
    }
    const children = (
      <ReactStrictMode>
        <CookiesProvider>
          <BrowserRouter>
            <DataProvider>
              <HeadProvider>
                <App routes={routes} />
              </HeadProvider>
            </DataProvider>
          </BrowserRouter>
        </CookiesProvider>
      </ReactStrictMode>
    );
    if (ssrEnabled) {
      hydrateRoot(
        rootElement,
        children,
        {
          onRecoverableError: (error) => {
            /**
             * A Developer to a developer:
             * this is a known error, we are knowingly ignoring the error
             * of hydration. this can be improved with improvised implementation
             * of routes and router. Right now we are using ReactRouter and it only
             * happens when we doing selective hydrate on the same route.
             */
            if (error instanceof Error) {
              const isHydratingError = error.message
                .toLowerCase()
                .indexOf(
                  'this suspense boundary received an update before it finished hydrating',
                ) !== -1;
              const isDocumentLoading = document.readyState === 'loading';
              if (isHydratingError && isDocumentLoading) {
                // Do nothing ignore the error.
              }
            } else {
              throw error;
            }
          },
        },
      );
    } else {
      const root = createRoot(rootElement);
      root.render(children);
    }

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then((registration) => {
          // eslint-disable-next-line no-console
          console.log('SW registered: ', registration);
        }).catch((registrationError) => {
          // eslint-disable-next-line no-console
          console.log('SW registration failed: ', registrationError);
        });
      });
    }
  })();
} else {
  // eslint-disable-next-line no-console
  console.log('Cannot find root element');
}
