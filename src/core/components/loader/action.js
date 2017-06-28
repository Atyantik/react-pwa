export const SCREEN_STATE = "SCREEN_STATE";
export const SCREEN_LOADING = "SCREEN_LOADING";
export const SCREEN_LOADED = "SCREEN_LOADED";

export const screenLoading = () => {
  return {
    type: SCREEN_STATE,
    state: SCREEN_LOADING
  };
};

export const screenLoaded = () => {
  return {
    type: SCREEN_STATE,
    state: SCREEN_LOADED
  };
};