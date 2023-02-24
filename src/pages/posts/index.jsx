import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import styled from "@emotion/styled";
import { useMutation, useQuery } from "react-query";
import { FiEdit3 } from "react-icons/fi";
import { authService } from "../../firebase/firebase";
import { FaStar } from "react-icons/fa";
import { currentUserUid } from "../../share/atom";
import { useRecoilValue } from "recoil";
import CreateAddModal from "../../components/custom/CreateAddModal";
import CreatePost from "../../components/CreatePost";
import EditPost from "../../components/EditPost";
import { hospitalData } from "../../share/atom";

const Container = styled.div`
  width: 1200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  /* background-color: red; */
`;

const InfoContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
`;

const InformationBox = styled.div`
  /* background-color: blue; */
  width: 300px;
  height: 100px;
  display: flex;
  justify-content: center;
`;

const InfoContentsWrap = styled.div`
  display: flex;
  flex-direction: column;
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
  const [editTitle, setEditTitle] = useState("");
  const [editContents, setEditContents] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [postEdit, setPostEdit] = useState(false);
  const [hospitalId, setHospitalId] = useState("");
  const [userId, setUserId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [date, setDate] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [postId, setPostId] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [page, setPage] = useState(1);

  const placesData = useRecoilValue(hospitalData);

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
    isFetching,
  } = useQuery(
    ["posts", page],
    async (key, page) => {
      const response = await axios.get(
        `https://humble-summer-ballcap.glitch.me/posts?page=${page}&limit=10`,
      );
      return response.data.reverse();
    },
    {
      getNextPageParam: (lastPage, allPages) => {
        if (lastPage.length === 0) return undefined; // 마지막 페이지를 로드한 경우
        return allPages.length + 1; // 다음 페이지 번호
      },
    },
  );

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => prevPage - 1);
  };
  // 게시글 업데이트
  const { mutate: updateMutate } = useMutation(
    (data) =>
      axios
        .put(`https://humble-summer-ballcap.glitch.me/posts/${data.id}`, data)
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
    hospitalId,
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
      hospitalId,
    });
    refetchPost();
  };

  useEffect(() => {
    const container = document.getElementById("myMap");
    const options = {
      center: new window.kakao.maps.LatLng(37.506502, 127.053617),
      level: 3,
    };
    const map = new window.kakao.maps.Map(container, options);
  }, []);

  // 게시글 삭제
  const { mutate: deleteMutate } = useMutation(
    (id) =>
      axios
        .delete(`https://humble-summer-ballcap.glitch.me/posts/${id}`)
        .then((res) => res.data),
    {
      onSuccess: () => {
        refetchPost();
      },
    },
  );

  const handleDelete = async (id) => {
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
  const CloseCreatePost = () => {
    localStorage.removeItem("Photo");
    setIsEdit(false);
  };

  const goToEditPost = (id, downloadUrl) => {
    setPostId(id);
    setPostEdit(true);
  };

  // 함수 호출부분에서 매개변수를 주고 함수 정의부분에서 매개변수를 받는다
  // props로 내려준 것들 ex)id 같은것들은 따로 매개변수에 넣지않고 사용
  // 매개변수는 순서가 중요하다!!!!!

  const CloseEditPost = () => {
    localStorage.removeItem("Photo");
    setPostEdit(false);
  };

  console.log("placesData", placesData);

  return (
    <Container>
      {postEdit && (
        <CreateAddModal width="100%" height="100%">
          <EditPost
            setPostEdit={setPostEdit}
            refetchPost={refetchPost}
            id={postId}
            downloadUrl={photoUrl}
          />
          <button onClick={CloseEditPost}>close</button>
        </CreateAddModal>
      )}
      {isEdit && (
        <CreateAddModal width="100%" height="100%">
          <CreatePost
            setIsEdit={setIsEdit}
            isEdit={isEdit}
            refetchPost={refetchPost}
          />
          <button onClick={CloseCreatePost}>close</button>
        </CreateAddModal>
      )}
      <div id="myMap" style={{ width: "500px", height: "400px" }}></div>
      <InfoContainer>
        <InformationBox>
          <div>
            <h3>{placesData.place_name}</h3>
            <InfoContentsWrap>
              <span>{placesData.address_name}</span>
              <span>{placesData.phone}</span>
            </InfoContentsWrap>
            <p></p>
          </div>
        </InformationBox>
      </InfoContainer>
      {post
        .filter((f) => f.hospitalId === placesData.id)
        .map((p) => (
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
                  <>
                    <button
                      onClick={() => {
                        handleDelete(p.id);
                      }}
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => {
                        goToEditPost(p.id, p.downloadUrl);
                      }}
                    >
                      수정
                    </button>
                  </>
                ) : (
                  ""
                )}
              </BottomBox>
            </PostBox>
          </PostWrap>
        ))}
      <div>
        <button onClick={handlePreviousPage} disabled={page === 1}>
          이전 페이지
        </button>
        <button onClick={handleNextPage} disabled={!post || !post.length}>
          다음 페이지
        </button>
      </div>
      <CreatePostBtn onClick={goCreatePost}>
        <FiEdit3 />
      </CreatePostBtn>
    </Container>
  );
}

export default Posts;
