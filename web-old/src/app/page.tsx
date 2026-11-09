"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message = { id: number; name: string; text: string; createdAt: string };

export default function Page() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("general");
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const [typing, setTyping] = useState<string[]>([]);
  const [text, setText] = useState("");
  const socket = useRef<Socket | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!joined) return;
    const s = io(process.env.NEXT_PUBLIC_SOCKET_URL);
    socket.current = s;
    s.on("connect", () => s.emit("join", { room, name }));
    s.on("history", setMessages);
    s.on("message", (m: Message) => setMessages((p) => [...p, m]));
    s.on("presence", setUsers);
    s.on(
      "typing",
      ({ name: n, typing: t }: { name: string; typing: boolean }) =>
        setTyping((p) =>
          t ? [...new Set([...p, n])] : p.filter((x) => x !== n),
        ),
    );
    return () => {
      s.disconnect();
    };
  }, [joined, room, name]);

  useEffect(() => {
    bottom.current?.scrollIntoView();
  }, [messages]);

  const onChange = (v: string) => {
    setText(v);
    socket.current?.emit("typing", true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(
      () => socket.current?.emit("typing", false),
      1500,
    );
  };

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    socket.current?.emit("message", text);
    socket.current?.emit("typing", false);
    setText("");
  };

  if (!joined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setJoined(true);
          }}
          className="w-full max-w-sm space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h1 className="text-xl font-semibold">Join a room</h1>
          <label className="block text-sm">
            Name
            <input
              required
              maxLength={30}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Room
            <input
              required
              maxLength={50}
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
          </label>
          <button className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
            Join
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-screen max-w-4xl gap-4 p-4">
      <aside className="hidden w-48 shrink-0 rounded-xl border border-slate-200 bg-white p-4 sm:block">
        <h2 className="mb-2 text-sm font-semibold text-slate-500">
          Online ({users.length})
        </h2>
        <ul className="space-y-1 text-sm">
          {users.map((u) => (
            <li key={u} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              {u}
            </li>
          ))}
        </ul>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col rounded-xl border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-4 py-3 font-semibold">
          #{room}
        </header>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {messages.map((m) => (
            <div key={m.id} className={m.name === name ? "text-right" : ""}>
              <div className="text-xs text-slate-500">
                {m.name} - {new Date(m.createdAt).toLocaleTimeString()}
              </div>
              <div
                className={`inline-block max-w-[80%] break-words rounded-lg px-3 py-2 text-sm ${
                  m.name === name ? "bg-indigo-600 text-white" : "bg-slate-100"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottom} />
        </div>
        <p className="h-5 px-4 text-xs text-slate-500">
          {typing.length > 0 && `${typing.join(", ")} typing...`}
        </p>
        <form
          onSubmit={send}
          className="flex gap-2 border-t border-slate-200 p-3"
        >
          <input
            value={text}
            maxLength={1000}
            placeholder="Type a message"
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
            Send
          </button>
        </form>
      </section>
    </main>
  );
}
