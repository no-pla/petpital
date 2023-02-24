import axios from "axios";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import { useEditCounsel } from "../../../hooks/usePetsult";
import { useRef, useState } from "react";
import styled from "@emotion/styled";
import { CounselHeader, CounselInfo, UserInfo, UserProfileImg } from "../[id]";
import { authService } from "../../../firebase/firebase";
import CustomModal, {
  ModalButton,
} from "../../../components/custom/CustomModal";
import { HeaderButton } from "../../../pages";
import {
  BackButton,
  CustomHeader,
} from "../../../components/custom/CustomHeader";
import { SubBanner } from "../../../components/SubBanner";

const EditCounsel = () => {
  const router = useRouter();
  const newCounselRef = useRef<HTMLInputElement>(null);
  const { mutate: editCounsel } = useEditCounsel();
  const [emptyComment, setEmptyComment] = useState(false);
  const [tooLongComment, setToLongComment] = useState(false);
  const [backPage, setBackPage] = useState(false);

  const {
    query: { id },
  } = router;

  const { data } = useQuery(
    ["getEditCounsels", id],
    () => {
      return axios.get(`https://swift-flash-alfalfa.glitch.me/posts/${id}`);
    },
    {
      enabled: !!id,
    },
  );

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      newCounselRef.current?.value === "" ||
      newCounselRef.current?.value === null ||
      newCounselRef.current?.value === undefined
    ) {
      setEmptyComment((prev) => !prev);
      return;
    } else if (newCounselRef.current?.value.length > 40) {
      setToLongComment(true);
      return;
    } else {
      editCounsel({ ...data?.data, content: newCounselRef.current?.value });
      router.push(`/petconsult/${id}`);
    }
  };

  const backToCounselPage = () => {
    if (newCounselRef.current?.value === "") {
      router.push(`/petconsult/${id}`);
    } else {
      setBackPage((prev) => !prev);
    }
  };
  const RefInput = () => {
    return (
      <NewCounselInput
        ref={newCounselRef}
        disabled={backPage || tooLongComment || emptyComment}
        autoFocus
        placeholder={data?.data.content}
      />
    );
  };

  return (
    <>
      {tooLongComment && (
        <CustomModal
          modalText1={"글이 너무 깁니다."}
          modalText2={"40자 이하로 작성해 주세요!"}
        >
          <ModalButton onClick={() => setToLongComment((prev) => !prev)}>
            닫기
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
              "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FComponent%209.png?alt=media&token=ee6ff59f-3c4a-4cea-b5ff-c3f20765a606"
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
        <RefInput />
        <NewCounselButton>수정</NewCounselButton>
      </NewCounselForm>
      <SubBanner />
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
