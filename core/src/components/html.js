import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import {generateStringHash} from "../utils/utils";
import {generateMeta} from "../utils/seo";

const __development = process.env.NODE_ENV === "development";

export default class Html extends React.Component {
  
  static propTypes = {
    inlineCss: PropTypes.string,
    stylesheets: PropTypes.array,
    scripts: PropTypes.array,
    globals: PropTypes.shape({}),
    seo: PropTypes.shape({}),
    isBot: PropTypes.bool,
    baseUrl: PropTypes.string,
    url: PropTypes.string,
    links: PropTypes.array,
  };
  static defaultProps = {
    inlineCss: "",
    stylesheets: [],
    scripts: [],
    globals: {},
    seo: {},
    isBot: false,
    baseUrl: "",
    url: "",
    links: []
  };
  
  getMeta() {
    return generateMeta(this.props.seo, {baseUrl: this.props.baseUrl, url: this.props.url});
  }
  
  getTitle() {
    const allMeta = this.getMeta();
    const metaForTitle = _.find(allMeta, {name: "title"});
    if (metaForTitle) {
      return metaForTitle.content;
    }
    return "";
  }
  
  render() {
    const {stylesheets, scripts, links, inlineCss} = this.props;
    return (
      <html lang="en">
        <head>
          {
            _.map(this.getMeta(), (meta, i) => {
              return <meta key={i} {...meta} />;
            })
          }
          <title>{this.getTitle()}</title>
          {/** The url /manifest.json is a url handled via the server.js **/}
          {
            !__development &&
            (<link rel="manifest" href={"/manifest.json"} />)
          }
          {/** Loading Styles **/}
          {
            (inlineCss && inlineCss.length) &&
            (<style type="text/css" dangerouslySetInnerHTML={{__html: inlineCss}} />)
          }
          {
            _.map(stylesheets, path => {
              const pathHash = generateStringHash(path, "CSS");
              return <link rel="stylesheet" type="text/css" key={pathHash} id={pathHash} href={path} />;
            })
          }
          {
            _.map(links, (link, i) => {
              return <link key={i} {...link} data-type="seo"/>;
            })
          }
        </head>
        <body>
          <div id="app">
            {this.props.children}
          </div>
          <div id="temp" />
          {
            !this.props.isBot &&
            _.map(scripts, path => {
              const pathHash = generateStringHash(path, "JS");
              return <script type="text/javascript" key={pathHash} id={pathHash} src={path} defer />;
            })
          }
        </body>
      </html>
    );
  }
}
