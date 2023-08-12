import { ReactNode } from 'react';

/**
 * Acceptable types of Head Elements
 * <Head>
 *  // .. Acceptable Element Types, we are accepting Fragment till level 1
 * </Head>
 */
export type HeadElement = ReactNode[] | ReactNode;
