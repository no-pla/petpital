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

const EditCounsel = () => {
  const router = useRouter();
  const { mutate: editCounsel } = useEditCounsel();
  const [newCounsel, setNewCounsel] = useState("");

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
      alert("11");
      return;
    } else {
      editCounsel({ ...data?.data, content: newCounsel });
      router.push(`/petconsult/${id}`);
    }
  };

  return (
    <>
      <form onSubmit={onSubmit}>
        <input
          onChange={(event) => setNewCounsel(event.target.value)}
          placeholder={data?.data.content}
        />
        <button>수정</button>
      </form>
    </>
  );
};

export default EditCounsel;
