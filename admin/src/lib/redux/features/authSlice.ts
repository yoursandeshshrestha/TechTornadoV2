import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState } from "@/types";
import { toast } from "sonner";

import { getTokenFromCookie } from "@/utils/cookieUtils";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  token: {
    success: boolean;
    message: string;
    error?: {
      code: string;
      details: string;
    };
    data?: {
      token: string;
      admin: {
        id: string;
        username: string;
      };
    };
  };
}

export const loginAdmin = createAsyncThunk<LoginResponse, LoginCredentials>(
  "auth/login",
  async (credentials) => {
    const response = await fetch("http://localhost:8000/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!data.token.success) {
      toast.error(data.token.error?.details || data.token.message);
      throw new Error(data.token.error?.details || data.token.message);
    }

    document.cookie = `token=${data.token.data?.token}; path=/`;
    return data;
  }
);

const initialState: AuthState = {
  token: getTokenFromCookie(), // Initialize with token from cookie
  isAuthenticated: !!getTokenFromCookie(), // Set initial auth state based on token presence
  loading: false,
  error: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      toast.success("Logged out successfully");
    },
    restoreAuthState: (state) => {
      const token = getTokenFromCookie();
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token.data?.token;
        state.user = action.payload.token.data?.admin;
        toast.success("Logged in successfully");
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Login failed";
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      });
  },
});

export const { logout, restoreAuthState, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
