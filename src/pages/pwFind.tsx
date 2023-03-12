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
import Logo2 from "../../public/Logo2.png";
import app_logo from "../../public/app_logo.png";
import loginBottomImg from "../../public/loginBottomImg.png";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { LoginBottomImg } from "../components/LoginBottomImg";
import Head from "next/head";

const Login = () => {
  const [email, setEmail] = useState("");

  const router = useRouter();
  const matchCheckEmail = email.match(emailRegex);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      console.log("비밀번호 재설정 이메일을 보냈습니다");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>펫피탈 | 비밀번호 찾기</title>
      </Head>
      <ModalBackground>
        <Container>
          <Image
            src={app_logo}
            alt="loginLogo"
            width={50}
            height={40}
            style={{ marginBottom: 20 }}
          />
          <Image
            src={Logo2}
            alt="loginLogo"
            width={170}
            height={40}
            style={{ marginBottom: 60 }}
          />
          <ModalWrap>
            <div style={{ backgroundColor: "white", marginBottom: "100px" }}>
              <h3>비밀번호 찾기</h3>
            </div>
            <FormWrap onSubmit={handleSubmit}>
              <label
                style={{
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginBottom: "15px",
                }}
              >
                등록된 이메일을 입력해 주세요.
              </label>
              <InputEmail
                type="text"
                name={email}
                placeholder="등록된 이메일을 입력해 주세요."
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

              <ButtonWrap>
                <LoginButton
                  type="submit"
                  onClick={() => {
                    alert(
                      "이메일을 확인하여 비밀번호를 재설정해주시기 바랍니다.",
                    );
                    router.push("login", undefined, { shallow: true });
                  }}
                >
                  전송
                </LoginButton>
              </ButtonWrap>
            </FormWrap>
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
              style={{ cursor: "default", textDecoration: "underline" }}
              // onClick={() => {
              //   router.push("passwordFind");
              // }}
            >
              비밀번호 찾기
            </Singup>
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
      </ModalBackground>
    </>
  );
};

export default Login;
const ModalBackground = styled.div`
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
  overflow-y: auto;
`;

const Container = styled.div`
  margin-top: 100px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  /* background-color: red; */
  align-items: center;
  overflow-y: auto;
  /* min-height: 1100px; */
`;

const ModalWrap = styled.div`
  position: relative;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  flex-direction: column;
  padding: 10px 20px 30px 20px;
  background-color: #fff;
  /* border-radius: 16px; */
  color: #000;
  border: 1px solid #15b5bf;
  width: 564px;
  height: 512px;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
`;

const FormWrap = styled.form`
  display: flex;
  flex-direction: column;
  width: 368px;
  margin: 1em 0;
`;

const LoginButton = styled.button`
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

const BottomButtonWrap = styled.div`
  justify-content: center;
  display: flex;
`;

const Singup = styled.button`
  color: #15b5bf;
  font-weight: 600;
  margin-top: 16px;
  cursor: pointer;
  background-color: #f5f5f5;
  border: none;
  width: 70px;
`;

const ButtonWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 4px 0;
  width: 100%;
  height: 10px > span {
    cursor: pointer;
  }
`;

const InputEmail = styled.input`
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

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  padding: 0 8px;
  /* background-color: blue; */
  height: 1px;
  margin-top: 1px;
`;
const OkMessage = styled.p`
  color: #33a264;
  font-size: 12px;
  padding: 0 8px;
  height: 1px;
  margin-top: 1px;
`;

export const MainBanner = styled.div`
  padding-top: 10px;
  padding-left: 30px;
`;

export const PetpitalTitle = styled.h2`
  color: #ffffff;
  font-weight: 400;
  font-size: 1rem;
  line-height: 34px;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

export const PetpitalSubTitle = styled.h1`
  font-weight: 700;
  font-size: 1.5rem;
  line-height: 24px;
  color: #ffffff;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

export const BottomButtonContainer = styled.div`
  display: flex;
  margin-top: 50px;
  margin-right: 20px;
  /* background-color: red; */
  justify-content: flex-end;
`;

export const MainCustomButton = styled.button`
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid #ffffff;
  backdrop-filter: blur(20px);
  border-radius: 999px;
  height: 32px;
  color: white;
  cursor: pointer;
`;
