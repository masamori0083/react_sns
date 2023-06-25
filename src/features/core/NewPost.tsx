import { Button, IconButton, TextField } from '@mui/material';
import React, { useState } from 'react';
import { MdAddAPhoto } from 'react-icons/md';
import Modal from "react-modal";
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import {
	fetchAsyncNewPost,
	fetchPostEnd,
	fetchPostStart,
	resetOpenNewPost,
	selectOpenNewPost
} from '../post/postSlice';
import styles from "./Core.module.css";


const customStyles = {
  content: {
    top: "55%",
    left: "50%",

    width: 280,
    height: 220,
    padding: "50px",

    transform: "translate(-50%, -50%)",
  },
};


const NewPost: React.FC = () => {
	const dispatch: AppDispatch = useDispatch();
	const openNewPost = useSelector(selectOpenNewPost);

	const [image, setImage] = useState<File | null>(null); // 画像を格納するためのstate
	const [title, setTitle] = useState(""); // タイトルを格納するためのstate

	const handlerEditPicture = () => {
		// iconを押すことでファイルを選べるようにする
		const fileInput = document.getElementById('imageInput');
		fileInput?.click();
	};

	const newPost = async (e: React.MouseEvent<HTMLElement>) => {
		// 投稿ボタンを押した時の挙動
		e.preventDefault(); // ページのリロードを防ぐ
		const packet = { // 投稿の情報を格納
			title: title,
			img: image,
		};
		await dispatch(fetchPostStart()); // 投稿してサーバーとの通信の開始のフラグ
		await dispatch(fetchAsyncNewPost(packet)); // 投稿をサーバーに送る
		await dispatch(fetchPostEnd()); // 投稿してサーバーとの通信の終了のフラグ
		setTitle(""); // タイトルを空にする
		setImage(null); // 画像を空にする
		dispatch(resetOpenNewPost()); // 投稿画面(モーダル)を閉じる
	};

	return (
		<>
			<Modal
				isOpen={openNewPost}
				onRequestClose={async () => {
					await dispatch(resetOpenNewPost()); // 投稿画面(モーダル)を閉じる
				}}
			style={customStyles}
			>
				<form className={styles.core_signUp}>
					<h1 className={styles.core_title}>My Insta</h1>
					<br />
					<TextField
						placeholder="Please enter caption"
						type="text"
						onChange={(e) => setTitle(e.target.value)} // タイトルをstateに格納
					/>
					<input
						type="file"
						id="imageInput"
						hidden={true}
						onChange={(e) => setImage(e.target.files![0])} // 画像をstateに格納
					/>
					<br />
					<IconButton onClick={handlerEditPicture}>
						<MdAddAPhoto/>
					</IconButton>
					<br />

					<Button
						disabled={!title || !image} // タイトルか画像がない場合は投稿できないようにする
						variant="contained"
						color="primary"
						onClick={newPost}
					>
						New post
					</Button>
				</form>
			</Modal>
		</>
	)
}

export default NewPost
