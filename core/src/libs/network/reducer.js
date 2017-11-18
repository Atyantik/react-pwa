import _ from "lodash";
import {NETWORK_STATE_CHANGE, NETWORK_STATE_ONLINE} from "./action";

const initialState = {
  "state": NETWORK_STATE_ONLINE
};

export const network = (state = initialState, action) => {
  switch (action.type) {
    case NETWORK_STATE_CHANGE:
      return _.assign({}, state, {
        "state": action.state
      });
    default:
      return state;
  }
};