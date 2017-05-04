import React, { Component } from "react";
import Header from "../header";
import Footer from "../footer";

export default class Layout extends Component {
  render() {
    return (
      <div>
        <Header url={this.props.match.url} />
        <main className="container">
          {this.props.children}
        </main>
        <Footer />
      </div>
    );
  }
}