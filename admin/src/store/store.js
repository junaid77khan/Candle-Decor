import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import accessToken from "./accessToken";

const store = configureStore({
    reducer: {
        accessToken,
        auth: authSlice
    }
})

export {store}




