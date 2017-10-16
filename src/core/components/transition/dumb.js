import { Component } from "react";

export default class Dumb extends Component {
  shouldComponentUpdate() {
    return false;
  }
  render() {
    return this.props.children || null;
  }
}