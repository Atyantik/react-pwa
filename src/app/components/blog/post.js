import React from "react";
import _ from "lodash";

export default class Post extends React.Component {

  render() {
    if (!_.get(this.props, "preLoadedData.id", 0)) {
      return null;
    }
    return (
      <div className="mt-5">
        <h1
          className="text-center"
          dangerouslySetInnerHTML={{
            __html: this.props.preLoadedData.title.rendered
          }}
        />
        <div dangerouslySetInnerHTML={{ __html: this.props.preLoadedData.content.rendered}} />
      </div>
    );
  }
}