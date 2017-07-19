export const SCREEN_STATE_CHANGE = "@@rrs/SCREEN_STATE_CHANGE";
export const SCREEN_STATE_LOADING = "loading";
export const SCREEN_STATE_LOADED = "loaded";

export const screenLoading = () => {
  return {
    type: SCREEN_STATE_CHANGE,
    state: SCREEN_STATE_LOADING
  };
};

export const screenLoaded = () => {
  return {
    type: SCREEN_STATE_CHANGE,
    state: SCREEN_STATE_LOADED
  };
};