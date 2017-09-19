export const NETWORK_STATE_CHANGE = "@@rrs/NETWORK_STATE_CHANGE";
export const NETWORK_STATE_ONLINE = "online";
export const NETWORK_STATE_OFFLINE = "offline";

export const networkOnline = () => {
  return {
    type: NETWORK_STATE_CHANGE,
    state: NETWORK_STATE_ONLINE
  };
};

export const networkOffline = () => {
  return {
    type: NETWORK_STATE_CHANGE,
    state: NETWORK_STATE_OFFLINE
  };
};