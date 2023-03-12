import { REVIEW_SERVER } from "../../share/server";
import styled from "@emotion/styled";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";

export const CounselItem = ({ counsel, index, page }: any) => {
  const router = useRouter();
  const [commentList, setCommentList] = useState<string[][]>([]);
  const { data: petConsult, isLoading } = useQuery(
    ["pagnationCounsel", page],
    () => {
      // console.log("pagnationCounsel");
      return axios.get(
        `${REVIEW_SERVER}qna?_sort=createdAt&_order=desc&limit=10&_page=${page}`,
      );
    },
    {
      select: (data) => data?.data,
    },
  );

  useEffect(() => {
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
  }, [page, petConsult]);

  const onClick = (id: string) => {
    router.push(`petconsult/${id}`, undefined, { shallow: true });
  };

  return (
    <Counsel key={counsel.id}>
      <CounselTitle>{counsel.content}</CounselTitle>
      <CurrentReviewContainer>
        {commentList[index]?.length > 0 &&
          commentList[index]?.map((comment: any) => {
            return (
              <CurrentReview key={comment.content}>
                <CurrentReviewNickname>
                  {comment.nickname}
                </CurrentReviewNickname>
                <CurrentReviewContent>{comment.content}</CurrentReviewContent>
              </CurrentReview>
            );
          })}
      </CurrentReviewContainer>
      <CounselButton onClick={() => onClick(counsel.id)}>
        답변하러가기
      </CounselButton>
    </Counsel>
  );
};

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

export const CounselTitle = styled.div`
  margin-bottom: 50px;
  display: flex;
  font-size: 1.1rem;
  margin-top: 12px;
  padding-right: 8px;
  &::before {
    content: "Q";
    color: #c5c5c5;
    font-size: 47px;
    margin: 0 10px 0 15px;
  }
`;

export const Counsel = styled.div`
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-radius: 4px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
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
const CurrentReviewContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-start;
  padding: 0 8px;
  border-top: 1px solid #e4e4e4;
  height: 80px;
`;
const CurrentReview = styled.div`
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

const CurrentReviewNickname = styled.span`
  font-weight: 600;
  padding-right: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CurrentReviewContent = styled.div`
  padding-top: 4px;
`;
