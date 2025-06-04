import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSessionSocket(sessionId: string, onAlbumSelected: (album: any) => void) {
  useEffect(() => {
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      autoConnect: false,
      transports: ['websocket'],
    });

    console.log("Connecting to:", process.env.NEXT_PUBLIC_SOCKET_URL);

    socket.connect(); // manually connect after full config

    socket.on('album_selected', onAlbumSelected);

    return () => {
      socket.disconnect();
    };
  }, [sessionId, onAlbumSelected]);
}
