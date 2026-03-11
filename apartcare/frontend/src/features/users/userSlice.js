import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteUser,
  reactivateUser,
  updateUser,
  updateStaff,
  updateResident,
} from "../../api/admin";


export const toggleDeactivate = createAsyncThunk(
  "users/toggleDeactivate",
  async ({ id, is_active }) => {
    console.log("TOGGLE CLICKED", id, is_active);
    if (is_active) {
      await deleteUser(id);
      return { id, is_active: false };
    } else {
      await reactivateUser(id);
      return { id, is_active: true };
    }

  }
);


export const editUser = createAsyncThunk(
  "users/editUser",
  async ({ id, data }) => {
    const res = await updateUser(id, data);
    return res.data.data;
  }
);


export const editStaff = createAsyncThunk(
  "users/editStaff",
  async ({ id, data }) => {
    const res = await updateStaff(id, data);
    return res.data.data;
  }
);


export const editResident = createAsyncThunk(
  "users/editResident",
  async ({ id, data }) => {
    const res = await updateResident(id, data);
    return res.data.data;
  }
);

const userSlice = createSlice({
  name: "users",

  initialState: {
    users: [],
  },

  reducers: {},

  extraReducers: (builder) => {
      builder.addCase(toggleDeactivate.fulfilled, (state, action) => {

      const { id, is_active } = action.payload;

      const user = state.users.find((u) => u.id === id);

      if (user) {
        user.is_active = is_active;
      }

    });

  },
});

export default userSlice.reducer;