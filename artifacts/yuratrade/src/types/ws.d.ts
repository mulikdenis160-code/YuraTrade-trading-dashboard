declare module "ws" {
  import { EventEmitter } from "node:events";

  class WebSocket extends EventEmitter {
    static OPEN: number;
    readyState: number;
    constructor(
      url: string,
      options?: { headers?: Record<string, string>; handshakeTimeout?: number; agent?: import("node:http").Agent },
    );
    send(data: string): void;
    close(): void;
    terminate(): void;
    on(event: "message", listener: (data: Buffer | string) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: "close", listener: () => void): this;
  }

  namespace WebSocket {
    type RawData = Buffer | ArrayBuffer | Buffer[] | string;
  }

  export default WebSocket;
}
