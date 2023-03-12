import { BackButton } from "@/components/custom/CustomHeader";
import CustomModal, { ModalButton } from "@/components/custom/ErrorModal";
import { authService, storageService } from "@/firebase/firebase";
import { useGetReviews } from "@/hooks/useGetReviews";
import { useGetPetConsult } from "@/hooks/usePetsult";
import { REVIEW_SERVER } from "@/share/server";
import styled from "@emotion/styled";
import axios from "axios";
import { getAuth, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { BsArrowLeftCircle } from "react-icons/bs";

const Nickname = () => {
  const router = useRouter();
  const [newNickname, setNewNickname] = useState("");
  const [photoURL, setPhotoURL] = useState<any>("");
  // const [newNickName, setNewNickName] = useState("");
  const [success, setSucess] = useState(false);
  const [error, setError] = useState(false);
  const [url, setUrl] = useState();
  const currentUser = useAuth();
  const [onSubmitting, setOnSubmitting] = useState(false);
  const auth = getAuth();

  function useAuth() {
    const [currentUser, setCurrentUser] = useState<any>();
    useEffect(() => {
      const unsub = onAuthStateChanged(authService, (user) =>
        setCurrentUser(user),
      );
      return unsub;
    }, []);

    return currentUser;
  }
  const onUploadNewProfilePhoto = async (event: any) => {
    event.preventDefault();
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const theFile = event.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(theFile); // file 객체를 브라우저가 읽을 수 있는 data URL로 읽음.

    reader.onloadend = (finishedEvent: any) => {
      // 파일리더가 파일객체를 data URL로 변환 작업을 끝났을 때
      const contentimgDataUrl = finishedEvent?.currentTarget?.result;
      localStorage.setItem("newProfilePhoto", contentimgDataUrl);
      const previewPhoto = document.querySelector(
        "#preview-photo",
      ) as HTMLImageElement;
      if (previewPhoto) {
        previewPhoto.src = contentimgDataUrl;
      }
    };
  };

  const ChangeProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (onSubmitting === true) return;
    if (!auth.currentUser) return;
    setOnSubmitting(true);
    // 변경할 이미지를 올리면 데이터 url로 로컬 스토리지에 임시 저장이 되는데
    // 그 값 가져와서 firestore에 업로드
    let newPhoto = localStorage.getItem("newProfilePhoto");
    const imgRef = ref(
      storageService,
      `${authService.currentUser?.uid}/${Date.now()}`,
    );

    let downloadUrl: string | null | undefined;
    if (newPhoto) {
      const response = await uploadString(imgRef, newPhoto, "data_url");
      downloadUrl = await getDownloadURL(response.ref);
    }

    const changeProfile = {
      id: currentUser.uid,
      nickname: newNickname === "" ? currentUser.displayName : newNickname,
      profileImage:
        downloadUrl === undefined ? currentUser.photoURL : downloadUrl,
    };

    // 새로운 닉네임과 프로필 사진이 없으면 리턴
    await updateProfile(auth.currentUser, {
      displayName: newNickname === "" ? currentUser.displayName : newNickname,
      photoURL: downloadUrl === undefined ? currentUser.photoURL : downloadUrl,
    })
      .then(async () => {
        setNewNickname("");
        router.push("/mypage", undefined, { shallow: true });

        await axios.patch(
          `${REVIEW_SERVER}users/${currentUser.uid}`,
          changeProfile,
        );
        // 이전 게시글 수정
      })
      .catch((error) => {
        // alert("에러가 발생했습니다. 다시 시도해 주세요.");
        console.log(error);
        setError((prev) => !prev);
      });
  };

  return (
    <>
      <Head>
        <title>펫피탈 | 프로필 변경</title>
      </Head>
      <ChangeProfileContainer>
        <ChangeProfileHeader>
          <BackButton
            style={{
              marginLeft: "40px",
            }}
            onClick={() => router.push("/mypage", undefined, { shallow: true })}
          >
            <BsArrowLeftCircle style={{ marginLeft: "20px" }} color="black" />
            <span>이전으로</span>
          </BackButton>
          <div>프로필 변경</div>
        </ChangeProfileHeader>
        <UserChangeProfileContainer>
          <UserChangeProfile>
            <PreviewProfileImage
              id="preview-photo"
              src={currentUser?.photoURL}
            />
            <input
              type="file"
              id="add-profile"
              accept="image/jpg, image/png, image/jpeg"
              onChange={(event) => onUploadNewProfilePhoto(event)}
              style={{ display: "none" }}
            />
            <AddProfileImage htmlFor="add-profile">
              <AiOutlinePlus size={20} color="white" />
            </AddProfileImage>
          </UserChangeProfile>
        </UserChangeProfileContainer>
        <ChageNickNameForm onSubmit={(event) => ChangeProfile(event)}>
          <div>
            <NicknameInput
              placeholder={currentUser?.displayName}
              onChange={(event) => setNewNickname(event.target.value)}
            />
            <NicknameLength>
              {newNickname.length} / <NicknameLengthMax>20</NicknameLengthMax>
            </NicknameLength>
          </div>
          <SubmitButton
            style={{ opacity: onSubmitting === true ? "0.7" : "1" }}
            disabled={onSubmitting}
          >
            저장하기
          </SubmitButton>
        </ChageNickNameForm>
      </ChangeProfileContainer>
      {error && (
        <CustomModal
          modalText1={"에러가 발생했습니다."}
          modalText2={"다시 시도해 주세요."}
        >
          <ModalButton onClick={() => setError(false)}>취소</ModalButton>
        </CustomModal>
      )}
    </>
  );
};

export default Nickname;

const PreviewProfileImage = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  object-fit: cover;
`;

const SubmitButton = styled.button`
  width: 400px;
  padding: 20.5px 0;
  border: 1px solid #afe5e9;
  background: #15b5bf;
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
  box-sizing: border-box;
  cursor: pointer;
`;

const ChageNickNameForm = styled.form`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-direction: column;
  height: 50%;
  & > div:nth-of-type(1) {
    display: flex;
    flex-direction: column;
  }
`;

const UserChangeProfileContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AddProfileImage = styled.label`
  background-color: #15b5bf;
  border: none;
  border-radius: 50%;
  display: flex;
  position: absolute;
  top: 16px;
  right: 32px;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  padding: 4px;
`;

const UserChangeProfile = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
`;

const ChangeProfileContainer = styled.div`
  height: 100vh;
`;

const ChangeProfileHeader = styled.div`
  display: flex;
  margin: 110px 0 37px 0;
  width: 100%;
  justify-content: center;
  flex-direction: column;
  & span {
    color: black;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
  & div:nth-of-type(1) {
    margin: -26px auto 0 auto;
    color: black;
    font-weight: 600;
    font-size: 1.2rem;
    display: flex;
    justify-content: center;
  }
`;

const NicknameInput = styled.input`
  margin-top: 100px;
  border: 1px solid #e4e4e4;
  background-color: white;
  width: 400px;
  height: 40px;
  padding-left: 30px;
  font-size: 20px;
`;

const NicknameLength = styled.span`
  margin-left: 350px;
  margin-top: 10px;
`;

const NicknameLengthMax = styled.span`
  color: #c5c5c5;
`;
