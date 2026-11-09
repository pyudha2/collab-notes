# Realtime Chat

Chat room with Socket.io: rooms, presence, typing indicator, message history.

Stack: Next.js, Tailwind CSS, Socket.io, Prisma 7, MariaDB.

## Structure

- `realtime-server/`: Socket.io server and database (Prisma).
- `web/`: Next.js client.

## Run locally

1. Create a database named `realtime_chat`.
2. Server:
   - `cd realtime-server`
   - copy `.env.example` to `.env` and set your database user and password
   - `npm install`
   - `npx prisma migrate dev`
   - `npx prisma generate`
   - `npm run dev`
3. Web (new terminal):
   - `cd web`
   - create `.env.local` with `NEXT_PUBLIC_SOCKET_URL=http://localhost:4000`
   - `npm install`
   - `npm run dev`
4. Open http://localhost:3000 in two tabs and join the same room.

## Environment variables

`realtime-server/.env`

- `DATABASE_URL`: MariaDB connection string
- `CLIENT_ORIGIN`: web origin allowed by CORS (default `http://localhost:3000`)
- `PORT`: server port (default `4000`)

`web/.env.local`

- `NEXT_PUBLIC_SOCKET_URL`: Socket.io server URL

## Checks

`cd realtime-server` then `npm run check` runs the presence test.