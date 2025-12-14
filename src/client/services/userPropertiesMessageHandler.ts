import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

export type UserPropertiesResponse = {
  service: "user_properties";
  defaultAccountCode: string;
  nickname: string;
  plDisplayMethod: string;
  stocksOrderDefaultType: string;
  stocksOrderDefaultQuantity: number;
  stocksOrderQuantityIncrement: number;
  optionsOrderDefaultType: string;
  optionsOrderDefaultQuantity: number;
  optionsOrderQuantityIncrement: number;
  futuresOrderOrderDefaultType: string;
  futuresOrderDefaultType: string;
  futuresOrderDefaultQuantity: number;
  futuresOrderQuantityIncrement: number;
  futureOptionsOrderDefaultType: string;
  futureOptionsOrderDefaultQuantity: number;
  futureOptionsOrderQuantityIncrement: number;
  forexOrderDefaultType: string;
  forexOrderDefaultQuantity: number;
  forexOrderQuantityIncrement: number;
};

export default class UserPropertiesMessageHandler implements WebSocketApiMessageHandler<never> {
  buildRequest(_: void): RawPayloadRequest {
    return newPayload({
      header: { service: "user_properties", id: "user_properties", ver: 0 },
      params: {},
    });
  }

  service: ApiService = "user_properties";
}
