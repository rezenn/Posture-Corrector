import { createSlice } from "@reduxjs/toolkit";

interface User {
    id: string;
    name: string;
    email: string;
    profilePictureUrl?: string;
    // add other user properties as needed
}

interface UserState {
    currentUser: User | null;
}

const initialState: UserState = {
    currentUser: null,
};

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        registerSuccess: (state, action) => {
            state.currentUser = action.payload.user;
            localStorage.setItem("upryt-app-token", action.payload.token);
        },
        loginSuccess: (state, action) => {
            state.currentUser = action.payload.user;
            localStorage.setItem("upryt-app-token", action.payload.token);
        },
        logout: (state) => {
            state.currentUser = null;
            localStorage.removeItem("upryt-app-token");
        },
        updateUserDetails: (state, action) => {
            if (state.currentUser) {
                state.currentUser = { ...state.currentUser, ...action.payload };
            }
        },
        updateProfilePictureSuccess: (state, action) => {
            if (state.currentUser) {
                state.currentUser.profilePictureUrl = action.payload;
            }
        },
        deleteUserSuccess: (state) => {
            state.currentUser = null;
            localStorage.removeItem("upryt-app-token");
        }
    },
});

export const { registerSuccess, loginSuccess, logout, deleteUserSuccess, updateProfilePictureSuccess, updateUserDetails } = userSlice.actions;

export default userSlice.reducer;