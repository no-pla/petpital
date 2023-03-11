import { authService } from "../firebase/firebase";
import { useDeletCounsel, useGetCounselTarget } from "../hooks/usePetsult";
import { UserInfo, UserProfileImg } from "../pages/petconsult/[id]";
import { REVIEW_SERVER } from "../share/server";
import styled from "@emotion/styled";
import axios from "axios";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useQuery } from "react-query";
import CounselComments, {
  ManageButtonContainer,
} from "../components/CounselComments";
import CustomModal, { ModalButton } from "../components/custom/ErrorModal";

export const UserProfile = (counselData: any) => {
  return (
    <UserProfileImg>
      <Image
        src={counselData.profileImg}
        alt={counselData.nickname + " 유저의 프로필 사진입니다."}
        width={64}
        height={64}
        priority={true}
      />
    </UserProfileImg>
  );
};

export function getServerSideProps({ query }: any) {
  // if query object was received, return it as a router prop:
  if (query.id) {
    return { props: { router: { query } } };
  }
  // obtain candidateId elsewhere, redirect or fallback to some default value:
  /* ... */
  return { props: { router: { query: { id: "test" } } } };
}

const CounselPost = () => {
  const router = useRouter();
  const id = router.query.id;
  const [openModal, setOpenModal] = useState(false);
  const [targetId, setTargetId] = useState("");
  const { CounselList: targetTime } = useGetCounselTarget(id);
  const { mutate: deleteCounsel } = useDeletCounsel();

  // console.log("메인 리렌더");

  const fetchInfiniteComment = async (targetTime: any) => {
    return await axios.get(
      `${REVIEW_SERVER}qna?_sort=createdAt&_order=desc&createdAt_lte=${targetTime}`,
    );
  };

  const { data } = useQuery(["infiniteComments", targetTime], () =>
    fetchInfiniteComment(targetTime),
  );
  const onOpenInput = (targetId: string) => {
    router.push(`/petconsult/edit/${targetId}`, undefined, { shallow: true });
  };

  const onDelete = (id: any) => {
    setOpenModal((prev: any) => !prev);
    setTargetId(id);
  };

  const deleteCounselPost = () => {
    deleteCounsel(targetId);
    if (id === targetId) {
      router.push(`/petconsult`, undefined, { shallow: true });
    }
    setOpenModal((prev: any) => !prev);
  };

  return (
    <>
      {data?.data?.map((counselData: any) => {
        return (
          <Counsel key={counselData.id}>
            <CounselHeader>
              <CounselInfo>
                {/* <UserProfileImg counselData={counselData} /> */}
                <UserInfo>
                  <div>{counselData.nickname}</div>
                  <div>
                    {new Date(counselData.createdAt).toLocaleDateString(
                      "ko-Kr",
                    )}
                  </div>
                </UserInfo>
              </CounselInfo>
              {counselData.uid === authService.currentUser?.uid && (
                <ManageButtonContainer>
                  <button onClick={() => onDelete(counselData.id)}>삭제</button>
                  <button onClick={() => onOpenInput(counselData.id)}>
                    수정
                  </button>
                </ManageButtonContainer>
              )}
            </CounselHeader>
            <CounselText>{String(counselData.content)}</CounselText>
            {/* <CounselComments target={counselData.id} /> */}
          </Counsel>
        );
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
    </>
  );
};

const Counsel = styled.div`
  min-height: 80vh;
  height: 100%;
  border-bottom: 1px solid #c5c5c5;
`;

const CounselInfo = styled.div`
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
`;

const CounselText = styled.div`
  width: 80%;
  height: 120px;
  background: #afe5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #ffffff;
  border-radius: 4px;
  margin: 40px auto;
  text-align: center;
  padding: 0 10px;
`;

export const CounselHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 0 20px;
  padding-top: 20px;
`;

export default React.memo(CounselPost);
