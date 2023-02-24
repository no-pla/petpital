import { useGetReviews } from "../../hooks/useGetReviews";
import React from "react";
import styled from "@emotion/styled";
import { authService } from "../../firebase/firebase";
import { useRouter } from "next/router";

const Review = () => {
  const { recentlyReview, isLoading } = useGetReviews(
    "?_sort=createdAt&_order=desc",
  );

  const router = useRouter();

  const myId = authService.currentUser?.uid;

  return (
    <div>
      {isLoading
        ? "로딩중"
        : recentlyReview?.data
            .filter((review) => myId === review.userId)
            .map((review: any) => (
              <ReviewContainer key={review.userId}>
                <ReviewBox onClick={() => router.push(`posts/`)}>
                  <ReviewId>
                    <ReviewImg src={review.downloadUrl} alt="" />
                    <ReviewInfo>
                      <ReviewTitle>{review.title}</ReviewTitle>
                      <PetpitalInfo>
                        <PetpitalAddressName>
                          {review.hospitalName}
                        </PetpitalAddressName>
                        <PetpitalAddress>
                          {review.hospitalAddress}
                        </PetpitalAddress>
                      </PetpitalInfo>
                      <ReviewDesc>{review.contents}</ReviewDesc>
                      {/* <div>별점 : {review.rating} / 5</div> */}
                      <PetpitalPrice>
                        <PetpitalHighPrice>
                          {review.totalCost}
                        </PetpitalHighPrice>
                      </PetpitalPrice>
                      {/* {review.selectedColors.map((e)=> (<div>{e}</div>))} */}
                    </ReviewInfo>
                  </ReviewId>
                </ReviewBox>
              </ReviewContainer>
            ))}
    </div>
  );
};

export default Review;

// 리뷰 스타일

const ReviewContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const ReviewBox = styled.div`
  margin-top: 50px;
  width: 80%;
  border: 1px solid;
  background-color: #fafafa;
  display: flex;
  flex-direction: column;
  border-radius: 4px;
  box-shadow: 0px 4px 0px rgba(0, 0, 0, 0.25);
  cursor: pointer;
`;

const ReviewList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(460px, 2fr));
  gap: 20px 24px;
`;

const ReviewId = styled.div`
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
  font-weight: 600;
  font-size: 1.4rem;
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
  font-size: 0.8rem;
  line-height: 19px;
`;

const PetpitalAddressName = styled.div`
  font-weight: 600;
  font-size: 1.2rem;
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
