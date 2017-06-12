import React from "react";
import classNames from "classnames";
import  { Link } from "react-router-dom";
import { renderSubRoutes } from "../../../utils/renderer";
import * as styles from "./about.scss";

export default class About extends React.Component {

  render() {
    return (
      <div className="row mt-3">
        <div className="col-sm-3 blog-sidebar">
          <div className={classNames("sidebar-module", styles["sidebar-module-inset"])}>
            <h4>About</h4>
            <p>
              <em>Atyantik technologies</em> is a software company based in
              gujarat servicing the needs of all businesses ranging
              from midsize to large ones.
            </p>
          </div>
          <div className={styles["sidebar-module"]}>
            <h4>Left sidebar</h4>
            <ol className="list-unstyled">
              <li><Link to="/about/about-us">About Us</Link></li>
              <li><Link to="/about/we-execute-your-dreams">What do we do?</Link></li>
              <li><Link to="/about/do-not-hire-us">Looking for a team?</Link></li>
            </ol>
          </div>
        </div>
        <div className="offset-sm-1 col-sm-6">
          {renderSubRoutes(this)}
        </div>
      </div>
    );
  }
}