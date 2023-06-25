import { Avatar, Badge, Button, CircularProgress, Grid } from "@mui/material";
import { styled } from '@mui/material/styles';
import * as React from 'react';
import { MdAddAPhoto } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../app/store";
import Auth from "../auth/Auth";
import { editNickname, fetchAsyncGetMyProf, fetchAsyncGetProfs, resetOpenProfile, resetOpenSignIn, resetOpenSignUp, selectIsLoadingAuth, selectProfile, setOpenProfile, setOpenSignIn, setOpenSignUp } from "../auth/authSlice";
import Post from "../post/Post";
import {
	fetchAsyncGetComments,
	fetchAsyncGetPosts,
	resetOpenNewPost,
	selectIsLoadingPost,
	selectPosts,
	setOpenNewPost
} from "../post/postSlice";
import styles from "./Core.module.css";
import EditProfile from "./EditProfile";
import NewPost from "./NewPost";

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));



const Core: React.FC = () => {
	const dispatch: AppDispatch = useDispatch();
	const profile = useSelector(selectProfile);
	const posts = useSelector(selectPosts);
	const isLoadingPost = useSelector(selectIsLoadingPost);
	const isLoadingAuth = useSelector(selectIsLoadingAuth);

	React.useEffect(() => {
		const fetchBootLoader = async () => {
			if (localStorage.localJWT) { // ローカルストレージにJWTが存在するか確認
				dispatch(resetOpenSignIn()); // ログイン画面を非表示にする
				const result = await dispatch(fetchAsyncGetMyProf()); // ログインしているユーザーの情報を取得
				if (fetchAsyncGetMyProf.rejected.match(result)) { // ログインしているユーザーの情報が取得できなかった場合
					await dispatch(setOpenSignIn()); // ログイン画面を表示する
					return null; // 何もしない
				}
				await dispatch(fetchAsyncGetPosts()); // ログインしているユーザーの投稿を取得
				await dispatch(fetchAsyncGetProfs()); // ログインしているユーザーのプロフィールを取得
				await dispatch(fetchAsyncGetComments()); // ログインしているユーザーのコメントを取得
			}
		};
		fetchBootLoader();
	}, [dispatch]);
	

	return (
		<div>
			<Auth />
			<EditProfile />
			<NewPost/>
			<div className={styles.core_header}>
				<h1 className={styles.core_title}>My Insta</h1>
				{/* ログインしている場合は、<></>を表示。ログインしていない場合は、<div></div>を表示 */}
				{profile?.nickName ? (
					<>
						<button
							className={styles.core_btnModal}
							onClick={() => {
								dispatch(setOpenNewPost());
								dispatch(resetOpenProfile());
							}}
						>
							{/* カメラのアイコン */}
							<MdAddAPhoto /> 
							
						</button>
						<div className={styles.core_logout}>

							{/* ローディング中は、<CircularProgress />を表示 */}
							{(isLoadingPost || isLoadingAuth) && <CircularProgress />} 
							<Button // ログアウトボタン
								onClick={() => {
									localStorage.removeItem("localJWT");
									dispatch(editNickname("")); // ニックネームを空にする
									dispatch(resetOpenProfile()); // プロフィール画面を非表示にする
									dispatch(resetOpenNewPost()); // 投稿画面を非表示にする
									dispatch(setOpenSignIn()); // ログイン画面を表示する
								}}
							>
								Logout
							</Button>

							{/* // プロフィール画面を表示するボタン */}
							<button
								className={styles.core_btnModal}
								onClick={() => {
									dispatch(setOpenProfile()); // プロフィール変更用のモーダル表示する
									dispatch(resetOpenNewPost()); // 投稿画面を非表示にする
								}}
							>
								{/* // バッジ（ログイン状態を表す）を付与 */}
								<StyledBadge
									overlap="circular"
									anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
									variant="dot"
								>
									<Avatar alt="who?" src={profile.img} />{" "}
								</StyledBadge>
							</button>
						</div>
					</>
				) : ( // ログインしていない場合
						<div>
							<Button
								onClick={() => {
									dispatch(setOpenSignIn()); // ログイン画面を表示する
									dispatch(resetOpenSignUp()); // 新規登録画面を非表示にする 
								}}
							>
								Login
							</Button>
							<Button
								onClick={() => {
									dispatch(setOpenSignUp()); // 新規登録画面を表示する
									dispatch(resetOpenSignIn()); // ログイン画面を非表示にする
								}}
							>
								Signup
							</Button>
					</div>
				)} 
			</div>

			{/* ログインしている場合は、<></>を表示。ログインしていない場合は、<div></div>を表示 */}
			{profile?.nickName &&(
				<>
				<div className={styles.core_posts}>
					<Grid container spacing={4}>
						{posts // 投稿の配列
							.slice(0) // 配列のコピー
							.reverse() // 配列を逆順にする
								.map((post) => (
								
									// デザイン
								<Grid key={post.id} item xs={12} md={4}> 
									<Post
										postId={post.id}
										title={post.title}
										loginId={profile.userProfile}
										userPost={post.userPost}
										imageUrl={post.img}
										liked={post.liked}
									/>
								</Grid>
							))}
					</Grid>
				</div>
				</>
			)}
		</div>
	)
}

export default Core
