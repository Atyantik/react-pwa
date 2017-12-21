/**
 * Created by Yash Thakur
 * Date: 21/12/17
 * Time: 11:23 AM
 */

import _ from "lodash";

const initialState = {
  Count: 0,
};

export const INCREMENT_COUNT = "INCREMENT_COUNT";
export const DECREMENT_COUNT = "DECREMENT_COUNT";

export const counter = (state = initialState, action) => {
  switch (action.type) {
    case INCREMENT_COUNT:
      return _.assignIn({}, state, {
        Count: ++initialState.Count,
      });
    case DECREMENT_COUNT:
      return _.assignIn({}, state, {
        Count: --initialState.Count,
      });
    default:
      return state;
  }
};