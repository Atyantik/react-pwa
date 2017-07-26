import React from "react";
import * as styles from "./footer.scss";

const Footer = () => {
  "use strict";
  return (
    <footer className={styles.footer} >
      <div className="container">
        <span className="text-muted">
          Powered by&nbsp;
          <a
            href="https://www.atyantik.com"
            target="_blank"
            rel="noopener"
          >
            Atyantik Technologies Private Limited
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;