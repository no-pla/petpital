import { useGetReviews } from "../hooks/useGetReviews";
import {
  Counsel,
  CounselTitle,
  CounselButton,
  PageButtonContainer,
  PageButton,
} from "./petconsult";
import styled from "@emotion/styled";
import { useGetPetConsult } from "../hooks/usePetsult";
import { useRouter } from "next/router";
import { useGetMainHospital } from "../components/api/getMainHosiptal";
import { useEffect, useState } from "react";
import { HeaderTitle } from "../components/custom/CustomHeader";
import axios from "axios";
import { MainBannerContiner } from "../components/MainBanner";
import { authService } from "../firebase/firebase";

export default function Home() {
  const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;
  const router = useRouter();
  const { recentlyReview, isLoading: isLoadingReviews } = useGetReviews(
    "?_sort=createdAt&_order=desc&_limit=6",
  );
  const { isLoadingPetConsult, petConsult } = useGetPetConsult({
    limit: "&_limit=3",
  });

  const [page, setPage] = useState(1);
  const [hospitaList, setHospitalList] = useState<string[]>([]);
  const [hospitaListImage, setHospitalImageList] = useState<string[]>([]);
  const { data: mainPetpial, refetch } = useGetMainHospital(page);

  useEffect(() => {
    // 메인 사진을 불러오기 위해 배열에 병원 이름을 저장합니다.
    // 지역명 + 병원 이름이 담긴 배열을 만든다.
    const tempArray: any[] = [];
    const newArray: string[] = [];

    if (mainPetpial?.documents) {
      mainPetpial?.documents.map((place: any) => {
        const temp =
          place.address_name.split(" ")[0] +
          " " +
          place.address_name.split(" ")[1] +
          " " +
          place.place_name;
        tempArray.push(temp);
      });

      tempArray.forEach((hospital: string) => {
        axios
          .get(
            `https://dapi.kakao.com/v2/search/image?sort=accuracy&size=1&query=${hospital}`,
            {
              headers: {
                Authorization: `KakaoAK ${KAKAO_API_KEY}`,
              },
            },
          )
          .then((res) => {
            const link =
              res?.data.documents[0]?.thumbnail_url === undefined
                ? "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2Fno_image_info.svg?alt=media&token=c770159e-01d1-443e-89d9-0e14dea7ebdd"
                : res?.data.documents[0]?.thumbnail_url;
            setHospitalImageList((prev) => [...prev, link]);
          });
      });
    }
    // 첫 랜더링 메인 병원리스트, 페이지가 될 때마다 리랜더링
  }, [mainPetpial, page, KAKAO_API_KEY, hospitaList]);

  const previousPage = () => {
    const emptyArray: string[] = [];
    setHospitalImageList(emptyArray);
    setPage((prev) => prev - 1);
  };

  const nextPage = () => {
    const emptyArray: string[] = [];
    setHospitalImageList(emptyArray);
    setPage((prev) => prev + 1);
  };

  return (
    <>
      <MainBannerContiner backgroundImg="https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FRectangle%201.png?alt=media&token=80384910-8ef9-456e-8e2f-cb548d67e263">
        <MainBanner>
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
          <MainCustomButton onClick={() => router.push("/searchMap")}>
            병원검색 하러가기
          </MainCustomButton>
        </MainBanner>
      </MainBannerContiner>
      <Section>
        <SectionTitle>아주 만족했던 병원이었개!🐶</SectionTitle>
        <SectionSubTitle>
          육각형 병원 여기 다 모여 있다냥 확인해보라냥🐱
        </SectionSubTitle>
        <PageButtonContainer
          style={{ justifyContent: "right", marginBottom: "50px" }}
        >
          <PageButton disabled={page === 1} onClick={previousPage}>
            &larr;
          </PageButton>
          <PageButton
            disabled={mainPetpial?.meta.is_end === true}
            onClick={nextPage}
          >
            &rarr;
          </PageButton>
        </PageButtonContainer>
        <BestPetpitalContainer>
          {mainPetpial?.documents.map((petpital: any, index: number) => {
            return (
              <BestPetpitalItem
                key={petpital.id}
                // onClick={() =>
                //   router.push({
                //     pathname: "/searchMap",
                //     query: { target: petpital.place_name },
                //   })
                // }
              >
                <BestPetpitalImage
                  ImgSrc={
                    hospitaListImage[index] === undefined
                      ? "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2Fno_image_info.svg?alt=media&token=c770159e-01d1-443e-89d9-0e14dea7ebdd"
                      : hospitaListImage[index]
                  }
                  loading="eager"
                />
                <BestPetpitalName>
                  {petpital.place_name.length > 12
                    ? petpital.place_name.slice(0, 12) + "..."
                    : petpital.place_name}
                </BestPetpitalName>
                <BestPetpitalAddress>
                  {petpital.road_address_name === ""
                    ? "정보 없음"
                    : petpital.road_address_name === undefined
                    ? ""
                    : petpital.road_address_name.split(" ")[0] +
                      " " +
                      petpital.road_address_name.split(" ")[1]}
                </BestPetpitalAddress>
                <BestPetpitalCost>
                  {petpital.phone || "정보 없음"}
                </BestPetpitalCost>
              </BestPetpitalItem>
            );
          })}
        </BestPetpitalContainer>
      </Section>
      <ReviewBanner
        backgroundMinImg="
      https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2Fapp_banner.jpg?alt=media&token=1622f93e-970b-4a9d-a521-ada6094668fb"
        backgroundImg="https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2Freview_banner.jpg?alt=media&token=aa4b416c-5b37-4ca1-afae-9b040631d396"
      />
      <Section>
        <SectionTitle>내가 한번 가봤다냥</SectionTitle>
        <CurrentReivewContainer>
          {recentlyReview?.data.map((review) => {
            return (
              <CurrentReview
                // onClick={() => router.push("/searchMap")}
                key={review.id}
              >
                <CurrentImageContainer>
                  <CurrentReviewImage src={review.downloadUrl} />
                </CurrentImageContainer>
                <CurrentReviewComment>
                  <CurrentReviewTitle>{review.title}</CurrentReviewTitle>
                  <CurrentReviewPetpitalDesc>
                    <CurrentReviewPetpitalName>
                      {review.hospitalName}
                    </CurrentReviewPetpitalName>
                    <CurrentReviewPetpitalAddress>
                      {/* {review?.hospitalAddress.split(" ")[0] +
                        " " +
                        review?.hospitalAddress.split(" ")[1]} */}
                    </CurrentReviewPetpitalAddress>
                  </CurrentReviewPetpitalDesc>
                  <CurrentReviewDesc>{review.contents}</CurrentReviewDesc>
                  <CurrentReviewCost>
                    {Number(review.totalCost).toLocaleString("ko-KR")}
                  </CurrentReviewCost>
                </CurrentReviewComment>
              </CurrentReview>
            );
          })}
        </CurrentReivewContainer>
      </Section>
      <Section>
        <HeaderContainer>
          <HeaderTitle>고민있음 털어놔보개!</HeaderTitle>
          <div>
            <HeaderButton
              onClick={() =>
                authService.currentUser === null
                  ? router.push("/login")
                  : router.push("/petconsult/new")
              }
            >
              질문하기
            </HeaderButton>
            <HeaderButton onClick={() => router.push("/petconsult")}>
              전체보기
            </HeaderButton>
          </div>
        </HeaderContainer>
        <CounselList>
          {!isLoadingPetConsult &&
            petConsult?.data.map((counsel) => (
              <Counsel key={counsel.id}>
                <CounselTitle>{counsel.content}</CounselTitle>
                <CounselButton
                  onClick={() => router.push(`petconsult/${counsel.id}`)}
                >
                  답변하러가기
                </CounselButton>
              </Counsel>
            ))}
        </CounselList>
      </Section>
    </>
  );
}

// 배너
const MainBanner = styled.div`
  padding-top: 50px;
  padding-left: 50px;
`;

const ReviewBanner = styled.div<{
  backgroundImg: string;
  backgroundMinImg: string;
}>`
  background-image: url(${(props) => props.backgroundImg});
  background-size: 100% auto;
  background-repeat: no-repeat;
  background-position: center;
  object-fit: cover;
  height: calc(min(40vh, 200px));

  @media screen and (max-width: 550px) {
    background-image: url(${(props) => props.backgroundMinImg});
    height: calc(min(30vh, 400px));
    width: 100vw;
    object-fit: cover;
    margin-top: 80px;
  }
`;

// 최근 검색 병원
const BestPetpitalContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 190px);
  gap: 20px 24px;
  padding-bottom: 20px;
  @media screen and (max-width: 1200px) {
    overflow-x: scroll;
  }
`;

const BestPetpitalItem = styled.div`
  width: calc(max(100%, 140px));
  border-radius: 4px;
  box-shadow: 0px 4px 4px 0px #0000001a;
  @media screen and (max-width: 800px) {
    grid-template-columns: repeat(5, 200px);
  }
`;

const BestPetpitalImage = styled.img<{ ImgSrc: string }>`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px 4px 0 0;
  background-image: url(${(props) => props.ImgSrc});
  background-position: center;
`;

const BestPetpitalName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  padding: 0 6px 6px 6px;
  border-bottom: 0.4px solid #e4e4e4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
const BestPetpitalAddress = styled.div`
  padding: 6px;
  font-weight: 300;
  font-size: 0.8rem;
`;
const BestPetpitalCost = styled.div`
  padding: 6px;
  font-size: 1rem;
  border-radius: 0 0 4px 4px;
  color: #15b5bf;
  font-weight: 600;
  background-color: #afe5e9;
  height: 30px;
`;

// 메인 리뷰
const CurrentReivewContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 24px;
  padding: 10px 0;
  @media screen and (max-width: 800px) {
    overflow-x: scroll;
    grid-template-columns: repeat(2, 375px);
  }
`;

const CurrentReview = styled.div`
  display: flex;
  background-color: #fafafa;
  border-radius: 4px;
  height: 180px;
`;

const CurrentImageContainer = styled.div`
  width: 220px;
`;

const CurrentReviewImage = styled.img`
  width: 220px;
  height: 100%;
  object-fit: cover;
  border-radius: 4px 0px 0px 4px;
`;

const CurrentReviewComment = styled.div`
  padding: 15px 8px;
  position: relative;
`;

const CurrentReviewTitle = styled.div`
  font-weight: 600;
  -webkit-box-orient: vertical;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 220px;
`;

const CurrentReviewPetpitalDesc = styled.div`
  display: flex;
  align-items: center;
  gap: 0 15px;
  margin: 9px 0;
`;

const CurrentReviewPetpitalName = styled.div`
  color: #9f9f9f;
  font-weight: 400;
  font-size: 14px;
`;

const CurrentReviewPetpitalAddress = styled.div`
  font-weight: 300;
  font-size: 12px;
`;

const CurrentReviewDesc = styled.div`
  font-weight: 300;
  font-size: 14px;
  color: #c5c5c5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CurrentReviewCost = styled.div`
  margin-top: 6px;
  position: absolute;
  bottom: 10px;
`;

// 메인 설명
const PetpitalTitle = styled.h1`
  color: #ffffff;
  font-weight: 700;
  font-size: 2rem;
  line-height: 34px;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const PetpitalSubTitle = styled.h2`
  font-weight: 400;
  font-size: 1.2rem;
  line-height: 24px;
  color: #ffffff;
  text-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;

const CounselList = styled.div`
  margin-bottom: 180px;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
  @media screen and (max-width: 820px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const HeaderContainer = styled.header`
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  & button:nth-of-type(1) {
    font-size: 0.8rem;
    color: #15b5bf;
  }
  & button:nth-of-type(2) {
    font-size: 0.8rem;
    color: #c5c5c5;
  }
  @media screen and (max-width: 375px) {
    & div {
      display: flex;
      flex-direction: column;
      text-align: right;
    }
  }
`;

// 커스텀
const Section = styled.section`
  width: 100%;
  padding: 0 60px;
`;

export const MainCustomButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid #ffffff;
  backdrop-filter: blur(20px);
  border-radius: 999px;
  height: 32px;
  color: white;
  cursor: pointer;
`;

const SectionTitle = styled.h3`
  margin-top: 100px;
`;

const SectionSubTitle = styled.div`
  margin-bottom: 24px;
  color: #c5c5c5;
`;

export const HeaderButton = styled.button`
  cursor: pointer;
  border: none;
  font-weight: 700;
  background-color: transparent;
  @media screen and (min-width: 376px) {
    font-size: 1rem;
    padding: 8px;
    border-radius: 20px;
    color: #15b5bf;
    background-color: transparent;
    transition: background-color 0.2s ease-in;
    &:hover {
      background: rgba(101, 216, 223, 0.3);
    }
  }
`;
