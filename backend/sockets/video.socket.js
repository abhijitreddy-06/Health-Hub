export default function videoSocket(io) {
    io.on("connection", socket => {

        socket.on("join-room", roomId => {
            socket.join(roomId);
            socket.roomId = roomId;
            socket.to(roomId).emit("user-joined");
        });

        socket.on("signal", ({ roomId, payload }) => {
            socket.to(roomId).emit("signal", payload);
        });

        socket.on("call-ended", ({ roomId }) => {
            io.to(roomId).emit("call-ended");
            io.in(roomId).socketsLeave(roomId);
        });

        socket.on("disconnecting", () => {
            if (socket.roomId) {
                socket.to(socket.roomId).emit("call-ended");
            }
        });
    });
}
