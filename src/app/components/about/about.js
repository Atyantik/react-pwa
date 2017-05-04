import React from "react";
import classNames from "classnames";
import  { Link, Route } from "react-router-dom";
import * as styles from "./about.scss";

export default class About extends React.Component {
  renderContent(section) {
    switch(section) {
    case "section1":
      return <div>
        <p className="h4">Section 1</p>
        <p>
          This is 1st section. Write anything here. Just to bluff!
        </p>
      </div>;
    case "section2":
      return <div>
        <p className="h4">Section 2</p>
        <p>
          This is pretty serious section. Maybe Di-section?
        </p>
      </div>;
    case "section3":
      return <div>
        <p className="h4">Section 3</p>
        <p>
          Don't know much about this section but yes its called <strong>3</strong>
          &nbsp;for a reason
        </p>
      </div>;
    default:
      return <div>
        <p className="h4">Main Section</p>
        <p>
          Never ever ignore the main content, Try click on the left sidebar
        </p>
      </div>;
    }
  }

  render() {
    return (
      <div className="row mt-3">
        <div className="col-sm-3 blog-sidebar">
          <div className={classNames("sidebar-module", styles["sidebar-module-inset"])}>
            <h4>About</h4>
            <p>Etiam porta <em>sem malesuada magna</em> mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.</p>
          </div>
          <div className={styles["sidebar-module"]}>
            <h4>Archives</h4>
            <ol className="list-unstyled">
              <li><Link to="/about">Main About Page</Link></li>
              <li><Link to="/about/section1">Section 1</Link></li>
              <li><Link to="/about/section2">Section 2</Link></li>
              <li><Link to="/about/section3">Section 3</Link></li>
            </ol>
          </div>
        </div>
        <div className="offset-sm-1 col-sm-6">
          <Route exact path="/about" render={() => {
            return this.renderContent();
          }} />
          <Route path="/about/:section" render={({match}) => {
            return this.renderContent(match.params.section);
          }} />
        </div>
      </div>
    );
  }
}