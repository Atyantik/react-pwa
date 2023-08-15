import { useLayoutEffect } from 'react';
import { matchRoutes, BrowserRouter, useLocation } from 'react-router-dom';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { CookiesProvider } from 'react-cookie';
// @ts-ignore
import Routes from '@currentProject/routes';
import { ReactStrictMode } from './components/strict.js';
import { App } from './components/app.js';
import { requestArgs } from './utils/client.js';
import { ReactPWAContext } from './components/reactpwa.js';
import { setInternalVar, getInternalVar } from './utils/request-internals.js';

const rootElement = document.getElementsByTagName('app-content')?.[0];
// @ts-ignore
const ssrEnabled = EnableServerSideRender;

if (rootElement) {
  const init = async () => {
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

    const reference = {
      current: {
        key: 'INITIAL',
      },
    };
    const setRequestValue = (key: string, val: any) => {
      setInternalVar(reference.current, key, val);
    };
    const getRequestValue = (key: string, dv: any = null) => getInternalVar(reference.current, key, dv);

    let scriptInitialized = false;
    const initSyncData = () => {
      if (!scriptInitialized) {
        scriptInitialized = true;
        const scriptTextElement = document.querySelector(
          'script[type="text/sync-data-template"][id="_rpwa"]',
        );
        if (scriptTextElement) {
          try {
            const scriptText = window.atob(scriptTextElement.innerHTML);
            setRequestValue(
              'syncData',
              new Map(JSON.parse(scriptText) as [string, any][]),
            );
          } catch (ex) {
            // eslint-disable-next-line no-console
            console.error('Failed to parse sync data.', ex);
          }
          scriptTextElement.remove();
        }
      }
    };

    const MountElement = () => {
      const location = useLocation();
      useLayoutEffect(() => {
        reference.current = {
          key: location.key,
        };
        initSyncData();
      }, [location.key]);
      return null;
    };

    const children = (
      <ReactStrictMode>
        <ReactPWAContext.Provider
          value={{ setValue: setRequestValue, getValue: getRequestValue }}
        >
          <CookiesProvider>
            <BrowserRouter>
              <MountElement />
              <App routes={routes} />
            </BrowserRouter>
          </CookiesProvider>
        </ReactPWAContext.Provider>
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
    // @ts-ignore
    if (window.preloadComplete) {
      render();
    } else {
      // @ts-ignore
      window.onPreloadComplete = render;
    }

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
