import _ from "lodash";
import { SCREEN_STATE, SCREEN_LOADED } from "./action";
const initialState = {
  [SCREEN_STATE]: SCREEN_LOADED
};

export const screenLoader = (state = initialState, action) => {
  switch (action.type) {
    case [SCREEN_STATE]:
      return _.assign({}, state, {
        [SCREEN_STATE]: action.state
      });
      break;
    default:
      return state;
  }
};