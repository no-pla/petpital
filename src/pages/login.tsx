import { FcGoogle } from "react-icons/fc";
import { GrFacebook } from "react-icons/gr";
import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useState } from "react";
import styled from "styled-components";
import { authService } from "../firebase/firebase";
import { emailRegex } from "../share/utils";
import CustomButton from "../components/custom/CustomButton";
import AuthModal, { AuthTitle } from "../components/custom/AuthModal";
import Join from "./signup";
import Link from "next/link";
import { useRouter } from "next/router";
import { currentUserUid, hospitalData } from "../share/atom";
import { useSetRecoilState } from "recoil";
import Image from "next/image";
import loginLogo from "../../public/loginLogo.jpg";
import { BiArrowBack } from "react-icons/bi";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notMember, setNotMember] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const router = useRouter();
  const matchCheckEmail = email.match(emailRegex);

  const setUidState = useSetRecoilState(currentUserUid);
  const setHospitalState = useSetRecoilState(hospitalData);

  const onSubmit = async (e: any) => {
    e.preventDefault();

    await signInWithEmailAndPassword(authService, email, password)
      .then(() => {
        setEmail("");
        setPassword("");
        // -- useruid 전역상태관리 --
        setUidState(authService.currentUser?.uid);

        router.push("/");
      })
      .catch((err) => {
        if (err.message.includes("user-not-found")) {
          setNotMember(!notMember);
        }
        if (err.message.includes("wrong-password")) {
          setWrongPassword(!wrongPassword);
        }
      });
  };

  const onFacebookSignIn = async () => {
    let provider = new FacebookAuthProvider();
    await signInWithPopup(authService, provider);
    setUidState(authService.currentUser?.uid);
    router.push("/");
  };
  const onGoogleSignIn = async () => {
    let provider = new GoogleAuthProvider();
    await signInWithPopup(authService, provider);
    setUidState(authService.currentUser?.uid);
    router.push("/");
  };

  // 로그아웃할때 setUidState(null); 와 setHospitalState(null) 추가해야됨

  return (
    <ModalBackground>
      <ModalWrap>
        <BiArrowBack
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            cursor: "pointer",
          }}
          size="30"
          color="#15b5bf"
          onClick={() => {
            router.push("/");
          }}
        />
        <Image
          src={loginLogo}
          alt="loginLogo"
          width={170}
          height={40}
          style={{ marginBottom: 40 }}
        />
        <FormWrap onSubmit={onSubmit}>
          <Input
            type="text"
            name={email}
            placeholder="이메일을 입력해 주세요."
            // required
            value={email}
            onChange={(e) => {
              const value = e.target.value;
              setEmail(value);
            }}
            onKeyPress={(e) => {
              e.key === "Enter" && e.preventDefault();
            }}
          />

          {!matchCheckEmail ? (
            email ? (
              <ErrorMessage>올바른 이메일 형식이 아닙니다.</ErrorMessage>
            ) : null
          ) : (
            <OkMessage>올바른 이메일 형식입니다.</OkMessage>
          )}

          <Input
            name={password}
            type="password"
            placeholder="비밀번호를 입력해 주세요."
            // required
            value={password}
            onChange={(e) => {
              const value = e.target.value;
              setPassword(value);
            }}
          />

          <ButtonWrap>
            <LoginButton type="submit">로그인</LoginButton>
          </ButtonWrap>
        </FormWrap>
        <span style={{ color: "#aaa", padding: "40px" }}>
          ---------------------또는----------------------
        </span>
        <ButtonWrap>
          <span onClick={onGoogleSignIn}>
            <FcGoogle size={40} />
          </span>
          <span onClick={onFacebookSignIn}>
            <GrFacebook size={35} />
          </span>
        </ButtonWrap>
        {/* 회원가입 */}
        <Singup
          onClick={() => {
            router.push("signup");
          }}
        >
          회원가입
        </Singup>
        {signUp && <Join />}
      </ModalWrap>

      {/* 회원이 아닌경우 */}
      {notMember && (
        <AuthModal>
          <AuthTitle>회원이 아닙니다.</AuthTitle>
          <p>회원가입을 해주세요</p>
          <CustomButton
            bgColor="#444444"
            height={8}
            width={16}
            onClick={() => setNotMember(!notMember)}
          >
            되돌아가기
          </CustomButton>
        </AuthModal>
      )}
      {/* 비밀번호가 틀린경우 */}
      {wrongPassword && (
        <AuthModal>
          <AuthTitle>비밀번호가 틀렸습니다.</AuthTitle>
          <p>다시 확인 해주세요.</p>
          <CustomButton
            bgColor="#444444"
            height={8}
            width={16}
            onClick={() => setWrongPassword(!wrongPassword)}
          >
            되돌아가기
          </CustomButton>
        </AuthModal>
      )}
    </ModalBackground>
  );
};

export default Login;

export const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.5);
`;

export const ModalWrap = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 40px 20px 30px 20px;
  background-color: #fff;
  border-radius: 16px;
  color: #000;
`;

export const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
`;

export const FormWrap = styled.form`
  display: flex;
  flex-direction: column;
  width: 320px;
  margin: 1em 0;
`;

export const LoginButton = styled.button`
  flex: 1;
  cursor: pointer;
  background: #15b5bf;
  color: #fff;
  padding: 15px;
  border-style: none;
  border-radius: 5px;
  font-size: 15px;
  font-weight: 600;
  margin-top: 20px;
`;

const Singup = styled.span`
  padding-top: 20px;
  color: #15b5bf;
  font-weight: 600;
  margin-top: 16px;
  cursor: pointer;
`;

export const ButtonWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 4px 0;
  width: 100%;

  > span {
    cursor: pointer;
  }
`;

export const Input = styled.input`
  border-bottom: 1px solid #ddd;
  background-color: #eee;
  padding: 8px;
  margin: 4px 4px 8px 4px;
  font-size: 16px;
  border: 1px;
`;

export const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  padding: 0 8px;
`;
export const OkMessage = styled.p`
  color: #33a264;
  font-size: 12px;
  padding: 0 8px;
`;
