import {
  cloneElement,
  ReactElement,
  Fragment,
  Children,
  ReactFragment,
  DetailedReactHTMLElement,
} from 'react';

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
              if ((metatype !== 'name' || !hasKey) && categories.has(category)) {
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
        break;
      default:
        break;
    }
    return isUnique;
  };
}

/**
 * Acceptable types of Head Elements
 * <Head>
 *  // .. Acceptable Element Types, we are accepting Fragment till level 1
 * </Head>
 */
export type HeadElement = ReactElement | ReactElement[] | ReactFragment;

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
        && node?.props?.children
      ) {
        // @ts-ignore
        const childElements = convertToReactElement(Children.toArray(node.props.children));
        headNodes = headNodes.concat(childElements);
      } else if (
        // @ts-ignore
        node.type === 'title'
        // @ts-ignore
        && Array.isArray(node?.props?.children)
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

      if (
        // @ts-ignore
        node?.type === 'link'
        // @ts-ignore
        && node?.props?.rel === 'stylesheet'
      ) {
        // @ts-ignore
        const hrefText = node?.props?.href
          // @ts-ignore
          ? `${node?.props?.href} detected in your <Head> tag. `
          : '';
        // eslint-disable-next-line no-console
        console.warn(
          `WARNING:: ${hrefText}Avoid stylesheets in <Head> element.\nRead more here: https://www.reactpwa.com/blog/no-link-in-head.html`,
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
  if (element.type === 'meta' && (element.props?.charSet || element.props?.charset)) {
    return priorities.charSet;
  }
  if (element.type === 'meta' && (element.props?.httpEquiv || element.props?.['http-equiv'])) {
    return priorities.httpEquiv;
  }

  if (element.type === 'title') {
    return priorities.title;
  }
  if (element.type === 'meta' && typeof element.props?.name === 'string') {
    return priorities?.[element.props.name.toLowerCase()] ?? priorities.default;
  }
  return priorities.default;
};

export const sortHeadElements = (
  a: React.ReactElement,
  b: React.ReactElement,
) => getPriority(a) - getPriority(b);
