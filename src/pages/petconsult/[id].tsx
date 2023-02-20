import {
  useDeletCounsel,
  useGetCounselList,
  useGetCounselTarget,
} from "@/Hooks/usePetsult";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CounselComments from "@/components/CounselComments";
import { useQuery } from "react-query";
import axios from "axios";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import CustomModal, { ModalButton } from "@/components/custom/CustomModal";
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
  const { data: targetTime } = useGetCounselTarget(id);
  const { data: infinite } = useGetCounselList(targetTime);
  const [counsel, setCounsel] = useState<any>();
  const [openModal, setOpenModal] = useState(false);
  const [targetId, setTargetId] = useState("");

  const fetchInfiniteComment = async (targetTime: any) => {
    return await axios.get(
      `http://localhost:3001/qna?_sort=createdAt&_order=desc&createdAt_lte=${targetTime}`,
    );
  };

  const { data } = useQuery(["infiniteComments", targetTime], () =>
    fetchInfiniteComment(targetTime),
  );

  const onDelete = (id: any) => {
    setOpenModal((prev: any) => !prev);
    setTargetId(id);
  };

  const deleteCounselPost = () => {
    deleteCounsel(targetId);
    if (id === targetId) {
      router.push(`/petconsult`);
    }
    setOpenModal((prev: any) => !prev);
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
          <div>
            작성 시간:
            {new Date(counselData.createdAt).toLocaleDateString("ko-Kr")}
          </div>
        </CounselHeader>
        <CounselText>{String(counselData.content)}</CounselText>
        <CounselComments target={counselData.id} />
      </div>
    );
  }

  return (
    <div>
      {data?.data?.map((counselData: any) => {
        return <Components key={counselData.id} counselData={counselData} />;
      })}
      {openModal && (
        <CustomModal
          modalText1={"입력하신 게시글을"}
          modalText2={"삭제 하시겠습니까?"}
        >
          <ModalButton onClick={() => setOpenModal((prev: any) => !prev)}>
            취소
          </ModalButton>
          <ModalButton onClick={deleteCounselPost}>삭제</ModalButton>
        </CustomModal>
      )}
    </div>
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

export default PetconsultDetail;
