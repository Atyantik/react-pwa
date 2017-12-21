/**
 * Created by Yash Thakur
 * Date: 21/12/17
 * Time: 11:19 AM
 */

import React, { Component } from "react";
import _ from "lodash";
import { connect } from "react-redux";
import {decrementCounter, incrementCounter} from "./action";

@connect((state) => {
  return {
    counterValue: _.get(state.counter, "Count", 0)
  }
})
export default class Counter extends Component {

  incrementCounter(e) {
    if(e && e.preventDefault) {
      e.preventDefault();
    }
    this.props.dispatch(incrementCounter());
  }

  decrementCounter(e) {
    if(e && e.preventDefault) {
      e.preventDefault();
    }
    this.props.dispatch(decrementCounter());
  }
  render() {
    return (
      <div className="text-center py-5 my-5">
        <h1>REDUX - Counter</h1>
        <br/>
        <div className="text-center mx-auto col-6 col-sm-4">
          <span style={{fontSize: "150px"}}>{this.props.counterValue}</span>
        </div>
        <div className="text-center mx-auto col-8 col-lg-2 col-sm-4">
          <div className="float-right">
            <button style={{width: "70px"}} className="btn btn-primary d-block px-4" onClick={e => this.incrementCounter(e)}>+</button>
          </div>
          <div className="float-left">
            <button style={{width: "70px"}} className="btn btn-primary d-block px-4" onClick={e => this.decrementCounter(e)}>-</button>
          </div>
        </div>
      </div>
    );
  }
}