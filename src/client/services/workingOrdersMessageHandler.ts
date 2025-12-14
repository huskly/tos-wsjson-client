import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

export default class WorkingOrdersMessageHandler implements WebSocketApiMessageHandler<string> {
  buildRequest(accountNumber: string): RawPayloadRequest {
    return newPayload({
      header: { service: "order_events", ver: 0, id: "workingOrders" },
      params: { account: accountNumber, types: ["WORKING"] },
    });
  }

  service: ApiService = "order_events";
}
