import React, { Component } from "react";
import classNames from "classnames";
import Link from "../../../core/components/link";
import { renderSubRoutes } from "../../../core/utils/renderer";
import Transition from "../../../core/components/transition";
import * as styles from "./about.scss";

export default class About extends Component {
  render() {
    return (
      <div className="row mt-3">
        <div className="col-sm-3 blog-sidebar">
          <div className={classNames("sidebar-module", styles["sidebar-module-inset"])}>
            <h4>About</h4>
            <p>
              <em>Atyantik technologies Pvt. Ltd.</em> is a software company based in
              gujarat servicing the needs of all businesses ranging
              from midsize to large ones
            </p>
          </div>
          <div className={styles["sidebar-module"]}>
            <h4>Left sidebar</h4>
            <ol className="list-unstyled">
              <li><Link to="/about/about-us" animateSection="about-section" >About Us</Link></li>
              <li><Link to="/about/we-execute-your-dreams" animateSection="about-section">What do we do?</Link></li>
              <li><Link to="/about/do-not-hire-us" animateSection="about-section">Looking for a team?</Link></li>
            </ol>
          </div>
        </div>
        <div className="pl-4 col-sm-6">
          <Transition
            sectionName="about-section"
            className={styles["animator"]}
            onEnterClassName={styles["fade-in"]}
            onExitClassName={styles["fade-out"]}
          >
            {renderSubRoutes(this)}
          </Transition>
        </div>
      </div>
    );
  }
}

