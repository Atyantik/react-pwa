import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";

export default class Picture extends Component {
  static propTypes = {
    alt: PropTypes.string,
    image: PropTypes.arrayOf(PropTypes.shape({
      "sources": PropTypes.object,
      "type": PropTypes.string,
      "srcSet": PropTypes.string,
      "placeholder": PropTypes.shape({
        "color": PropTypes.array,
        "url": PropTypes.string,
        "ratio": PropTypes.number
      })
    }))
  };
  static defaultProps = {
    alt: "",
    image: [],
  };
  
  constructor(props) {
    super(props);
    this.state = {
      image: this.rearrange(props.image)
    };
  }
  
  rearrange(image) {
    if (!_.isArray(image)) return image;
    const webpSet = _.find(image, img => img.type.toLowerCase() !== "image/webp");
    // If no webp set is found, then simply return the image as it is
    if (!webpSet) return image;
    
    _
    
  }
  
  getFallbackSrc(image) {
    if (_.isString(image)) return image;
    if (_.isArray(image) && image.length >= 2) {
      let selectSet = _.find(image, img => img.type.toLowerCase() !== "image/webp");
      if (!selectSet) {
        selectSet = _.first(image);
      }
      
      let placeholder = _.get(selectSet, "placeholder.url", "");
      if (placeholder) return placeholder;
      
      let sources = _.get(selectSet, "sources", {});
      let sourcesKeys = Object.keys(sources);
      if (!sourcesKeys.length) return "";
      return sources[_.last(sourcesKeys)];
    }
  }
  render() {
    const { image, alt, imgClassName, pictureClassName } = this.props;
    return (
      <picture className={pictureClassName}>
        {Array.map(image, (img, index) => {
          return <source type={img.type} srcSet={img.srcSet} key={index}/>;
        })}
        <img className={imgClassName} src={this.getFallbackSrc(image)} alt={alt} />
      </picture>
    );
  }
}