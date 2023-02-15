import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { colourOptions, colourStyles } from "../../components/Select";
import Select from "react-select";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";
import { auth } from "firebase/auth";
import { authService, storageService } from "../../firebase/firebase";

const Container = styled.div``;
const FormWrap = styled.form`
  /* display: flex; */
  /* flex-direction: column; */
  align-items: center;
  padding: 150px;
`;

const ImageBox = styled.label`
  display: flex;
  justify-content: center;
  border-radius: 100%;
  overflow: hidden;
  cursor: pointer;
  width: 250px;
  height: 250px;
  margin: auto;
  > img {
    width: 100%;
    height: 100%;
    text-align: center;
    object-fit: cover;
  }
`;

const PostImage = styled.img`
  border-radius: 100%;
  object-fit: cover;
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 60px;
  margin-bottom: 30px;
`;

const TitleBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
`;

const ContentBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
`;

const TotalCostBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
`;

const CreatePostButton = styled.button`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: none;
  background-color: lightgray;
  cursor: pointer;
  float: right;
`;
const StarRating = styled.div`
  display: flex;
  flex-direction: row;
  cursor: pointer;
  margin-bottom: 30px;
`;

const PostSelect = styled.div`
  margin-bottom: 30px;
`;

const NewPost = () => {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const [totalCost, setTotalCost] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [selectvalue, setSelectValue] = useState([]);

  const router = useRouter();

  // 별점 만들기
  const starArray = Array.from({ length: 5 }, (_, i) => i + 1);

  const Star = ({ selected, onClick }) => (
    <div
      style={{
        color: selected ? "#ffc107" : "#e4e5e9",
      }}
      onClick={onClick}
    >
      <span style={{ fontSize: "40px" }}>&#9733;</span>
    </div>
  );

  // DB에 저장
  const handleSubmit = async (downloadUrl) => {
    // event.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/posts", {
        title,
        contents,
        totalCost,
        rating: starRating,
        selectedColors: selectvalue.map((option) => option.value), // 선택된 value값만
        downloadUrl,
      });
      console.log("response", response);
      localStorage.removeItem("newProfilePhoto");
      router.push(`/posts`);
    } catch (error) {
      console.error(error);
    }
  };

  // 이미지 업로드(이미지를 로컬에 임시 저장)
  const uploadPhoto = async (event) => {
    // event.preventDefault();
    try {
      const theFile = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(theFile); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.

      reader.onloadend = (finishedEvent) => {
        // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
        const contentimgDataUrl = finishedEvent.currentTarget.result;
        localStorage.setItem("newProfilePhoto", contentimgDataUrl);
        document.getElementById("preview-photo").src = contentimgDataUrl; //useref 사용해서 DOM에 직접 접근 하지 말기
      };
    } catch (error) {
      console.error(error);
    }
  };

  const ChangePhoto = async (event) => {
    event.preventDefault();
    // 변경할 이미지를 올리면 데이터 url로 로컬 스토리지에 임시 저장이 되는데
    // 그 값 가져와서 firestore에 업로드
    try {
      let newPhoto = localStorage.getItem("newProfilePhoto");
      const imgRef = ref(storageService, `${Date.now()}`);

      let downloadUrl;
      if (newPhoto) {
        const response = await uploadString(imgRef, newPhoto, "data_url");
        downloadUrl = await getDownloadURL(response.ref);
      }
      if (downloadUrl) {
        handleSubmit(downloadUrl);
      } else if (downloadUrl === undefined) {
        // 새로운 사진이 없으면 리턴
        alert("새로운 사진이없습니다");
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Container>
        <FormWrap onSubmit={ChangePhoto}>
          <ImageBox htmlFor="file">
            <PostImage
              id="preview-photo"
              src="https://media.istockphoto.com/id/1357365823/vector/default-image-icon-vector-missing-picture-page-for-website-design-or-mobile-app-no-photo.jpg?s=612x612&w=0&k=20&c=PM_optEhHBTZkuJQLlCjLz-v3zzxp-1mpNQZsdjrbns="
              alt="게시글사진"
            />
          </ImageBox>
          <input
            id="file"
            type="file"
            style={{ display: "none" }}
            accept="images/*"
            onChange={uploadPhoto}
          />
          <InputWrap>
            <label htmlFor="title">제목쓰기</label>
            <TitleBox
              type="text"
              placeholder="Title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              id="title"
              rows="1"
              maxLength="50"
            />
            <label htmlFor="title">글 작성</label>
            <ContentBox
              type="text"
              placeholder="Contents"
              value={contents}
              onChange={(event) => setContents(event.target.value)}
              rows="8"
              maxLength="500"
            />
            <label htmlFor="title">총 진료비</label>
            <TotalCostBox
              type="text"
              placeholder="TotalCost"
              value={totalCost}
              onChange={(event) => setTotalCost(event.target.value)}
              rows="3"
              maxLength="200"
            />
          </InputWrap>
          {/* <CreatePostButton type="submit">Create Post</CreatePostButton> */}
          <label htmlFor="title">별점남기기</label>
          <StarRating>
            {starArray.map((star) => (
              <Star
                key={star}
                selected={star <= starRating}
                onClick={() => setStarRating(star)}
              />
            ))}
          </StarRating>
          <label htmlFor="title">이 병원의 좋은점을 남겨주세요</label>
          <PostSelect>
            <Select
              value={selectvalue}
              onChange={(selectedOptions) => setSelectValue(selectedOptions)}
              closeMenuOnSelect={false}
              defaultValue={[colourOptions[0], colourOptions[1]]}
              isMulti
              options={colourOptions}
              styles={colourStyles}
              instanceId="selectbox"
            />
          </PostSelect>
          <CreatePostButton>리뷰남기기</CreatePostButton>
        </FormWrap>
      </Container>
    </>
  );
};

export default NewPost;
