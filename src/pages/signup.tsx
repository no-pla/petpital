import { useState } from "react";
import styled from "styled-components";
import { authService } from "../firebase/firebase";
import CustomButton from "../components/custom/CustomButton";
import { emailRegex, pwRegex } from "../share/utils";
import { ModalBackground } from "./login";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import AuthModal, { AuthTitle } from "../components/custom/AuthModal";
import Link from "next/link";
import { Router, useRouter } from "next/router";
import Image from "next/image";
import Logo2 from "../../public/Logo2.png";
import { BiArrowBack } from "react-icons/bi";
import Head from "next/head";

const Join = () => {
  const [email, setEmail] = useState("");
  const [nick, setNick] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setConfirmpassword] = useState("");
  const matchCheckEmail = email.match(emailRegex);
  const matchCheckPassword = password.match(pwRegex);
  const [joinFail, setJoinFail] = useState(false);
  const [joinComplete, setJoinComplete] = useState(false);
  const [joinAready, setJoinAready] = useState(false);

  const router = useRouter();

  const onSubmitJoin = async (event: any) => {
    event.preventDefault();

    await createUserWithEmailAndPassword(authService, email, password)
      .then(({ user }) => {
        setJoinComplete(true);
        updateProfile(user, {
          displayName: nick,
        });
      })
      .catch((error) => {
        const errorMessage = error.message;
        console.log("errorMessage:", errorMessage);
        if (errorMessage.includes("email-already-in-use")) {
          setJoinAready(true);
        }
        if (!email || !password) {
          setJoinFail(true);
        }
        if (password !== confirmpassword) {
          setJoinFail(true);
        }
      });

    setNick("");
    setEmail("");
    setPassword("");
    setConfirmpassword("");
  };

  const completeJoin = () => {
    setJoinComplete(false);
  };

  return (
    <>
      <Head>
        <title>펫피탈 | 회원가입</title>
      </Head>
      <ModalBackground>
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
            src={Logo2}
            alt="loginLogo"
            width={400}
            height={81}
            style={{ marginBottom: 40 }}
          />
          <FormWrap onSubmit={onSubmitJoin}>
            <InputWrap>
              <LabelText>이메일</LabelText>
              <InputPassward
                type="text"
                name={email}
                placeholder="이메일을 입력해 주세요."
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
            </InputWrap>
            <InputWrap>
              <LabelText>닉네임</LabelText>
              <InputEmail
                type="text"
                name={nick}
                placeholder="닉네임을 입력해 주세요."
                value={nick}
                onChange={(e) => {
                  const value = e.target.value;
                  setNick(value);
                }}
                onKeyPress={(e) => {
                  e.key === "Enter" && e.preventDefault();
                }}
              />
            </InputWrap>

            <InputWrap>
              <LabelText>비밀번호</LabelText>
              <InputPassward
                name={password}
                type="password"
                placeholder="비밀번호를 입력해 주세요."
                value={password}
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                }}
              />
              {!matchCheckPassword ? (
                password ? (
                  <ErrorMessage>
                    비밀번호는 8자리 이상 영문자, 숫자, 특수문자 조합이어야
                    합니다.
                  </ErrorMessage>
                ) : null
              ) : (
                <OkMessage>안전한 비밀번호입니다</OkMessage>
              )}
            </InputWrap>

            <InputWrap>
              <LabelText>비밀번호 확인</LabelText>
              <InputPassward
                name={password}
                type="password"
                placeholder="비밀번호를 입력해 주세요."
                value={confirmpassword}
                onChange={(e) => {
                  const value = e.target.value;
                  setConfirmpassword(value);
                }}
              />
              {password !== confirmpassword ? (
                <ErrorMessage>비밀번호가 다릅니다.</ErrorMessage>
              ) : (
                confirmpassword && (
                  <OkMessage>동일한 비밀번호 입니다.</OkMessage>
                )
              )}
            </InputWrap>

            <ButtonWrap>
              <SignupButton type="submit">회원가입</SignupButton>
            </ButtonWrap>
          </FormWrap>
        </ModalWrap>
        {joinAready && (
          <AuthModal>
            <AuthTitle>이미 가입된 이메일입니다.</AuthTitle>
            <p>이미 가입된 이메일입니다. 로그인 해주세요.</p>
            <CustomButton
              bgColor="#444444"
              height={8}
              width={16}
              onClick={() => setJoinAready(false)}
            >
              되돌아가기
            </CustomButton>
          </AuthModal>
        )}
        {joinFail && (
          <AuthModal>
            <AuthTitle>가입할 수 없습니다.</AuthTitle>
            <p>이메일 또는 비밀번호를 확인해 주세요.</p>
            <CustomButton
              bgColor="#444444"
              height={8}
              width={16}
              onClick={() => setJoinFail(false)}
            >
              되돌아가기
            </CustomButton>
          </AuthModal>
        )}
        {joinComplete && (
          <AuthModal>
            <AuthTitle>가입성공</AuthTitle>
            <p>회원가입이 완료되었습니다.</p>
            <CustomButton
              bgColor="#15b5bf"
              height={8}
              width={16}
              onClick={() => {
                router.push("/");
              }}
            >
              확인
            </CustomButton>
          </AuthModal>
        )}
      </ModalBackground>
    </>
  );
};

export default Join;

export const ModalWrap = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding: 40px 20px 30px 20px;
  background-color: #f5f5f5;
  /* border-radius: 16px; */
  color: #000;
  /* border: 1px solid #15b5bf; */
  width: 400px;
  height: 1000px;
  /* margin-top: 20px; */
`;

const InputWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 8px 0;
  padding: 0 20px;
`;

const FormWrap = styled.form`
  display: flex;
  flex-direction: column;
  width: 530px;
  margin: 1em 0;
  /* background-color: red; */
  gap: 30px;
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

const LabelText = styled.label`
  font-size: 14px;
  /* padding: 0 8px; */
  font-weight: 700;
  margin-bottom: 4px;
`;

const SignupButton = styled.button`
  flex: 1;
  cursor: pointer;
  background: #15b5bf;
  color: #fff;
  padding: 15px;
  border-style: none;
  border-radius: 5px;
  font-size: 15px;
  font-weight: 600;
  margin: 20px 20px 0 20px;
`;

const ButtonWrap = styled.div`
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

const InputEmail = styled.input`
  border: 1px solid lightgray;
  background-color: #fafafa;
  padding: 8px;
  /* margin: 4px 4px 8px 4px; */
  font-size: 16px;
  height: 45px;
  margin-top: 5px;
  :focus {
    outline: 1px solid #15b5bf;
  }
`;

const InputPassward = styled.input`
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

const ErrorMessage = styled.p`
  color: red;
  font-size: 12px;
  padding: 0 8px;
  /* background-color: blue; */
  height: 1px;
  margin-top: 5px;
`;
const OkMessage = styled.p`
  color: #33a264;
  font-size: 12px;
  padding: 0 8px;
  height: 0.1px;
`;
