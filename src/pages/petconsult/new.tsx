import { useState } from "react";
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
  content: string;
  nickname: any;
  profileImg: any;
  createdAt: number;
}

const NewPetsult = () => {
  const router = useRouter();
  const [backPage, setBackPage] = useState(false);
  const [emptyComment, setEmptyComment] = useState(false);
  const [newPetsult, setNewPetsult] = useState<INewPetsult>({
    uid: authService.currentUser?.uid,
    id: short.generate(),
    content: "",
    nickname: authService.currentUser?.displayName,
    profileImg: authService.currentUser?.photoURL,
    createdAt: Date.now(),
  });
  const { mutate: addCounsel } = useAddCounsel();

  const addPetsult = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPetsult.content) {
      setEmptyComment((prev) => !prev);
      return;
    } else {
      addCounsel(newPetsult);
      setNewPetsult({
        uid: authService.currentUser?.uid,
        id: short.generate(),
        content: "",
        nickname: authService.currentUser?.displayName,
        profileImg: authService.currentUser?.photoURL,
        createdAt: Date.now(),
      });
      router.push(`/petconsult/${newPetsult.id}`);
    }
  };

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value: content },
    } = event;

    setNewPetsult({
      uid: authService.currentUser?.uid,
      id: short.generate(),
      content,
      nickname: authService.currentUser?.displayName,
      profileImg: authService.currentUser?.photoURL,
      createdAt: Date.now(),
    });
  };

  const backToCounselPage = () => {
    if (newPetsult.content === "") {
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
        <NewCounselInput
          placeholder="궁금한 점을 입력해 주세요…"
          value={newPetsult.content}
          onChange={onChange}
        />
        <NewCounselButton type="submit">질문하기</NewCounselButton>
      </NewCounselForm>
    </>
  );
};

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
