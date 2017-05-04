import React from "react";

export default class Post extends React.Component {

  render() {
    if (!this.props.preLoadedData.id) {
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