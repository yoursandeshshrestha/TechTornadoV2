import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AuthState } from "@/types";
import { toast } from "sonner";

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
  token: null,
  isAuthenticated: false,
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
        state.token = action.payload.token.data?.token || null;
        state.user = action.payload.token.data?.admin || null;
        toast.success("Logged in successfully");
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
