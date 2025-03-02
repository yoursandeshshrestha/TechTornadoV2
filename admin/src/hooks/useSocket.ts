import { useEffect, useCallback, useState } from "react";
import SocketService from "@/lib/socket";
import type { Socket } from "socket.io-client";

// Define a generic type for the socket event callback
type SocketEventCallback<T = unknown> = (data: T) => void;

// Define a type for game state
interface GameState {
  currentRound?: number;
  isRegistrationOpen?: boolean;
  isGameActive?: boolean;
  gameStatus?: "In Progress" | "Stopped";
  [key: string]: unknown;
}

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
    <T = unknown>(event: string, callback: SocketEventCallback<T>) => {
      const service = SocketService.getInstance();
      service.subscribe(event, callback);
    },
    []
  );

  const unsubscribe = useCallback(
    <T = unknown>(event: string, callback: SocketEventCallback<T>) => {
      const service = SocketService.getInstance();
      service.unsubscribe(event, callback);
    },
    []
  );

  const subscribeToGameState = useCallback(
    (callback: SocketEventCallback<GameState>) => {
      const service = SocketService.getInstance();
      service.subscribeToGameState(callback);
    },
    []
  );

  const unsubscribeFromGameState = useCallback(
    (callback: SocketEventCallback<GameState>) => {
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
