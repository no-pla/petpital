import { useGetReviews } from "@/Hooks/useGetReviews";
import styled from "@emotion/styled";
import axios from "axios";
import { useQuery } from "react-query";

export default function Home() {
  const { recentlyReview, isLoading } = useGetReviews();
  return (
    <>
      <Slider>
        <PetpitalTitle>
          우리 아이를 위한 병원,
          <br />
          어디에 있지?
        </PetpitalTitle>
        <PetpitalSubTitle>
          동물병원 검색하고
          <br />
          리뷰도 확인해보세요
        </PetpitalSubTitle>
        <MainCustomButton>병원검색 하러가기</MainCustomButton>
      </Slider>
      <SectionTitle>아주 만족했던 병원이었개!🐶</SectionTitle>
      <SectionSubTitle>
        육각형 병원 여기 다 모여 있다냥 확인해보라냥🐱
      </SectionSubTitle>
      <button>⬅</button>
      <button>➡</button>
      <BestPetpitalContainer>
        <BestPetpital>
          <BestPetpitalImg src="https://i.pinimg.com/originals/09/4b/57/094b575671def2c7e7adb60becdee7c4.jpg" />
          <BestPetpitalPrice>15,000~55,000</BestPetpitalPrice>
          <BestPetpitalInfo>
            <BestPetpitalAddressName>파인떙큐</BestPetpitalAddressName>
            <BestPetpitalAddress>경기도 용인시 기흥구</BestPetpitalAddress>
          </BestPetpitalInfo>
        </BestPetpital>
      </BestPetpitalContainer>
      <WriteAReviewSection>
        회원님의 후기로
        <br />
        다른 반려인에게 도움을 주세요🙊
        <MainCustomButton>리뷰 남기러가기</MainCustomButton>
      </WriteAReviewSection>
      <SectionTitle>내가 한번 가봤다냥</SectionTitle>
      <ReviewList>
        {!isLoading &&
          recentlyReview?.data.map((review) => {
            return (
              <Review key={review.id}>
                <ReviewImg src={review.downloadUrl} alt="" />
                <ReviewInfo>
                  <ReviewTitle>{review.title}</ReviewTitle>
                  <PetpitalInfo>
                    <PetpitalAddressName>파인떙큐</PetpitalAddressName>
                    <PetpitalAddress>경기도 용인시 기흥구</PetpitalAddress>
                  </PetpitalInfo>
                  <ReviewDesc>{review.contents}</ReviewDesc>
                  <PetpitalPrice>
                    <PetpitalHighPrice>25,000</PetpitalHighPrice>
                  </PetpitalPrice>
                </ReviewInfo>
              </Review>
            );
          })}
      </ReviewList>
      <SectionTitle>고민 있음 털어놔보개!</SectionTitle>
      <CounselList>
        <Counsel>
          <CounselTitle>강아지 털관리 다들 어떻게 하시나요?</CounselTitle>
          <CounselButton>답변하러가기</CounselButton>
        </Counsel>
      </CounselList>
    </>
  );
}

// 메인 설명
const PetpitalTitle = styled.h1`
  color: #ffffff;
  font-weight: 700;
  font-size: 28px;
  line-height: 34px;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;
const PetpitalSubTitle = styled.h2`
  font-weight: 400;
  font-size: 20px;
  line-height: 24px;
  color: #ffffff;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const Slider = styled.div`
  height: 500px;
  background-color: #798b9b; // 임시값
  padding-top: 100px;
  padding-left: 50px;
`;

// 리뷰쓰러가기 섹션
const WriteAReviewSection = styled.div`
  height: 200px;
  background-color: #798b9b; // 임시값
  margin: 150px 0 50px 0;
  padding: 50px 70px;
  font-weight: 700;
  font-size: 34px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;

// 리뷰 스타일
const ReviewList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(460px, 2fr));
  gap: 20px 24px;
`;

const Review = styled.div`
  background-color: #fafafa;
  border-radius: 5px;
  display: flex;
  width: 100%;
  height: 200px;
  position: relative;
`;

const ReviewImg = styled.img`
  width: 40%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px 0px 0px 4px;
`;

const ReviewDesc = styled.div`
  border-radius: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  border-radius: 0px 4px 4px 0px;
  color: #c5c5c5;
  margin: 11px 0 5px 0;
`;

const ReviewTitle = styled.h3`
  padding-top: 1px;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: 17px;
  font-style: normal;
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
  word-break: break-all;
`;

const PetpitalInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const PetpitalAddress = styled.div`
  font-weight: 600;
  font-size: 10px;
  line-height: 19px;
`;

const PetpitalAddressName = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
`;

const ReviewInfo = styled.div`
  display: flex;
  margin-left: 8px;
  margin-right: 30px;
  flex-direction: column;
  width: 60%;
`;

const PetpitalPrice = styled.div`
  margin-top: 8px;
  position: absolute;
  bottom: 18px;
`;

const PetpitalLowPrice = styled.span`
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #65d8df;
  margin-right: 8px;
  &::before {
    content: "진료비 최저 ";
    color: #fff;
  }
`;

const PetpitalHighPrice = styled.span`
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #65d8df;
  &::before {
    content: "진료비 최대 ";
    color: #fff;
  }
`;

// 고민 상담 스타일
export const CounselList = styled.div`
  margin-bottom: 180px;
  display: flex;
  gap: 12px;
`;

export const CounselTitle = styled.h3`
  margin-bottom: 50px;
  display: flex;
  font-size: 14px;
  &::before {
    content: "Q";
    color: #c5c5c5;
    font-size: 47px;
    margin: 0 10px 0 30px;
  }
`;

export const Counsel = styled.div`
  background-color: #fafafa;
  width: 350px;
  height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 4px 4px 0px 0px;
  box-shadow: 0px 4px 0px rgba(0, 0, 0, 0.25);
`;

export const CounselButton = styled.button`
  background: #65d8df;
  padding: 12px 8px;
  gap: 8px;
  color: white;
  border: none;
  border-radius: 0px 0px 4px 4px;
`;

// 리뷰 많은 병원

const BestPetpitalContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 5fr));
  gap: 20px 24px;
`;

const BestPetpital = styled.div`
  border-radius: 5px;
  display: flex;
  width: 100%;
  height: 240px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.1));
`;

const BestPetpitalImg = styled.img`
  height: 150px;
  width: 100%;
  object-fit: cover;
  border-radius: 4px 0px 0px 4px;
`;

const BestPetpitalPrice = styled.span`
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #65d8df;
  margin: 16px auto;

  &::before {
    content: "진료비 ";
    color: #fff;
  }
`;

const BestPetpitalInfo = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0 20px;
`;

const BestPetpitalAddress = styled.div`
  font-weight: 600;
  font-size: 10px;
  line-height: 19px;
`;

const BestPetpitalAddressName = styled.div`
  font-weight: 600;
  font-size: 16px;
  line-height: 19px;
`;

// 커스텀
const MainCustomButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid #ffffff;
  backdrop-filter: blur(20px);
  border-radius: 999px;
  height: 32px;
`;

const SectionTitle = styled.h3`
  margin-top: 150px;
`;

const SectionSubTitle = styled.div`
  margin-bottom: 24px;
`;
