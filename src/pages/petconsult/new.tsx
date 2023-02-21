import { useState } from "react";
import { useAddCounsel } from "@/hooks/usePetsult";
import CustomModal, { ModalButton } from "../../components/custom/CustomModal";
import { useRouter } from "next/router";
import { authService } from "@/firebase/firebase";
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
      <form onSubmit={addPetsult}>
        <input value={newPetsult.content} onChange={onChange} />
        <button type="submit">질문하기</button>
      </form>
      <button onClick={backToCounselPage}>취소하기</button>
    </>
  );
};

export default NewPetsult;
