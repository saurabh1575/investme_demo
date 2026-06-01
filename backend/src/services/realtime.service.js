export function initRealtime(io) {
  io.on("connection", (socket) => {
    socket.on("join:user", (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on("join:session", (sessionId) => {
      socket.join(`session:${sessionId}`);
    });

    socket.on("message:send", (message) => {
      io.to(`session:${message.sessionId}`).emit("message:new", {
        ...message,
        deliveredAt: new Date().toISOString()
      });
    });
  });
}

export function notifyUser(io, userId, notification) {
  io.to(`user:${userId}`).emit("notification:new", notification);
}
