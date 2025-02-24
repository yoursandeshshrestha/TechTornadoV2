import { io, Socket } from "socket.io-client";

interface GameState {
  gameStatus: "In Progress" | "Stopped";
  isRegistrationOpen: boolean;
  currentRound: number;
  activeUsers: number;
  endTime?: string;
}

type GameStateListener = (state: Partial<GameState>) => void;

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private gameStateListeners: Set<GameStateListener> = new Set();

  private constructor() {
    this.socket = io(
      process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000",
      {
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    this.setupSocketListeners();
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("Connected to WebSocket server");
      this.socket?.emit("requestInitialState");
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    // Game state events
    this.socket.on("gameStateUpdate", (data: Partial<GameState>) => {
      console.log("Game state update received:", data);
      this.notifyListeners(data);
    });

    this.socket.on("registrationStatusChange", (status: "open" | "closed") => {
      const gameState: Partial<GameState> = {
        isRegistrationOpen: status === "open",
      };
      this.notifyListeners(gameState);
    });

    this.socket.on(
      "roundChange",
      (data: { round: number; endTime?: string }) => {
        const gameState: Partial<GameState> = {
          currentRound: data.round,
          gameStatus: data.round > 0 ? "In Progress" : "Stopped",
          endTime: data.endTime,
        };
        this.notifyListeners(gameState);
      }
    );

    this.socket.on("roundTerminated", () => {
      const gameState: Partial<GameState> = {
        currentRound: 0,
        gameStatus: "Stopped",
        endTime: undefined,
      };
      this.notifyListeners(gameState);
    });

    this.socket.on("leaderboardUpdate", (data: any) => {
      const gameState: Partial<GameState> = {
        activeUsers: Array.isArray(data) ? data.length : 0,
      };
      this.notifyListeners(gameState);
    });
  }

  private notifyListeners(state: Partial<GameState>): void {
    this.gameStateListeners.forEach((listener) => listener(state));
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public subscribeToGameState(callback: GameStateListener): void {
    this.gameStateListeners.add(callback);
  }

  public unsubscribeFromGameState(callback: GameStateListener): void {
    this.gameStateListeners.delete(callback);
  }

  public subscribe(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }

  public unsubscribe(event: string, callback: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  public emit(event: string, data?: any): void {
    this.socket?.emit(event, data);
  }
}

export default SocketService;
