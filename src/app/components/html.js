import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { generateStringHash } from "../../utils/utils.js";

export default class Html extends React.Component {

  static propTypes = {
    stylesheets: PropTypes.array,
    scripts: PropTypes.array,
    globals: PropTypes.shape({}),
  };

  getGlobalHtml() {
    const { globals } = this.props;
    let html = "";
    _.each(globals, (value, key) => {
      if (_.isArray(value) || _.isObject(value)) {
        html += `window["${key}"] = ${JSON.stringify(value)};`;
      } else {
        html += `window["${key}"] = "${value}";`;
      }
    });
    return html;
  }

  render() {
    "use strict";
    const { stylesheets, scripts } = this.props;
    return (
      <html>
      <head>
        <title>TrustyTribe</title>
        {
          _.map(stylesheets, path => {
            const pathHash = generateStringHash(path, "CSS");
            return <link rel="stylesheet" key={pathHash} id={pathHash} href={path} />;
          })
        }
        <script type="text/javascript" dangerouslySetInnerHTML={{__html: this.getGlobalHtml()}}/>
      </head>
      <body>
      <div id="app">{this.props.children}</div>
      {
        _.map(scripts, path => {
          const pathHash = generateStringHash(path, "JS");
          return <script type="text/javascript" key={pathHash} id={pathHash} src={path} />;
        })
      }
      </body>
      </html>
    );
  }
};