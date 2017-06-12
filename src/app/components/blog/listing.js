import React from "react";
import _ from "lodash";
import { Link } from "react-router-dom";

export default class BlogListing extends React.Component {

  render() {
    return (
      <div className="mt-5">
        {
          _.map(this.props.preLoadedData, blog => {
            const id = _.get(blog, "id", 0);
            return (
              <div key={id} className="media">
                <div className="media-body">
                  <h5 className="mt-0">
                    <Link to={`/blog/${id}`} dangerouslySetInnerHTML={{ __html: _.get(blog, "title.rendered")}} />
                  </h5>
                  <p dangerouslySetInnerHTML={{ __html:_.get(blog, "excerpt.rendered") }} />
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }
}
