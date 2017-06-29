import BlogListing from "app/components/blog";
import BlogPost from "app/components/blog/post";
import DefaultLayout from "app/components/layout";

const routes = [
  {
    path: "/:something",
    exact: true,
    layout: DefaultLayout,
    component: BlogListing,
    preLoadData: async ({ api }) => {
      return api.fetch("https://www.atyantik.com/wp-json/wp/v2/posts");
    },
    bundleKey: "blog",
  },
  {
    path: "/:something/:id",
    layout: DefaultLayout,
    component: BlogPost,
    preLoadData: async ({match, api}) => {
      const { params } = match;
      return api.fetch(`https://www.atyantik.com/wp-json/wp/v2/posts/${params.id}`);
    },
    bundleKey: "blog",
  }
];

if (typeof window !== "undefined") {
  window.__updatePage({ routes });
  if (module.hot) {
    module.hot.accept();
    //window.__renderRoutes();
  }
}

export default routes;