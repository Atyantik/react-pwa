import React from "react";
import { Link } from "react-router-dom";
import ClientLogo from "../../../resources/images/client.png";
import classNames from "classnames";
import * as styles from "./home.scss";

export default class Home extends React.Component {

  render() {
    return (
      <main>
        <div className={classNames("container", styles["home-container"])}>
          <section className="text-center w-100 text-center">
            <div className={classNames("d-inline-block", styles["form-layout"], styles["white-box"])}>
              <img src={ClientLogo} alt="Logo"/>
              <h3 className={styles.title}>Forgot Password</h3>
              <div className="form">
                <form>
                  <div className="form-group mt-3">
                    <div className="has-icon">
                      <input type="email" className="form-control" id="Email" placeholder="Email address" />
                      <span className="icon"><i className="fa fa-envelope" /></span>
                    </div>
                  </div>
                  <div className="form-group">
                    <a href="reset-password.php" className="btn btn-primary btn-lg btn-block">Reset Password</a>
                  </div>
                  <div className="form-group mb-0 w-100 d-inline-block">
                    <label className="pt-2 float-left">Go to about page</label>
                    <Link to="/about" className="btn btn-secondary float-right">About page</Link>
                  </div>
                  <div className="form-group mb-0 w-100 d-inline-block">
                    <label className="pt-2 float-left">Go to contact page</label>
                    <Link to="/contact" className="btn btn-secondary float-right">Contact page</Link>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }
}