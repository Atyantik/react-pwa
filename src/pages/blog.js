import BlogListing from "../app/components/blog";
import BlogPost from "../app/components/blog/post";
import DefaultLayout from "../app/components/layout";

const routes = [
  {
    path: "/blog",
    exact: true,
    layout: DefaultLayout,
    component: BlogListing,
    preLoadData: async ({ api }) => {
      return api.fetch("https://www.atyantik.com/wp-json/wp/v2/posts", { swcache: 20000 });
    },
    bundleKey: "blog",
  },
  {
    path: "/blog/:id",
    layout: DefaultLayout,
    component: BlogPost,
    preLoadData: async ({match, api}) => {
      const { params } = match;
      return api.fetch(`https://www.atyantik.com/wp-json/wp/v2/posts/${params.id}`, { swcache: 20000 });
    },
    bundleKey: "blog",
  }
];

if (typeof window !== "undefined") {
  window.__updatePage && window.__updatePage({ routes });
  window.__renderRoutes && window.__renderRoutes();
}
export default routes;