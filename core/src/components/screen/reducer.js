import _ from "lodash";
import {
  ANIMATE_PAGE,
  ANIMATE_SCREEN_SECTION,
  SCREEN_ANIMATION_CHANGE,
  SCREEN_STATE_CHANGE,
  SCREEN_STATE_LOADED,
  SCREEN_STATE_PAGE_ENTER
} from "./action";

const initialState = {
  "state": SCREEN_STATE_LOADED,
  "animation": SCREEN_STATE_PAGE_ENTER,
  "animate_section": ANIMATE_PAGE
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
    case ANIMATE_SCREEN_SECTION:
      return _.assign({}, state, {
        "animate_section": action.animate_section
      });
    default:
      return state;
  }
};