import React, { useRef, useState } from "react";
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
import CustomModal, { ModalButton } from "../../components/custom/CustomModal";

// 고민 상담 스타일
const CounselContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  justify-content: center;
  justify-items: center;
  @media screen and (max-width: 880px) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

export const CounselTitle = styled.h3`
  margin-bottom: 50px;
  display: flex;
  font-size: 1.1rem;
  &::before {
    content: "Q";
    color: #c5c5c5;
    font-size: 47px;
    margin: 0 10px 0 15px;
  }
`;

export const Counsel = styled.div`
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 4px;
  box-shadow: 0px 4px 0px rgba(0, 0, 0, 0.25);
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
  margin: 20px 0 96px 0;
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

function Petconsult() {
  const router = useRouter();
  const targetRef = useRef<HTMLDivElement>(null);
  const [isLogin, setIsLogin] = useState(false);
  const [page, setPage] = useState(1);
  const { data: petConsult, isLoading } = useQuery(
    ["pagnationCounsel", page],
    () => {
      return axios.get(
        `https://swift-flash-alfalfa.glitch.me/posts?_sort=createdAt&_order=desc&limit=10&_page=${page}`,
      );
    },
    {
      keepPreviousData: true,
    },
  );

  const onClick = (id: string) => {
    router.push(`petconsult/${id}`);
  };

  const goToNewQnAPage = () => {
    if (authService.currentUser !== null) {
      router.push("/petconsult/new");
    } else {
      setIsLogin(true);
    }
  };

  return (
    <>
      {isLogin && (
        <CustomModal
          modalText1={"회원가입 후"}
          modalText2={"질문을 남겨보세요!"}
        >
          <ModalButton onClick={() => setIsLogin(false)}>취소</ModalButton>
          <ModalButton onClick={() => router.push("/signup")}>
            회원가입 하기
          </ModalButton>
        </CustomModal>
      )}
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
        <HeaderButton
          disabled={!authService.currentUser === undefined}
          onClick={goToNewQnAPage}
          // onClick={() =>}
        >
          질문하기
        </HeaderButton>
      </CustomHeader>
      <CounselContainer ref={targetRef}>
        {isLoading
          ? "로딩중"
          : petConsult?.data.map((counsel: any) => (
              <Counsel key={counsel.id}>
                <CounselTitle>{counsel.content}</CounselTitle>
                <CounselButton onClick={() => onClick(counsel.id)}>
                  답변하러가기
                </CounselButton>
              </Counsel>
            ))}
      </CounselContainer>
      <PageButtonContainer>
        <PageButton
          disabled={page === 1 && true}
          onClick={() => setPage((prev) => prev - 1)}
        >
          &larr;
        </PageButton>
        <PageButton
          disabled={petConsult?.data.length !== 10 && true}
          onClick={() => setPage((prev) => prev + 1)}
        >
          &rarr;
        </PageButton>
      </PageButtonContainer>
    </>
  );
}

export default Petconsult;
