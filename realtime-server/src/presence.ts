const rooms = new Map<string, Map<string, Set<string>>>();

export function join(room: string, name: string, id: string) {
  const users = rooms.get(room) ?? new Map<string, Set<string>>();
  const ids = users.get(name) ?? new Set<string>();
  ids.add(id);
  users.set(name, ids);
  rooms.set(room, users);
}

export function leave(room: string, name: string, id: string) {
  const users = rooms.get(room);
  const ids = users?.get(name);
  if (!users || !ids) return;
  ids.delete(id);
  if (ids.size === 0) users.delete(name);
  if (users.size === 0) rooms.delete(room);
}

export function online(room: string) {
  return [...(rooms.get(room)?.keys() ?? [])];
}
