import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3800', {
      autoConnect: true,
      reconnection: true,
    });
  }
  return socket;
}

export function joinRoom(room: string) {
  getSocket().emit('join', room);
}
