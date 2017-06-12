import BlogListing from "app/components/blog";
import BlogPost from "app/components/blog/post";
import DefaultLayout from "app/components/layout";

const routes = [
  {
    path: "/blog",
    exact: true,
    component: BlogListing,
    layout: DefaultLayout,
    preLoadData: async ({ api }) => {
      return api.fetch("https://www.atyantik.com/wp-json/wp/v2/posts");
    },
    bundleKey: "blog",
  },
  {
    path: "/blog/:id",
    component: BlogPost,
    layout: DefaultLayout,
    preLoadData: async ({match, api}) => {
      const { params } = match;
      return api.fetch(`https://www.atyantik.com/wp-json/wp/v2/posts/${params.id}`);
    },
    bundleKey: "blog",
  }
];

if (typeof window !== "undefined") {
  window.__updateRoutes(routes);
}

export default routes;