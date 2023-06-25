import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit';
import authReducer from "../features/auth/authSlice";
import postReducer from "../features/post/postSlice";

export const store = configureStore({
  reducer: {
		auth: authReducer,
		post: postReducer,
  },
});

// dispatchはアクションをReducerに送信して状態を更新するために存在
export type AppDispatch = typeof store.dispatch; // storeのdispatchの型を取得
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
