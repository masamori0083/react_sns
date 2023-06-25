import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from "axios";
import { RootState } from '../../app/store';
import { PROPS_AUTHEN, PROPS_NICKNAME, PROPS_PROFILE } from '../types';



// djangoのapiサーバーとの通信に使うurl
const apiUrl = process.env.REACT_APP_DEV_API_URL;


/* 非同期関数の定義 */

// apiサーバーとの非同期通信。HTTP通信
// ユーザーが入力した情報をサーバーに渡す。login
export const fetchAsyncLogin = createAsyncThunk(
	"auth/post",
	async (authen: PROPS_AUTHEN, {rejectWithValue}) => {
		// authenにはPROPS_AUTHEで定義したデータが入っている
		// axios.postの第二引数でそのデータを渡す
		try {
			const res = await axios.post(`${apiUrl}authen/jwt/create/`, authen, {
				headers: {
					"Content-Type": "application/json"
				},
			});
			// アクセストークンが返ってくる。このトークンをreactに設置して、個人のviewページが見れる
			return res.data
		} catch (err) {
			if (err instanceof axios.AxiosError) {
				return rejectWithValue({
					errorMessage: err.response?.data,
					errorStatus: err.response?.statusText
				});
			}
			return rejectWithValue({
				errorMessage: "Something went wrong",
				errorStatus: "500"
			});
		}
	}
);

// apiサーバーとの非同期通信。HTTP通信
// ユーザーが入力した情報をサーバーに渡す。signup
export const fetchAsyncRegister = createAsyncThunk(
	"auth/register",
	async (auth: PROPS_AUTHEN) => {
		// authにはPROPS_AUTHEで定義したデータが入っている
		// axios.postの第二引数でそのデータを渡す
		const res = await axios.post(`${apiUrl}api/register/`, auth, {
			headers: {
				"Content-Type": "application/json"
			},
		});
		// 新規作成したユーザーの情報が返ってくる
		return res.data
	}
);

// apiサーバーとの非同期通信
// ユーザーのプロフィールの作成
export const fetchAsyncCreateProf = createAsyncThunk(
	"profile/post",
	async (nickName: PROPS_NICKNAME) => {
		// nickNameにはPROPS_NICKNAMEで定義したデータが入っている
		// axios.postの第二引数でそのデータを渡す
		const res = await axios.post(`${apiUrl}api/profile/`, nickName, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `JWT ${localStorage.localJWT}` // トークンはログインした段階でlocalStorage.localJWTに格納される
			},
		});
		// ユーザーのニックネームが返ってくる
		return res.data
	}
);

// apiサーバーとの非同期通信
// ユーザーのプロフィールの更新
export const fetchAsyncUpdateProf = createAsyncThunk(
	"profile/put",
	async (profile: PROPS_PROFILE) => {

		// HTMLのフォーム要素から要素を受け取るためのオブジェクト
		const uploadData = new FormData();
		// オブジェクトにデータを追加
		uploadData.append("nickName", profile.nickName);
		// 渡されたprofileにimgが含まれる場合だけ、FormDataオブジェクトに追加
		profile.img && uploadData.append("img", profile.img, profile.img.name);
		
		// uploadDataオブジェクトに格納されたデータを渡す
		// 更新のHTTPメソッドはputなので、axios.putを選択
		const res = await axios.put(`${apiUrl}api/profile/${profile.id}/`, uploadData,
			{
			headers: {
				"Content-Type": "multipart/form-data",
					Authorization: `JWT ${localStorage.localJWT}` // トークンはログインした段階でlocalStorage.localJWTに格納される
				},
			}
		);
		// 更新したユーザーの情報が返ってくる
		return res.data
	}
);

// apiサーバーとの非同期通信
// ユーザーのプロフィール情報を取得
export const fetchAsyncGetMyProf = createAsyncThunk(
	"profile/get",
	async () => {
		// 情報を取得するだけなので、getメソッド。
		// 何も情報を送信しないんので、引数もなし
		const res = await axios.get(`${apiUrl}api/myprofile/`,{
			headers: {
				Authorization: `JWT ${localStorage.localJWT}` // トークンはログインした段階でlocalStorage.localJWTに格納される
			},
		});
		// ユーザー情報が返ってくる
		// djangoでユーザー情報を取得するときに、filterを使っている。
		// 返ってくるデータは配列の形式なので、インデックスの指定が必要。
		return res.data[0];
	}
);

// apiサーバーとの非同期通信
// 存在する全ユーザーのプロフィール情報を取得
export const fetchAsyncGetProfs = createAsyncThunk(
	"profiles/get",
	async () => {
		// 情報を取得するだけなので、getメソッド。
		// 何も情報を送信しないので、引数もなし
		const res = await axios.get(`${apiUrl}api/profile/`,{
			headers: {
				Authorization: `JWT ${localStorage.localJWT}` // トークンはログインした段階でlocalStorage.localJWTに格納される
			},
		});
		// ユーザー情報が返ってくる
		// djangoでユーザー情報を取得するときに、filterを使っている。
		// 返ってくるデータは配列の形式なので、インデックスの指定が必要。
		return res.data;
	}
);


/** スライスの定義 */

export const authSlice = createSlice({
	name: 'auth',
	
	initialState: {
		openSignIn: true, // ログイン用モーダル表示のフラグ
		openSignUp: false, // サインアップ用のモーダル表示のフラグ
		openProfile: false, // プロフィール画像をクリックする際に現れるモーダル表示のフラグ
		isLoadingAuth: false, // apiにアクセスして処理を行っている最中はtrueになる
		isOpenEditProfile: false, // プロフィール編集用のモーダル表示のフラグ
		loginErrorMessages: "", // ログインに失敗した時のエラーメッセージ
		
		// djangoで定義したモデルのフィールドと同じ
		// バックエンドから取得したデータを保持する
		myprofile: {
			id: 0,
			nickName: "",
			userProfile: 0,
			created_on: "",
			img: "",
		},

		// djangoで定義したProfileモデルのフィールドと同じ
		// バックエンドから取得したデータを保持する 
		profiles: [
			{
				id: 0,
				nickName: "",
				userProfile: 0,
				created_on: "",
				img: "",
			},
		],
	},
	
	/* 特定のアクションが発生した時にアプリケーションの状態をどのように更新するかを決定する */
	reducers: {
		// 認証プロセスが始まったの時の挙動
		fetchCredStart(state) {
			state.isLoadingAuth = true;
		},
		// 認証プロセスが終了した時の挙動
		fetchCredEnd(state) {
			state.isLoadingAuth = false;
		},
		// ログインモーダルの表示制御
		setOpenSignIn(state) {
			state.openSignIn = true;
		},
		// ログインモーダルの表示制御
		resetOpenSignIn(state) {
			state.openSignIn = false
		},
		// ログインエラーメッセージのリセット
		resetLoginErrorMessages(state) {
			state.loginErrorMessages = "";
		},

		// サインアップモーダルの表示制御
		setOpenSignUp(state) {
			state.openSignUp = true;
		},
		// サインアップモーダルの表示制御
		resetOpenSignUp(state) {
			state.openSignUp = false
		},
		// プロフィールモーダルの表示制御
		setOpenProfile(state) {
			state.openProfile = true;
		},
		// プロフィールモーダルの表示制御
		resetOpenProfile(state) {
			state.openProfile = false;
		},

		// ユーザーが入力した文字列をactionで受け取ってmyProfileを上書きする
		// 入力した文字列はaction.payloadに保管されている。
		editNickname(state, action) {
			state.myprofile.nickName = action.payload
		},
	},

	/*
	非同期関数の処理が終了した場合の後処理
	extraRedusersというメソッドを使う
	addCase のstateはinitialStateで定義した各オブジェクト
	*/
	
	extraReducers: (builder) => {
		// fulfiled:成功した場合、JWTをlocalStorageに格納する
		builder.addCase(fetchAsyncLogin.fulfilled, (state, action) => {
			// 非同期関数で渡されたデータをaction.payloadで受け取ることができる
			// accessでトークンにアクセスして、localStorageに保管
			localStorage.setItem("localJWT", action.payload.access);
		});

		builder.addCase(fetchAsyncLogin.rejected, (state, action) => {
			const payload = action.payload as { errorMessage: { detail: string }, errorStatus: string };

			if (payload.errorMessage) {
				// state.loginErrorMessages = action.payload.errorMessage.detail;
				state.loginErrorMessages = payload.errorMessage.detail;
				console.log(payload.errorMessage.detail);
			}
			else {
				state.loginErrorMessages = "Something went wrong";
			}
			
		});
		builder.addCase(fetchAsyncCreateProf.fulfilled, (state, action) => {
			// action.payloadで受け取って、myProfileに格納
			state.myprofile = action.payload
		});

		builder.addCase(fetchAsyncGetMyProf.fulfilled, (state, action) => {
			// action.payloadで受け取って、myProfileに格納
			state.myprofile = action.payload
		});

		builder.addCase(fetchAsyncGetProfs.fulfilled, (state, action) => {
			// action.payloadで受け取って、profilesに格納
			state.profiles = action.payload
		});

		builder.addCase(fetchAsyncUpdateProf.fulfilled, (state, action) => {
			// action.payloadで受け取って、myProfileとprofilesに格納
			state.myprofile = action.payload;
			// profilesの中には全ユーザーのプロフィール情報が入っている。
			// それをmapで展開して、自分のidのプロフィールだけを更新する
			state.profiles = state.profiles.map((prof) =>
				prof.id === action.payload.id ? action.payload : prof
			);
		});
		
	},
});

/**
 * reducerのexport
 */
export const {
	fetchCredStart,
	fetchCredEnd,
	setOpenSignIn,
	resetOpenSignIn,
	setOpenSignUp,
	resetOpenSignUp,
	setOpenProfile,
	resetOpenProfile,
	editNickname
} = authSlice.actions;

/**
 * Sliceで定義したinitialStateをexportする部分
 */

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// RootStateは Sliceで定義したinitialStateの要素を全て持っている

export const selectIsLoadingAuth = (state: RootState) => state.auth.isLoadingAuth;
export const selectLoginErrorMessages = (state: RootState) => state.auth.loginErrorMessages;
export const selectOpenSignIn = (state: RootState) => state.auth.openSignIn;
export const selectOpenSignUp = (state: RootState) => state.auth.openSignUp;
export const selectOpenProfile = (state: RootState) => state.auth.openProfile;
export const selectProfile = (state: RootState) => state.auth.myprofile;
export const selectProfiles = (state: RootState) => state.auth.profiles;
export const { resetLoginErrorMessages } = authSlice.actions
export default authSlice.reducer;
