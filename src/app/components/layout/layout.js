import React, { Component } from "react";

export default class Layout extends Component {
  render() {

    return (
      <div>
        <header>
          Some header data
        </header>
        {this.props.children || null}
        <footer>
          some footer data
        </footer>
      </div>
    );
  }
}