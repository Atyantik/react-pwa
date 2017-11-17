import React, {Component} from "react";

export default class Layout extends Component {
  render() {
    return (
      <main className="container">
        {this.props.children}
      </main>
    );
  }
}