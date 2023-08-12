import { ReactElement, Fragment } from 'react';

type HeadElement = ReactElement | HeadElement[];

export function findTitle(list: HeadElement): string | null {
  // Base case: if it's a title element, return its contents.
  if (!Array.isArray(list) && list.type === 'title') {
    return typeof list.props.children === 'string'
      ? list.props.children
      : list.props.children.join('');
  }

  // Recursive case: if it's an array, look for the first non-null title.
  if (Array.isArray(list)) {
    return list.map(findTitle).find((title) => title !== null) || null;
  }

  // Recursive case: if it's a Fragment, look for the title within its children.
  if (list.type === Fragment && list.props.children) {
    return findTitle(list.props.children);
  }

  return null;
}
