import React, { Component } from "react";
import SmallImage from "../../../resources/images/mario-large.png?sizes=100w+200w+400w+800w&placeholder&lightweight";
import Picture from "pawjs/src/components/picture/picture";

export default class ProgressiveImage extends Component {
  render() {
    return (
      <div className="mt-4">
        <Picture
          pictureClassName="d-inline-block w-100 my-4"
          image={SmallImage}
          alt="Small Image"
          imgClassName="w-100"
        />
      </div>
    );
  }
}
