import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styled from "@emotion/styled";
import { useQuery } from "react-query";
import { FiEdit3 } from "react-icons/fi";

const Container = styled.div`
  width: 1200px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const PostBox = styled.div`
  /* width: 300px;
  height: 300px; */
  /* background-color: red; */
  margin-top: 50px;
`;
const TitleBox = styled.div`
  /* background-color: red; */
  font-weight: bold;
`;

const ContentsBox = styled.div`
  width: 100%;
  height: 100%;
`;

const InformationBox = styled.div`
  /* background-color: blue; */
  width: 300px;
  height: 100px;
`;

const PostHeader = styled.div`
  height: 50px;
  width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30px;
  /* background-color: purple; */
`;

const RatingBox = styled.div`
  display: flex;
  flex-direction: row;
`;

const PhotoBox = styled.img`
  width: 200px;
  height: 200px;
`;

const ReviewTagWrap = styled.div`
  display: flex;
  flex-direction: row;
`;

const ReviewTag = styled.div`
  width: 130px;
  height: 22px;
  border: 1px solid black;
  background-color: gray;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
`;
const CreatePostBtn = styled.button`
  position: fixed;
  bottom: 30px;
  right: 20px;

  display: flex;
  justify-content: center;
  align-items: center;

  width: 50px;
  height: 50px;

  border-radius: 100%;

  background-color: #3e46d1;
  color: #fff;

  transition-duration: 0.3s;
  cursor: pointer;
  :hover {
    background-color: #eee;
    color: #3e46d1;
    box-shadow: 3px 3px 5px #aaa;
  }
`;

function posts() {
  const { query } = useRouter();
  const id = typeof query.id === "string" ? query.id : "";
  const router = useRouter();
  console.log("router", id);
  const {
    data: post,
    isLoading: postLoading,
    refetch: refetchPost,
  } = useQuery(["posts", id], async () => {
    const response = await axios.get(`http://localhost:5000/posts/${id}`);
    return response.data.reverse();
  });
  console.log("post", post);
  if (postLoading || !post) {
    return <div>Loading...</div>;
  }

  const Star = () => (
    <div
      style={{
        color: "#ffc107",
      }}
    >
      <span style={{ fontSize: "20px" }}>&#9733;</span>
    </div>
  );

  const goCreatePost = () => {
    router.push(`/posts/createPost`);
  };
  console.log("posts", post[3].selectedColors);
  return (
    <Container>
      <InformationBox>병원정보</InformationBox>
      {post.map((p) => (
        <div key={p.id}>
          <PostHeader>
            <div>프로필사진&닉네임</div>
            <RatingBox>
              <Star />
              {p.rating}/5
            </RatingBox>
          </PostHeader>
          <PostBox>
            <PhotoBox src={p.downloadUrl} alt="게시글 이미지" />
            <TitleBox>{p.title}</TitleBox>
            <ContentsBox>{p.contents}</ContentsBox>

            <ReviewTagWrap>
              {p.selectedColors.map((color) => (
                <ReviewTag key={color}>{color}</ReviewTag>
              ))}
            </ReviewTagWrap>
          </PostBox>
        </div>
      ))}
      <CreatePostBtn onClick={goCreatePost}>
        <FiEdit3 />
      </CreatePostBtn>
    </Container>
  );
}

export default posts;
