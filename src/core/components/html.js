import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { generateStringHash } from "../utils/utils";
import { generateMeta} from "../utils/seo";

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
    const metaForTitle = _.find(allMeta, {itemProp: "name"});
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
          <link rel="manifest" href={"/manifest.json"}/>
          {
            _.map(this.getMeta(), (meta, i) => {
              return <meta key={i} {...meta} />;
            })
          }
          <script dangerouslySetInnerHTML={{
            __html: `(function(){var WebP=new Image();WebP.onload=WebP.onerror=function(){
              if(WebP.height!=2){var sc=document.createElement('script');sc.type='text/javascript';sc.async=true;
              var s=document.getElementsByTagName('script')[0];sc.src='public/js/webpjs-0.0.2.min.js';s.parentNode.insertBefore(sc,s);}};
              WebP.src='data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';})();`
          }} />
        </head>
        <body>
          <div id="app">{this.props.children}</div>
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
