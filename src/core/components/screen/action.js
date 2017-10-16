export const SCREEN_STATE_CHANGE = "@@rrs/SCREEN_STATE_CHANGE";
export const SCREEN_ANIMATION_CHANGE = "@@rrs/SCREEN_ANIMATION_CHANGE";
export const SCREEN_STATE_LOADING = "loading";
export const SCREEN_STATE_LOADED = "loaded";
export const SCREEN_STATE_PAGE_EXIT = "page_exit";
export const SCREEN_STATE_PAGE_ENTER = "page_enter";

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

export const screenPageExit = () => {
  return {
    type: SCREEN_ANIMATION_CHANGE,
    state: SCREEN_STATE_PAGE_EXIT
  };
};

export const screenPageEnter = () => {
  return {
    type: SCREEN_ANIMATION_CHANGE,
    state: SCREEN_STATE_PAGE_ENTER
  };
};