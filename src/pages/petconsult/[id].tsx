import {
  useDeletCounsel,
  useGetCounselList,
  useGetCounselTarget,
} from "../../hooks/usePetsult";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useState } from "react";
import CounselComments, {
  ManageButtonContainer,
} from "../../components/CounselComments";
import { useQuery } from "react-query";
import axios from "axios";
import CustomModal, { ModalButton } from "../../components/custom/CustomModal";
import {
  BackButton,
  CustomHeader,
  HeaderButton,
} from "../../components/custom/CustomHeader";
import { authService } from "../../firebase/firebase";

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
  const [openModal, setOpenModal] = useState(false);
  const [targetId, setTargetId] = useState("");

  const fetchInfiniteComment = async (targetTime: any) => {
    return await axios.get(
      `https://swift-flash-alfalfa.glitch.me/posts?_sort=createdAt&_order=desc&createdAt_lte=${targetTime}`,
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
      <Counsel key={counselData.id}>
        <CounselHeader>
          <CounselInfo>
            <UserProfileImg
              src={counselData.profileImg}
              alt={counselData.nickname + " 유저의 프로필 사진입니다."}
            />
            <UserInfo>
              <div>{counselData.nickname}</div>
              <div>
                {new Date(counselData.createdAt).toLocaleDateString("ko-Kr")}
              </div>
            </UserInfo>
          </CounselInfo>
          {counselData.uid === authService.currentUser?.uid && (
            <ManageButtonContainer>
              <button onClick={() => onDelete(counselData.id)}>삭제</button>
              <button onClick={() => onOpenInput(counselData.id)}>수정</button>
            </ManageButtonContainer>
          )}
        </CounselHeader>
        <CounselText>{String(counselData.content)}</CounselText>
        <CounselComments target={counselData.id} />
      </Counsel>
    );
  }

  return (
    <CounselContainer>
      <CustomHeader>
        <BackButton onClick={() => router.push("/petconsult")}>
          &larr; 이전으로
        </BackButton>
        <HeaderButton onClick={() => router.push("/petconsult/new")}>
          질문하기
        </HeaderButton>
      </CustomHeader>
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
    </CounselContainer>
  );
};

const Counsel = styled.div`
  min-height: 80vh;
  height: 100%;
  border-bottom: 1px solid #c5c5c5;
`;

export const CounselHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 20px;
  padding-top: 20px;
`;

export const CounselInfo = styled.div`
  display: flex;
  margin: 0 20px;
`;

const CounselContainer = styled.div`
  @media screen and (max-width: 375px) {
    margin-bottom: 120px;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  & div:nth-of-type(1) {
    font-size: 16px;
    margin-bottom: 6px;
  }

  & div:nth-of-type(2) {
    ::before {
      content: "게시일 • ";
    }
    color: #c5c5c5;
    font-weight: 400;
    font-size: 12px;
  }
`;

export const UserProfileImg = styled.img`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
`;

const CounselText = styled.div`
  width: 80%;
  height: 120px;
  background: #afe5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #ffffff;
  border-radius: 4px;
  margin: 40px auto;
`;

export default PetconsultDetail;
