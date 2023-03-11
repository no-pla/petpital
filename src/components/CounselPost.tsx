import { authService } from "../firebase/firebase";
import {
  useDeletCounsel,
  useGetCounselTarget,
  useEditCounsel,
} from "../hooks/usePetsult";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import CounselComments from "./CounselComments";
import CustomModal, { ModalButton } from "./custom/ErrorModal";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Image from "next/image";
import { RxShare2 } from "react-icons/rx";
import { AiOutlineMore } from "react-icons/ai";
import { REVIEW_SERVER, REVIEW_SITE } from "@/share/server";

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
        style={{ objectFit: "cover" }}
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
  return { props: { router: { query: { id: "id" } } } };
}

const CounselSettingButton = ({ counselData }: any) => {
  const router = useRouter();
  const [openSetting, setOpenSetting] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const id = router.query.id;
  const { mutate: deleteCounsel } = useDeletCounsel();

  const onDelete = (id: any) => {
    setOpenModal((prev: any) => !prev);
    setTargetId(id);
  };

  const onOpenInput = (targetId: string) => {
    router.push(`/petconsult/edit/${targetId}`, undefined, { shallow: true });
  };

  const deleteCounselPost = async () => {
    // 추후 수정 예정 삭제보다 이동이 먼저 발생하고 있음
    await deleteCounsel(targetId);

    if (id === targetId) {
      await router.push(`/petconsult`, undefined, { shallow: true });
    }
    setOpenModal((prev: any) => !prev);
  };

  return (
    <>
      {counselData.uid === authService.currentUser?.uid && (
        <PostSettingButtonContainer>
          <ShareButton onClick={() => setOpenSetting((prev) => !prev)}>
            <AiOutlineMore />
          </ShareButton>
          {openSetting && (
            <PostSettingButtons>
              <PostSettingButton onClick={() => onOpenInput(counselData.id)}>
                수정하기
              </PostSettingButton>
              <PostSettingButton onClick={() => onDelete(counselData.id)}>
                삭제하기
              </PostSettingButton>
            </PostSettingButtons>
          )}
        </PostSettingButtonContainer>
      )}
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

const CounselPost = () => {
  const router = useRouter();
  const id = router.query.id;
  const { CounselList, isRefetching, counselRefetch } = useGetCounselTarget(id);
  useEffect(() => {
    counselRefetch();
  }, []);

  return (
    <>
      {CounselList?.data?.map((counselData: any) => {
        return (
          <Counsel key={counselData.id}>
            <CounselHeader>
              <CounselInfo>
                <UserProfile profileLink={counselData.profileImg} />
                <UserInfo>
                  <div>{counselData?.nickname}</div>
                  <div>
                    {new Date(counselData.createdAt).toLocaleDateString(
                      "ko-Kr",
                    )}
                  </div>
                </UserInfo>
              </CounselInfo>
              <CounselSetting>
                <CopyToClipboard
                  text={`${REVIEW_SITE}petconsult/${counselData.id}`}
                >
                  <ShareButton>
                    <RxShare2 size={16} />
                  </ShareButton>
                </CopyToClipboard>
                <CounselSettingButton counselData={counselData} />
              </CounselSetting>
            </CounselHeader>
            {/* 좋아요 */}
            <CounselText>{String(counselData?.content)}</CounselText>
            {/* 댓글 */}
            <CounselComments target={counselData.id} />
          </Counsel>
        );
      })}
    </>
  );
};

const ShareButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const PostSettingButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px;
  gap: 8px;
  width: 104px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  font-family: "Pretendard";
  font-size: 12px;
  color: #9f9f9f;
`;

const PostSettingButtons = styled.div`
  position: absolute;
  top: 28px;
  right: 0;
  & button:nth-of-type(1) {
    border-bottom: 0.4px solid #9f9f9f;
  }
  filter: drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2));
`;

const PostSettingButtonContainer = styled.div`
  position: relative;
`;

const CounselSetting = styled.div`
  display: flex;
  align-items: baseline;
`;

const CounselText = styled.div`
  width: 100%;
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
  margin: 0 20px;
`;

export const CounselHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-top: 20px;
`;

export const CounselInfo = styled.div`
  display: flex;
  margin-right: 20px;
`;

const CounselContainer = styled.div`
  @media screen and (max-width: 375px) {
    margin-bottom: 120px;
  }
`;

export default CounselPost;
