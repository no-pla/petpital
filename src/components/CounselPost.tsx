import { authService } from "@/firebase/firebase";
import {
  useDeletCounsel,
  useGetCounselTarget,
  useEditCounsel,
} from "@/hooks/usePetsult";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import React, { useState } from "react";
import CounselComments, { ManageButtonContainer } from "./CounselComments";
import CustomModal, { ModalButton } from "./custom/ErrorModal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Image from "next/image";

export const UserProfile = ({ profileLink }: any) => {
  return (
    <UserProfileImg>
      <Image
        src={profileLink}
        width={64}
        height={64}
        alt={""}
        loading={"lazy"}
        sizes="(max-width: 768px) 64px,
        (max-width: 1200px) 64px"
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
  const { CounselList } = useGetCounselTarget(id);
  const [targetId, setTargetId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const { mutate: deleteCounsel } = useDeletCounsel();
  const { mutate: editCounsel } = useEditCounsel();

  console.log("포스트 리렌더");

  const onOpenInput = (targetId: string) => {
    router.push(`/petconsult/edit/${targetId}`);
  };

  const onDelete = (id: any) => {
    setOpenModal((prev: any) => !prev);
    setTargetId(id);
  };

  const deleteCounselPost = () => {
    // 추후 수정 예정 삭제보다 이동이 먼저 발생하고 있음
    // deleteCounsel(targetId).then(() => {
    //   if (id === targetId) {
    //     console.log("이동");
    //     // router.back();
    //     router.push(`/petconsult`);
    //   }
    //   setOpenModal((prev: any) => !prev);
    // });
  };

  const addLike = (linkedUser: string[], counselData: any) => {
    const newCounselData = {
      ...counselData,
      linkedUser: [...linkedUser, authService.currentUser?.uid],
    };
    editCounsel(newCounselData);
  };

  const removeLike = (linkedUser: string[], counselData: any) => {
    const removeUser = linkedUser.filter(
      (target) => target !== authService.currentUser?.uid,
    );
    const newCounselData = {
      ...counselData,
      linkedUser: [...removeUser],
    };

    editCounsel(newCounselData);
  };

  return (
    <>
      {CounselList?.map((counselData: any) => {
        return (
          <Counsel key={counselData.id}>
            <CopyToClipboard
              text={`http://localhost:3000/petconsult/${counselData.id}`}
            >
              <button>클릭해서 공유</button>
            </CopyToClipboard>
            <CounselHeader>
              <CounselInfo>
                <UserProfile profileLink={counselData.profileImg} />
                <UserInfo>
                  <div>{counselData.nickname}</div>
                  <div>
                    {new Date(counselData.createdAt).toLocaleDateString(
                      "ko-Kr",
                    )}
                  </div>
                </UserInfo>
              </CounselInfo>
              <div>
                {String(
                  counselData?.linkedUser?.includes(
                    authService?.currentUser?.uid,
                  ),
                )}
              </div>
              {counselData.uid === authService.currentUser?.uid && (
                <ManageButtonContainer>
                  <button onClick={() => onDelete(counselData.id)}>삭제</button>
                  <button onClick={() => onOpenInput(counselData.id)}>
                    수정
                  </button>
                </ManageButtonContainer>
              )}
            </CounselHeader>
            {/* 좋아요 */}
            <div>{counselData?.linkedUser?.length}</div>
            <div>
              {counselData?.linkedUser?.includes(
                authService?.currentUser?.uid,
              ) ? (
                <button
                  disabled={authService.currentUser === null}
                  onClick={() =>
                    removeLike(counselData?.linkedUser, counselData)
                  }
                >
                  이미 좋아요 누름
                </button>
              ) : (
                <button
                  disabled={authService.currentUser === null}
                  onClick={() => addLike(counselData?.linkedUser, counselData)}
                >
                  {authService?.currentUser === null
                    ? "가입하고 좋아요를 남겨보세요"
                    : "좋와요"}
                </button>
              )}
            </div>
            <CounselText>{String(counselData.content)}</CounselText>
            {/* 댓글 */}
            <CounselComments target={counselData.id} />
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

export const UserProfileImg = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  margin-right: 10px;
  overflow: hidden;
`;

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

export default CounselPost;
