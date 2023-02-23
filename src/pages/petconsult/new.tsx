import { useEffect, useRef, useState } from "react";
import { useAddCounsel } from "@/hooks/usePetsult";
import CustomModal, { ModalButton } from "../../components/custom/CustomModal";
import { useRouter } from "next/router";
import { authService } from "@/firebase/firebase";
import {
  BackButton,
  CustomHeader,
  HeaderButton,
} from "@/components/custom/CustomHeader";
import { CounselHeader, CounselInfo, UserInfo, UserProfileImg } from "./[id]";
import styled from "@emotion/styled";
const short = require("short-uuid");

export interface INewPetsult {
  uid: any;
  id: string;
  content: any;
  nickname: any;
  profileImg: any;
  createdAt: number;
}

const NewPetsult = () => {
  const router = useRouter();
  const [backPage, setBackPage] = useState(false);
  const [emptyComment, setEmptyComment] = useState(false);
  const newCounselRef = useRef<HTMLInputElement>(null);
  const { mutate: addCounsel } = useAddCounsel();

  const addPetsult = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newCounselRef.current?.value !== "") {
      const content = newCounselRef.current?.value;
      const newCounsel = {
        uid: authService.currentUser?.uid,
        id: short.generate(),
        content,
        nickname: authService.currentUser?.displayName,
        profileImg:
          authService.currentUser?.photoURL ||
          "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FComponent%209.png?alt=media&token=ee6ff59f-3c4a-4cea-b5ff-c3f20765a606",
        createdAt: Date.now(),
      };
      addCounsel(newCounsel);

      router.push(`/petconsult/${newCounsel.id}`);
    } else {
      setEmptyComment((prev) => !prev);
      return;
    }
  };

  const RefInput = () => {
    return (
      <NewCounselInput
        placeholder="궁금한 점을 입력해 주세요…"
        ref={newCounselRef}
        disabled={backPage}
        autoFocus
      />
    );
  };

  const backToCounselPage = () => {
    if (newCounselRef.current?.value === "") {
      router.push("/petconsult");
    } else {
      setBackPage((prev) => !prev);
    }
  };

  return (
    <>
      {backPage && (
        <CustomModal
          modalText1={"질문하고 다양한"}
          modalText2={"의견을 받아보세요!"}
        >
          <ModalButton onClick={() => router.push("/petconsult")}>
            해결했어요!
          </ModalButton>
          <ModalButton onClick={() => setBackPage((prev) => !prev)}>
            질문하러가기
          </ModalButton>
        </CustomModal>
      )}
      {emptyComment && (
        <CustomModal
          modalText1={"내용이 비어있습니다."}
          modalText2={"내용은 최소 1글자 이상 채워주세요."}
        >
          <ModalButton onClick={() => setEmptyComment((prev) => !prev)}>
            닫기
          </ModalButton>
        </CustomModal>
      )}
      <CustomHeader>
        <BackButton onClick={() => router.push("/petconsult")}>
          &larr; 이전으로
        </BackButton>
        <HeaderButton onClick={backToCounselPage}>취소하기</HeaderButton>
      </CustomHeader>
      <CounselHeader>
        <CounselInfo>
          <UserProfileImg
            src={
              authService.currentUser?.photoURL ||
              "https://lh3.googleusercontent.com/a/AEdFTp5U2EnK1FMKWmSorIVabTl1FEHY08ZYYrK0cXhI=s96-c"
            }
            alt={
              authService.currentUser?.displayName +
              " 유저의 프로필 사진입니다."
            }
          />
          <UserInfo>
            <div>{authService.currentUser?.displayName}</div>
            <div>{new Date().toLocaleDateString("ko-Kr")}</div>
          </UserInfo>
        </CounselInfo>
      </CounselHeader>
      <NewCounselForm onSubmit={addPetsult}>
        <RefInput />
        <NewCounselButton type="submit">질문하기</NewCounselButton>
      </NewCounselForm>
      <SubBanner backgroundImg="https://coolthemestores.com/wp-content/uploads/2021/07/hamster-wallpaper-background.jpg">
        <SubBannerTitle>
          궁금한 점 없으셨나요?
          <br />
          무엇이든 물어보개~
        </SubBannerTitle>
        <SubBannerLogo>
          <SubBannerLogoImg src="https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2F%E1%84%90%E1%85%A6%E1%86%A8%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3%E1%84%85%E1%85%A9%E1%84%80%E1%85%A9%20(1).png?alt=media&token=9171cde5-4ca1-4bfb-abf4-03cf00508dae" />
          <div>
            <b>팻피털</b>에서!
          </div>
        </SubBannerLogo>
      </SubBanner>
    </>
  );
};

const SubBanner = styled.div<{ backgroundImg: string }>`
  height: 25vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0 24px 24px 24px;
  width: 80%;
  margin: 0 auto;
  justify-content: space-between;
  background-image: url(${(props) => props.backgroundImg});
  background-position: center;
`;

const SubBannerTitle = styled.h3`
  font-weight: normal;
  font-size: 1.6rem;
  color: #ffffff;
`;

const SubBannerLogo = styled.div`
  display: flex;
  object-fit: cover;
  justify-content: space-between;
  & div:nth-of-type(1) {
    color: white;
    font-size: 1.8rem;
  }
`;

const SubBannerLogoImg = styled.img`
  object-fit: scale-down;
`;

const NewCounselForm = styled.form`
  margin: 40px auto 80px auto;
  display: flex;
  flex-direction: column;
  width: 80%;
  align-items: stretch;
`;

const NewCounselInput = styled.input`
  background: #afe5e9;
  border-radius: 4px;
  padding: 50px 0;
  text-align: center;
  border: none;
  margin-bottom: 80px;
  font-size: 28px;
  font-weight: 700;

  &::placeholder {
    color: #ffffff;
  }
`;

const NewCounselButton = styled.button`
  color: white;
  background-color: #24979e;
  font-weight: 700;
  font-size: 20px;
  padding: 20px 0;
  border: none;
  cursor: pointer;
`;
export default NewPetsult;
