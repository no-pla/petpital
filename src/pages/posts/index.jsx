import React, { useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styled from "@emotion/styled";
import { useMutation, useQuery } from "react-query";
import { FiEdit3 } from "react-icons/fi";
import { authService } from "../../firebase/firebase";
import { FaStar } from "react-icons/fa";
import { currentUserUid } from "../../share/atom";
import { useRecoilValue } from "recoil";
import useUpdatePost from "../../hooks/usePost";
import CreatePostModal from "../../components/custom/CreatePostModal";

const Container = styled.div`
  width: 1200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* background-color: red; */
`;

const InformationBox = styled.div`
  /* background-color: blue; */
  width: 300px;
  height: 100px;
`;

const PostWrap = styled.div`
  /* background-color: blue; */
  margin-bottom: 10px;
  border: 1px solid black;
  padding: 40px;
`;

const PostHeader = styled.div`
  height: 50px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* background-color: purple; */
`;

const ProfileBox = styled.div`
  display: flex;
  flex-direction: row;
  font-size: 30px;
  align-items: center;
`;

const RatingBox = styled.div`
  display: flex;
  flex-direction: row;
`;

const PostBox = styled.div`
  /* width: 300px;
  height: 300px; */
  /* background-color: red; */
  margin-top: 50px;
`;

const PhotoText = styled.div`
  display: flex;
  /* background-color: pink; */
`;

const PhotoBox = styled.img`
  width: 200px;
  height: 200px;
`;

const TextBox = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 20px;
`;
const TitleBox = styled.div`
  /* background-color: red; */
  font-weight: bold;
`;

const ContentsBox = styled.div`
  width: 100%;
  height: 100%;
`;

const ReviewTagWrap = styled.div`
  display: flex;
  flex-direction: row;
`;

const ReviewTagFirst = styled.div`
  width: 130px;
  height: 28px;
  background-color: #00b8d9;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

const ReviewTagSecond = styled.div`
  width: 130px;
  height: 28px;
  background-color: #0052cc;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;
const ReviewTagThird = styled.div`
  width: 130px;
  height: 28px;
  background-color: #5243aa;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

const ReviewTagFourth = styled.div`
  width: 130px;
  height: 28px;
  background-color: #ff5630;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;
const ReviewTagFifth = styled.div`
  width: 130px;
  height: 28px;
  background-color: #ff8b00;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
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

const BottomBox = styled.div`
  display: flex;
  justify-content: space-between;
`;

function Posts() {
  const [totalRating, setTotalRating] = useState(0);
  const [numRatings, setNumRatings] = useState(0);
  const [editTitle, setEditTitle] = useState("");
  const [editContents, setEditContents] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  // const { query } = useRouter();

  // const id = typeof query.id === "string" ? query.id : "";

  const router = useRouter();
  // const id = "";

  const userUid = useRecoilValue(currentUserUid);

  // 로그인시 uid 로컬스토리지에 저장한것 get

  // typeof window !== "undefined"
  //   ? JSON.parse(localStorage.getItem("currentuser.uid"))
  //   : "null";
  // console.log("authuid", userUid);

  // let userUid = authService.currentUser?.uid;

  // 게시글 불러오기
  const {
    data: post,
    isLoading: postLoading,
    refetch: refetchPost,
  } = useQuery("posts", async () => {
    const response = await axios.get(`http://localhost:5000/posts`);
    return response.data.reverse();
  });

  // 게시글 업데이트
  const { mutate: updateMutate } = useMutation(
    (data) =>
      axios
        .put(`http://localhost:5000/posts/${data.id}`, data)
        .then((res) => res.data),
    {
      onSuccess: () => {
        setEditTitle("");
        setEditContents("");
        refetchPost();
      },
    },
  );

  const handleEditSubmit = async (
    e,
    id,
    downloadUrl,
    selectedColors,
    rating,
    totalCost,
    isEdit,
    profileImage,
    date,
    displayName,
    userId,
  ) => {
    e.preventDefault();
    updateMutate({
      id,
      title: editTitle,
      contents: editContents,
      downloadUrl,
      selectedColors,
      rating,
      totalCost,
      isEdit,
      profileImage,
      date,
      displayName,
      userId,
    });
    refetchPost();
  };

  // 게시글 삭제
  const { mutate: deleteMutate } = useMutation(
    (id) =>
      axios.delete(`http://localhost:5000/posts/${id}`).then((res) => res.data),
    {
      onSuccess: () => {
        refetchPost();
      },
    },
  );

  const handleDelete = async (id) => {
    console.log("id", id);
    deleteMutate(id);
  };

  if (postLoading || !post) {
    return <div>Loading...</div>;
  }

  const goCreatePost = () => {
    router.push(`/posts/createPost`);
    // router.push("/posts/ModalAddPost");
    // setIsEdit(true);
  };
  console.log("post", post);

  return (
    <Container>
      {isEdit ? <CreatePostModal></CreatePostModal> : "null"}
      <InformationBox>병원정보</InformationBox>
      {post.map((p) => (
        <PostWrap key={p.id}>
          <PostHeader>
            <ProfileBox>
              <img
                src={
                  p.profileImage
                    ? p.profileImage
                    : "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
                }
                width={70}
                height={70}
              ></img>
              <div>{p.displayName}</div>
            </ProfileBox>
            <RatingBox>
              총 진료비:{p.totalCost}
              <FaStar size="20" color="#ffc107" />
              {p.rating}/5
            </RatingBox>
          </PostHeader>
          <PostBox>
            <PhotoText>
              <PhotoBox src={p.downloadUrl} alt="게시글 이미지" />
              <TextBox>
                <TitleBox>{p.title}</TitleBox>
                <ContentsBox>{p.contents}</ContentsBox>
                <ReviewTagWrap>
                  {p.selectedColors?.map((color) => {
                    if (color === "깨끗해요") {
                      return (
                        <ReviewTagFirst key={color}>{color}</ReviewTagFirst>
                      );
                    } else if (color === "시설이좋아요") {
                      return (
                        <ReviewTagSecond key={color}>{color}</ReviewTagSecond>
                      );
                    } else if (color === "친절해요") {
                      return (
                        <ReviewTagThird key={color}>{color}</ReviewTagThird>
                      );
                    } else if (color === "꼼꼼해요") {
                      return (
                        <ReviewTagFourth key={color}>{color}</ReviewTagFourth>
                      );
                    } else if (color === "저렴해요") {
                      return (
                        <ReviewTagFifth key={color}>{color}</ReviewTagFifth>
                      );
                    }
                  })}
                </ReviewTagWrap>
              </TextBox>
            </PhotoText>
            <BottomBox>
              <div>{p.date}</div>
              {userUid === p.userId ? (
                <button
                  onClick={() => {
                    handleDelete(p.id);
                  }}
                >
                  삭제
                </button>
              ) : (
                ""
              )}
              <form
                onSubmit={(e) => {
                  handleEditSubmit(
                    e,
                    p.id,
                    p.downloadUrl,
                    p.selectedColors,
                    p.rating,
                    p.totalCost,
                    p.isEdit,
                    p.profileImage,
                    p.date,
                    p.displayName,
                    p.userId,
                  );
                }}
              >
                <input
                  type="text"
                  placeholder="Title"
                  // value={p.title}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Contents"
                  // value={p.contents}
                  onChange={(e) => setEditContents(e.target.value)}
                />
                <button type="submit">Update</button>
              </form>
            </BottomBox>
          </PostBox>
        </PostWrap>
      ))}
      <CreatePostBtn onClick={goCreatePost}>
        <FiEdit3 />
      </CreatePostBtn>
    </Container>
  );
}

export default Posts;
