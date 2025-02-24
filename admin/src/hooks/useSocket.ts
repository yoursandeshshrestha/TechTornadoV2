import { useEffect, useCallback, useState } from "react";
import SocketService from "@/lib/socket";
import type { Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = SocketService.getInstance().getSocket();
    setSocket(socketInstance);

    return () => {
      // Cleanup if needed
      socketInstance?.off();
    };
  }, []);

  const subscribe = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      const service = SocketService.getInstance();
      service.subscribe(event, callback);
    },
    []
  );

  const unsubscribe = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      const service = SocketService.getInstance();
      service.unsubscribe(event, callback);
    },
    []
  );

  const subscribeToGameState = useCallback((callback: (state: any) => void) => {
    const service = SocketService.getInstance();
    service.subscribeToGameState(callback);
  }, []);

  const unsubscribeFromGameState = useCallback(
    (callback: (state: any) => void) => {
      const service = SocketService.getInstance();
      service.unsubscribeFromGameState(callback);
    },
    []
  );

  return {
    socket,
    subscribe,
    unsubscribe,
    subscribeToGameState,
    unsubscribeFromGameState,
  };
};
