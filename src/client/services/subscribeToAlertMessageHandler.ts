import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";

export const DEFAULT_ALERT_TYPES = [
  "CHANGED_ALERT",
  "TRIGGERED_ALERT",
  "EXPIRED_ALERT",
  "MULTIPLE_EXPIRED_ALERTS",
];

export default class SubscribeToAlertMessageHandler implements WebSocketApiMessageHandler<
  string[]
> {
  buildRequest(alertTypes: string[] = DEFAULT_ALERT_TYPES): RawPayloadRequest {
    return {
      payload: [
        {
          header: {
            service: "alerts/subscribe",
            id: "alerts_subscribe",
            ver: 0,
          },
          params: { alertTypes },
        },
      ],
    };
  }

  service: ApiService = "alerts/subscribe";
}
