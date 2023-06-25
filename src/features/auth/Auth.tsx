import { Button, CircularProgress, TextField } from "@mui/material";
import { Formik } from "formik";
import Modal from "react-modal";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import { AppDispatch } from "../../app/store";
import styles from "./Auth.module.css";
import {
	fetchAsyncCreateProf,
	fetchAsyncGetMyProf,
	fetchAsyncGetProfs,
	fetchAsyncLogin,
	fetchAsyncRegister,
	fetchCredEnd,
	fetchCredStart,
	resetLoginErrorMessages,
	resetOpenSignIn,
	resetOpenSignUp,
	selectIsLoadingAuth,
	selectLoginErrorMessages,
	selectOpenSignIn,
	selectOpenSignUp,
	setOpenProfile,
	setOpenSignIn,
	setOpenSignUp
} from "./authSlice";

import {
	fetchAsyncGetComments,
	fetchAsyncGetPosts
} from "../post/postSlice";

const customStyles = {
  overlay: {
    backgroundColor: "#777777",
  },
  content: {
    top: "55%",
    left: "50%",

    width: 280,
    height: 350,
    padding: "50px",

    transform: "translate(-50%, -50%)",
  },
};

const Auth: React.FC = () => {
	Modal.setAppElement("#root");
	// storeのOpenSignInを取得することができる。Sliceで定義したstate
	const openSignIn = useSelector(selectOpenSignIn);
	const openSignUp = useSelector(selectOpenSignUp);
	const isLoadingAuth = useSelector(selectIsLoadingAuth);
	const errorMessage = useSelector(selectLoginErrorMessages);

	// dispatchはアクションをReducerに送信して更新するために存在。app/store.tsに存在。
	const dispatch: AppDispatch = useDispatch();
	return (
		<>
			{/* 新規登録用のモーダル */}
			<Modal
				// Modalのパラメータ
				isOpen={openSignUp} 
				// モーダル以外のところをクリックした時の挙動。モーダルは非常になる
				onRequestClose={async () => { 
					await dispatch(resetOpenSignUp()); // resetOpenSignUpはモーダルを非表示にするフラ
				}}
				style={customStyles}
			>
				<Formik
					// Formik: フォームを作成するreactのライブラリ
					/*フォームの初期状態を定義*/
					initialErrors={{ email: "required" }}
					initialValues={{ email: "", password: "" }}

					/* 入力情報をsubmitした時の挙動を定義 */
					onSubmit={async (values) => { // valuesには、ユーザーが入力した情報が格納されている
						try {
							
							
							await dispatch(fetchCredStart()); // apiへのアクセス開始のフラグ
							const resultReg = await dispatch(fetchAsyncRegister(values)); // apiのエンドポイントに入力された情報を送る

							// ユーザー情報が無事にapiに渡された時のみ、次の処理に移行
							// matchメソッドで、resultRegの状態とfetchAsyncRegisterの状態を比較している
							if (fetchAsyncRegister.fulfilled.match(resultReg)) {
								await dispatch(fetchAsyncLogin(values)); // ログインに移行。アクセストークンの取得
								await dispatch(fetchAsyncCreateProf({ nickName: "annonymous" })); // プロフィールの作成

								await dispatch(setOpenProfile()); // プロフィール編集画面を表示

								await dispatch(fetchAsyncGetProfs()); // プロフィールの一覧を取得
								await dispatch(fetchAsyncGetPosts());
								await dispatch(fetchAsyncGetComments());
								await dispatch(fetchAsyncGetMyProf()); // ログインしているユーザーのログイン情報を取得
							}
						} catch (error) {
						console.log(error);
						} finally {
						await dispatch(fetchCredEnd());
						await dispatch(resetOpenSignUp());
					}
					}}
			
					
					/* バリデーション */
					// 以下の関数はほぼテンプレ
					validationSchema={Yup.object().shape({
						email: Yup.string()
							.email("email format is wrong")
							.required("email is must"),
						password:Yup.string().required("password is must").min(4).max(8), // min()は最小の文字数
					})}
				>
					{({
						handleSubmit,
						handleChange,
						handleBlur,
						values,
						errors, // バリデーションで定義したエラーメッセージの取得
						touched, // 入力欄に一度でもフォーカスされた場合にTrueになる
						isValid, // バリデーションの結果、問題がなければTrueを返す
					}) =>(
						<div>
							<form onSubmit={handleSubmit}>
								<div className={styles.auth_signUp}>
									<h1 className={styles.auth_title}>My Insta</h1>
									<br />
									<div className={styles.auth_progress}>
										{/* isLoadingAuthがTrueの場合のみ、CircularProgressが実行される。
									    ローディング画面で、ぐるぐるまわるやつ */}
										{isLoadingAuth && <CircularProgress/>}
									</div>
									<br />

									{/* email入力欄 */}
									<TextField
										placeholder="email"
										type="input"
										name="email"
										onChange={handleChange} // ユーザーが入力した情報をバリデーションに通す挙動
										onBlur={handleBlur} // 入力欄からフォーカスが外れた場合、バリデーションに通す
										value={values.email}
									/>
									<br />
									{/* 入力欄にフォーカスがあたり、かつメールの入力にエラーがあった場合 */}
									{touched.email && errors.email ? (
										<div className={styles.auth_error}>{errors.email}</div>
									) : null}

									{/* password入力欄 */}
									<TextField
										placeholder="password"
										type="password"
										name="password"
										onChange={handleChange} // ユーザーが入力した情報をバリデーションに通す挙動
										onBlur={handleBlur} // 入力欄からフォーカスが外れた場合、バリデーションに通す
										value={values.password}
									/>
									{/* 入力欄にフォーカスがあたり、かつパスワードの入力にエラーがあった場合 */}
									{touched.password && errors.password ? (
										<div className={styles.auth_error}>{errors.password}</div>
									) : null}
									<br />
									<br />

									<Button
										variant="contained"
										color="primary"
										disabled={!isValid} // バリデーションの結果が有効でない場合、ボタンを無効化
										type="submit"
									>
										Register
									</Button>
									<br />
									<br />

									{/* すでにアカウントが存在する場合 */}
									<span
										className={styles.auth_text}
										onClick={async () => {
											await dispatch(setOpenSignIn()); // ログイン用のモーダルを開く
											await dispatch(resetOpenSignUp()); // サインアップ用のモーダル閉じる
										}}
									>
										You already have a account?
									</span>
								</div>
							</form>
						</div>
					)}
				</Formik>
			</Modal>

			{/* ログイン用のモーダル */}
			<Modal
				isOpen={openSignIn}
				onRequestClose={async () => {
				await dispatch(resetOpenSignIn());
				}}
				style={customStyles}
			>
				<Formik
					initialErrors={{ email: "required" }}
					initialValues={{ email: "", password: "" }}
					onSubmit={async (values) => {
						try {await dispatch(fetchCredStart());
							const result = await dispatch(fetchAsyncLogin(values));
						if (fetchAsyncLogin.fulfilled.match(result)) {
								await dispatch(fetchAsyncGetProfs());
								await dispatch(fetchAsyncGetPosts());
								await dispatch(fetchAsyncGetComments());
								await dispatch(fetchAsyncGetMyProf());
							await dispatch(resetOpenSignIn());
							await dispatch(resetLoginErrorMessages()); 
							
							} else {
							const rejectValue = result.payload as { errorMessage: { detail: string }, erroStatus: string };
							console.log(rejectValue.errorMessage.detail);
						}
						}
					catch (error) {
								console.log(error);
							}
				finally {
								await dispatch(fetchCredEnd());
							}
					}
					}
					
					validationSchema={Yup.object().shape({
						email: Yup.string()
							.email("email format is wrong")
							.required("email is must"),
						password: Yup.string().required("password is must").min(4).max(8),
					})}
				>
					{({
						handleSubmit,
						handleChange,
						handleBlur,
						values,
						errors,
						touched,
						isValid,
					}) => (
						<div>
							<form onSubmit={handleSubmit}>
								<div className={styles.auth_signUp}>
									<h1 className={styles.auth_title}>My Insta</h1>
									<br />
									<div className={styles.auth_progress}>
										{isLoadingAuth ? ( // エラーが起こった時の処理。
											<div className={styles.auth_progress}>
												<CircularProgress />
											</div>
										) : (
												errorMessage && <div className="auth_error">{errorMessage}</div>
											)}
									</div>
									<br />

									{/* メールアドレス入力欄 */}
									<TextField
										placeholder="email"
										type="input"
										name="email"
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.email}
									/>
										{touched.email && errors.email ? (
											<div className={styles.auth_error}>{errors.email}</div>
									) : null}
									<br />

									{/* パスワード入力欄 */}
									<TextField
										placeholder="password"
										type="password"
										name="password"
										onChange={handleChange}
										onBlur={handleBlur}
										value={values.password}
									/>
									
										<br />
										<br />
										<Button
											variant="contained"
											color="primary"
											disabled={!isValid}
											type="submit"
										>
											Login
										</Button>
										<br />
										<br />
										<span
											className={styles.auth_text}
											onClick={async () => {
												await dispatch(setOpenSignUp());
												await dispatch(resetOpenSignIn());
											}}
										>
											You don't have a account?
										</span>
								</div>
							</form>
						</div>
					)}
				</Formik>
			</Modal>
		</>
	)
};

export default Auth
