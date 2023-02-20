import { useState } from "react";
import { useAddCounsel } from "@/Hooks/usePetsult";
import CustomModal, { ModalButton } from "../../components/custom/CustomModal";
import { useRouter } from "next/router";
const short = require("short-uuid");

export interface INewPetsult {
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
    id: short.generate(),
    content: "",
    nickname: "",
    profileImg: "",
    createdAt: Date.now(),
  });

  const nickname = "임시닉네임"; // 임시값
  const profileImg =
    "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/1676431476796?alt=media&token=2a8e780a-d89b-4274-bfe4-2a4e375fa23a"; // 임시값

  const { mutate: addCounsel } = useAddCounsel();
  const addPetsult = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPetsult.content) {
      setEmptyComment((prev) => !prev);
      return;
    } else {
      addCounsel(newPetsult);
      setNewPetsult({
        id: short.generate(),
        content: "",
        nickname: "",
        profileImg: "",
        createdAt: Date.now(),
      });
    }
  };

  const onChange = (event: React.FormEvent<HTMLInputElement>) => {
    const {
      currentTarget: { value: content },
    } = event;

    setNewPetsult({
      id: short.generate(),
      content,
      nickname,
      profileImg,
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
