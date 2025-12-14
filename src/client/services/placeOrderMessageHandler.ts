import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import { OrderEvent } from "./orderEventsMessageHandler.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

export type PlaceLimitOrderRequestParams = {
  accountNumber: string;
  limitPrice: number;
  symbol: string;
  quantity: number;
  refOrderId?: number;
};

export type RawPlaceOrderPatchResponse = {
  patches: {
    op: string;
    path: string;
    value: any;
  }[];
};

export type RawPlaceOrderSnapshotResponse = {
  groupType: string;
  confirmation: {
    commission: number;
    cost: number;
    fee: number;
    rows: {
      title: string;
      value: string;
    }[];
  };
  maxOrders: number;
  orders: RawPlaceOrderItem[];
};

type RawPlaceOrderItem = {
  orderId: number;
  types: { values: string[]; selection: number };
  exchanges: { values: string[]; selection: number };
  tifs: { values: string[]; selection: number };
  legsDescription: string;
  actionDescription: string;
  orderLegsDescription: string;
  orderLegsDescDisplay: string;
  dollarValue: number;
  quantity: number;
  legs: [{ symbol: string }];
  priceLocked: boolean;
  limitPrice: number;
  midPrice: number;
  natPrice: number;
  bidPrice: number;
  askPrice: number;
  priceStep: number;
  priceFractionalType: string;
  underlyingSymbol: string;
  spreadName: string;
  descriptionToShare: string;
  futureSpread: boolean;
  confirmation: string;
  minQty: number;
  maxQty: number;
  priceType: string;
  compositeSymbol: string;
  compositeDisplaySymbol: string;
  quantityOffset: number;
  quantityStep: number;
  limitOffsetStep: number;
  stopOffsetStep: number;
  quantityLinkOptions: string[];
  descriptionTemplate: string;
};

export type PlaceOrderSnapshotResponse = {
  orders: OrderEvent[];
  service: "place_order";
};

export default class PlaceOrderMessageHandler implements WebSocketApiMessageHandler<PlaceLimitOrderRequestParams> {
  // quantity > 0 => buy
  // quantity < 0 => sell
  buildRequest({
    accountNumber,
    limitPrice,
    symbol,
    quantity,
  }: PlaceLimitOrderRequestParams): RawPayloadRequest {
    return newPayload({
      header: {
        id: `update-draft-order-${symbol}`,
        service: "place_order",
        ver: 1,
      },
      params: {
        accountCode: accountNumber,
        action: "CONFIRM",
        marker: "SINGLE",
        orders: [
          {
            requestType: "INIT_STOCK",
            orderType: "LIMIT",
            limitPrice,
            legs: [{ symbol, quantity }],
          },
        ],
      },
    });
  }

  service: ApiService = "place_order";
}
