import {
  cloneElement,
  ReactElement,
  Fragment,
  Children,
  DetailedReactHTMLElement,
} from 'react';
import { IWebManifest } from '../../typedefs/webmanifest.js';
import { HeadElement } from '../../typedefs/head.js';

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
          // this is a classic case when we want to avoid
          // the default share image in og:image
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

const isValidReactElement = (n: HeadElement): n is ReactElement => n !== null && typeof n === 'object' && 'type' in n;

/**
 * Get Elements presented by user in the <Head></Head>
 * tag as children and convert it to ReactElement
 * @param list HeadElement
 * @returns ReactElement []
 */
export function convertToReactElement(list: HeadElement): ReactElement[] {
  const headNodes: ReactElement[] = [];

  const allNodes: HeadElement[] = Array.isArray(list) ? list : [list];

  const handleFragment = (node: ReactElement) => {
    const childElements = convertToReactElement(
      Children.toArray(node.props.children),
    );
    headNodes.push(...childElements);
  };

  const handleTitle = (node: DetailedReactHTMLElement<any, any>) => {
    const titleNode = cloneElement(node, {
      children: node.props.children.join(''),
    });
    headNodes.push(titleNode);
  };

  const handleWarnings = (node: ReactElement) => {
    const { type, props } = node;
    if (type === 'link' && props?.rel === 'stylesheet') {
      const hrefText = props?.href
        ? `${props.href} detected in your <Head> tag. `
        : '';
      // eslint-disable-next-line no-console
      console.warn(
        `WARNING:: ${hrefText} Avoid stylesheets in <Head> element.\n
         Read more here: https://www.reactpwa.com/blog/no-link-in-head.html`,
      );
    }
  };

  allNodes.forEach((node) => {
    if (isValidReactElement(node)) {
      if (node.type === Fragment && node.props?.children) {
        handleFragment(node);
      } else if (node.type === 'title' && Array.isArray(node.props?.children)) {
        handleTitle(node as DetailedReactHTMLElement<any, any>);
      } else {
        headNodes.push(node);
      }
      handleWarnings(node);
    }
  });

  return headNodes;
}

/**
 * Add key to ReactElement if missing,
 * helps us solve the problem when we render components of head
 * as an array
 */
export const addKeyToElement = () => {
  let keyIndex = 1;
  const existingKeys: Set<string | number> = new Set();

  return (element: ReactElement) => {
    let { key } = element;

    if (!key || existingKeys.has(key)) {
      key = `h.${keyIndex}`;
      while (existingKeys.has(key)) {
        keyIndex += 1;
        key = `h.${keyIndex}`;
      }
    }

    existingKeys.add(key);

    if (key !== element.key) {
      const clonedElement = cloneElement(element, { key });
      return clonedElement;
    }

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
