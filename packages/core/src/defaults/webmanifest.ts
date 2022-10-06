import ReactPWASVG512 from '@reactpwa/core/assets/reactpwa-512.svg';
import ReactPWAPNG512 from '@reactpwa/core/assets/reactpwa-512.png';
import ReactPWAPNG192 from '@reactpwa/core/assets/reactpwa-192.png';

export default {
  short_name: 'ReactPWA',
  name: 'ReactPWA',
  icons: [
    {
      src: ReactPWASVG512,
      type: 'image/svg+xml',
      sizes: '512x512',
    },
    {
      src: ReactPWAPNG192,
      type: 'image/png',
      sizes: '192x192',
      purpose: 'maskable',
    },
    {
      src: ReactPWAPNG512,
      type: 'image/png',
      sizes: '512x512',
      purpose: 'maskable',
    },
  ],
  id: '/?source=pwa',
  start_url: '/?source=pwa',
  background_color: '#FFFFFF',
  display: 'standalone',
  scope: '/',
  theme_color: '#00ABEB',
  shortcuts: [
    // {
    //   name: "How's weather today?",
    //   short_name: 'Today',
    //   description: 'View weather information for today',
    //   url: '/today?source=pwa',
    //   icons: [{ src: '/images/today.png', sizes: '192x192' }],
    // },
    // {
    //   name: "How's weather tomorrow?",
    //   short_name: 'Tomorrow',
    //   description: 'View weather information for tomorrow',
    //   url: '/tomorrow?source=pwa',
    //   icons: [{ src: '/images/tomorrow.png', sizes: '192x192' }],
    // },
  ],
  description: 'React PWA - The simplest framework to create PWA with React',
  screenshots: [
    // {
    //   src: '/images/screenshot1.png',
    //   type: 'image/png',
    //   sizes: '540x720',
    // },
    // {
    //   src: '/images/screenshot2.jpg',
    //   type: 'image/jpg',
    //   sizes: '540x720',
    // },
  ],
};
