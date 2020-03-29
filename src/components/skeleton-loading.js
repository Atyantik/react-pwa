import React from 'react';
import GuestLayout from './guest-layout';

const stripTags = (s, elip = true, l = 60) => `${s.replace(/(<([^>]+)>)/ig, '').replace(/[^a-zA-Z0-9\s]/g, ' ').substr(0, l)} ${elip ? '...' : ''}`;
export default (props) => {
  // eslint-disable-next-line
  const { loadedData: [blog1, blog2, blog3, blog4] } = props;
  return (
    <GuestLayout>
      <div className="container p-t-xl  p-r-md p-l-md">
        <h1 className="title">Ajax loaded SSR Compliant blog list from Atyantik Technologies</h1>
        <div className="tile is-ancestor">
          <div className="tile is-vertical is-8">
            <div className="tile">
              <div className="tile is-parent is-vertical">
                <article className="tile is-child notification is-primary">
                  <p className="title">{stripTags(blog1.title.rendered, false)}</p>
                  <p className="subtitle">{stripTags(blog1.excerpt.rendered)}</p>
                </article>
                <article className="tile is-child notification is-warning">
                  <p className="title">{stripTags(blog2.title.rendered, false)}</p>
                  <p className="subtitle">{stripTags(blog2.excerpt.rendered)}</p>
                </article>
              </div>
              <div className="tile is-parent">
                <article className="tile is-child notification is-info">
                  <p className="title">{stripTags(blog3.title.rendered, false)}</p>
                  <p className="subtitle">{stripTags(blog3.excerpt.rendered)}</p>
                  <figure className="image is-4by3">
                    <img alt="placeholder" src={blog3.jetpack_featured_media_url} />
                  </figure>
                </article>
              </div>
            </div>
            <div className="tile is-parent">
              <article className="tile is-child notification is-danger">
                <p className="title">{stripTags(blog3.title.rendered, false)}</p>
                <p className="subtitle">{stripTags(blog3.excerpt.rendered)}</p>
              </article>
            </div>
          </div>
          <div className="tile is-parent">
            <article className="tile is-child notification is-success">
              <div className="content">
                <p className="title">{stripTags(blog4.title.rendered, false)}</p>
                <p className="subtitle">{stripTags(blog3.excerpt.rendered, true, 1000)}</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </GuestLayout>
  );
};
