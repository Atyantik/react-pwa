import React from "react";
import Link from "pawjs/src/components/link";
import * as styles from "./contact.scss";

export default class Contact extends React.Component {

  render() {
    return (
      <div className="text-center">
        <h2 className={styles["thank-you-note"]}>Thank you for contacting us</h2>
        <p>Go back to <Link to="/">home page</Link></p>
      </div>
    );
  }
}