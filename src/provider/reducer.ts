import type { ConnectionAction, ConnectionState } from "./types.js";

/**
 * Initial state for the connection reducer.
 */
export const initialConnectionState: ConnectionState = {
  status: "disconnected",
  error: null,
};

/**
 * Reducer for managing connection state.
 */
export function connectionReducer(
  _state: ConnectionState,
  action: ConnectionAction
): ConnectionState {
  switch (action.type) {
    case "CONNECT_START": {
      return {
        status: "connecting",
        error: null,
      };
    }
    case "CONNECT_SUCCESS": {
      return {
        status: "connected",
        error: null,
      };
    }
    case "CONNECT_ERROR": {
      return {
        status: "disconnected",
        error: action.error,
      };
    }
    case "DISCONNECT": {
      return {
        status: "disconnected",
        error: null,
      };
    }
  }
}
