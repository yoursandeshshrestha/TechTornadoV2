import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import gameReducer from "./features/gameSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    game: gameReducer, // Added game reducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
