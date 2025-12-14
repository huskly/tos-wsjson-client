import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler from "./webSocketApiMessageHandler.js";

export type RawOptionChainDetailsResponse = {
  optionSeries: OptionChainDetailsItem[];
};

export type OptionChainDetailsItem = {
  expiration: string; // eg "16 JUN 23"
  expirationString: string; // eg "16 JUN 23 (100)"
  fractionalType: string; // eg X10
  optionPairs: {
    strike: number;
    callSymbol: string;
    putSymbol: string;
    callDisplaySymbol: string;
    putDisplaySymbol: string;
  }[];
  spc: number;
  name: string;
  contract: string;
  contractDisplay: string;
  daysToExpiration: number;
  settlementType: "AM" | "PM";
};

export type OptionChainDetailsRequest = {
  symbol: string;
  seriesNames: string[];
};

export default class OptionChainDetailsMessageHandler implements WebSocketApiMessageHandler<OptionChainDetailsRequest> {
  // param `seriesNames` as returned from `newOptionChainRequest`, eg: "16 JUN 23 100"
  buildRequest({
    symbol,
    seriesNames,
  }: OptionChainDetailsRequest): RawPayloadRequest {
    return {
      payload: [
        {
          header: {
            service: "option_chain/get",
            id: "option_chain/get",
            ver: 0,
          },
          params: {
            underlyingSymbol: symbol,
            filter: { strikeQuantity: 2147483647, seriesNames },
          },
        },
      ],
    };
  }

  service: ApiService = "option_chain/get";
}
