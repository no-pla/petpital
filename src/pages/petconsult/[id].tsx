import {
  useDeletCounsel,
  useEditCounsel,
  useGetCounselList,
  useGetCounselTarget,
} from "@/Hooks/usePetsult";
import styled from "@emotion/styled";
import { faL } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { NextPageContext } from "next";
import CounselComments from "@/components/CounselComments";
interface INewPetsult {
  filter(arg0: (log: any) => void): INewPetsult;
  data: {
    id: string;
    content: string;
    nickname: any;
    profileImg: any;
    createdAt: number;
  }[];
}

export function getServerSideProps({ query }: any) {
  // if query object was received, return it as a router prop:
  if (query.id) {
    return { props: { router: { query } } };
  }
  // obtain candidateId elsewhere, redirect or fallback to some default value:
  /* ... */
  return { props: { router: { query: { id: "test" } } } };
}

const PetconsultDetail = () => {
  const router = useRouter();
  const id = router.query.id;
  const { mutate: deleteCounsel } = useDeletCounsel();
  const [newQuestion, setNewQuestion] = useState("");
  const { data: targetTime } = useGetCounselTarget(id);
  const { data: infinite, isLoading } = useGetCounselList(targetTime);
  const [openEdit, setOpenEdit] = useState(false);
  const [counsel, setCounsel] = useState<any>();

  useEffect(() => {
    if (infinite) {
      setCounsel(infinite);
    }
  }, [counsel?.data, infinite]);

  const onDelete = (targetId: string) => {
    if (targetId === id) {
      router.push(`/petconsult`);
    }
    deleteCounsel(targetId);
  };

  const onOpenInput = (targetId: string) => {
    router.push(`/petconsult/edit/${targetId}`);
  };

  function Components(this: any, { counselData }: any) {
    return (
      <div key={counselData.id}>
        <button onClick={() => onDelete(counselData.id)}>삭제</button>
        <button onClick={() => onOpenInput(counselData.id)}>수정</button>
        <CounselHeader>
          <UserProfileImg
            src={counselData.profileImg}
            alt={counselData.nickname + " 유저의 프로필 사진입니다."}
          />
          <div>{counselData.nickname}</div>
        </CounselHeader>
        <CounselText>{String(counselData.content)}</CounselText>
        <CounselComments target={counselData.id} />
      </div>
    );
  }

  return (
    <>
      {counsel?.data?.map((counselData: any) => {
        return <Components key={counselData.id} counselData={counselData} />;
      })}
    </>
  );
};

const CounselHeader = styled.div``;

const UserProfileImg = styled.img`
  width: 150px;
  height: 150px;
  object-fit: cover;
`;

const CounselText = styled.div`
  width: 80%;
  height: 120px;
  background: #65d8df;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 28px;
  color: #ffffff;
  border-radius: 4px;
`;

const CounselEditInput = styled.input`
  width: 80%;
  height: 120px;
  background: magenta;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 28px;
  color: #ffffff;
  border-radius: 4px;
  text-align: center;
  ::placeholder {
    color: white;
  }
`;

export default PetconsultDetail;
