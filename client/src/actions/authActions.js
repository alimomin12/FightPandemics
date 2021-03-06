import axios from "axios";
import { checkRememberCookie, clearRememberCookie } from "utils/cookie";
import { SESSION_ACTIONS } from "reducers/session";

import TagManager from "react-gtm-module";

const GET_CURRENT_USER_ENDPOINT = "/api/users/current";
const CHECK_REMEMBER_COOKIE_INTERVAL = 3000;

// Token stored in httpOnly cookie set/cleared by server
export const initAuth = () => {
  return async (dispatch) => {
    if (!checkRememberCookie()) return;

    dispatch({ type: SESSION_ACTIONS.SET_AUTH_LOADING, payload: true });
    try {
      const { data: user } = await axios.get(GET_CURRENT_USER_ENDPOINT);
      TagManager.dataLayer({
        dataLayer: {
          userId: user.id,
          isActingAsOrg: !!localStorage.getItem("organisationId"),
        },
      });
      dispatch({ type: SESSION_ACTIONS.SET_USER, payload: { user } });
    } catch (error) {
      dispatch({ error, type: SESSION_ACTIONS.AUTH_ERROR });
    } finally {
      dispatch({ type: SESSION_ACTIONS.SET_AUTH_LOADING, payload: false });
    }
  };
};

export const refetchUser = () => {
  return async (dispatch) => {
    try {
      const { data: user } = await axios.get(GET_CURRENT_USER_ENDPOINT);
      dispatch({ type: SESSION_ACTIONS.SET_USER, payload: { user } });
    } catch (error) {
      dispatch({ error, type: SESSION_ACTIONS.AUTH_ERROR });
    }
  };
};

export const authLogout = () => {
  return (dispatch) => {
    clearRememberCookie();
    TagManager.dataLayer({
      dataLayer: {
        userId: -1,
        isActingAsOrg: false,
      },
    });
    dispatch({ type: SESSION_ACTIONS.AUTH_LOGOUT });
  };
};

export const startCheckCookieInterval = () => {
  const checkRememberCookieInterval = setInterval(() => {
    if (!checkRememberCookie()) {
      clearInterval(checkRememberCookieInterval);
      authLogout();
      sessionStorage.setItem("postredirect", window.location.pathname);
      return window.location.reload();
    }
  }, CHECK_REMEMBER_COOKIE_INTERVAL);
};
