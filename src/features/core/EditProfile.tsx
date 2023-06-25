import { Button, IconButton, TextField } from '@mui/material';
import React, { useState } from 'react';
import { MdAddAPhoto } from 'react-icons/md';
import Modal from 'react-modal';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../app/store';
import {
	editNickname,
	fetchAsyncUpdateProf,
	fetchCredEnd,
	fetchCredStart,
	resetOpenProfile,
	selectOpenProfile,
	selectProfile
} from '../auth/authSlice';
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

const EditProfile: React.FC = () => {
	const dispatch: AppDispatch = useDispatch();
	const openProfile = useSelector(selectOpenProfile);
	const profile = useSelector(selectProfile);
	const [image, setImage] = useState<File | null>(null); // 画像を格納するためのstate

	const updateProfile = async (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault(); // ページのリロードを防ぐ
		
		try {

		const packet = { // プロフィールの情報を格納
			id: profile.id,
			nickName: profile.nickName,
			img: image,
		};

		await dispatch(fetchCredStart()); // サーバーとの通信の開始のフラグ
		await dispatch(fetchAsyncUpdateProf(packet)); 
			
			await dispatch(resetOpenProfile()); // プロフィール画面を非表示にする
		} catch (error) {
			console.log("An error ocurred", error);
		} finally {
			await dispatch(fetchCredEnd()); // サーバーとの通信の終了のフラグ
		}
	};

	const handlerEditPicture = () => {
		const fileInput = document.getElementById('imageInput');
		fileInput?.click();
	};
	

	return (
		<>
			<Modal
				isOpen={openProfile}
				onRequestClose={async () => {
					await dispatch(resetOpenProfile());
				}}
				style={customStyles}
			>
				<form className={styles.core_signUp}>
					<h1 className={styles.core_title}>My Insta</h1>

					<br />
					<TextField
						placeholder="nickname"
						type="text"
						value={profile?.nickName}
					onChange={(e) => dispatch(editNickname(e.target.value))}
					/>

					<input type="file"
						id='imageInput'
						hidden={true}
						onChange={(e) => setImage(e.target.files![0])}
					/>
					<br />
					<IconButton onClick={handlerEditPicture}>
						<MdAddAPhoto />
					</IconButton>
					<br />
					<Button
						disabled={!profile?.nickName} // プロフィールのニックネームが空の場合はボタンを押せない
						variant="contained"
						color="primary"
						type="submit"
						onClick={updateProfile}
					>
						Update
					</Button>
        </form>
			</Modal>
		</>
	)
}

export default EditProfile
