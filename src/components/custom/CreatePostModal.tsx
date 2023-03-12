import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { colourOptions, colourStyles } from "../Select";
import Select from "react-select";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { authService, storageService } from "../../firebase/firebase";

import { hospitalData } from "../../share/atom";
import { REVIEW_SERVER } from "../../share/server";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { modalState } from "../../share/atom";
import { useGetReviews } from "../../hooks/useGetReviews";
import { useQueryClient } from "react-query";
import { GrClose } from "react-icons/gr";
import CustomModal, { ModalButton } from "./ErrorModal";
import shortUUID from "short-uuid";
const short = require("short-uuid");

type CreatePostModalProps = {
  setCreateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const CreatePostModal = ({ setCreateModalOpen }: CreatePostModalProps) => {
  const [title, setTitle] = useState<string>("");
  const [contents, setContents] = useState<string>("");
  const [totalCost, setTotalCost] = useState<string>("");
  const [starRating, setStarRating] = useState<any>(0);
  const [selectvalue, setSelectValue] = useState<
    { label: string; value: string }[]
  >([]);
  const [openModalTitle, setOpenModalTitle] = useState<boolean>(false);
  const [openModalContents, setOpenModalContents] = useState<boolean>(false);
  const [openModalTotalCost, setOpenModalTotalCost] = useState<boolean>(false);
  const [openModalStarRating, setOpenModalStarRating] =
    useState<boolean>(false);
  const [openModalSelectValue, setOpenModalSelectValue] =
    useState<boolean>(false);
  const [openModalPhoto, setOpenModalPhoto] = useState<boolean>(false);

  const focusTitle = useRef<HTMLTextAreaElement>(null);
  const focusContents = useRef<HTMLTextAreaElement>(null);
  const focusTotalCost = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();

  const queryClient = useQueryClient();

  const placesData = useRecoilValue(hospitalData);
  // console.log("placesData", placesData);
  const { recentlyRefetch } = useGetReviews("");

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      isEdit(false);
    }
  };

  // const isOpenModal = useRecoilValue(modalState);
  // const setIsOpenModal = useSetRecoilState(modalState);

  const handleClose = () => {
    setCreateModalOpen(false);
  };

  // 별점 만들기
  const starArray = Array.from({ length: 5 }, (_, i) => i + 1);

  // useEffect(() => {
  // document.body.style.cssText = // position: fixed; // top: -${window.scrollY}px; // overflow-y: scroll; // width: 100%;;
  // return () => {
  // const scrollY = document.body.style.top;
  // document.body.style.cssText = "";
  // window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
  // };
  // }, []);

  type StarProps = {
    selected: boolean;
    onClick: () => void;
  };

  const Star = ({ selected, onClick }: StarProps) => (
    <div
      style={{
        color: selected ? "#15B5BF" : "#e4e5e9",
      }}
      onClick={onClick}
    >
      <span style={{ fontSize: "50px", padding: "7px" }}>&#9733;</span>
    </div>
  );

  const createdAt = Date.now();
  const timestamp = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(createdAt);

  // DB에 저장
  const handleSubmit = async (downloadUrl: any) => {
    console.log(starRating);
    if (title.replace(/ /g, "") === "") {
      setOpenModalTitle(true);
      return;
    } else if (contents.replace(/ /g, "") === "") {
      setOpenModalContents(true);
      return;
    } else if (totalCost.replace(/ /g, "") === "" || !/^\d+$/.test(totalCost)) {
      setOpenModalTotalCost(true);
      return;
    } else if (starRating.length === 0) {
      setOpenModalStarRating(true);
      return;
    } else if (selectvalue.length === 0) {
      setOpenModalSelectValue(true);
      return;
    }
    try {
      await axios.post(`${REVIEW_SERVER}posts`, {
        title,
        contents,
        totalCost,
        rating: starRating,
        selectedColors: selectvalue.map((option) => option.value), // 선택된 value값만
        downloadUrl,
        date: timestamp,
        displayName: authService.currentUser?.displayName,
        userId: authService.currentUser?.uid,
        profileImage: authService.currentUser?.photoURL,
        hospitalId: placesData.id,
        isEdit: false,
        id: shortUUID.generate(),
        hospitalAddress: placesData.address_name,
        hospitalName: placesData.place_name,
      });
      // console.log("response", response);
      localStorage.removeItem("Photo");
      // console.log("포스트완료");
      // await recentlyRefetch();
      setCreateModalOpen(false);
      await queryClient.invalidateQueries(["getrecentlyReview"]);
      // await refetch();
      // router.push(`/searchMap`);
    } catch (error) {
      console.error(error);
    }
  };

  // 이미지 업로드(이미지를 로컬에 임시 저장)
  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const theFile = event.target.files?.[0];
      if (!theFile) {
        throw new Error("파일이 선택되지 않았습니다.");
      }

      const reader = new FileReader();
      reader.readAsDataURL(theFile);

      reader.onloadend = (finishedEvent: ProgressEvent<FileReader>) => {
        const contentimgDataUrl = (finishedEvent.currentTarget as FileReader)
          ?.result as string;
        localStorage.setItem("Photo", contentimgDataUrl);
        const previewPhoto = document.getElementById(
          "preview-photo",
        ) as HTMLImageElement;
        previewPhoto.src = contentimgDataUrl;
      };
    } catch (error) {
      console.error(error);
    }
  };
  const ChangePhoto: React.FormEventHandler<HTMLFormElement> = async (
    event,
  ) => {
    event.preventDefault();
    // 변경할 이미지를 올리면 데이터 url로 로컬 스토리지에 임시 저장이 되는데
    // 그 값 가져와서 firestore에 업로드
    try {
      let newPhoto = localStorage.getItem("Photo");
      const imgRef = ref(storageService, `${Date.now()}`);

      let downloadUrl: string | undefined;
      if (newPhoto) {
        const response = await uploadString(imgRef, newPhoto, "data_url");
        downloadUrl = await getDownloadURL(response.ref);
      }
      if (downloadUrl) {
        handleSubmit(downloadUrl);
      } else if (downloadUrl === undefined) {
        // 새로운 사진이 없으면 리턴
        setOpenModalPhoto((prev) => !prev);
        return;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const ModalTitleEmpty = () => {
    setOpenModalTitle(false);
    focusTitle.current?.focus();
  };

  const ModalContentsEmpty = () => {
    setOpenModalContents(false);
    focusContents.current?.focus();
  };

  const ModalTotalCostEmpty = () => {
    setOpenModalTotalCost(false);
    focusTotalCost.current?.focus();
  };

  const ModalStarRatingEmpty = () => {
    setOpenModalStarRating(false);
  };

  const ModalSelectValueEmpty = () => {
    setOpenModalSelectValue(false);
  };

  const ModalPhotoEmpty = () => {
    setOpenModalPhoto(false);
  };

  return (
    <>
      {openModalTitle && (
        <CustomModal modalText1={"제목을 입력해주세요"}>
          <ModalButton onClick={ModalTitleEmpty}>확인</ModalButton>
        </CustomModal>
      )}
      {openModalContents && (
        <CustomModal modalText1={"내용을 입력해주세요"}>
          <ModalButton onClick={ModalContentsEmpty}>확인</ModalButton>
        </CustomModal>
      )}
      {openModalTotalCost && (
        <CustomModal modalText1={"비용을 숫자로 입력해주세요"}>
          <ModalButton onClick={ModalTotalCostEmpty}>확인</ModalButton>
        </CustomModal>
      )}
      {openModalStarRating && (
        <CustomModal modalText1={"별점평가를 완료해주세요"}>
          <ModalButton onClick={ModalStarRatingEmpty}>확인</ModalButton>
        </CustomModal>
      )}
      {openModalSelectValue && (
        <CustomModal modalText1={"카테고리를 선택해주세요"}>
          <ModalButton onClick={ModalSelectValueEmpty}>확인</ModalButton>
        </CustomModal>
      )}
      {openModalPhoto && (
        <CustomModal modalText1={"사진을 업로드해주세요"}>
          <ModalButton onClick={ModalPhotoEmpty}>확인</ModalButton>
        </CustomModal>
      )}
      {/* {isOpenModal && ( */}
      <ContainerBg onClick={handleBackgroundClick}>
        <Container>
          <ModalContainer>
            <Wrap>
              <FormWrap
                onSubmit={(event: React.FormEvent<HTMLFormElement>) =>
                  ChangePhoto(event)
                }
              >
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ cursor: "pointer" }} onClick={handleClose}>
                    <GrClose />
                  </div>
                </div>
                <label style={{ fontSize: "15px", fontWeight: "bold" }}>
                  사진인증
                </label>
                <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                  영수증, 병원 등 다른 회원님들에게 도움 될 만한 이미지를
                  공유해주세요.
                </p>
                <ImageBox htmlFor="file">
                  <PostImage
                    id="preview-photo"
                    src="https://images.unsplash.com/photo-1648823161626-0e839927401b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                    alt="게시글사진"
                  />
                </ImageBox>
                <input
                  id="file"
                  type="file"
                  style={{ display: "none", border: "none" }}
                  accept="images/*"
                  onChange={uploadPhoto}
                />
                <InputWrap>
                  <label
                    htmlFor="title"
                    style={{ fontSize: "15px", fontWeight: "bold" }}
                  >
                    제목 쓰기
                  </label>
                  <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                    눈에 띄는 제목으로 다른 회원님들에게 도움을 주세요.
                  </p>
                  <TitleBox
                    ref={focusTitle}
                    placeholder="20자 이내로 제목을 입력해 주세요."
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    id="title"
                    rows={1}
                    maxLength={21}
                    style={{
                      border: "none",
                      backgroundColor: "#e8e7e6",
                      opacity: "0.6",
                    }}
                  />
                  <label
                    htmlFor="title"
                    style={{ fontSize: "15px", fontWeight: "bold" }}
                  >
                    내용 쓰기
                  </label>
                  <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                    자세한 후기로 회원님들에게 도움을 주세요.
                  </p>
                  <ContentBox
                    ref={focusContents}
                    placeholder="150자 이내로 내용을 입력해 주세요."
                    value={contents}
                    onChange={(event) => setContents(event.target.value)}
                    rows={8}
                    maxLength={150}
                    style={{
                      border: "none",
                      backgroundColor: "#e8e7e6",
                      opacity: "0.6",
                    }}
                  />
                  <label
                    htmlFor="title"
                    style={{ fontSize: "15px", fontWeight: "bold" }}
                  >
                    진료 총액
                  </label>
                  <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                    진료 총액을 숫자로 입력해 주세요.
                  </p>
                  <TotalCostBox
                    ref={focusTotalCost}
                    placeholder="금액을 입력해 주세요"
                    value={totalCost}
                    onChange={(event) => setTotalCost(event.target.value)}
                    rows={1}
                    maxLength={7}
                    style={{
                      border: "none",
                      backgroundColor: "#e8e7e6",
                      opacity: "0.6",
                    }}
                  />
                </InputWrap>
                <label
                  htmlFor="title"
                  style={{ fontSize: "15px", fontWeight: "bold" }}
                >
                  별점 평가
                </label>
                <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                  이 병원을 별점으로 총평해 주세요.
                </p>
                <StarRating>
                  {starArray.map((star) => (
                    <Star
                      key={star}
                      selected={star <= starRating}
                      onClick={() => setStarRating(star)}
                    />
                  ))}
                </StarRating>
                <label
                  htmlFor="title"
                  style={{ fontSize: "15px", fontWeight: "bold" }}
                >
                  카테고리
                </label>
                <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                  다른 회원님에게 이 병원을 간단하게 설명해 주세요.
                </p>
                <PostSelect>
                  <Select
                    value={selectvalue}
                    onChange={(selectedOptions) =>
                      setSelectValue(
                        Array.isArray(selectedOptions) ? selectedOptions : [],
                      )
                    }
                    closeMenuOnSelect={false}
                    defaultValue={[colourOptions[0], colourOptions[1]]}
                    isMulti
                    options={colourOptions}
                    styles={colourStyles}
                    instanceId="selectbox"
                  />
                </PostSelect>

                <div style={{ display: "flex" }}>
                  <CreatePostButton>리뷰남기기</CreatePostButton>
                </div>
              </FormWrap>
            </Wrap>
          </ModalContainer>
        </Container>
      </ContainerBg>
      {/* )} */}
    </>
  );
};

const ContainerBg = styled.div`
  width: 1200px;
  height: 100vh;
  /* background-color: rgba(0, 0, 0, 0.6); */
  position: fixed;
  top: 0px;
  /* left: 375px; */
  z-index: 60;
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: -75px;
  right: 0;
  bottom: 0;
  /* background-color: rgba(0, 0, 0, 0.7); */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  overflow-y: auto;
`;

const ModalContainer = styled.div`
  background-color: white;
  /* padding: 30px; */
  border-radius: 10px;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.2);
  width: 375px;
  height: 100%;
  overflow-y: auto;
  position: fixed;
  padding-top: 60px;
`;

// -------------------

const Wrap = styled.div`
  margin-bottom: 300px;
`;
const FormWrap = styled.form`
  align-items: center;
  padding: 20px;
`;

const ImageBox = styled.label`
  display: flex;
  justify-content: center;
  /* border-radius: 100%; */
  overflow: hidden;
  cursor: pointer;
  width: 100%;
  height: 150px;
  margin: auto;
  > img {
    width: 100%;
    height: 100%;
    text-align: center;
    object-fit: fill;
  }
`;

const PostImage = styled.img`
  border: 1px solid lightgray;
  /* border-radius: 100%; */
  object-fit: cover;
`;

const InputWrap = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const TitleBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
  margin-bottom: 30px;
  ::placeholder {
    color: black;
    opacity: 0.3;
    font-size: 12px;
  }
`;

const ContentBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
  margin-bottom: 30px;
  ::placeholder {
    color: black;
    opacity: 0.3;
    font-size: 12px;
  }
`;

const TotalCostBox = styled.textarea`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid gray;
  resize: none;
  ::placeholder {
    color: black;
    opacity: 0.3;
    font-size: 12px;
  }
`;

const CreatePostButton = styled.button`
  margin: 10px 0;
  padding: 8px;
  font-size: 16px;
  border: none;
  background-color: #15b5bf;
  cursor: pointer;
  /* position: fixed; */
  width: 375px;
  height: 56px;
  top: 422px;
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

export default CreatePostModal;
function isEdit(arg0: boolean) {
  throw new Error("Function not implemented.");
}
