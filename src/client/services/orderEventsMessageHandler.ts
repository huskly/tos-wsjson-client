import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";

export type OrderEvent = {
  id: number;
  symbol: string;
  status: string;
  quantity: number;
  price: number;
  orderType: string;
  side: "BUY" | "SELL";
  description: string;
  orderDateTime: Date;
  cancelable: boolean;
  underlyingType: string;
};

export type RawOrderEvent = {
  eventType: string;
  eventTime: number;
  orderId: number;
  refOrderId: number;
  triggerOrderId: number;
  executionId: number;
  orderTime: string;
  description: string;
  descriptionToShare: string;
  accountCode: string;
  status: string;
  tag: string;
  side: "BUY" | "SELL";
  taxLotMethod: string;
  orderType: string;
  tif: string;
  exchange: string;
  spreadName: string;
  sellOut: boolean;
  quantity: number;
  filledQuantity: number;
  limitPrice: number;
  priceType: string;
  price: number;
  cost: number;
  groupId: number;
  groupMarker: string;
  unionId: number;
  cancelable: boolean;
  replaceable: boolean;
  exercise: boolean;
  similarAllowed: boolean;
  oppositeAllowed: boolean;
  underlyingSymbol: string;
  underlyingType: string;
  rootSymbol: string;
  compositeSymbol: string;
  legs: {
    symbol: string;
    positionEffect: string;
    quantity: number;
    instrumentType: string;
  }[];
  legsDescription: string;
  legsDescriptionDisplay: string;
};

export type OrderEventsSnapshotResponse = {
  orders: OrderEvent[];
  service: "order_events";
};

export default class OrderEventsMessageHandler implements WebSocketApiMessageHandler<never> {
  buildRequest(_: never): RawPayloadRequest {
    throw new Error("Should never be called, this message is inbound only");
  }

  service: ApiService = "order_events";
}
