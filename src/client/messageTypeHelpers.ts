import {
  ConnectionResponse,
  RawPayloadResponse,
  WsJsonRawMessage,
} from "./tdaWsJsonTypes.js";
import { RawLoginResponse } from "./services/loginMessageHandler.js";

export function isPayloadResponse(
  response: WsJsonRawMessage,
): response is RawPayloadResponse {
  return "payload" in response;
}

export function isConnectionResponse(
  message: WsJsonRawMessage,
): message is ConnectionResponse {
  return "session" in message && "build" in message && "ver" in message;
}

export function isLoginResponse(
  message: WsJsonRawMessage,
): message is RawLoginResponse {
  if (!isPayloadResponse(message)) return false;
  const [{ header }] = message.payload;
  const { service } = header;
  return service === "login";
}

export function isSchwabLoginResponse(
  message: WsJsonRawMessage,
): message is RawLoginResponse {
  if (!isPayloadResponse(message)) return false;
  const [{ header }] = message.payload;
  const { service } = header;
  return service === "login/schwab";
}
