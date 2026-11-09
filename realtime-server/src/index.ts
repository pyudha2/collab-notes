import "dotenv/config";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { prisma } from "./prisma";
import { join, leave, online } from "./presence";

const clean = (v: unknown, max: number) =>
  typeof v === "string" ? v.trim().slice(0, max) : "";

const http = createServer();
const io = new Server(http, { cors: { origin: process.env.CLIENT_ORIGIN } });

io.on("connection", (socket) => {
  let room = "";
  let name = "";

  const exit = () => {
    if (!room) return;
    leave(room, name, socket.id);
    socket.leave(room);
    socket.to(room).emit("typing", { name, typing: false });
    io.to(room).emit("presence", online(room));
    room = "";
  };

  socket.on(
    "join",
    async (p: { room?: unknown; name?: unknown } | undefined) => {
      const r = clean(p?.room, 50);
      const n = clean(p?.name, 30);
      if (!r || !n) return;
      exit();
      room = r;
      name = n;
      socket.join(r);
      join(r, n, socket.id);
      try {
        const rows = await prisma.message.findMany({
          where: { room: r },
          orderBy: { id: "desc" },
          take: 50,
        });
        socket.emit("history", rows.reverse());
      } catch (e) {
        console.error(e);
        socket.emit("history", []);
      }
      io.to(r).emit("presence", online(r));
    },
  );

  socket.on("message", async (t: unknown) => {
    const text = clean(t, 1000);
    const r = room;
    const n = name;
    if (!r || !text) return;
    try {
      const msg = await prisma.message.create({
        data: { room: r, name: n, text },
      });
      io.to(r).emit("message", msg);
    } catch (e) {
      console.error(e);
    }
  });

  socket.on("typing", (t: unknown) => {
    if (room) socket.to(room).emit("typing", { name, typing: t === true });
  });

  socket.on("disconnect", exit);
});

http.listen(Number(process.env.PORT) || 4000);
