export default {
  server: {
    port: 3003,
  },
  hsts: {
    enabled: true,
    // mageAge: Must be at least 18 weeks to be approved by Google, but we are setting it to 1 year
    maxAge: 31536000,
    // Must be enabled to be approved by Google
    includeSubDomains: true,
    preload: true,
  },
  pwa: {
    "name": "React Redux PWA Seo-ed",
    "short_name": "RRPS",
    // Possible values ltr(left to right)/rtl(right to left)
    "dir": "ltr",
    
    // language: Default en-US
    "lang": "en-US",
    
    // Orientation of web-app possible:
    // any, natural, landscape, landscape-primary, landscape-secondary, portrait, portrait-primary, portrait-secondary
    "orientation": "any",
    "start_url": "/",
    "background_color": "#fff",
    "theme_color": "#fff",
    "display": "standalone",
    "description": "Boilerplate for react, redux with server-side rendering for SEO and support for progressive web application"
  },
  seo: {
    title: "Common Title",
    site_name: "My Site Name",
    description: "This is some temporary description, used if no other description is found",
    twitter: {
      site: "@atyantik_tech",
      creator: "@tirthbodawala"
    },
    facebook: {
      admins: [
        "1501220844",
        "765904161",
      ],
    },
    meta: [
      {
        name:"viewport",
        content: "width=device-width, initial-scale=1"
      },
      {
        name:"theme-color",
        content: "#fff"
      },
      {
        charSet: "utf-8",
      },
      {
        httpEquiv: "x-ua-compatible",
        content: "ie=edge",
      }
    ],
  },
};