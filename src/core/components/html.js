import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { generateStringHash } from "../utils/utils";
import { generateMeta } from "../utils/seo";

const __development = process.env.NODE_ENV === "development";

export default class Html extends React.Component {
  
  static propTypes = {
    stylesheets: PropTypes.array,
    scripts: PropTypes.array,
    globals: PropTypes.shape({}),
    seo: PropTypes.shape({})
  };
  
  getMeta() {
    return generateMeta(this.props.seo);
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
    const {stylesheets, scripts} = this.props;
    return (
      <html lang="en">
        <head>
          <title>{this.getTitle()}</title>
          {/** The url /manifest.json is a url handled via the server.js **/}
          {
            !__development &&
            (<link rel="manifest" href={"/manifest.json"} />)
          }
          
          {
            _.map(this.getMeta(), (meta, i) => {
              return <meta key={i} {...meta} />;
            })
          }
        </head>
        <body>
          <div id="app">
            {this.props.children}
          </div>
          <div id="temp" />
          {
            _.map(scripts, path => {
              const pathHash = generateStringHash(path, "JS");
              return <script type="text/javascript" key={pathHash} id={pathHash} src={path} defer />;
            })
          }
          {/** Loading Styles @ bottom of page to give the best **/}
          {
            _.map(stylesheets, path => {
              const pathHash = generateStringHash(path, "CSS");
              return <link rel="stylesheet" type="text/css" key={pathHash} id={pathHash} href={path} />;
            })
          }
        </body>
      </html>
    );
  }
}
