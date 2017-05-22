import fetch from "universal-fetch";
import BlogListing from "app/components/blog";
import BlogPost from "app/components/blog/post";
import DefaultLayout from "app/components/layout";

const routes = [
  {
    path: "/blog",
    exact: true,
    component: BlogListing,
    layout: DefaultLayout,
    preLoadData: async () => {
      "use strict";
      return fetch("https://www.atyantik.com/wp-json/wp/v2/posts")
        .then(response => response.json());
    },
    bundleKey: "blog",
  },
  {
    path: "/blog/:id",
    component: BlogPost,
    layout: DefaultLayout,
    preLoadData: async ({match}) => {
      const { params } = match;
      return fetch(`https://www.atyantik.com/wp-json/wp/v2/posts/${params.id}`)
        .then(response => response.json());
    },
    bundleKey: "blog",
  }
];

if (typeof window !== "undefined") {
  window.__updateRoutes(routes);
}

export default routes;