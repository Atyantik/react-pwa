import _ from "lodash";
import {
  SCREEN_ANIMATION_CHANGE,
  SCREEN_STATE_CHANGE,
  SCREEN_STATE_LOADED,
  SCREEN_STATE_PAGE_ENTER
} from "./action";
const initialState = {
  "state": SCREEN_STATE_LOADED,
  "animation": SCREEN_STATE_PAGE_ENTER
};

export const screen = (state = initialState, action) => {
  switch (action.type) {
    case SCREEN_STATE_CHANGE:
      return _.assign({}, state, {
        "state": action.state
      });
    case SCREEN_ANIMATION_CHANGE:
      return _.assign({}, state, {
        "animation": action.state
      });
    default:
      return state;
  }
};