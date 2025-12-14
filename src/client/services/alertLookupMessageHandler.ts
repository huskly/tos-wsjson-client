import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";
import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { RawAlertResponse } from "../types/alertTypes.js";
import { ApiService } from "./apiService.js";

export type RawAlertLookupResponse = {
  alerts: RawAlertResponse[];
};

export default class AlertLookupMessageHandler implements WebSocketApiMessageHandler<never> {
  buildRequest(_: never): RawPayloadRequest {
    return {
      payload: [
        {
          header: {
            service: "alerts/lookup",
            id: "ACTIVE_alerts_lookup",
            ver: 0,
          },
          params: { status: "ACTIVE" },
        },
      ],
    };
  }

  service: ApiService = "alerts/lookup";
}
