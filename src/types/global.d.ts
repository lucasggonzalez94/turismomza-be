declare global {
  namespace NodeJS {
    interface Global {
      io: import("socket.io").Server;
    }
  }
}

export {};
