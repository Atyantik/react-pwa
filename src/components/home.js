import React from 'react';
import PropTypes from 'prop-types';
import GuestLayout from './guest-layout';

const Column = (props) => {
  const { title, description, link } = props;
  return (
    <div className="column">
      <div className="card">
        <header className="card-header">
          <p className="card-header-title">
            {title}
          </p>
        </header>
        <div className="card-content">
          <div className="content">
            {description}
            {' '}
            {!!link.length && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer noopener nofollow"
              >
                Read more
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
Column.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  link: PropTypes.string.isRequired,
};

export default () => (
  <GuestLayout>
    <section className="hero is-medium is-info is-bold">
      <div className="hero-body">
        <div className="container">
          <h1 className="title">
            Features
          </h1>
          <h2 className="subtitle">
            There are no limits for creativity
          </h2>
        </div>
      </div>
    </section>
    <section className="m-t-lg">
      <div className="container p-l-md p-r-md">
        <h4 className="title is-4">
          ReactPWA is configurable to the core.
          You can add plugins as you like to extend the features or
          you can use a bare minimum to start from scratch.
        </h4>
        <div className="columns">
          <Column
            title="Babel 7"
            description="Already packed with the latest babel to achieve great performance and lower bundle size."
            link="https://babeljs.io/blog/2018/08/27/7.0.0"
          />
          <Column
            title="Webpack 4"
            description="Optimized chunk splitting and is 98% more faster!
            Thus creating small chunks and only loading the required chunk (code splitting)."
            link="https://medium.com/webpack/webpack-4-released-today-6cdb994702d4"
          />
          <Column
            title="Image Optimization"
            description="@pawjs/image-optimizer specially for image optimizations.
            Improving the compression of image with image-webpack-loader"
            link="https://www.reactpwa.com/docs/en/plugin-image-optimization.html"
          />
        </div>
        <div className="columns">
          <Column
            title="Skeleton loaders"
            description="All the goodness of skeleton loading with very simple route configuration.
            Supports pre-loading of data for the route as well."
            link=""
          />
          <Column
            title="Non Conflicting CSS"
            description="Create hashed css classes such as _ax1c2d for your css modules loaded for
            the specific component, thus no-conflict for using same class names"
            link=""
          />
          <Column
            title="Redux"
            description="Integrating redux made simple with @pawjs/redux.
            Preconfigured SSR with redux at your finger tips with minimum configuration"
            link="https://www.reactpwa.com/docs/en/plugin-redux.html"
          />
        </div>
        <div className="columns">
          <Column
            title="SASS"
            description="Fan of SASS and PostCSS/CSSNext? well @pawjs/sass can help you
            add sass support very easily to your project."
            link="https://www.reactpwa.com/docs/en/plugin-sass.html"
          />
          <Column
            title="Deployments"
            description="Oh yes it is very simple to deploy and we already have tutorials for Heroku, Amazon EC2 & Digital Ocean"
            link="https://www.reactpwa.com/docs/en/deploying-to-heroku.html"
          />
          <Column
            title="Zero Configuration"
            description="You can also start minimal with react-pwa. You just need one file: `src/routes.js` and nothing more."
            link=""
          />
        </div>
      </div>
    </section>
  </GuestLayout>
);
