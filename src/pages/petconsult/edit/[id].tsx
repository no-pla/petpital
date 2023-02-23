import axios from "axios";
import { Router, useRouter } from "next/router";
import { useQuery } from "react-query";
import {
  useDeletCounsel,
  useEditCounsel,
  useGetCounselList,
  useGetCounselTarget,
} from "@/hooks/usePetsult";
import { useState } from "react";
import styled from "@emotion/styled";
import { CounselHeader, CounselInfo, UserInfo, UserProfileImg } from "../[id]";
import { authService } from "@/firebase/firebase";
import CustomModal, { ModalButton } from "@/components/custom/CustomModal";
import { HeaderButton } from "@/pages";
import { BackButton, CustomHeader } from "@/components/custom/CustomHeader";

const EditCounsel = () => {
  const router = useRouter();
  const { mutate: editCounsel } = useEditCounsel();
  const [newCounsel, setNewCounsel] = useState("");
  const [emptyComment, setEmptyComment] = useState(false);
  const [backPage, setBackPage] = useState(false);

  const {
    query: { id },
  } = router;

  const { data } = useQuery(
    ["getEditCounsels", id],
    () => {
      return axios.get(`http://localhost:3001/qna/${id}`);
    },
    {
      enabled: !!id,
    },
  );

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newCounsel === "") {
      setEmptyComment((prev) => !prev);
      return;
    } else {
      editCounsel({ ...data?.data, content: newCounsel });
      router.push(`/petconsult/${id}`);
    }
  };

  const backToCounselPage = () => {
    if (newCounsel === "") {
      router.push("/petconsult");
    } else {
      setBackPage((prev) => !prev);
    }
  };

  return (
    <>
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
      {backPage && (
        <CustomModal modalText1={"정말로 수정을"} modalText2={"취소할까요?"}>
          <ModalButton onClick={() => router.push("/petconsult")}>
            취소할게요!
          </ModalButton>
          <ModalButton onClick={() => setBackPage((prev) => !prev)}>
            질문 수정하기
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
            <div>
              {new Date(data?.data.createdAt).toLocaleDateString("ko-Kr")}
            </div>
          </UserInfo>
        </CounselInfo>
      </CounselHeader>
      <NewCounselForm onSubmit={onSubmit}>
        <NewCounselInput
          onChange={(event) => setNewCounsel(event.target.value)}
          placeholder={data?.data.content}
          autoFocus
        />
        <NewCounselButton>수정</NewCounselButton>
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
  width: 100%;
  height: 120px;
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

export default EditCounsel;
