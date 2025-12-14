import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import { PlaceLimitOrderRequestParams } from "./placeOrderMessageHandler.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

// Submit new order or update existing order. Provide a `refOrderId` to update an existing order.
export default class SubmitOrderMessageHandler implements WebSocketApiMessageHandler<PlaceLimitOrderRequestParams> {
  buildRequest({
    accountNumber,
    limitPrice,
    symbol,
    quantity,
    refOrderId,
  }: PlaceLimitOrderRequestParams): RawPayloadRequest {
    return newPayload({
      header: {
        id: `update-draft-order-${symbol}`,
        service: "place_order",
        ver: 0,
      },
      params: {
        accountCode: accountNumber,
        action: "SUBMIT",
        marker: "SINGLE",
        orders: [
          {
            tif: "DAY",
            orderType: "LIMIT",
            refOrderId,
            limitPrice,
            requestType: "EDIT_ORDER",
            legs: [{ symbol, quantity }],
            tag: "TOSWeb",
          },
        ],
      },
    });
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  service: ApiService = "unused";
}
