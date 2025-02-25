import { createSlice } from '@reduxjs/toolkit';

const emailSlice = createSlice({
  name: 'email',
  initialState: '',
  reducers: {
    setEmail: (state, action) => action.payload,
    clearEmail: () => '',
  },
});

export const { setEmail, clearEmail } = emailSlice.actions;
export default emailSlice.reducer;
