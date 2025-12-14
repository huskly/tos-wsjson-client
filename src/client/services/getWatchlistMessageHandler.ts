import { RawPayloadRequest } from "../tdaWsJsonTypes.js";
import { ApiService } from "./apiService.js";
import WebSocketApiMessageHandler, {
  newPayload,
} from "./webSocketApiMessageHandler.js";

export type GetWatchListResponseItem = {
  id: number;
  name: string;
  type?: string;
  symbols?: string[];
};

export type GetWatchlistSnapshotResponse = {
  watchlist: GetWatchListResponseItem;
  service: "watchlist/get";
};

export type GetWatchlistPatchResponse = {
  patches: {
    op: string;
    path: string;
    value: { watchlist: GetWatchListResponseItem } | number | string | string[];
  }[];
  service: "watchlist/get";
};

export type GetWatchlistResponse = GetWatchlistSnapshotResponse;

export default class GetWatchlistMessageHandler implements WebSocketApiMessageHandler<number> {
  buildRequest(watchlistId: number): RawPayloadRequest {
    return newPayload({
      header: {
        service: "watchlist/get",
        id: "watchlist/get",
        ver: 0,
      },
      params: { watchlistId },
    });
  }

  service: ApiService = "watchlist/get";
}
