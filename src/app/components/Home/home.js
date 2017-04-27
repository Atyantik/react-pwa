import React from "react";
import { Link } from "react-router-dom";
import * as styles from "./home.scss";

export default class Home extends React.Component {

  render() {
    {/*<div className={styles.h1}>*/}
    return (
      <div className={styles.h1}>
        This is Tirth Bodawala from react class. Right?
         <Link to="/about">Go to about page</Link>
      </div>
    );
  }
}