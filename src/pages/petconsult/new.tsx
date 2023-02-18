import { useState } from "react";
import { useAddCounsel } from "@/Hooks/usePetsult";
import { useRouter } from "next/router";
const short = require("short-uuid");

export interface INewPetsult {
  id: string;
  content: string;
  nickname: any;
  profileImg: any;
  createdAt: number;
  onEdit: boolean;
}

const NewPetsult = () => {
  const router = useRouter();
  const [newPetsult, setNewPetsult] = useState<INewPetsult>({
    id: short.generate(),
    content: "",
    nickname: "",
    profileImg: "",
    createdAt: Date.now(),
    onEdit: false,
  });

  const nickname = "임시닉네임"; // 임시값
  const profileImg =
    "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/1676431476796?alt=media&token=2a8e780a-d89b-4274-bfe4-2a4e375fa23a"; // 임시값

  const { mutate: addCounsel } = useAddCounsel();
  const addPetsult = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newPetsult.content) {
      return;
    } else {
      addCounsel(newPetsult);
      setNewPetsult({
        id: short.generate(),
        content: "",
        nickname: "",
        profileImg: "",
        createdAt: Date.now(),
        onEdit: false,
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
      onEdit: false,
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
