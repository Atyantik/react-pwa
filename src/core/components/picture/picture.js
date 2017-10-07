import _ from "lodash";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Fold from "../fold/fold";

export default class Picture extends Component {
  static propTypes = {
    alt: PropTypes.string,
    image: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.shape({
        "sources": PropTypes.object,
        "type": PropTypes.string,
        "srcSet": PropTypes.string,
        "placeholder": PropTypes.shape({
          "color": PropTypes.array,
          "url": PropTypes.string,
          "ratio": PropTypes.number
        })
      })),
      PropTypes.string,
    ]),
    pictureClassName: PropTypes.string,
    imgClassName: PropTypes.string,
  };
  static defaultProps = {
    alt: "",
    image: [],
    pictureClassName: "",
    imgClassName: "",
  };
  
  constructor(props) {
    super(props);
    this.state = {
      image: this.rearrange(props.image)
    };
  }
  
  componentWillReceiveProps(nextProps) {
    this.setState({
      image: this.rearrange(nextProps.image)
    });
  }
  
  rearrange(image) {
    if (!_.isArray(image)) return image;
    const webpSet = _.find(image, img => img.type.toLowerCase() === "image/webp");
    // If no webp set is found, then simply return the image as it is
    if (!webpSet) return image;
    
    const sortedImages = _.without(image, webpSet);
    sortedImages.unshift(webpSet);
    return sortedImages;
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
  getSourceSrc(image) {
    const sources = _.get(image, "sources", {});
    if (_.isEmpty(sources)) return "";
    return sources[_.last(Object.keys(sources))];
  }
  getSrcSet(image) {
    let srcSet = _.get(image, "srcSet", "");
    if (srcSet) return srcSet;
    
    return `${this.getSourceSrc(image)} 1w`;
  }
  render() {
    const { alt, imgClassName, pictureClassName } = this.props;
    const { image } = this.state;
    return (
      <picture className={pictureClassName}>
        <Fold>
          {Array.map(image, (img, index) => {
            return <source type={img.type} srcSet={this.getSrcSet(img)} key={index}/>;
          })}
        </Fold>
        <img className={imgClassName} src={this.getFallbackSrc(image)} alt={alt} />
      </picture>
    );
  }
}