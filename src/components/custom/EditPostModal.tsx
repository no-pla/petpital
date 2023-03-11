import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import styled from "@emotion/styled";
import { colourOptions, colourStyles } from "../../components/Select";
import Select from "react-select";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { authService, storageService } from "../../firebase/firebase";

import { hospitalData } from "../../share/atom";
import { REVIEW_SERVER } from "../../share/server";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { modalState } from "../../share/atom";
import { useGetReviews } from "../../hooks/useGetReviews";
import { useMutation, useQueryClient } from "react-query";
import { GrClose } from "react-icons/gr";
import CustomModal, { ModalButton } from "./ErrorModal";

interface EditPostModalProps {
  setIsEdit: (value: boolean) => void;
  id: string;
  postTitle: any;
  postContents: any;
  postTotalCost: any;
  postDownloadUrl: any;
  postRating: any;
}

const EditPostModal = ({
  setIsEdit,
  id,
  postTitle,
  postContents,
  postTotalCost,
  postDownloadUrl,
  postRating,
}: EditPostModalProps) => {
  // console.log("지금궁금", postRating);
  const [editTitle, setEditTitle] = useState(postTitle);
  const [editContents, setEditContents] = useState(postContents);
  const [editTotalCost, setEditTotalCost] = useState(postTotalCost);
  const [editRatings, setEditRatings] = useState<any>(postRating);
  const [editSelectValue, setEditSelectValue] = useState<any[]>([]);
  // const [editDownloadUrl, setEditDownloadUrl] = useState(postDownloadUrl);
  const [openModalTitle, setOpenModalTitle] = useState(false);
  const [openModalContents, setOpenModalContents] = useState(false);
  const [openModalTotalCost, setOpenModalTotalCost] = useState(false);
  const [openModalStarRating, setOpenModalStarRating] = useState(false);
  const [openModalSelectValue, setOpenModalSelectValue] = useState(false);
  const [openModalPhoto, setOpenModalPhoto] = useState(false);

  const focusTitle = useRef<HTMLTextAreaElement>(null);
  const focusContents = useRef<HTMLTextAreaElement>(null);
  const focusTotalCost = useRef<HTMLTextAreaElement>(null);
  //   const ref = useRef(null);

  const router = useRouter();

  const queryClient = useQueryClient();

  const placesData = useRecoilValue(hospitalData);
  // console.log("placesData", placesData);
  const { recentlyRefetch } = useGetReviews("");

  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsEdit(false);
    }
  };

  // const isOpenModal = useRecoilValue(modalState);
  // const setIsOpenModal = useSetRecoilState(modalState);

  const handleClose = () => {
    setIsEdit(false);
  };

  // 별점 만들기
  const starArray = Array.from({ length: 5 }, (_, i) => i + 1);

  // useEffect(() => {
  //   document.body.style.cssText = `
  //     position: fixed;
  //     top: -${window.scrollY}px;
  //     overflow-y: scroll;
  //     width: 100%;`;
  //   return () => {
  //     const scrollY = document.body.style.top;
  //     document.body.style.cssText = "";
  //     window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
  //   };
  // }, []);

  interface StarProps {
    selected: boolean;
    onClick: () => void;
  }

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
  // 게시글 업데이트
  const { mutate: updateMutate } = useMutation(
    (data: any) =>
      axios.put(`${REVIEW_SERVER}posts/${id}`, data).then((res) => res.data),
    {
      onSuccess: () => {
        // refetchPost();
        queryClient.invalidateQueries(["getrecentlyReview"]);
      },
    },
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
  const handleEditSubmit = async (downloadUrl: string) => {
    console.log(editRatings);
    if (editTitle.replace(/ /g, "") === "") {
      setOpenModalTitle(true);

      return;
    } else if (editContents.replace(/ /g, "") === "") {
      setOpenModalContents(true);
      return;
    } else if (
      editTotalCost.replace(/ /g, "") === "" ||
      !/^\d+$/.test(editTotalCost)
    ) {
      setOpenModalTotalCost(true);
      return;
    } else if (editRatings === 0) {
      setOpenModalStarRating(true);
      return;
    } else if (editSelectValue.length === 0) {
      setOpenModalSelectValue(true);
      return;
    }
    updateMutate({
      title: editTitle,
      contents: editContents,
      selectedColors: editSelectValue.map((option) => option.value),
      rating: editRatings,
      totalCost: editTotalCost,
      downloadUrl,
      date: timestamp,
      displayName: authService.currentUser?.displayName,
      userId: authService.currentUser?.uid,
      profileImage: authService.currentUser?.photoURL,
      hospitalId: placesData.id,
      isEdit: false,
      id,
      hospitalAddress: placesData.address_name,
      hospitalName: placesData.place_name,
    });
    // console.log("response", response);
    await queryClient.invalidateQueries(["getrecentlyReview"]);
    localStorage.removeItem("Photo");
    // console.log("포스트완료");
    // await recentlyRefetch();
    setIsEdit(false);

    // await refetch();
    // router.push(`/searchMap`);
  };

  // 이미지 업로드(이미지를 로컬에 임시 저장)
  const uploadPhoto = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    try {
      const theFile = event.target.files?.[0];
      const reader = new FileReader();
      reader.readAsDataURL(theFile!); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.

      reader.onloadend = (finishedEvent: ProgressEvent<FileReader>) => {
        // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
        const contentimgDataUrl = (finishedEvent.currentTarget as FileReader)
          ?.result as string;
        localStorage.setItem("Photo", contentimgDataUrl);
        const previewPhoto = document.getElementById(
          "preview-photo",
        ) as HTMLImageElement;
        if (previewPhoto) {
          previewPhoto.src = contentimgDataUrl; // useRef 사용해서 DOM에 직접 접근하지 말기
        }
      };
    } catch (error) {
      console.error(error);
    }
  };

  const ChangePhoto = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    // 변경할 이미지를 올리면 데이터 url로 로컬 스토리지에 임시 저장이 되는데
    // 그 값 가져와서 firestore에 업로드
    try {
      const newPhoto = localStorage.getItem("Photo");
      if (!newPhoto) {
        // alert("사진을 업로드 해주세요");
        setOpenModalPhoto(true);
        return;
      }
      const imgRef = ref(storageService, `${Date.now()}`);

      const response = await uploadString(imgRef, newPhoto, "data_url");
      const downloadUrl = await getDownloadURL(response.ref);

      if (downloadUrl) {
        // console.log("downloadUrl", downloadUrl);
        // setEditDownloadUrl(downloadUrl);
        handleEditSubmit(downloadUrl);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const ModalTitleEmpty = (): void => {
    setOpenModalTitle(false);
    const titleInput = focusTitle.current;
    if (titleInput) {
      titleInput.focus();
    }
  };

  const ModalContentsEmpty = (): void => {
    setOpenModalContents(false);
    const contentsInput = focusContents.current;
    if (contentsInput) {
      contentsInput.focus();
    }
  };

  const ModalTotalCostEmpty = (): void => {
    setOpenModalTotalCost(false);
    const totalCostInput = focusTotalCost.current;
    if (totalCostInput) {
      totalCostInput.focus();
    }
  };

  const ModalStarRatingEmpty = (): void => {
    setOpenModalStarRating(false);
  };

  const ModalSelectValueEmpty = (): void => {
    setOpenModalSelectValue(false);
  };

  const ModalPhotoEmpty = (): void => {
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
              <FormWrap onSubmit={ChangePhoto}>
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
                    defaultValue={editTitle}
                    placeholder="20자 이내로 제목을 입력해 주세요."
                    onChange={(event) => setEditTitle(event.target.value)}
                    id="title"
                    rows={1}
                    maxLength={50}
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
                    defaultValue={editContents}
                    placeholder="150자 이내로 내용을 입력해 주세요."
                    onChange={(event) => setEditContents(event.target.value)}
                    rows={8}
                    maxLength={500}
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
                    defaultValue={editTotalCost}
                    placeholder="금액을 입력해 주세요"
                    onChange={(event) => setEditTotalCost(event.target.value)}
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
                      selected={star <= (editRatings[0] || 0)}
                      onClick={() => setEditRatings([star])}
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
                    value={editSelectValue}
                    onChange={(selectedOptions) =>
                      setEditSelectValue(
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
                  <CreatePostButton>수정하기</CreatePostButton>
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
  object-fit: fill;
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

export default EditPostModal;
