import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: 'user', // Default role, change as needed
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.role = action.payload;
    },
    logout: () => initialState, // Reset state on logout
  },
});

export const { setRole } = userSlice.actions;
export default userSlice.reducer;
