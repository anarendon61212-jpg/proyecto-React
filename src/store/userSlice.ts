// src/store/userSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "../models/User";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";

interface UserState {
    user: User | null;
}

const storage = new LocalStorageProvider();

const storedUser = storage.getItem("user");

const initialState: UserState = {
    user: storedUser ? JSON.parse(storedUser) : null,
};

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state: UserState, action: PayloadAction<User | null>) => {
            console.log("USERSLICE REDUCER - ANTES:", state.user);
            console.log("USERSLICE REDUCER - ACTION PAYLOAD:", action.payload);

            state.user = action.payload;

            console.log("USERSLICE REDUCER - DESPUES:", state.user);

            if (action.payload) {
                storage.setItem("user", JSON.stringify(action.payload));
                console.log("USERSLICE REDUCER - GUARDADO EN LOCALSTORAGE:", JSON.stringify(action.payload));
            } else {
                storage.removeItem("user");
            }
        },
        clearUser: (state: UserState) => {
            state.user = null;
            storage.removeItem("user");
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;