import { useEffect, useRef, useState } from "react";
import { useAddCounsel } from "../../hooks/usePetsult";
import CustomModal, { ModalButton } from "../../components/custom/ErrorModal";
import { useRouter } from "next/router";
import { authService } from "../../firebase/firebase";
import {
  BackButton,
  CustomHeader,
  HeaderButton,
} from "../../components/custom/CustomHeader";
import { CounselHeader, CounselInfo, UserInfo, UserProfileImg } from "./[id]";
import styled from "@emotion/styled";
import { SubBanner } from "../../components/SubBanner";
const short = require("short-uuid");

export interface INewPetsult {
  uid: any;
  id: string;
  content: any;
  nickname: any;
  profileImg: any;
  createdAt: number;
  linkedUser: string[];
}

const NewPetsult = () => {
  const router = useRouter();
  const [backPage, setBackPage] = useState(false);
  const [emptyComment, setEmptyComment] = useState(false);
  const [tooLongComment, setToLongComment] = useState(false);
  const newCounselRef = useRef<HTMLInputElement>(null);
  const { mutate: addCounsel } = useAddCounsel();

  const addPetsult = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (
      newCounselRef.current?.value === "" ||
      newCounselRef.current?.value === null ||
      newCounselRef.current?.value === undefined
    ) {
      setEmptyComment((prev) => !prev);
    } else if (newCounselRef.current?.value.length > 100) {
      setToLongComment(true);
      return;
    } else {
      //
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
        linkedUser: [],
      };
      await addCounsel(newCounsel);

      router.push(`/petconsult/${newCounsel.id}`, undefined, { shallow: true });
    }
  };

  const RefInput = () => {
    return (
      <NewCounselInput
        placeholder="????????? ?????? ????????? ????????????"
        ref={newCounselRef}
        disabled={backPage || tooLongComment || emptyComment}
        autoFocus
      />
    );
  };

  const backToCounselPage = () => {
    if (newCounselRef.current?.value === "") {
      router.push("/petconsult", undefined, { shallow: true });
    } else {
      setBackPage((prev) => !prev);
    }
  };

  return (
    <>
      {tooLongComment && (
        <CustomModal
          modalText1={"?????? ?????? ?????????."}
          modalText2={"100??? ????????? ????????? ?????????!"}
        >
          <ModalButton onClick={() => setToLongComment((prev) => !prev)}>
            ??????
          </ModalButton>
        </CustomModal>
      )}
      {backPage && (
        <CustomModal
          modalText1={"???????????? ?????????"}
          modalText2={"????????? ???????????????!"}
        >
          <ModalButton
            onClick={() =>
              router.push("/petconsult", undefined, { shallow: true })
            }
          >
            ???????????????!
          </ModalButton>
          <ModalButton onClick={() => setBackPage((prev) => !prev)}>
            ??????????????????
          </ModalButton>
        </CustomModal>
      )}
      {emptyComment && (
        <CustomModal
          modalText1={"????????? ??????????????????."}
          modalText2={"????????? ?????? 1?????? ?????? ???????????????."}
        >
          <ModalButton onClick={() => setEmptyComment((prev) => !prev)}>
            ??????
          </ModalButton>
        </CustomModal>
      )}
      <CustomHeader>
        <BackButton
          onClick={() =>
            router.push("/petconsult", undefined, { shallow: true })
          }
        >
          &larr; ????????????
        </BackButton>
        <HeaderButton onClick={backToCounselPage}>????????????</HeaderButton>
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
              " ????????? ????????? ???????????????."
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
        <NewCounselButton type="submit">????????????</NewCounselButton>
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
