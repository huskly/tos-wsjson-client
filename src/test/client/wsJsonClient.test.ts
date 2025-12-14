import {
  RealWsJsonClient,
  CONNECTION_REQUEST_MESSAGE,
} from "../../client/realWsJsonClient";
import "dotenv/config";
import WS from "jest-websocket-mock";
import LoginMessageHandler from "../../client/services/loginMessageHandler";
import ResponseParser from "../../client/responseParser";
import WebSocketApiMessageHandler, {
  newPayload,
} from "../../client/services/webSocketApiMessageHandler";
import { ApiService } from "../../client/services/apiService";
import {
  RawPayloadRequest,
  RawPayloadResponse,
} from "../../client/tdaWsJsonTypes";
import GenericIncomingMessageHandler from "../../client/services/genericIncomingMessageHandler";

const accessToken = "something-secret";
const refreshToken = "something-secret-refresh";
const fakeConnectionResponse = {
  session: "17a7_7115011e1b4a8c9c",
  build: "27.2323.3-B0",
  ver: "27.*.*",
};

const fakeLoginResponse = {
  payload: [
    {
      header: { service: "login", id: "login", ver: 0, type: "snapshot" },
      body: {
        authenticationStatus: "OK",
        authenticated: true,
        forceLogout: false,
        stalePassword: true,
        userDomain: "TDA",
        userSegment: "ADVNCED",
        userId: 123345566,
        userCdi: "A00000000000",
        userCode: "foobar",
        token: "something-random",
        schwabAccountMigrationValue: "REMAIN_ON_TDA",
        permissions: {
          isCryptoAllowed: false,
          isFractionalQuantityAllowed: false,
          isMandatoryAutoLockAllowed: false,
          isSchwabIntegrationHubLinkAllowed: true,
          isPlaceQuantityLinkOrdersAllowed: true,
        },
        quotePermissions: [
          {
            name: "Level I",
            isAllowed: true,
            children: [
              {
                name: "Stock",
                isAllowed: true,
                children: [
                  { name: "AMEX", isAllowed: true },
                  { name: "NASDAQ", isAllowed: true },
                  { name: "NYSE", isAllowed: true },
                ],
              },
              { name: "Equity options", isAllowed: true },
              {
                name: "Futures and futures options",
                isAllowed: true,
                children: [
                  { name: "CFE", isAllowed: true },
                  { name: "CME", isAllowed: true },
                  { name: "ICE EU", isAllowed: true },
                  { name: "ICE", isAllowed: true },
                  { name: "LIFFE", isAllowed: true },
                ],
              },
              { name: "Forex", isAllowed: true },
              { name: "Other", isAllowed: true },
            ],
          },
          { name: "Level II", isAllowed: true },
        ],
      },
    },
  ],
};

class FakeMessageHandler implements WebSocketApiMessageHandler<
  string,
  { service: "fake"; result: number } | null
> {
  buildRequest(value: string): RawPayloadRequest {
    return newPayload({
      header: { service: "fake", id: "fake", ver: 0 },
      params: { value },
    });
  }

  parseResponse(
    message: RawPayloadResponse,
  ): { service: "fake"; result: number } | null {
    const [{ body }] = message.payload as any;
    return { service: "fake", result: body.someMagicNumber };
  }

  // This service doesn't really exist and is just used for testing
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  service: ApiService = "fake";
}

describe("wsJsonClientTest", () => {
  it("should connect and log in successfully", async () => {
    const url = "ws://localhost:1234";
    const server = new WS(url, { jsonProtocol: true });
    const client = new RealWsJsonClient(new WebSocket(url));
    try {
      await server.connected;
      // explicitly do not await for this promise so that we can send the server replies below
      client.authenticateWithAccessToken({ accessToken, refreshToken });
      server.send(fakeConnectionResponse);
      server.send(fakeLoginResponse);
      await expect(server).toReceiveMessage(CONNECTION_REQUEST_MESSAGE);
      const loginMessageHandler = new LoginMessageHandler();
      await expect(server).toReceiveMessage(
        loginMessageHandler.buildRequest(accessToken),
      );
      expect(client.isConnected()).toBeTruthy();
    } finally {
      client.disconnect();
    }
    expect(client.isConnected()).toBeFalsy();
  });

  it("should register a message handler", async () => {
    const fakeResponse = {
      payload: [
        {
          header: { service: "fake", id: "fake", ver: 0, type: "snapshot" },
          body: { someMagicNumber: 42 },
        },
      ],
    };
    const fakeRequest = newPayload({
      header: { service: "fake", id: "fake", ver: 0 },
      params: { value: "wowowow" },
    });
    const url = "ws://localhost:1235";
    const server = new WS(url, { jsonProtocol: true });
    const fakeMessageHandler = new FakeMessageHandler();
    const responseParser = new ResponseParser(
      new GenericIncomingMessageHandler(),
    );
    const webSocket = new WebSocket(url);
    const client = new RealWsJsonClient(webSocket, responseParser);
    try {
      await server.connected;
      // explicitly do not await for this promise so that we can send the server replies below
      client.authenticateWithAccessToken({ accessToken, refreshToken });
      server.send(fakeConnectionResponse);
      server.send(fakeLoginResponse);
      await expect(server).toReceiveMessage(CONNECTION_REQUEST_MESSAGE);
      const loginMessageHandler = new LoginMessageHandler();
      await expect(server).toReceiveMessage(
        loginMessageHandler.buildRequest(accessToken),
      );
      const observable = client.dispatch(fakeMessageHandler, "wowowow");
      await expect(server).toReceiveMessage(fakeRequest);
      server.send(fakeResponse);
      const response = await observable.promise();
      expect(response).toEqual({
        body: { someMagicNumber: 42 },
        service: "fake",
      });
    } finally {
      client.disconnect();
    }
  });
});
