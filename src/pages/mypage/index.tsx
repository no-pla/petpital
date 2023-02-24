import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { authService, storageService } from "../../firebase/firebase";
import React, { useEffect, useState, ChangeEvent } from "react";
import Likedpetpital from "./Likedpetpital";
import styled from "@emotion/styled";
import Review from "./Review";
import AuthModal from "../../components/custom/AuthModal";
import CustomModal, { ModalButton } from "../../components/custom/CustomModal";
import { useRouter } from "next/router";

const Index = () => {
  const [modal, setModal] = useState(false);
  const currentUser = useAuth();
  const [newNickname, setNewNickname] = useState("");
  const [checkImageModal, setCheckImageModal] = useState<any>(false);
  const [photo, setPhoto] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const userEmail = authService.currentUser?.email;
  const [photoURL, setPhotoURL] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
  );

  const router = useRouter();

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

  async function upload(file: any, currentUser: any, setLoading: any) {
    const fileRef = ref(storageService, currentUser.uid + ".png");

    setLoading(true);

    const snapshot = await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    updateProfile(currentUser, { photoURL });
    setPhotoURL(photoURL);
    setLoading(false);
    setCheckImageModal(true);
  }

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e?.target?.files?.[0]) {
      setPhoto(e?.target?.files?.[0]);
    }
  }

  async function handleClick() {
    upload(photo, currentUser, setLoading);
  }

  useEffect(() => {
    if (currentUser?.photoURL) {
      setPhotoURL(currentUser.photoURL);
    }
  }, [currentUser]);

  //카테고리 버튼
  const [selected, setSelected] = useState("");
  const handleHospitalClick = () => {
    setSelected("hospital");
  };
  const handleReviewClick = () => {
    setSelected("review");
  };

  //닉네임변경
  const userName = authService.currentUser?.displayName;

  const nicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewNickname(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (userName !== newNickname) {
      await updateProfile(authService.currentUser as any, {
        displayName: newNickname,
      });
    }
  };

  const onLogOutClick = () => {
    authService.signOut();
    router.push("/");
  };

  return (
    <>
      <MyPageContainer>
        <MyPageTop>
          {modal == true ? (
            <AuthModal>
              <form onSubmit={handleSubmit}>
                <label>
                  닉네임 :
                  <NicknameInput
                    type="text"
                    value={newNickname}
                    onChange={nicknameChange}
                  />
                </label>
                <UploatBtn type="submit">닉네임 변경</UploatBtn>
              </form>
              <ButtonWrap>
                <FileSelectBtn htmlFor="input-file">
                  사진 선택
                  <input
                    type="file"
                    hidden
                    id="input-file"
                    onChange={handleChange}
                  />
                </FileSelectBtn>
                <UploatBtn disabled={loading || !photo} onClick={handleClick}>
                  사진 등록
                </UploatBtn>
              </ButtonWrap>
              <ModalButton onClick={() => setModal(false)}>완료</ModalButton>
            </AuthModal>
          ) : null}
          <ProfileImageContainer></ProfileImageContainer>
          <ProfileWrapper>
            <div>
              <PicContainer>
                <ImageWrap>
                  <ProfileImage src={photoURL} width={150} height={130} />
                </ImageWrap>
                <ProfileId>
                  <ProfileIdBox>{userName}</ProfileIdBox>
                  <ProfileIdBox>{userEmail}</ProfileIdBox>
                </ProfileId>
                <ProfileModifyButton
                  onClick={() => {
                    setModal(true);
                  }}
                >
                  프로필 변경하기
                </ProfileModifyButton>

                <ProfileModifyButton onClick={onLogOutClick}>
                  로그아웃
                </ProfileModifyButton>
              </PicContainer>
            </div>
          </ProfileWrapper>
          <ButtonBox>
            <Button onClick={handleHospitalClick}>Q & A</Button>
            <Button onClick={handleReviewClick}>리뷰</Button>
          </ButtonBox>
        </MyPageTop>
        <MyPageBottom>
          {selected === "hospital" && <Likedpetpital />}
          {selected === "review" && <Review />}
        </MyPageBottom>
      </MyPageContainer>
    </>
  );
};

export default Index;

const MyPageContainer = styled.div`
  height: 100%;
  position: relative;
  background-color: #15b5bf;
`;
const MyPageTop = styled.div`
  height: 500px;

  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileImageContainer = styled.div`
  margin-top: 100px;
`;

const ProfileId = styled.span`
  color: white;
  font-weight: 600;
`;

const ProfileIdBox = styled.div`
  margin-top: 10px;
  display: flex;
  justify-content: center;
`;

const ProfileModifyButton = styled.div`
  margin-top: 30px;
  display: flex;
  color: white;
  justify-content: center;
  cursor: pointer;
  &:hover {
    color: #9c88ff;
    transition: 0.5s;
  }
`;

const ProfileWrapper = styled.div`
  margin-top: 30px;
`;

const ButtonBox = styled.div`
  display: flex;
  justify-content: space-between;
  width: 160px;
  margin-top: 130px;
`;

const Button = styled.button`
  border: none;
  color: #15b5bf;
  font-size: 20px;
  background-color: white;
  cursor: pointer;
  &:hover {
    color: #9c88ff;
    transition: 0.5s;
  }
`;

const MyPageBottom = styled.div`
  background-color: white;
  width: 100%;
  padding-top: 70px;
`;

const PicContainer = styled.div`
  width: 140px;
  height: 20%;
`;

const ImageWrap = styled.div`
  width: 140px;
  height: 140px;
  margin: 0 auto;
`;

const ProfileImage = styled.img`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 1px solid #d0d0d0;
  object-fit: cover;
`;

const ButtonWrap = styled.div`
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 12px;
`;

const FileSelectBtn = styled.label`
  padding: 4px 12px;
  font-size: 12px;
  color: #262b7f;
  background-color: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  cursor: pointer;
  :hover {
    color: #fff;
    background-color: #262b7f;
    border: 1px solid #262b7f;
  }
`;

const UploatBtn = styled.button`
  padding: 4px 12px;
  margin-left: 10px;
  font-size: 12px;
  color: #262b7f;
  background-color: #fff;
  border: 1px solid #d0d0d0;
  border-radius: 10px;
  cursor: pointer;
  :hover {
    color: #fff;
    background-color: #262b7f;
    border: 1px solid #262b7f;
  }
`;

const NicknameInput = styled.input`
  margin-left: 5px;
`;
