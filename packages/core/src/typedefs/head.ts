import { ReactElement, ReactFragment } from 'react';

/**
 * Acceptable types of Head Elements
 * <Head>
 *  // .. Acceptable Element Types, we are accepting Fragment till level 1
 * </Head>
 */
export type HeadElement = ReactElement | ReactElement[] | ReactFragment;

export type PromiseResolver = () => void;
