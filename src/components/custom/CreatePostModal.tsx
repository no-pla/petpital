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

  // ?????? ?????????
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

  // DB??? ??????
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
        selectedColors: selectvalue.map((option) => option.value), // ????????? value??????
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
      // console.log("???????????????");
      // await recentlyRefetch();
      setCreateModalOpen(false);
      await queryClient.invalidateQueries(["getrecentlyReview"]);
      // await refetch();
      // router.push(`/searchMap`);
    } catch (error) {
      console.error(error);
    }
  };

  // ????????? ?????????(???????????? ????????? ?????? ??????)
  const uploadPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const theFile = event.target.files?.[0];
      if (!theFile) {
        throw new Error("????????? ???????????? ???????????????.");
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
    // ????????? ???????????? ????????? ????????? url??? ?????? ??????????????? ?????? ????????? ?????????
    // ??? ??? ???????????? firestore??? ?????????
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
        // ????????? ????????? ????????? ??????
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
        <CustomModal modalText1={"????????? ??????????????????"}>
          <ModalButton onClick={ModalTitleEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalContents && (
        <CustomModal modalText1={"????????? ??????????????????"}>
          <ModalButton onClick={ModalContentsEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalTotalCost && (
        <CustomModal modalText1={"????????? ????????? ??????????????????"}>
          <ModalButton onClick={ModalTotalCostEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalStarRating && (
        <CustomModal modalText1={"??????????????? ??????????????????"}>
          <ModalButton onClick={ModalStarRatingEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalSelectValue && (
        <CustomModal modalText1={"??????????????? ??????????????????"}>
          <ModalButton onClick={ModalSelectValueEmpty}>??????</ModalButton>
        </CustomModal>
      )}
      {openModalPhoto && (
        <CustomModal modalText1={"????????? ?????????????????????"}>
          <ModalButton onClick={ModalPhotoEmpty}>??????</ModalButton>
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
                  ????????????
                </label>
                <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                  ?????????, ?????? ??? ?????? ?????????????????? ?????? ??? ?????? ????????????
                  ??????????????????.
                </p>
                <ImageBox htmlFor="file">
                  <PostImage
                    id="preview-photo"
                    src="https://images.unsplash.com/photo-1648823161626-0e839927401b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                    alt="???????????????"
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
                    ?????? ??????
                  </label>
                  <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                    ?????? ?????? ???????????? ?????? ?????????????????? ????????? ?????????.
                  </p>
                  <TitleBox
                    ref={focusTitle}
                    placeholder="20??? ????????? ????????? ????????? ?????????."
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
                    ?????? ??????
                  </label>
                  <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                    ????????? ????????? ?????????????????? ????????? ?????????.
                  </p>
                  <ContentBox
                    ref={focusContents}
                    placeholder="150??? ????????? ????????? ????????? ?????????."
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
                    ?????? ??????
                  </label>
                  <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                    ?????? ????????? ????????? ????????? ?????????.
                  </p>
                  <TotalCostBox
                    ref={focusTotalCost}
                    placeholder="????????? ????????? ?????????"
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
                  ?????? ??????
                </label>
                <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                  ??? ????????? ???????????? ????????? ?????????.
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
                  ????????????
                </label>
                <p style={{ fontSize: "10.5px", color: "lightgray" }}>
                  ?????? ??????????????? ??? ????????? ???????????? ????????? ?????????.
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
                  <CreatePostButton>???????????????</CreatePostButton>
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
