import {
  allComponents,
  provideFluentDesignSystem,
} from "@fluentui/web-components";
import { SocketCanvasElement } from "./socket_canvas.js";
// Make everything use microsoft fluent by default.
provideFluentDesignSystem().register(allComponents);

/*
Useful types (you don't have to use them explicitly,
they serve as documentation for what the protocol is doing)
*/

interface Point {
  x: number;
  y: number;
}

interface WelcomeMessage {
  // The size of the remote canvas.
  x: number;
  y: number;
  data: [number];
}

interface UpdateMessage {
  point: Point;
  value: boolean;
}

// Create a websocket connection.
// More info at https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
const socket = new WebSocket("ws:socket.zavazadlo.unsigned-short.com");
const canvas = new SocketCanvasElement();
document.querySelector("#container")!.appendChild(canvas);

// The protocol should handle the following messages:
// - WelcomeMessage: The server sends this message when the client connects.
// - UpdateMessage: The server sends this message when the pixel data changes.
socket.onmessage = (m) => {
  const message = JSON.parse(m.data);
  const isItUpdateMessages =
      Array.isArray(message) &&
      message.every((m) => "point" in m && "value" in m);
  if (isItUpdateMessages) {
    console.log("Update messages received");
    drawPixelsUpdate(canvas, message as UpdateMessage[]);
    return;
  }

  const isItWelcomeMessage =
      "x" in message && "y" in message && "data" in message;
  if (isItWelcomeMessage) {
    console.log("Welcome message received");
    const welcomeMessage = message as WelcomeMessage;
    canvas.width = welcomeMessage.x;
    canvas.height = welcomeMessage.y;
    setTimeout(() => {
      drawInitiallyCanvasPixels(canvas, welcomeMessage.data);
    }, 10);
    return;
  }

  console.error("Unknown message received", message);
};

canvas.ondraw = (x, y) => {
  const updateMessage: UpdateMessage = {
    point: {x, y},
    value: true,
  };
  canvas.setPixel(x, y, true);
  socket.send(JSON.stringify(updateMessage));
};

function drawInitiallyCanvasPixels(
  canvas: SocketCanvasElement,
  data: [number],
) {
  for (let i = 0; i < data?.length; i++) {
    const y = i % canvas.width!;
    const x = Math.floor(i / canvas.width!);
    canvas.setPixel(x, y, !!data[i]);
  }
}

function drawPixelsUpdate(
  canvas: SocketCanvasElement,
  updates: UpdateMessage[],
) {
  updates.forEach((updateMessage) => {
    canvas.setPixel(
      updateMessage.point.x,
      updateMessage.point.y,
      updateMessage.value,
    );
  });
}
