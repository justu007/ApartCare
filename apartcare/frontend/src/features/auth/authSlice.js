import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axios"; 


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/auth/login/", credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Login failed" }
      );
    }
  }
);



export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/profile/");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || { detail: "Unauthorized" }
      );
    }
  }
);



export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/auth/logout/");
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);



const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    role: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    authChecked: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload?.non_field_errors?.[0] ||
          action.payload?.detail ||
          "Login failed";
      })

      // FETCH PROFILE
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.role = action.payload.role;
        state.isAuthenticated = true;
        state.authChecked =true;
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
        state.authChecked = true;
      })

      // LOGOUT
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.role = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;