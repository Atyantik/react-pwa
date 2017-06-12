export default {
  server: {
    port: 3000,
  },
  //api: {
    //baseUrl: "https://api.example.com/",
  //},
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
        charSet: "utf-8",
      },
      {
        httpEquiv: "x-ua-compatible",
        content: "ie=edge",
      }
    ],
  },
  images: {
    allowedExtensions: [
      ".jpeg",
      ".jpg",
      ".png",
      ".gif",
      ".svg",
      ".bmp",
    ],
  },
};