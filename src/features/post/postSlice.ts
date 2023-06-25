import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios, { AxiosError } from "axios";
import { RootState } from '../../app/store';
import { PROPS_COMMENT, PROPS_LIKED, PROPS_NEWPOST } from '../types';



// djangoのapiサーバーとの通信に使うurl
const apiUrlPost = `${process.env.REACT_APP_DEV_API_URL}api/post/`;
const apiUrlComment = `${process.env.REACT_APP_DEV_API_URL}api/comment/`;

/* 非同期関数の定義 */

// 投稿内容を取得する
export const fetchAsyncGetPosts = createAsyncThunk("post/get", async () => {
	const res = await axios.get(apiUrlPost, { // axios.getでapiサーバーからデータを取得する
		headers: {
			Authorization: `JWT ${localStorage.localJWT}`, // トークンはログインした段階でlocalStorage.localJWTに格納されたものを使用する
		},
	});
	return res.data;// 取得したデータを配列でreturnする
});

// 投稿内容を送信する
export const fetchAsyncNewPost = createAsyncThunk(
	"post/post",
	async (newPost: PROPS_NEWPOST) => {
		const uploadData = new FormData(); // FormDataはフォームのデータを扱うためのオブジェクト
		uploadData.append("title", newPost.title); // appendでフォームのデータを追加する
		newPost.img && uploadData.append("img", newPost.img, newPost.img.name); // imgがあれば追加する
		
		const res = await axios.post(apiUrlPost, uploadData, { // axios.postでapiサーバーにデータを送信する
			headers: {
				"Content-Type": "multipart/form-data",
				Authorization: `JWT ${localStorage.localJWT}`,
			},
		});
		return res.data;
	}
);

// いいねの状態を更新する
export const fetchAsyncPatchLiked = createAsyncThunk(
	"post/patch",
	async (liked: PROPS_LIKED) => {
		const currentLiked = liked.current; // いいねをしてくれたユーザーのidを格納する配列
		const uploadData = new FormData();

		let isOverlapped = false; // いいねをしたユーザーが既にいいねをしているかどうかを判定するフラグ
		currentLiked.forEach((current) => { // いいねをしてくれたユーザーのidを一つずつ取り出す
			if (current === liked.new) { // いいねをしてくれたユーザーのidと新たにいいねをしてくれたユーザーのidが一致した場合
				isOverlapped = true;
			} else { // いいねをしてくれたユーザーのidと新たにいいねをしてくれたユーザーのidが一致しなかった場合
				uploadData.append("liked", String(current)); // いいねをしてくれたユーザーのidをuploadDataに追加する
			}
		});
		if (!isOverlapped) { // いいねを押したユーザーが新しくいいねをする場合
			uploadData.append("liked", String(liked.new)); // いいねを押したユーザーのidをuploadDataに追加する
		} else if (currentLiked.length === 1) { 
			// いいねを押したユーザーがいいねを外し、かつそのユーザーのみがいいねをしている場合
			// currentLiked配列を空にしたい
			// しかし、patchメソッドはそれができない
			// 初期化するために、putメソッドを使用したいがtitleが必須なため、uploadDataにtitleを追加する
			// この状態でputをすると、currentLiked配列が初期化されて空になる
			uploadData.append("title", liked.title);
			const res = await axios.put(`${apiUrlPost}${liked.id}/`, uploadData, {
				headers: { 
					"Content-Type": "multipart/form-data",
					Authorization: `JWT ${localStorage.localJWT}`,
				},
			});
			return res.data;
		}
		// いいねの状態の更新
		const res = await axios.patch(`${apiUrlPost}${liked.id}/`, uploadData, {
			headers: {
				"Content-Type": "multipart/form-data",
				Authorization: `JWT ${localStorage.localJWT}`,
			},
		});
		return res.data;
	}
);

// コメントを取得する
export const fetchAsyncGetComments = createAsyncThunk(
	"comment/get",
	async () => {
		const res = await axios.get(apiUrlComment, {
			headers: {
				Authorization: `JWT ${localStorage.localJWT}`,
			},
		});
		return res.data;
	}
);

// コメントを送信する
export const fetchAsyncPostComment = createAsyncThunk(
	"comment/post",
	async (comment: PROPS_COMMENT) => {
		const res = await axios.post(apiUrlComment, comment, {
			headers: {
				Authorization: `JWT ${localStorage.localJWT}`,
			},
		});
		return res.data;
	}
);
// コメントを削除する
export const fetchAsyncDeleteComment = createAsyncThunk(
	"comment/delete",
	async (id: number, { rejectWithValue }) => {
		try {
			await axios.delete(`${apiUrlComment}${id}/`, {
				headers: {
					Authorization: `JWT ${localStorage.localJWT}`,
				},
			});
			return id; 
		} catch (err) {
			let axiosError = err as AxiosError;
			// axiosError.responseがtruthyの場合はrejectWithValueデータを返す(400番台)
			// axiosError.responseがfalsyの場合はrejectWithValueオブジェクトを返す(500番台想定)
			return rejectWithValue(axiosError.response ? axiosError.response.data : axiosError);
		}
	}
);


/** スライスの定義 */
export const postSlice = createSlice({
	name: 'post',
	
	initialState: {
		isLoadingPost: false, // 投稿のローディング状態を管理する
		openNewPost: false, // 新規投稿モーダルの表示制御
		// djangoで登録したmodelのfieldと同じfieldに設定する
		posts: [  
			{
				id: 0,
				title: "",
				userPost:0, // 投稿したユーザーのid
				created_on: "",
				img: "",
				liked: [0],
	},
		],
		comments: [
			{
				id: 0,
				text: "",
				post: 0,
				userComment: 0,
			},
		],
	},
	
	/* 特定のアクションが発生した時にアプリケーションの状態をどのように更新するかを決定する */
	reducers: {
		// 投稿のローディング状態をスタートさせる
		fetchPostStart(state) {
			state.isLoadingPost = true;
		},
		// 投稿のローディング状態を終了させる
		fetchPostEnd(state) {
			state.isLoadingPost = false;
		},
		// 新規投稿モーダルの表示を開始
		setOpenNewPost(state) {
			state.openNewPost = true;
		},
		// 新規投稿モーダルの表示を終了
		resetOpenNewPost(state) {
			state.openNewPost = false;
		},
	},

	/*
	非同期関数の処理が終了した場合の後処理
	extraRedusersというメソッドを使う
	addCase のstateはinitialStateで定義した各オブジェクト
	*/
	
	extraReducers: (builder) => {
		// 投稿内容を取得して、state(posts)に格納する
		builder.addCase(fetchAsyncGetPosts.fulfilled, (state, action) => {
			return {
				...state,
				posts: action.payload,
			};
		});
		// 投稿内容を送信して、state(posts)に格納する
		builder.addCase(fetchAsyncNewPost.fulfilled, (state, action) => {
			return {
				...state,
				posts: [...state.posts, action.payload],
			};
		});
		// コメントの状態を更新する
		builder.addCase(fetchAsyncGetComments.fulfilled, (state, action) => {
			return {
				...state,
				comments: action.payload,
			};
		});
		// コメントを送信して、state(comments)に格納する
		builder.addCase(fetchAsyncPostComment.fulfilled, (state, action) => {
			return {
				...state,
				comments: [...state.comments, action.payload],
			};
		});
		// いいねの状態を更新する
		builder.addCase(fetchAsyncPatchLiked.fulfilled, (state, action) => {
			return {
				...state,
				posts: state.posts.map((post) => // mapメソッドでpostsの中身を一つずつ取り出す
					post.id === action.payload.id ? action.payload : post // action.payloadには更新したいデータが入っている
				),
			};
		});
		// コメントを削除して、state(comment)から削除する
		builder.addCase(fetchAsyncDeleteComment.fulfilled, (state, action) => {
			return {
				...state,
				comments: state.comments.filter((comment) => comment.id !== action.payload), // filterメソッドで削除したいデータを取り除く
			};
		});
	},
});

/**
 * reducerのexport
 */
export const {
	fetchPostStart,
	fetchPostEnd,
	setOpenNewPost,
	resetOpenNewPost,
} = postSlice.actions;

/**
 * Sliceで定義したinitialStateをexportする部分
 */

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
// RootStateは Sliceで定義したinitialStateの要素を全て持っている

export const selectIsLoadingPost = (state: RootState) =>
	state.post.isLoadingPost; // 投稿のローディング状態を管理する
export const selectOpenNewPost = (state: RootState) => state.post.openNewPost; // 新規投稿モーダルの表示制御
export const selectPosts = (state: RootState) => state.post.posts; // 投稿内容を格納する
export const selectComments = (state: RootState) => state.post.comments; // コメントを格納する


export default postSlice.reducer;
