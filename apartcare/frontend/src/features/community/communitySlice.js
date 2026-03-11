import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getCommunities,updateCommunity,deactivateCommunity,reactivateCommunity } from "../../api/superadmin";


export const fetchCommunities = createAsyncThunk(
  "community/fetchCommunities",
  async () => {
    const data = await getCommunities();
    return data;
  }
);
export const editCommunity = createAsyncThunk(
  "community/editCommunity",
  async ({ id, data }) => {
    const response = await updateCommunity(id, data);
    return response.data;
  }
);

export const toggleDeactivate = createAsyncThunk(
  "community/deactivate",
  async ({ id, is_active }) => {
    if (is_active) {
      await deactivateCommunity(id);
      return { id, is_active: false };
    } else {
      await reactivateCommunity(id);
      return { id, is_active: true };
    }
  }
);

const communitySlice = createSlice({
  name: "community",
  initialState: {
    communities: [],
    loading: false,
    error: null,
  },



  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunities.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
      })
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(toggleDeactivate.fulfilled, (state, action) => {
      const community = state.communities.find(
        (c) => c.id === action.payload.id
      );
      if (community) {
        community.is_active = action.payload.is_active;
      }
    });
  },
});

export default communitySlice.reducer;