import { BackButton } from "@/components/custom/CustomHeader";
import { authService } from "@/firebase/firebase";
import { useGetReviews } from "@/hooks/useGetReviews";
import { useGetPetConsult } from "@/hooks/usePetsult";
import styled from "@emotion/styled";
import { onAuthStateChanged } from "firebase/auth";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineSetting } from "react-icons/ai";
import { BsArrowLeftCircle } from "react-icons/bs";
import Likedpetpital from "./Likedpetpital";
import Review from "./Review";

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

//카테고리 버튼
const Mypage = () => {
  const router = useRouter();
  const currentUser = useAuth();
  const [selected, setSelected] = useState("");
  const { recentlyReview, isLoading } = useGetReviews(
    `?_sort=date&_order=desc&userId=${currentUser?.uid}`,
  );
  const { isLoadingPetConsult, petConsult } = useGetPetConsult({
    limit: `&uid=${currentUser?.uid}`,
  });

  //프로필 변경 페이지 이동
  const onProfileChangeClick = () => {
    router.push("/mypage/Nickname", undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>펫피탈 | 마이페이지</title>
      </Head>
      <MyPageContainer>
        <HeaderContainer>
          <MyPageHeader>
            <BackButton
              onClick={() => router.push("/", undefined, { shallow: true })}
            >
              <BsArrowLeftCircle color="white" />
              <span>이전으로</span>
            </BackButton>
            <div>마이페이지</div>
          </MyPageHeader>
          <UserProfile>
            <ImageContainer>
              <UserProfileImage src={currentUser?.photoURL} />
              <SettingButton onClick={onProfileChangeClick}>
                <AiOutlineSetting size={20} color="#15b5bf" />
              </SettingButton>
            </ImageContainer>
            <UserNickName>{authService.currentUser?.displayName}</UserNickName>
            <UserWritten>
              <CountPost>
                <span>남긴 질문 +</span>
                <span>{petConsult?.data?.length}</span>
              </CountPost>
              <CountPost>
                <span>남긴 리뷰 +</span>
                <span>{recentlyReview?.data?.length}</span>
              </CountPost>
            </UserWritten>
          </UserProfile>
          <ToggleButtonContainer>
            <ToggleButton
              style={{
                borderBottom:
                  selected === "hospital" ? "4px solid #FFFFFF" : "none",
              }}
              onClick={() => setSelected("hospital")}
            >
              남긴 질문
            </ToggleButton>
            <ToggleButton
              style={{
                borderBottom:
                  selected === "review" ? "4px solid #FFFFFF" : "none",
              }}
              onClick={() => setSelected("review")}
            >
              리뷰
            </ToggleButton>
          </ToggleButtonContainer>
        </HeaderContainer>
        <SectionContainer>
          {selected === "hospital" && <Likedpetpital />}
          {selected === "review" && <Review />}
        </SectionContainer>
      </MyPageContainer>
    </>
  );
};

export default Mypage;

export const SettingButton = styled.button`
  position: absolute;
  top: 12px;
  right: 90px;
  background-color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

export const ImageContainer = styled.div`
  position: relative;
  display: flex;
`;

const ToggleButton = styled.button`
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
  background-color: transparent;
  border: none;
  font-weight: 500;
  padding: 8px 8px 16px;
  cursor: pointer;
`;

const CountPost = styled.div`
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 5px 7px;
  color: #ffffff;
  width: 144px;
  display: flex;
  gap: 8px;
`;

export const HeaderContainer = styled.div`
  background: #15b5bf;
  margin-top: 80px;
  padding-top: 10px;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

const MyPageContainer = styled.div`
  width: 100%;
  margin: 0 auto;
`;

export const MyPageHeader = styled.div`
  display: flex;
  margin: 30px 0 37px 0;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  & span {
    color: white;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  & div:nth-of-type(1) {
    margin: -26px auto 0 auto;
    color: white;
    font-weight: 600;
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
  }
`;
export const UserProfile = styled.div`
  display: flex;
  flex-direction: column;
  background-position: center;
`;

export const UserProfileImage = styled.img`
  object-fit: cover;
  width: 128px;
  height: 128px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  background-position: center;
  background-repeat: no-repeat;
`;
const UserNickName = styled.div`
  margin: 24px 0 48px 0;
  text-align: center;
  font-style: normal;
  font-weight: 700;
  font-size: 1.3rem;
  color: white;
`;
const UserWritten = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 70px;
`;
const ToggleButtonContainer = styled.div``;
const SectionContainer = styled.div`
  padding-bottom: 40px;
`;
const Section = styled.div`
  margin-bottom: 20px;
`;
