/* eslint-disable prefer-rest-params */
/* eslint-disable no-param-reassign */
import {
  FC,
  ReactElement,
  ReactNode,
  Suspense,
  useContext,
  useEffect,
  useRef,
} from 'react';
import { createRoot } from 'react-dom/client';
import { delay } from '../../utils/delay.js';
import {
  convertToReactElement,
  defaultHead,
  fastHashStr,
  getAppleIcon,
  proxyHistoryPushReplace,
  restoreHistoryPushReplace,
  sanitizeElements,
} from '../../utils/head.js';
import { IWebManifest } from '../../typedefs/webmanifest.js';
import { ReactPWAContext } from '../reactpwa.js';
import { HeadElement, PromiseResolver } from '../../typedefs/head.js';
import { HeadContext } from './context.js';
import { LazyHead } from './lazy.js';

export const HeadProvider: FC<{
  children: ReactNode;
  styles?: string[];
  stylesWithContent?: { href: string; content: string }[];
  preStyles?: ReactElement | ReactElement[];
}> = ({
  children, styles, stylesWithContent, preStyles,
}) => {
  const { getValue } = useContext(ReactPWAContext);
  const dataPromiseResolver = useRef<null | { current: PromiseResolver }>(null);
  const setDataPromiseResolver = (resolver: { current: PromiseResolver }) => {
    dataPromiseResolver.current = resolver;
  };
  const resolveDataPromiseResolver = () => {
    if (dataPromiseResolver.current?.current) {
      dataPromiseResolver.current.current();
    }
  };
  // Get web manifest data
  const webmanifest = getValue<IWebManifest>('Webmanifest', {});
  const appleIcon = getAppleIcon(webmanifest);
  const { name, description } = webmanifest || {};
  const headElementsMap = useRef<
  {
    id: string;
    elements: ReactElement[];
  }[]
  >([
    {
      id: '__default',
      elements: defaultHead,
    },
  ]);
  if (name || description) {
    headElementsMap.current.push({
      id: '__manifest',
      elements: convertToReactElement(
        <>
          {!!webmanifest.name && <title>{webmanifest.name}</title>}
          {!!webmanifest.description && (
            <meta name="description" content={webmanifest.description} />
          )}
        </>,
      ),
    });
  }
  const elements = useRef<ReactElement[]>([]);
  const headRootRef = useRef<ReturnType<typeof createRoot> | null>(null);
  const headShadowDivRef = useRef<HTMLDivElement | null>(null);
  const renderedHeadNodesRef = useRef<Node[]>([]);
  // @ts-ignore
  // If server side render is disabled, it means the script will be loaded at end
  // and we do not need to stream or hydrate any data. Thus making sure we can set
  // initialLoad as false. Purpose of initial load is only significant when we already have
  // head rendered by SSR.
  const initialLoadRef = useRef(EnableServerSideRender);
  const nextHeadUpdate = useRef<Function | null>(null);
  const isHeadUpdating = useRef(false);
  const isMutating = useRef(false);

  const executeNextUpdate = () => {
    if (isHeadUpdating.current || isMutating.current) {
      return;
    }
    if (nextHeadUpdate.current) {
      nextHeadUpdate.current();
      nextHeadUpdate.current = null;
    }
  };

  /**
   * When the head component is mounted, which means,
   * the SSR is complete and now the components that are being changed are used
   * to change the state of head
   */
  const updateHead = async () => {
    if (
      !initialLoadRef.current
      && headShadowDivRef.current
      && headRootRef.current
    ) {
      isHeadUpdating.current = true;
      let allElements: ReactElement[] = [];
      // Because for loop is faster
      for (let i = 0; i < headElementsMap.current.length; i += 1) {
        allElements = allElements.concat(headElementsMap.current[i].elements);
      }

      const headElements = sanitizeElements(allElements);

      // Render ReactPWA head
      headRootRef.current.render(headElements);
      // Wait for 10 miliseconds to let dom update the elements
      await delay(10);

      const newRenderedHeadNodes = [];
      for (let i = renderedHeadNodesRef.current.length - 1; i >= 0; i -= 1) {
        let node = renderedHeadNodesRef.current[i];
        const newArrIndex = Array.from(
          headShadowDivRef.current.childNodes,
        ).findIndex((cn) => {
          // @ts-ignore
          if (!cn.outerHTML || !node.outerHTML) {
            return false;
          }
          // @ts-ignore
          return fastHashStr(cn.outerHTML) === fastHashStr(node.outerHTML);
        });

        if (newArrIndex === -1) {
          try {
            node.parentNode?.removeChild?.(node);
          } catch {
            // With hot reload the node tends to to remove the child itself, thus
            // the node no longer belongs to the parent. thus forcefully
            // ask GC to garbage collect it.
            // @ts-ignore
            node = null;
          }
        } else {
          newRenderedHeadNodes.push(node);
        }
      }
      renderedHeadNodesRef.current = newRenderedHeadNodes;

      for (
        let i = headShadowDivRef.current.childNodes.length - 1;
        i >= 0;
        i -= 1
      ) {
        const node = headShadowDivRef.current.childNodes[i];
        const oldArrIndex = renderedHeadNodesRef.current.findIndex((n) => {
          try {
            return n.isEqualNode(node);
          } catch (ex) {
            // eslint-disable-next-line no-console
            console.log(ex);
          }
          return false;
        });
        if (oldArrIndex === -1) {
          const clonedNode = node.cloneNode(true);
          document.head.prepend(clonedNode);
          renderedHeadNodesRef.current.push(clonedNode);
        }
      }

      isHeadUpdating.current = false;
      executeNextUpdate();
    } else {
      executeNextUpdate();
    }
  };

  const queueUpdateHead = () => {
    if (isHeadUpdating.current || isMutating.current) {
      nextHeadUpdate.current = () => {
        updateHead();
      };
    } else {
      updateHead();
    }
  };

  /**
   * Create head root on navigation
   */
  useEffect(() => {
    const initLoaded = () => {
      if (!headRootRef.current) {
        headShadowDivRef.current = document.createElement('div');
        headRootRef.current = createRoot(headShadowDivRef.current);
        // Fill in the head elements
        let doRecord = false;
        const commentNodes = [];
        const { childNodes } = document.head;
        // Record nodes between the SSR Comment
        for (let i = 0; i < childNodes.length; i += 1) {
          const childNode = childNodes[i];
          if (childNode.nodeName === '#comment') {
            commentNodes.push(childNode);
            doRecord = childNode.textContent === '$';
          }
          if (doRecord) {
            renderedHeadNodesRef.current.push(childNode);
          }
        }
        /** Remove comment Nodes from head sent via server side render */
        for (let i = 0; i < commentNodes.length; i += 1) {
          commentNodes[i].remove();
        }
      }
      queueUpdateHead();
    };
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initLoaded, {
        passive: true,
      });
    } else {
      initLoaded();
    }
    const setInitialLoadRefFalse = () => {
      initialLoadRef.current = false;
      window.removeEventListener('popstate', setInitialLoadRefFalse);
      restoreHistoryPushReplace();
    };

    proxyHistoryPushReplace(setInitialLoadRefFalse);
    window.addEventListener('popstate', setInitialLoadRefFalse, {
      passive: true,
    });

    return () => {
      window.removeEventListener('DOMContentLoaded', initLoaded);
      window.removeEventListener('popstate', setInitialLoadRefFalse);
    };
  }, []);

  const addChildren = (headChildren: HeadElement, id: string) => {
    const existingId = headElementsMap.current.find((a) => a.id === id);
    if (!existingId) {
      headElementsMap.current.push({
        id,
        elements: convertToReactElement(headChildren),
      });
    } else {
      existingId.elements = convertToReactElement(headChildren);
    }
    let allElements: ReactElement[] = [];
    headElementsMap.current.forEach((e) => {
      allElements = allElements.concat(e.elements);
    });

    try {
      elements.current = sanitizeElements(allElements);
      // Update on client side
      queueUpdateHead();
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  };

  const removeChildren = (id: string) => {
    const existingIdIndex = headElementsMap.current.findIndex(
      (a) => a.id === id,
    );
    if (existingIdIndex !== -1) {
      headElementsMap.current.splice(existingIdIndex, 1);
    }
    let allElements: ReactElement[] = [];
    headElementsMap.current.forEach((e) => {
      allElements = allElements.concat(e.elements);
    });
    try {
      elements.current = sanitizeElements(allElements);
      // Update on client side
      queueUpdateHead();
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.log(ex);
    }
  };

  const renderHead = typeof window === 'undefined';
  return (
    <HeadContext.Provider
      value={{
        addChildren,
        removeChildren,
        elements,
        setDataPromiseResolver,
        resolveDataPromiseResolver,
      }}
    >
      {renderHead && (
        <head>
          <Suspense>
            <LazyHead />
          </Suspense>
          {convertToReactElement(<>{preStyles}</>)}
          <meta
            name="theme-color"
            content={`${webmanifest?.theme_color ?? '#FFFFFF'}`}
          />
          <link rel="manifest" href="/manifest.webmanifest" />
          {!!appleIcon && (
            <link rel="apple-touch-icon" href={appleIcon.src}></link>
          )}
          {(stylesWithContent ?? []).map((style) => (
            <style
              data-href={style.href}
              key={`style-${style.href}`}
              dangerouslySetInnerHTML={{
                __html: style.content,
              }}
            />
          ))}
          {(styles ?? []).map((style) => (
            <link
              data-href={style}
              rel="stylesheet"
              key={style}
              type="text/css"
              href={style}
            />
          ))}
        </head>
      )}
      {children}
    </HeadContext.Provider>
  );
};
