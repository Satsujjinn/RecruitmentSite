import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const useMock = !API_URL;

let socket: Socket | null = null;
let currentQuery = '';

export function getSocket(userId?: string, roomId?: string) {
  if (useMock) {
    // simple eventless mock
    return {
      on: () => {},
      emit: () => {},
      off: () => {},
      disconnect: () => {},
    } as unknown as Socket;
  }
  const query = `${userId || ''}-${roomId || ''}`;
  if (!socket || currentQuery !== query) {
    if (socket) socket.disconnect();
    socket = io(API_URL!, { query: { userId, roomId } });
    currentQuery = query;
  }
  return socket;
}

export function closeSocket() {
  if (!useMock && socket) {
    socket.disconnect();
    socket = null;
    currentQuery = '';
  }
}
