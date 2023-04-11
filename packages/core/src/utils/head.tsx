import {
  cloneElement,
  ReactElement,
  Fragment,
  Children,
  DetailedReactHTMLElement,
} from 'react';
import { IWebManifest } from '../typedefs/webmanifest.js';
import { HeadElement } from '../typedefs/head.js';

// eslint-disable-next-line no-bitwise
export const fastHashStr = (str: string) => str.split('').reduce((s, c) => (Math.imul(31, s) + c.charCodeAt(0)) | 0, 0);

export function insertAfter(newNode: Node, existingNode: Node) {
  if (!existingNode?.parentNode) {
    return;
  }
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}

const METATYPES = [
  'name',
  'rel',
  'httpEquiv',
  'charSet',
  'itemProp',
  'theme-color',
];
/**
 * The unique function is taken from next.js
 * @returns get set of unique
 */
export function unique() {
  const keys = new Set();
  const tags = new Set();
  const metaTypes = new Set();
  const metaCategories: { [metatype: string]: Set<string> } = {};
  const hashList: number[] = [];

  return (h: React.ReactElement<any>) => {
    let isUnique = true;
    let hasKey = false;

    if (h.key && typeof h.key !== 'number' && h.key.indexOf('$') > 0) {
      hasKey = true;
      const key = h.key.slice(h.key.indexOf('$') + 1);
      if (keys.has(key)) {
        isUnique = false;
      } else {
        keys.add(key);
      }
    }

    switch (h.type) {
      case 'title':
      case 'base':
        if (tags.has(h.type)) {
          isUnique = false;
        } else {
          tags.add(h.type);
        }
        break;
      case 'link':
        if (h.props?.rel === 'manifest') {
          if (tags.has('manifest')) {
            isUnique = false;
          } else {
            tags.add('manifest');
          }
        }
        break;
      case 'meta':
        for (let i = 0, len = METATYPES.length; i < len; i += 1) {
          const metatype = METATYPES[i];
          if (h.props.hasOwnProperty(metatype)) {
            if (metatype === 'charSet') {
              if (metaTypes.has(metatype)) {
                isUnique = false;
              } else {
                metaTypes.add(metatype);
              }
            } else {
              const category = h.props[metatype];
              const categories = metaCategories[metatype] || new Set();
              if (
                (metatype !== 'name' || !hasKey)
                && categories.has(category)
              ) {
                isUnique = false;
              } else {
                categories.add(category);
                metaCategories[metatype] = categories;
              }
            }
          }
        }
        if (isUnique) {
          const propsHash = fastHashStr(JSON.stringify(h.props));
          isUnique = !hashList.includes(propsHash);
          if (isUnique) {
            hashList.push(propsHash);
          }
        }
        if (
          isUnique
          && typeof h.key === 'string'
          && h.key.indexOf('$') === -1
          && h.props?.property === 'og:image'
        ) {
          // this is a classic case when we want to avoid the default share image in og:image
          if (keys.has(h.key)) {
            isUnique = false;
          } else {
            keys.add(h.key);
          }
        }
        break;
      default:
        break;
    }
    return isUnique;
  };
}

/**
 * Get Elements presented by user in the <Head></Head>
 * tag as children and convert it to ReactElement
 * @param list HeadElement
 * @returns ReactElement []
 */
export function convertToReactElement(list: HeadElement): ReactElement[] {
  let headNodes: any[] = [];
  const allNodes = Array.isArray(list) ? list : [list];
  for (let i = 0; i < allNodes.length; i += 1) {
    const node = allNodes[i];
    if (
      typeof node !== 'string'
      && typeof node !== 'number'
      && typeof node !== 'boolean'
      && node !== null
      && typeof node !== 'undefined'
    ) {
      if (
        // @ts-ignore
        node.type === Fragment
        // @ts-ignore
        && node.props?.children
      ) {
        const childElements = convertToReactElement(
          // @ts-ignore
          Children.toArray(node.props.children),
        );
        headNodes = headNodes.concat(childElements);
      } else if (
        // @ts-ignore
        node.type === 'title'
        // @ts-ignore
        && Array.isArray(node.props?.children)
      ) {
        const titleNode = node as DetailedReactHTMLElement<any, any>;
        headNodes.push(
          cloneElement(titleNode, {
            children: titleNode.props.children.join(''),
          }),
        );
      } else {
        headNodes.push(node);
      }

      // @ts-ignore
      const rel = node.props?.rel;
      // @ts-ignore
      const href = node.props?.href;

      if (
        // @ts-ignore
        node.type === 'link'
        && rel === 'stylesheet'
      ) {
        const hrefText = href ? `${href} detected in your <Head> tag. ` : '';
        // eslint-disable-next-line no-console
        console.warn(
          `WARNING:: ${hrefText} Avoid stylesheets in <Head> element.\n
          Read more here: https://www.reactpwa.com/blog/no-link-in-head.html`,
        );
      }
    }
  }
  return headNodes;
}

/**
 * Add key to ReactElement if missing,
 * helps us solve the problem when we render components of head
 * as an array
 */
export const addKeyToElement = () => {
  let keyIndex = 1;
  const existingKeys: (string | number)[] = [];
  return (element: ReactElement) => {
    if (!element.key || existingKeys.includes(element.key)) {
      let key = `h.${keyIndex}`;
      while (existingKeys.includes(key)) {
        keyIndex += 1;
        key = `h.${keyIndex}`;
      }
      const clonedElement = cloneElement(element, {
        key,
      });
      keyIndex += 1;
      existingKeys.push(key);
      return clonedElement;
    }
    existingKeys.push(element.key);
    return element;
  };
};

/**
 * Below two functions are for sorting of the meta tags in the head
 */
const priorities: Record<string, number> = {
  default: 100,
  charSet: 1,
  httpEquiv: 2,
  viewport: 3,
  title: 4,
  description: 5,
  keywords: 6,
  author: 7,
  robots: 8,
};

const getPriority = (element: React.ReactElement) => {
  if (
    element.type === 'meta'
    && (element.props?.charSet || element.props?.charset)
  ) {
    return priorities.charSet;
  }
  if (
    element.type === 'meta'
    && (element.props?.httpEquiv || element.props?.['http-equiv'])
  ) {
    return priorities.httpEquiv;
  }

  if (element.type === 'title') {
    return priorities.title;
  }
  if (element.type === 'meta' && typeof element.props?.name === 'string') {
    return priorities[element.props.name.toLowerCase()] ?? priorities.default;
  }
  return priorities.default;
};

export const sortHeadElements = (
  a: React.ReactElement,
  b: React.ReactElement,
) => getPriority(a) - getPriority(b);

export const defaultHead = convertToReactElement(
  <>
    <meta httpEquiv="X-UA-Compatible" content="IE=Edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </>,
);

export const getAppleIcon = (webmanifest: IWebManifest) => (webmanifest?.icons ?? []).find(
  (i: { sizes?: string; src: string }) => (i?.sizes?.indexOf('192') !== -1 || i?.sizes?.indexOf('180') !== -1)
      && i?.src?.indexOf?.('.svg') === -1,
);

export const sanitizeElements = (elements: ReactElement[]) => elements
  .reverse()
  .filter(unique())
  .reverse()
  .map(addKeyToElement())
  .sort(sortHeadElements);

const historyWeakMap = new WeakMap();
export const proxyHistoryPushReplace = (callback: Function) => {
  if (historyWeakMap.has(window)) {
    return;
  }
  (function proxyHistory(history) {
    const { pushState, replaceState } = history;
    historyWeakMap.set(window, { pushState, replaceState });

    const pushOverride: typeof pushState = (...args) => {
      callback();
      pushState.apply(history, args);
    };
    const replaceOverride: typeof replaceState = (...args) => {
      callback();
      pushState.apply(history, args);
    };
    // Patch the history for custom monitoring of events
    // eslint-disable-next-line no-param-reassign
    history.pushState = pushOverride;
    // eslint-disable-next-line no-param-reassign
    history.replaceState = replaceOverride;
  }(window.history));
};

export const restoreHistoryPushReplace = () => {
  (function proxyHistory(history) {
    const { pushState, replaceState } = historyWeakMap.get(window);
    // Patch the history for custom monitoring of events
    // eslint-disable-next-line no-param-reassign
    history.pushState = pushState;
    // eslint-disable-next-line no-param-reassign
    history.replaceState = replaceState;
  }(window.history));
};
