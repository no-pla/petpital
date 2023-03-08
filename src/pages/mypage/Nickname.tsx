import React, { useRef, useState, useEffect, ChangeEvent } from "react";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import { BsArrowLeftCircle } from "react-icons/bs";
import { authService, storageService } from "../../firebase/firebase";
import { onAuthStateChanged, updateProfile, User } from "firebase/auth";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import AuthModal from "../../components/custom/AuthModal";

const Nickname = () => {
  const router = useRouter();
  const [inputCount, setInputCount] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState("");
  const [newNickname, setNewNickname] = useState("");
  const [modal, setModal] = useState(false);

  const [photoURL, setPhotoURL] = useState(
    "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png",
  );
  const [photo, setPhoto] = useState<any>(null);
  const currentUser = useAuth();
  const [loading, setLoading] = useState(false);

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

  //바뀐 사진 넣기
  const photoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfilePhoto(event.target.value);
  };

  // 뒤로가기
  const onBackPageClick = () => {
    router.back();
  };

  // 마이페이지 이동
  const onMyPageClick = () => {
    router.push("/mypage");
  };

  // 닉네임 글자수 제한, 닉네임변경
  const onInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCount(e.target.value.length);
    setNewNickname(e.target.value);
    console.log(newNickname);
  };

  //   //바이트로 실시간변환
  //   const onTextareaHandler = (e:any) => {
  //     setInputCount(
  //       e.target.value.replace(/[\0-\x7f]|([0-\u07ff]|(.))/g, "$&$1$2").length,
  //     );
  //   };

  //닉네임변경
  //   const userName = authService.currentUser?.displayName;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await updateProfile(authService.currentUser as any, {
      displayName: newNickname,
      // photoURL: userPhotoURL,
    });
  };

  const fileInput = useRef(null);

  //1111111111
  async function upload(file: any, currentUser: any, setLoading: any) {
    const fileRef = ref(storageService, currentUser.uid + ".png");

    setLoading(true);

    const snapshot = await uploadBytes(fileRef, file);
    const photoURL = await getDownloadURL(fileRef);

    updateProfile(currentUser, { photoURL });
    setPhotoURL(photoURL);
    setLoading(false);
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

  //   //실시간 업데이트 프로필 사진 표시
 
  const onChange = (e: any) => {
	if(e.target.files[0]){
        setPhotoURL(e.target.files[0])
        }else{ //업로드 취소할 시
            setPhotoURL("https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png")
            return
        }
	//화면에 프로필 사진 표시
        const reader = new FileReader();
        reader.onload = () => {
            if(reader.readyState === 2){
                setPhotoURL(reader.result)
            }
        }
        reader.readAsDataURL(e.target.files[0])
    }





  //현재 로그인한거 불러오기
  const [myInformation, setMyInformation] = useState<User>();

  useEffect(() => {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        setMyInformation(user);
        console.log("로그인됨");
      } else {
        console.log("안됨");
      }
    });
  }, []);

  // // 프로필 업로드 아직 미완성
  // updateProfile(authService.currentUser, {userPhotoURL}).then(() => {
  //   console.log("사진 업데이트 성공");
  // }).catch((error) => {
  //      console.log("사진 업데이트 실패 ㅜㅜ");
  // });

  return (
    <MyPageContainer>
      <IconBox onClick={onBackPageClick}>
        <BsArrowLeftCircle size="20px" />
        <BackTitle>이전으로</BackTitle>
      </IconBox>
      <MyPageTop>
        <Title>프로필 변경</Title>
        <PicContainer>
          <ImageWrap>
            <input
              type="file"
                style={{ display: "none" }}
              onChange={(e)=>{
                onChange(e);
                handleChange(e)}}
              id="input-file"
            />
            <label htmlFor="input-file">
            <ProfileImage
              src={photoURL}
              width={150}
              height={130}
              onClick={handleClick}
            />
            </label>
          </ImageWrap>
        </PicContainer>
        <NicknameInput
          onChange={onInputHandler}
          type="text"
          value={newNickname}
          maxLength={20}
        />
        <NicknameLength>
          {inputCount} / <NicknameLengthMax>20</NicknameLengthMax>
        </NicknameLength>
        <SaveButton
          onClick={() => {
            setModal(true);
          }}
        >
          저장하기
        </SaveButton>
        {modal == true ? (
          <AuthModal>
            <ModalBox>
              <span>이전 닉네임을</span>
              <span>사용하시겠습니까?</span>
            </ModalBox>
            <form onSubmit={handleSubmit}>
              <ModalButton onClick={() => setModal(false)}>
                나중에 변경할래요
              </ModalButton>
              <ModalButton
                type="submit"
                onClick={() => {
                  onMyPageClick();
                  handleClick();
                }}
              >
                변경할래요
              </ModalButton>
            </form>
          </AuthModal>
        ) : null}
      </MyPageTop>
    </MyPageContainer>
  );
};
export default Nickname;

const MyPageContainer = styled.div`
  height: 100%;
  background-color: #fafafa;
`;

const MyPageTop = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconBox = styled.div`
  margin-top: 100px;
  margin-left: 30px;
  size: 200px;
  display: flex;
  justify-content: flex-start;
  cursor: pointer;
  &:hover {
    color: #9c88ff;
    transition: 0.5s;
  }
`;

const BackTitle = styled.div`
  font-size: 20px;
  margin-left: 20px;
`;

const Title = styled.span`
  margin-top: 120px;
  color: black;
  font-size: 20px;
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
  cursor: pointer;
`;

const PicContainer = styled.div`
  width: 140px;
  height: 20%;
  margin-top: 25px;
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

const SaveButton = styled.button`
  margin-top: 200px;
  margin-bottom: 100px;
  width: 400px;
  height: 40px;
  background-color: #15b5bf;
  border: none;
  color: white;
  cursor: pointer;
  &:hover {
    color: #9c88ff;
    transition: 0.5s;
  }
`;

const ModalBox = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 50px;
  width: 300px;
  font-size: 18px;
`;

const ModalButton = styled.button`
  border: none;
  background-color: white;
  color: #c5c5c5;
  font-size: 18px;
  cursor: pointer;
  &:hover {
    color: #15b5bf;
    transition: 0.5s;
};  `

