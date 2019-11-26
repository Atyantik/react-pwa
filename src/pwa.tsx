import PwaIcon192 from './resources/img/pwa-icon-192x192.png';
import PwaIcon512 from './resources/img/pwa-icon-512x512.png';

export default {
  name: process.env.APP_NAME,
  short_name: process.env.APP_NAME,

  // Possible values ltr(left to right)/rtl(right to left)
  dir: 'ltr',

  // language: Default en-US
  lang: 'en-US',

  // Orientation of web-app possible:
  // any, natural, landscape, landscape-primary, landscape-secondary,
  // portrait, portrait-primary, portrait-secondary
  orientation: 'any',
  start_url: '/',
  background_color: '#fff',
  theme_color: '#fff',
  display: 'standalone',
  description: process.env.APP_DESCRIPTION,
  icons: [
    {
      src: PwaIcon192,
      sizes: '192x192',
    },
    {
      src: PwaIcon512,
      sizes: '512x512',
    },
  ],
};
