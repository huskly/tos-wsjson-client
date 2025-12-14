import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";
import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";

export default class CancelAlertMessageHandler implements WebSocketApiMessageHandler<number> {
  buildRequest(alertId: number): RawPayloadRequest {
    return {
      payload: [
        {
          header: { service: "alerts/cancel", id: "cancel_alert", ver: 0 },
          params: { alertId },
        },
      ],
    };
  }

  service: ApiService = "alerts/cancel";
}
