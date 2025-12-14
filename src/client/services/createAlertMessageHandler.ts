import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { newRandomId } from "../util.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";

export type CreateAlertRequestParams = {
  symbol: string;
  triggerPrice: number;
  operator: "GREATER_OR_EQUAL" | "LESS_OR_EQUAL";
};

export default class CreateAlertMessageHandler implements WebSocketApiMessageHandler<CreateAlertRequestParams> {
  buildRequest({
    symbol,
    triggerPrice,
    operator,
  }: CreateAlertRequestParams): RawPayloadRequest {
    const id = newRandomId();
    return {
      payload: [
        {
          header: { service: "alerts/create", ver: 0, id: `alert-${id}` },
          params: {
            alert: {
              market: {
                components: [{ symbol, quantity: 1 }],
                exchange: "BEST",
                threshold: triggerPrice,
                field: "MARK",
                operator,
              },
            },
          },
        },
      ],
    };
  }

  service: ApiService = "alerts/create";
}
