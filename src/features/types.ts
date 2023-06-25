/**
 * データ型を定義するファイル
 * 
 */

// ファイル情報を表すオブジェクトを型付けするために使用される
export interface File extends Blob {
	readonly lastModified: number;
	readonly name: string;
}


/*authSlice.tsで以下の3つのデータタイプを使用する*/

// 認証に使うデータタイプ
export interface PROPS_AUTHEN {
	email: string;
	password: string;
}

// プロフィールに使うデータタイプ
export interface PROPS_PROFILE {
	id: number;
	nickName: string;
	img: File | null;
}

// ニックネームに使うデータタイプ
export interface PROPS_NICKNAME {
	nickName:string;
}

/* postSlice.tsで使用する*/
// 新規投稿に使うデータタイプ
export interface PROPS_NEWPOST {
	title: string;
	img: File | null;
}

// いいねが使用された時に更新するデータタイプ
export interface PROPS_LIKED {
	id: number;
	title: string;
	current: number[]; // いいねをしてくれたユーザーのidを格納する配列
	new: number; // 新たにいいねをしてくれたユーザーのid
}

// コメントに使うデータタイプ
export interface PROPS_COMMENT {
	text: string;
	post: number; // どの投稿に対するコメントかを識別するためのid
}

/* Post.tsxで使用する*/
export interface PROPS_POST {
	postId: number;
	loginId: number;
	userPost: number; // 投稿したユーザーのid
	title: string;
	imageUrl: string;
	liked: number[]; // いいねをしてくれたユーザーのidを格納する配列
}

