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
import { useRouter } from "next/router";
import { currentUserUid, hospitalData, modalState } from "../share/atom";
import { useSetRecoilState } from "recoil";
import Image from "next/image";
import loginLogo from "../../public/loginLogo.jpg";
import { LoginBottomImg } from "../components/LoginBottomImg";
import {
  BottomButtonContainer,
  MainBanner,
  MainCustomButton,
  PetpitalSubTitle,
  PetpitalTitle,
} from "./pwFind";
import Head from "next/head";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [notMember, setNotMember] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const router = useRouter();
  const matchCheckEmail = email.match(emailRegex);

  const setUidState = useSetRecoilState(currentUserUid);
  const setHospitalState = useSetRecoilState(hospitalData);
  const setIsOpenModal = useSetRecoilState(modalState);

  const onSubmit = async (e: any) => {
    e.preventDefault();

    await signInWithEmailAndPassword(authService, email, password)
      .then(() => {
        setEmail("");
        setPassword("");
        // -- useruid 전역상태관리 --
        setUidState(authService.currentUser?.uid);

        router.push("/", undefined, { shallow: true });
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
    router.push("/", undefined, { shallow: true });
  };
  const onGoogleSignIn = async () => {
    let provider = new GoogleAuthProvider();
    await signInWithPopup(authService, provider);
    setUidState(authService.currentUser?.uid);
    router.push("/", undefined, { shallow: true });
  };

  // 로그아웃할때 setUidState(null); 와 setHospitalState(null) 추가해야됨

  const PasswordResetModal = () => {
    setOpenModal(true);
  };

  const handleClosePsModal = () => {
    setOpenModal(false);
  };
  return (
    <>
      <Head>
        <title>펫피탈 | 로그인</title>
      </Head>
      <ModalBackground>
        {/* {openModal && (
          <PasswordFindModal>
            <AiOutlineCloseCircle
              onClick={handleClosePsModal}
              size="20"
              color="#15b5bf"
              style={{
                cursor: "pointer",
                position: "fixed",
                right: "215",
                top: "200",
              }}
            />
          </PasswordFindModal>
        )} */}
        <Container>
          <ModalWrap>
            {/* <BiArrowBack
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
        /> */}
            <Image
              src={loginLogo}
              alt="loginLogo"
              width={170}
              height={40}
              style={{ marginBottom: 40 }}
            />
            <FormWrap onSubmit={onSubmit}>
              <InputEmail
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

              <InputPassward
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
            <div style={{ color: "#aaa", padding: "40px", marginTop: "50px" }}>
              ---------------------또는----------------------
            </div>
            <ButtonWrap>
              <span onClick={onGoogleSignIn}>
                <FcGoogle size={40} />
              </span>
              <span onClick={onFacebookSignIn}>
                <GrFacebook size={35} />
              </span>
            </ButtonWrap>
          </ModalWrap>
          {/* 회원가입 */}
          <BottomButtonWrap>
            <Singup
              onClick={() => {
                router.push("signup", undefined, { shallow: true });
              }}
            >
              회원가입
            </Singup>
            <Singup
              onClick={() => {
                router.push("pwFind", undefined, { shallow: true });
              }}
            >
              비밀번호 찾기
            </Singup>
            {/* {signUp && <Join />} */}
          </BottomButtonWrap>
          {/* <Image
            src={loginBottomImg}
            alt="loginLogo"
            width={450}
            height={200}
            style={{ marginTop: 40, marginBottom: 40 }}
          /> */}
          <LoginBottomImg
            backgroundImg={
              "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/header.png?alt=media&token=6ce12df3-2b78-408e-a313-37c6dce7faab"
            }
          >
            <MainBanner>
              <PetpitalTitle>동물병원 찐 리뷰는</PetpitalTitle>
              <PetpitalSubTitle>펫피털에서!</PetpitalSubTitle>
              <BottomButtonContainer>
                <MainCustomButton
                  onClick={() => router.push("/", undefined, { shallow: true })}
                >
                  펫피털 구경해보기
                </MainCustomButton>
              </BottomButtonContainer>
            </MainBanner>
          </LoginBottomImg>
        </Container>

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
    </>
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
  background: #f5f5f5;
  overflow-y: scroll;
`;

export const Container = styled.div`
  margin-top: 200px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  /* background-color: red; */
  align-items: center;
  /* min-height: 1100px; */
`;

export const ModalWrap = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 40px 20px 30px 20px;
  background-color: #fff;
  /* border-radius: 16px; */
  color: #000;
  border: 1px solid #15b5bf;
  width: 564px;
  height: 512px;
`;

export const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
`;

export const FormWrap = styled.form`
  display: flex;
  flex-direction: column;
  width: 368px;
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
  margin-top: 60px;
`;

export const BottomButtonWrap = styled.div`
  justify-content: center;
  display: flex;
`;

export const Singup = styled.button`
  color: #15b5bf;
  font-weight: 600;
  margin-top: 16px;
  cursor: pointer;
  background-color: #f5f5f5;
  border: none;
  width: 70px;
`;

export const ButtonWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 4px 0;
  width: 100%;
  height: 10px;

  > span {
    cursor: pointer;
  }
`;

export const InputEmail = styled.input`
  border: 1px solid lightgray;
  background-color: #fafafa;
  padding: 8px;
  /* margin: 4px 4px 8px 4px; */
  font-size: 16px;
  height: 45px;
  :focus {
    outline: 1px solid #15b5bf;
  }
`;

export const InputPassward = styled.input`
  border: 1px solid lightgray;
  background-color: #fafafa;
  padding: 8px;
  /* margin: 4px 4px 8px 4px; */
  font-size: 16px;
  /* border-top: none; */
  height: 45px;
  margin-top: 5px;
  :focus {
    outline: 1px solid #15b5bf;
  }
`;

export const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  padding: 0 8px;
  /* background-color: blue; */
  height: 1px;
  margin-top: 1px;
`;
export const OkMessage = styled.p`
  color: #33a264;
  font-size: 12px;
  padding: 0 8px;
  height: 1px;
  margin-top: 1px;
`;
