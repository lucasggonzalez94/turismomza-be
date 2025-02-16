import { Server } from "socket.io";

export class SocketService {
  private io: Server;
  private userSockets: { [userId: string]: string } = {};

  constructor(io: Server) {
    this.io = io;
  }

  sendNotification(userId: string, notification: object) {
    const socketId = this.userSockets[userId];
    if (socketId) {
      this.io.to(socketId).emit("notification", notification);
    }
  }
}
