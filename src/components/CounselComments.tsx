import { authService } from "../firebase/firebase";
import {
  useAddCounselComment,
  useDeletCounselComment,
  useEditCounselComment,
  useGetPetConsultComment,
} from "../hooks/usePetsultReview";
import styled from "@emotion/styled";
import { useEffect, useRef, useState } from "react";
import CustomModal, { ModalButton } from "./custom/ErrorModal";
import { UserProfile } from "./CounselPost";

const short = require("short-uuid");

const CoComent = ({ cocoment, comment, index }: any) => {
  const { mutate: editComment } = useEditCounselComment();

  const DeleteCoComent = (comment: any, cocomment: any) => {
    const newCommentObj = {
      ...comment,
      cocoment: comment.cocoment.filter(
        (target: any) => target.commentId !== cocomment.commentId,
      ),
    };
    editComment(newCommentObj);
  };
  return (
    <>
      <CocomentItem key={cocoment.commentId}>
        <UserProfileImg src={cocoment.profileImage} />
        <UserInfo>
          <div>
            <div>{cocoment.nickname}</div>
            <div>{cocoment.createdAt}</div>
          </div>
          <div>
            {authService.currentUser?.displayName !== cocoment.targetNickname &&
              "@" + cocoment.targetNickname + " "}
            {cocoment.content}
          </div>
        </UserInfo>
      </CocomentItem>
      {cocoment.uid === authService.currentUser?.uid && (
        <ManageButtonContainer>
          <button onClick={() => DeleteCoComent(comment, cocoment)}>
            삭제
          </button>
        </ManageButtonContainer>
      )}
    </>
  );
};

const CounselComments = ({ target }: any) => {
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const [isOpenComment, setIsOpenComment] = useState<boolean[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [emptyComment, setEmptyComment] = useState(false);
  const { mutate: addNewComment } = useAddCounselComment();
  const { mutate: editComment } = useEditCounselComment();
  const { data: commentList } = useGetPetConsultComment();
  const { mutate: deleteComment } = useDeletCounselComment();
  const newCommentRef = useRef<HTMLInputElement>(null);
  const newEditCommentRef = useRef<HTMLInputElement>(null);
  const newCoCommentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 리뷰 개별 수정 가능하기 위해 추가
    if (commentList?.data) {
      for (let i = 0; i < commentList.data.length; i++) {
        setIsOpen((prev) => [...prev, false]);
        setIsOpenComment((prev) => [...prev, false]);
      }
    }
  }, [commentList]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newCommentRef.current?.value === "") {
      setEmptyComment((prev) => !prev);
      return;
    } else {
      const newComment = {
        uid: authService.currentUser?.uid,
        counselId: target,
        id: short.generate(),
        content: newCommentRef.current?.value,
        nickname: authService.currentUser?.displayName,
        profileImg:
          authService.currentUser?.photoURL ||
          "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FComponent%209.png?alt=media&token=ee6ff59f-3c4a-4cea-b5ff-c3f20765a606",
        createdAt: Date.now(),
        cocoment: [],
      };
      addNewComment(newComment);
    }
  };

  const onDelete = (id: string) => {
    setOpenModal((prev) => !prev);
    setTargetId(id);
  };

  const deleteReview = () => {
    setOpenModal((prev) => !prev);
    deleteComment(targetId);
  };

  const onSumbitNewComment = (
    event: React.FormEvent<HTMLFormElement>,
    index: number,
    comment: any,
  ) => {
    event.preventDefault();
    if (newEditCommentRef?.current?.value === "") {
      setEmptyComment((prev) => !prev);
    } else {
      const newArray = [...isOpen];
      newArray[index] = false;
      setIsOpen(newArray);
      editComment({ ...comment, content: newEditCommentRef?.current?.value });
    }
  };

  const openIpt = (index: any) => {
    const newArray = [...isOpen];
    newArray[index] = true;
    setIsOpen(newArray);
  };

  const closeIpt = (index: any) => {
    const newArray = [...isOpen];
    newArray[index] = false;
    setIsOpen(newArray);
  };

  const openCoComentIpt = (index: any) => {
    const newArray = [...isOpen];
    newArray[index] = true;
    setIsOpenComment(newArray);
  };

  const closeCoComentIpt = (index: any) => {
    const newArray = [...isOpen];
    newArray[index] = false;
    setIsOpenComment(newArray);
  };

  const NewCommentInput = () => {
    return (
      <CounselInput
        placeholder={
          authService.currentUser === null
            ? "로그인 후 이용해 주세요"
            : "답변 추가"
        }
        ref={newCommentRef}
        disabled={authService.currentUser === null}
      />
    );
  };

  const EditCommentInput = ({ comment }: any) => {
    return <CounselEditInput ref={newEditCommentRef} placeholder={comment} />;
  };

  const CoCommentInput = () => {
    return (
      <CounselEditInput
        placeholder="답글을 입력해 주세요."
        ref={newCoCommentRef}
      />
    );
  };

  const onSubmitCoComent = (
    event: React.FormEvent<HTMLFormElement>,
    comment: any,
    index: number,
  ) => {
    event.preventDefault();

    const cocomentObj = {
      ...comment,
      cocoment: [
        ...comment.cocoment,
        {
          commentId: short.generate(),
          id: comment.id,
          uid: authService.currentUser?.uid,
          content: newCoCommentRef.current?.value,
          targetNickname: comment.nickname,
          nickname: authService.currentUser?.displayName,
          profileImage:
            authService.currentUser?.photoURL ||
            "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FComponent%209.png?alt=media&token=ee6ff59f-3c4a-4cea-b5ff-c3f20765a606",
          createdAt: new Date().toLocaleString("ko-KR"),
        },
      ],
    };
    if (newCoCommentRef.current?.value === "") {
      setEmptyComment((prev) => !prev);
      return;
    } else {
      editComment(cocomentObj);
      isOpenComment[index] = false;
    }
  };

  // const EditCoComent = (
  //   comment: any,
  //   targetCocoment: any,
  //   newComment: string,
  // ) => {
  //   const newCommentObj = {
  //     ...comment,
  //     cocoment: [
  //       ...comment.cocoment.filter(
  //         (a: any) => a.commentId !== targetCocoment.commentId,
  //       ),
  //       {
  //         ...targetCocoment,
  //         content: newComment,
  //       },
  //     ],
  //   };
  //   editComment(newCommentObj);
  // };

  return (
    <CounselCommentContainer>
      <CounselCommentForm onSubmit={onSubmit}>
        <UserProfile
          profileLink={
            authService?.currentUser?.photoURL
              ? authService?.currentUser.photoURL
              : "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FComponent%209.png?alt=media&token=ee6ff59f-3c4a-4cea-b5ff-c3f20765a606"
          }
        />
        <NewCommentInput />
      </CounselCommentForm>
      <CounselLists>
        {commentList?.data?.map((comment: any, index: any) => {
          return (
            comment.counselId === target && (
              <CounselItem key={comment.id}>
                <CounselInfo>
                  <div style={{ display: "flex" }}>
                    <UserProfile profileLink={comment.profileImg} />
                    <UserInfo>
                      <div>
                        <div>{comment.nickname}</div>
                        <div>
                          {new Date(comment.createdAt).toLocaleDateString(
                            "ko-Kr",
                          )}
                        </div>
                      </div>
                      <div>
                        {!isOpen[index] ? (
                          <div>{comment.content}</div>
                        ) : (
                          <CounselCommentForm
                            onSubmit={(event) =>
                              onSumbitNewComment(event, index, comment)
                            }
                          >
                            <EditCommentInput comment={comment.content} />
                            <button type="submit">등록하기</button>
                            <button
                              type="button"
                              onClick={() => closeIpt(index)}
                            >
                              취소하기
                            </button>
                          </CounselCommentForm>
                        )}
                      </div>
                    </UserInfo>
                  </div>
                  {comment.uid === authService.currentUser?.uid && (
                    <ManageButtonContainer>
                      {!isOpen[index] && (
                        <>
                          <button onClick={() => onDelete(comment.id)}>
                            삭제
                          </button>
                          <button onClick={() => openIpt(index)}>수정</button>
                        </>
                      )}
                    </ManageButtonContainer>
                  )}
                </CounselInfo>
                <div style={{ display: "flex", gap: "12px" }}>
                  {!isOpenComment[index] && (
                    <CoComentButton onClick={() => openCoComentIpt([index])}>
                      답글
                    </CoComentButton>
                  )}
                </div>
                <div>
                  {isOpenComment[index] && (
                    <CounselCommentForm
                      onSubmit={(event) =>
                        onSubmitCoComent(event, comment, index)
                      }
                    >
                      <CoCommentInput />
                      <button type="submit">등록하기</button>
                      <button
                        type="button"
                        onClick={() => closeCoComentIpt(index)}
                      >
                        취소하기
                      </button>
                    </CounselCommentForm>
                  )}
                </div>
                <CocomentContainer>
                  {comment?.cocoment?.length > 0 &&
                    comment?.cocoment?.map((cocoment: any) => {
                      return (
                        <CoComent
                          key={cocoment.commentId}
                          cocoment={cocoment}
                          comment={comment}
                          index={index}
                        />
                      );
                    })}
                </CocomentContainer>
              </CounselItem>
            )
          );
        })}
      </CounselLists>
      {openModal && (
        <CustomModal
          modalText1={"입력하신 댓글을"}
          modalText2={"삭제 하시겠습니까?"}
        >
          <ModalButton onClick={() => setOpenModal((prev) => !prev)}>
            취소
          </ModalButton>
          <ModalButton onClick={deleteReview}>삭제</ModalButton>
        </CustomModal>
      )}
      {emptyComment && (
        <CustomModal
          modalText1={"내용이 비어있습니다."}
          modalText2={"댓글은 최소 1글자 이상 채워주세요."}
        >
          <ModalButton onClick={() => setEmptyComment((prev) => !prev)}>
            닫기
          </ModalButton>
        </CustomModal>
      )}
    </CounselCommentContainer>
  );
};

const CoComentButton = styled.button`
  font-weight: 400;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: right;
  padding: 8px;
  font-size: 12px;
  line-height: 14px;
  background: rgba(101, 216, 223, 0.3);
  border-radius: 999px;
  color: #15b5bf;
  border: none;
  width: 100px;
`;

const CocomentContainer = styled.div`
  padding: 12px 0;
  margin: 20px 0 0 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const CocomentItem = styled.div`
  display: flex;
  flex-direction: row;
  width: 90%;
  align-content: right;
  margin: 10px 0;
`;

export const ManageButtonContainer = styled.div`
  & button {
    background-color: transparent;
    padding: 4px 8px;
    font-size: 0.8rem;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    &:hover {
      background: rgba(101, 216, 223, 0.3);
    }
  }
  & button:nth-of-type(1) {
    color: #65d8df;
  }
  & button:nth-of-type(2) {
    color: #c5c5c5;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 0;
  & div:nth-of-type(1) {
    display: flex;
    & div:nth-of-type(1) {
      font-size: 14px;
      margin-right: 8px;
    }
    & div:nth-of-type(2) {
      ::before {
        content: "게시일 • ";
      }
      color: #c5c5c5;
      font-weight: 400;
      font-size: 12px;
    }
  }

  @media screen and (max-width: 500px) {
    & > div {
      flex-direction: column;
      margin-bottom: 4px;
    }
  }
`;

const CounselInfo = styled.div`
  padding: 10px 0;
  display: flex;
  justify-content: space-between;
`;

const CounselLists = styled.ul`
  padding: 0;
  height: 50vh;
  overflow-y: scroll;
`;

const CounselItem = styled.li`
  display: flex;
  justify-content: space-between;
  margin: 16px 0;
  flex-direction: column;
`;

const CounselCommentContainer = styled.div`
  width: 80vw;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 0;
`;

const CounselCommentForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 auto;
  gap: 0 4px;

  & button:nth-of-type(1) {
    color: #65d8df;
    background-color: transparent;
    padding: 4px;
    border: none;
    cursor: pointer;
  }

  & button:nth-of-type(2) {
    color: #c5c5c5;
    background-color: transparent;
    padding: 4px;
    border: none;
    cursor: pointer;
  }
`;

const CounselInput = styled.input`
  border: none;
  border-bottom: 1px solid #c5c5c5;
  padding: 10px 0 10px 5px;
  margin-left: 10px;
  flex-grow: 1;
`;

const UserProfileImg = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50px;
  margin-right: 10px;
  object-fit: cover;
`;

const CounselEditInput = styled.input`
  border: none;
  border-bottom: 1px solid #c5c5c5;
  padding: 10px 0 10px 5px;
  margin-left: 10px;
`;

export default CounselComments;
