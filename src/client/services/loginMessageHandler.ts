import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";
import {
  RawPayloadRequest,
  RawPayloadResponse,
  RawPayloadResponseItemHeader,
} from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";

export type RawLoginResponseBody = {
  message?: string;
  authenticationStatus: string;
  authenticated: boolean;
  forceLogout: boolean;
  stalePassword: boolean;
  userDomain: string;
  userSegment: string;
  userId: number;
  userCdi: string;
  userCode: string;
  token: string;
  schwabAccountMigrationValue: string;
  permissions: {
    isCryptoAllowed: boolean;
    isFractionalQuantityAllowed: boolean;
    isMandatoryAutoLockAllowed: boolean;
    isSchwabIntegrationHubLinkAllowed: boolean;
    isPlaceQuantityLinkOrdersAllowed: boolean;
  };
  quotePermissions: {
    name: string;
    isAllowed: boolean;
    children: {
      name: string;
      isAllowed: boolean;
      children: { name: string; isAllowed: boolean }[];
    }[];
  };
};

export type RawLoginResponse = {
  payload: {
    header: RawPayloadResponseItemHeader;
    body: RawLoginResponseBody;
  }[];
};

export type LoginResponse = {
  service: "login";
  successful: boolean;
};

export default class LoginMessageHandler implements WebSocketApiMessageHandler<string> {
  parseResponse(message: RawPayloadResponse): LoginResponse {
    const [{ body }] = message.payload;
    const { authenticationStatus } = body as RawLoginResponseBody;
    const successful = authenticationStatus === "OK";
    return { successful, service: "login" };
  }

  buildRequest(accessToken: string): RawPayloadRequest {
    return newPayload({
      header: { service: "login", id: "login", ver: 0 },
      params: {
        token: accessToken,
        domain: "TOS",
        platform: "PROD",
        tag: "TOSWeb",
      },
    });
  }

  service: ApiService = "login";
}
