import { Favorite, FavoriteBorder } from '@mui/icons-material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AvatarGroup, Checkbox, Divider, IconButton, styled } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import { selectProfiles } from '../auth/authSlice';
import { PROPS_POST } from '../types';
import styles from "./Post.module.css";
import {
	fetchAsyncDeleteComment,
	fetchAsyncPatchLiked,
	fetchAsyncPostComment,
	fetchPostEnd,
	fetchPostStart,
	selectComments
} from './postSlice';

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: theme.spacing(3),
  height: theme.spacing(3),
  marginRight: theme.spacing(1),
}));


const Post: React.FC<PROPS_POST> = ({
	postId,
	loginId,
	userPost,
	title,
	imageUrl,
	liked
}) => {
	
	const dispatch: AppDispatch = useDispatch();
	const profiles = useSelector(selectProfiles);
	const comment = useSelector(selectComments);
	const [text, setText] = useState("");

	const commnetsOnPost = comment.filter((com) => { // commentの中から、postIdと一致するものを抽出
		return com.post === postId;
	});

	const prof = profiles.filter((prof) => { // profilesの中から、userPostと一致するものを抽出
		return prof.userProfile === userPost;
	});

	// コメント削除の制御
	const handleDeleteClick = async (commentId:number) => {
		try {
			await dispatch(fetchAsyncDeleteComment(commentId)); // コメントを削除する
		} catch (error) {
			console.log("An error ocurred", error);
		}
	};

	const postComment = async (e: React.MouseEvent<HTMLElement>) => { 
		e.preventDefault(); // ページのリロードを防ぐ
		const packet = { // コメントの情報を格納
			text: text,
			post: postId,
		};
		await dispatch(fetchPostStart()); // 投稿してサーバーとの通信の開始のフラグ
		await dispatch(fetchAsyncPostComment(packet)); // コメントをサーバーに送る
		await dispatch(fetchPostEnd()); // サーバーとの通信の終了のフラグ
		setText(""); // コメントを空にする
	};

	const handlarLiked = async () => {
		const packet = { // いいねの情報を格納
			id: postId,
			title: title,
			current: liked,
			new: loginId,
		};
		await dispatch(fetchPostStart()); // 投稿してサーバーとの通信の開始のフラグ
		await dispatch(fetchAsyncPatchLiked(packet)); // いいねをサーバーに送る
		await dispatch(fetchPostEnd()); // サーバーとの通信の終了のフラグ
	};
	
	if (title) {

		return (
			<div className={styles.post}>
				<div className={styles.post_header}>

					{/* profから画像とニックネームを取得。”?”は、nullの場合の処理。undefinedが返るのを防ぐ */}
					<Avatar className={styles.post_avatar} src={prof[0]?.img} />
					<h3>{prof[0]?.nickName}</h3>

				</div>
				<img className={styles.post_image} src={imageUrl} alt="" />

				<h4 className={styles.post_text}>
					{/* いいねのチェックボックス */}
					<Checkbox
						className={styles.post_checkBox}
						icon={<FavoriteBorder />}
						checkedIcon={<Favorite/>}
						// someは、配列の中に条件に一致するものがあるかどうかを判定するメソッド
						checked={liked.some((like) => like === loginId)} // いいねを押したユーザーのidとログインしているユーザーのidが一致するかどうか
						onClick={handlarLiked}
					/>
					<strong> {prof[0]?.nickName}</strong> {title}
					<AvatarGroup max={7}>
						{liked.map((like) => (
							<Avatar
								key={like}
								className={styles.post_avatarGroup}
								// profilesの中から、userProfileと一致するユーザーの画像を抽出
								src={profiles.find((prof) => prof.userProfile === like)?.img}
							/>
						))}
					</AvatarGroup>
				</h4>
				<Divider />
				<div className={styles.post_comments}>
					{commnetsOnPost.map((comment) => ( // 投稿に対するコメントを取り出す
						<div key={comment.id} className={styles.post_comment}>
							<SmallAvatar
								src={
									profiles.find( // profilesの中から、userProfileと一致するユーザーの画像を抽出
										(prof) => prof.userProfile === comment.userComment)
										?.img
								}
								sx={{ width: 24, height: 24 }}
							/>
							<p>
								<strong className={styles.post_strong}>
									{ // profilesの中から、userProfileと一致するユーザーのニックネームを抽出(コメント用)
										profiles.find((prof) => prof.userProfile === comment.userComment
										)?.nickName
									}
								</strong>
								{comment.text}
							</p>
							{comment.userComment === loginId && ( // コメントを投稿したユーザーとログインしているユーザーが一致する場合} 
								<IconButton aria-label="delete" onClick={() => handleDeleteClick(comment.id)}>
									<DeleteIcon fontSize="inherit"/>
								</IconButton>
							)}
						</div>
					))}
				</div>

				{/* コメントを投稿するフォーム */}
				<form className={styles.post_commentBox}>
					<input
						className={styles.post_input}
						type="text"
						placeholder="add a comment.."
						value={text}
						onChange={(e) => setText(e.target.value)} // useStateのtextに入力された値を格納
					/>
					
					<button
						disabled={!text.length} // textの長さが0の場合は、ボタンを押せない
						className={styles.post_button}
						type="submit"
						onClick={postComment}
					>
						Post
					</button>
				</form>

			</div>
		);
	}
	return null
}

export default Post
