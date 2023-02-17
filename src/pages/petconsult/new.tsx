import axios from "axios";
import { useState } from "react";
import { authService } from "@/firebase/firebase";
import { v4 as uuidv4 } from "uuid";

export interface INewPetsult {
  id: string;
  content: string;
  nickname: any;
  profileImg: any;
  createdAt: number;
}

const NewPetsult = () => {
  const [newPetsult, setNewPetsult] = useState<INewPetsult>({
    id: uuidv4(),
    content: "",
    nickname: "",
    profileImg: "",
    createdAt: Date.now(),
  });

  const nickname = "임시닉네임"; // 임시값
  const profileImg =
    "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/1676431476796?alt=media&token=2a8e780a-d89b-4274-bfe4-2a4e375fa23a"; // 임시값

  //   const nickname = authService.currentUser?.displayName; // 이후 교체 예정
  //   const profileImg = authService.currentUser?.displayName; // 이후 교체 예정

  const addPetsult = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPetsult.content) {
      return;
    } else {
      await axios.post("http://localhost:3001/qna", newPetsult);
      setNewPetsult({
        id: uuidv4(),
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
      id: uuidv4(),
      content,
      nickname,
      profileImg,
      createdAt: Date.now(),
    });
  };

  return (
    <>
      <form onSubmit={addPetsult}>
        <input value={newPetsult.content} onChange={onChange} />
        <button>추가</button>
      </form>
    </>
  );
};

export default NewPetsult;
