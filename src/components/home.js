import React from 'react';
import Layout from './layout';

export default () => (
  <Layout>
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
    <section>
      <div className="columns">
        <div className="column">
          <div className="card">
            <header className="card-header">
              <p className="card-header-title">
                Component
              </p>
            </header>
            <div className="card-content">
              <div className="content">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Phasellus nec iaculis mauris.
                <button type="button">@bulmaio</button>
                <button type="button">#css</button>
                {' '}
                <button type="button">#responsive</button>
                <br />
                <time dateTime="2016-1-1">11:09 PM - 1 Jan 2016</time>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);
