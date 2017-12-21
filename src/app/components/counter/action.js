/**
 * Created by Yash Thakur
 * Date: 21/12/17
 * Time: 11:29 AM
 */

import { INCREMENT_COUNT, DECREMENT_COUNT } from "./reducer";

export const incrementCounter = () => {
  return {
    type: INCREMENT_COUNT,
  };
};
export const decrementCounter = () => {
  return {
    type: DECREMENT_COUNT,
  };
};
