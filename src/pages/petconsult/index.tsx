import React, { useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import axios from "axios";
import {
  CustomHeader,
  HeaderButton,
  HeaderTitle,
} from "../../components/custom/CustomHeader";
import { MainBannerContiner } from "../../components/MainBanner";
import { MainCustomButton } from "..";
import { authService } from "../../firebase/firebase";
import CustomModal, { ModalButton } from "../../components/custom/ErrorModal";
import { REVIEW_SERVER } from "../../share/server";
import Head from "next/head";
import { CounselItem } from "../../components/custom/CounselItem";

// 고민 상담 스타일
const CounselContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(5, 1fr);
  gap: 24px;
  justify-content: center;
  justify-items: center;
  position: relative;
  height: 100%;
  @media screen and (max-width: 880px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export const CounselTitle = styled.div`
  margin-bottom: 50px;
  display: flex;
  font-size: 1.1rem;
  margin-top: 12px;
  &::before {
    content: "Q";
    color: #c5c5c5;
    font-size: 47px;
    margin: -15px 20px 0 15px;
  }
`;

export const Counsel = styled.div`
  margin-top: -15px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 4px;
  border-width: 4px;
  border-color: #eee;
  border-style: solid;
  width: 90%;
  height: 100%;
`;

export const CounselButton = styled.button`
  background-color: #afe5e9;
  color: #15b5bf;
  padding: 12px 8px;
  gap: 8px;
  border: none;
  border-radius: 0px 0px 4px 4px;
  font-size: 1rem;
  cursor: pointer;
`;

export const PageButtonContainer = styled.div`
  width: 100%;
  text-align: center;
  margin: 20px 0 0px 0;
  display: flex;
  gap: 20px;
  justify-content: center;
  @media screen and (max-width: 375px) {
    margin-bottom: 120px;
  }
`;

export const PageButton = styled.button`
  font-size: 20px;
  color: #65d8df;
  padding: 4px 6px;
  background-color: transparent;
  border: 2px solid #65d8df;
  border-radius: 50%;
  margin-top: 20px;
  margin-bottom: 16px;
  &:disabled {
    color: gray;
    border-color: gray;
  }
`;

const MainBanner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const MainBannerText = styled.h1`
  color: #ffffff;
  font-weight: 700;
  font-size: 1.8rem;
  text-align: center;
  margin-bottom: 30px;
  text-shadow: 0px 4px 4px 0px #00000040;
`;

const DownButton = styled.button`
  background-color: transparent;
  border: none;
  display: flex;
  flex-direction: column;
  gap: 8px 0;
  color: white;
  margin-bottom: 24px;
  align-items: center;
  & span {
    color: white;
  }
`;

const DownButtonImage = styled.img``;
export const CurrentReviewContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  padding: 0 8px;
  border-top: 1px solid #e4e4e4;
  height: 80px;
`;
export const CurrentReview = styled.div`
  padding: 8px;
  background: #fafafa;
  border-radius: 4px;
  margin: 12px 0;
  width: 49%;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  padding-bottom: 4px;
`;

export const CurrentReviewNickname = styled.span`
  font-weight: 600;
  padding-right: 4px;
`;

export const CurrentReviewContent = styled.span``;

export const QuestionButton = styled.button`
  color: white;
  position: fixed;
  bottom: 60px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #15b5bf;
  border: none;
  font-weight: 700;
  gap: 8px;
  cursor: pointer;
  z-index: 1000;

  @media screen and (max-width: 1200px) {
    /* right: 12%; */
    right: 40px;
  }
  @media screen and (min-width: 1200px) {
    /* margin-bottom: 120px; */
    right: 12%;
  }
  filter: drop-shadow(0px 4px 20px rgba(0, 0, 0, 0.3));
  &::before {
    content: "Q";
    font-size: 48px;
    font-weight: 400;
  }
`;

interface ICounsel {
  uid: string;
  id: string;
  content: string;
  nickname: string;
  profileImg: string;
  createdAt: number;
}

function Petconsult() {
  const router = useRouter();
  const targetRef = useRef<HTMLDivElement>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [page, setPage] = useState(1);
  const [counselList, setCounselList] = useState<string[]>([]);
  const [commentList, setCommentList] = useState<string[][]>([]);

  const {
    data: petConsult,
    isLoading,
    refetch,
  } = useQuery(
    ["pagnationCounsel", page],
    () => {
      return axios.get(
        `${REVIEW_SERVER}qna?_sort=createdAt&_order=desc&limit=10&_page=${page}`,
      );
    },
    {
      select: (data) => data?.data,
    },
  );

  useEffect(() => {
    refetch();
    // forEach를 사용하면 이전 작업이 끝나는 것을 기다리고 실행되지 않기 때문에 Promise.all을 사용해주어야 한다.
    const tempArray: string[] = [];
    if (petConsult) {
      petConsult.map((counsel: any) => tempArray.push(counsel.id));
    }

    const promises = tempArray.map(async (counselId) => {
      return await axios
        .get(
          `${REVIEW_SERVER}qnaReview?_sort=createdAt&_order=desc&counselId=${counselId}`,
        )
        .then((res) => res.data.slice(0, 2));
    });

    Promise.all(promises).then((results) => {
      setCommentList(results);
    });
  }, [page]);

  // const onClick = (id: string) => {
  //   router.push(`petconsult/${id}`);
  // };

  const goToNewQnAPage = () => {
    if (authService.currentUser !== null) {
      router.push("/petconsult/new", undefined, { shallow: true });
    } else {
      setIsLogin(true);
      return;
    }
  };
  return (
    <>
      <Head>
        <title>펫피탈 | 질문 광장 리스트</title>
      </Head>
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
      {!isLoading && (
        <>
          <MainBannerContiner backgroundImg="https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FRectangle%201.png?alt=media&token=49a7be86-f7bc-44aa-b183-bc2a6ea13f08">
            <MainBanner>
              <MainBannerText>
                키우면서 궁금했던 고민
                <br />
                여기에 다 있어요!
              </MainBannerText>
              <DownButton>
                <DownButtonImage
                  src="https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2Fscroll.png?alt=media&token=009aec51-d2e9-4733-917e-04be43cdbf5b"
                  alt="내려서 질문 모아보기"
                />
                <span>scroll</span>
              </DownButton>
              <MainCustomButton
                onClick={() =>
                  targetRef.current?.scrollIntoView({ behavior: "smooth" })
                }
              >
                내려서 질문 모아보기
              </MainCustomButton>
            </MainBanner>
          </MainBannerContiner>
          <CustomHeader>
            <HeaderTitle>고민있음 털어놔보개!🐶</HeaderTitle>
          </CustomHeader>
          <CounselContainer ref={targetRef}>
            {!isLoading &&
              petConsult?.map((counsel: any, index: number) => (
                <CounselItem
                  key={counsel.id}
                  counsel={counsel}
                  index={index}
                  page={page}
                />
              ))}
            <QuestionButton onClick={goToNewQnAPage}>질문하기</QuestionButton>
          </CounselContainer>
          <PageButtonContainer>
            <PageButton
              disabled={page === 1 && true}
              onClick={() => setPage((prev) => prev - 1)}
            >
              &larr;
            </PageButton>
            <PageButton
              disabled={petConsult?.length !== 10 && true}
              onClick={() => setPage((prev) => prev + 1)}
            >
              &rarr;
            </PageButton>
          </PageButtonContainer>
        </>
      )}
    </>
  );
}

export default Petconsult;
