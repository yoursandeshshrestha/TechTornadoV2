import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface GameState {
  currentRound: number;
  gameStatus: "In Progress" | "Stopped";
  registrationStatus: "open" | "closed";
  activeUsers: number;
  loading: boolean;
  error: string | null;
}

const initialState: GameState = {
  currentRound: 1,
  gameStatus: "Stopped",
  registrationStatus: "closed",
  activeUsers: 0,
  loading: false,
  error: null,
};

export const fetchGameStatus = createAsyncThunk(
  "game/fetchStatus",
  async (_, { getState }) => {
    const response = await fetch(
      "http://localhost:8000/api/admin/registration/status"
    );
    const data = await response.json();
    return data;
  }
);

export const toggleRegistration = createAsyncThunk(
  "game/toggleRegistration",
  async (status: "open" | "closed", { getState, dispatch }) => {
    const { auth } = getState() as { auth: { token: string } };

    const response = await fetch(
      `http://localhost:8000/api/admin/registration/${status}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    toast.success(
      `Registration ${status === "open" ? "opened" : "closed"} successfully`
    );
    dispatch(fetchGameStatus());
    return data;
  }
);

export const startRound = createAsyncThunk(
  "game/startRound",
  async (round: number, { getState, dispatch }) => {
    const { auth } = getState() as { auth: { token: string } };

    const response = await fetch(
      "http://localhost:8000/api/admin/round/start",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ round }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message);
    }

    toast.success(`Round ${round} started successfully`);
    dispatch(fetchGameStatus());
    return data;
  }
);

const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGameStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGameStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.registrationStatus = action.payload.status;
      })
      .addCase(fetchGameStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch game status";
      });
  },
});

export default gameSlice.reducer;
