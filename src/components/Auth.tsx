import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../features/userSlice";
import styles from "./Auth.module.css";
import { auth, provider, storage } from "../firebase";

import {
    Avatar,
    Button,
    CssBaseline,
    TextField,
    Paper,
    Grid,
    Typography,
    makeStyles,
    Modal,
    IconButton,
    Box,
} from "@material-ui/core";

import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

const getModalStyle=()=> {
    const top = 50;
    const left = 50;

    return {
        top: `${top}%`,
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
    };
}
const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    modal: {
        outline: "none",
        position: "absolute",
        width: 400,
        borderRadius: 10,
        backgroundColor: "white",
        boxShadow: theme.shadows[5],
        padding: theme.spacing(10),
    },
    image: {
        backgroundImage: 'url(https://source.unsplash.com/random)',
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const Auth:React.FC = ()=> {
    const classes = useStyles();
    const dispatch = useDispatch()
    const [email, setEmail] = useState("test@sample.com");
    const [password, setPassword] = useState("123456");
    const [username, setUsername] = useState("");
    const [avatarImage, setAvatarImage] = useState<File | null>(null)
    const [isLogin, setIsLogin] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [resetEmail, setResetEmail] = useState("");
    const onChangeImageHandler = (event: React.ChangeEvent<HTMLInputElement>) =>{
        if(event.target.files![0]){
            setAvatarImage(event.target.files![0]);
            event.target.value="";
        }
    }
    const sendResetEmail = async (event: React.MouseEvent<HTMLElement>) => {
        await auth
            .sendPasswordResetEmail(resetEmail)
            .then(() => {
                setOpenModal(false);
                setResetEmail("");
            })
            .catch((err) => {
                alert(err.message);
                setResetEmail("");
            });
    };
    const signInGoogle = async () => {
        await auth.signInWithPopup(provider).catch((err) => alert(err.message));
    };
    const signInEmail = async () => {
        await auth.signInWithEmailAndPassword(email, password);
    };
    const signUpEmail = async () => {
        const authUser = await auth.createUserWithEmailAndPassword(email, password);
        let url = "";
        if(avatarImage) {
            const S =
                "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const N = 16;
            const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
                .map((n) => S[n % S.length])
                .join("");
            const fileName = randomChar + "_" + avatarImage.name;
            // refはフォルダの階層を指定することができる。
            await storage.ref(`avatars/${fileName}`).put(avatarImage);
            // アップしたファイルのURLを取得できる
            url = await storage.ref("avatars").child(fileName).getDownloadURL();
            // データベースの情報をアップデート
            await authUser.user?.updateProfile({
                displayName: username,
                photoURL:url,
            });
            dispatch(updateUserProfile({
                displayName: username,
                photoUrl:url,
            }))
        }
    };

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline />
            <Grid item xs={false} sm={4} md={7} className={classes.image} />
            <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        {isLogin ? 'Login': 'Register'}
                    </Typography>
                    <form className={classes.form} noValidate>

                        {!isLogin && (<>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="username"
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                                value={username}
                                onChange={(event:React.ChangeEvent<HTMLInputElement>)=>{setUsername(event.target.value)}}
                            />
                            <Box textAlign="center">
                                <IconButton>
                                    <label>
                                        <AccountCircleIcon
                                        fontSize="large"
                                        className={
                                            avatarImage ? styles.login_addIconLoaded : styles.login_addIcon
                                        }
                                        />
                                        <input
                                        className={styles.login_hiddenIcon}
                                            type="file"
                                        onChange={onChangeImageHandler}
                                        />
                                    </label>
                                </IconButton>
                            </Box>
                            <Box textAlign="center" className={styles.icon_text}>Set Icon Image</Box>
                        </>)}

                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={email}
                            onChange={(event:React.ChangeEvent<HTMLInputElement>)=>{setEmail(event.target.value)}}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event:React.ChangeEvent<HTMLInputElement>)=>{setPassword(event.target.value)}}
                        />

                        <Button
                            disabled={
                                isLogin
                                ? !email || password.length < 6
                                    : !username || !email || password.length<6 || !avatarImage
                            }
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            startIcon={<EmailIcon />}
                            onClick={
                                isLogin
                                    ? async () => {
                                        try {
                                            await signInEmail();
                                        } catch (err) {
                                            alert(err.message);
                                        }
                                    }
                                    : async () => {
                                        try {
                                            await signUpEmail();
                                        } catch (err) {
                                            alert(err.message);
                                        }
                                    }
                            }
                        >
                            {isLogin ? 'Login': 'Register'}
                        </Button>
                        <Grid container>
                            <Grid item xs><span className={styles.login_reset} onClick={()=>{setOpenModal(true)}}>Forgot password?</span></Grid>
                            <Grid item><span className={styles.login_toggleMode} onClick={()=>{setIsLogin(!isLogin)}}>{isLogin ? "Create new account ?": "Back to Login?"}</span></Grid>
                        </Grid>
                        <Button
                            fullWidth
                            variant="contained"
                            color="default"
                            className={classes.submit}
                            startIcon={<CameraIcon />}
                            onClick={signInGoogle}
                        >
                            SignIn with Google
                        </Button>
                    </form>
                    <Modal open={openModal} onClose={() => setOpenModal(false)}>
                        <div style={getModalStyle()} className={classes.modal}>
                            <div className={styles.login_modal}>
                                <TextField
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                    type="email"
                                    name="email"
                                    label="Reset E-mail"
                                    value={resetEmail}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setResetEmail(e.target.value);
                                    }}
                                />
                                <IconButton onClick={sendResetEmail}>
                                    <SendIcon />
                                </IconButton>
                            </div>
                        </div>
                    </Modal>
                </div>
            </Grid>
        </Grid>
    );
}

export default Auth;