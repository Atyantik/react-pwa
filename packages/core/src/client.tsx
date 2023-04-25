import { matchRoutes } from 'react-router-dom';

const rootElement = document.getElementsByTagName('app-content')?.[0];
// @ts-ignore
const ssrEnabled = EnableServerSideRender;

if (rootElement) {
  const init = async () => {
    const [
      { createRoot, hydrateRoot },
      { CookiesProvider },
      { default: Routes },
      { BrowserRouter },
      { ReactStrictMode },
      { App },
      { DataProvider },
      { HeadProvider },
      { requestArgs },
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
      import('./components/head/provider.js'),
      import('./utils/client.js'),
    ]);
    let routes = Routes;
    if (!Routes) {
      routes = [];
    }
    if (typeof Routes === 'function') {
      routes = await Routes(requestArgs);
    }
    const matched = matchRoutes(routes, window.location) ?? [];
    await Promise.all(
      // @ts-ignore
      matched.map((route) => route.route?.element?.()),
    );
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
    const render = async () => {
      if (ssrEnabled) {
        hydrateRoot(rootElement, children, {
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
        });
      } else {
        const root = createRoot(rootElement);
        root.render(children);
      }
    };
    if (document.readyState === 'complete') {
      render();
    }
    document.addEventListener('readystatechange', () => {
      if (document.readyState === 'complete') {
        render();
      }
    });

    // @ts-ignore
    if (EnableServiceWorker) {
      // Register service worker
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register('/sw.js')
            .then((registration) => {
              // eslint-disable-next-line no-console
              console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
              // eslint-disable-next-line no-console
              console.log('SW registration failed: ', registrationError);
            });
        });
      }
    } else if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
    }
  };
  init();
} else {
  // eslint-disable-next-line no-console
  console.log('Cannot find root element');
}
