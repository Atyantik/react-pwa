import _ from "lodash";
import { SCREEN_STATE_CHANGE, SCREEN_STATE_LOADED } from "./action";
const initialState = {
  "state": SCREEN_STATE_LOADED
};

export const screen = (state = initialState, action) => {
  switch (action.type) {
    case SCREEN_STATE_CHANGE:
      return _.assign({}, state, {
        "state": action.state
      });
    default:
      return state;
  }
};