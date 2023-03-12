import { useDeletCounsel } from "../../hooks/usePetsult";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CustomModal, { ModalButton } from "../../components/custom/ErrorModal";
import {
  BackButton,
  CustomHeader,
  HeaderButton,
} from "../../components/custom/CustomHeader";
import CounselPost from "../../components/CounselPost";
import { authService } from "../../firebase/firebase";
import CopyToClipboard from "react-copy-to-clipboard";
import { QuestionButton } from "./index";
import { BsArrowLeftCircle } from "react-icons/bs";
import { onAuthStateChanged } from "firebase/auth";
import Head from "next/head";

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
  const [openModal, setOpenModal] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  // const onDelete = (id: any) => {
  //   setOpenModal((prev: any) => !prev);
  //   setTargetId(id);
  // };

  const currentUser = useAuth();

  function useAuth() {
    const [currentUser, setCurrentUser] = useState<any>();
    useEffect(() => {
      const unsub = onAuthStateChanged(authService, (user) =>
        setCurrentUser(user),
      );
      return unsub;
    }, []);

    return currentUser;
  }

  const goToNewQnAPage = () => {
    if (currentUser !== null) {
      router.push("/petconsult/new", undefined, { shallow: true });
    } else {
      setIsLogin(true);
    }
  };

  const deleteCounselPost = async () => {
    if (id === targetId) {
      router.push("/petconsult", undefined, { shallow: true });
    }
    setOpenModal((prev: any) => !prev);
    await deleteCounsel(targetId);
  };

  return (
    <>
      <Head>
        <title>펫피탈 | 질문 광장</title>
      </Head>
      <CounselContainer>
        <CustomHeader>
          <BackButton
            onClick={() =>
              router
                .push("/petconsult", undefined, { shallow: true })
                .then(() => {
                  router.reload();
                })
            }
          >
            <BsArrowLeftCircle /> 이전으로
          </BackButton>
          <QuestionButton onClick={goToNewQnAPage}>질문하기</QuestionButton>
        </CustomHeader>
        <CounselPost />
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
      {isLogin && (
        <CustomModal
          modalText1={"회원가입 후"}
          modalText2={"질문을 남겨보세요!"}
        >
          <ModalButton onClick={() => setIsLogin(false)}>취소</ModalButton>
          <ModalButton
            onClick={() => router.push("/signup", undefined, { shallow: true })}
          >
            회원가입 하기
          </ModalButton>
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
  @media screen and (min-width: 375px) {
    margin-bottom: 60px;
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
  font-size: 1.2rem;
  color: #ffffff;
  border-radius: 4px;
  margin: 40px auto;
  text-align: center;
  padding: 0 10px;
`;

export default PetconsultDetail;
