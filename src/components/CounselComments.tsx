import { authService } from "../firebase/firebase";
import {
  useAddCounselComment,
  useDeletCounselComment,
  useEditCounselComment,
  useGetPetConsultComment,
} from "../hooks/usePetsultReview";
import styled from "@emotion/styled";
import React, { useRef, useState } from "react";
import { AiOutlineMore } from "react-icons/ai";

import shortUUID from "short-uuid";
import { UserProfile } from "./CounselPost";
import CustomModal, { ModalButton } from "./custom/ErrorModal";
const short = require("short-uuid");

const CounselComments = ({ target }: any) => {
  return (
    <CounselCOmmentContainer>
      <CounselCommentFormContainer target={target} />
      <CounselCommentList target={target} />
    </CounselCOmmentContainer>
  );
};

const CounselCommentFormContainer = ({ target }: any) => {
  const newCommentRef = useRef<HTMLInputElement>(null);
  const { mutate: addNewComment } = useAddCounselComment();
  const [emptyComment, setEmptyComment] = useState(false);
  const [tooLongComment, setTooLongComment] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // 새로운 코맨트 작성
    event.preventDefault();

    if (
      newCommentRef.current?.value === "" ||
      newCommentRef.current?.value === undefined
    ) {
      setEmptyComment((prev) => !prev);
      return;
    } else if (newCommentRef.current?.value.length > 300) {
      setTooLongComment((prev) => !prev);
      return;
    } else {
      const newComment = {
        uid: authService.currentUser?.uid,
        counselId: target,
        id: shortUUID.generate(),
        content: newCommentRef.current?.value,
        nickname: authService.currentUser?.displayName,
        profileImg:
          authService.currentUser?.photoURL ||
          "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FComponent%209.png?alt=media&token=ee6ff59f-3c4a-4cea-b5ff-c3f20765a606",
        createdAt: Date.now(),
        cocoment: [],
      };
      // console.log(newComment);
      await addNewComment(newComment);
    }
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

  return (
    <>
      <CounselCommentForm onSubmit={onSubmit}>
        <div>
          <UserProfile
            profileLink={
              authService?.currentUser?.photoURL
                ? authService?.currentUser.photoURL
                : "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2FComponent%209.png?alt=media&token=ee6ff59f-3c4a-4cea-b5ff-c3f20765a606"
            }
          />
          <NewCommentInput />
        </div>
        <FormButtonContainer>
          {/* <button type="button">취소</button> */}
          <CommentFormButton type="submit">답글</CommentFormButton>
        </FormButtonContainer>
      </CounselCommentForm>
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
      {tooLongComment && (
        <CustomModal
          modalText1={"내용이 너무 깁니다.."}
          modalText2={"댓글은 최대 300글자까지만 작성해 주세요."}
        >
          <ModalButton onClick={() => setTooLongComment((prev) => !prev)}>
            닫기
          </ModalButton>
        </CustomModal>
      )}
    </>
  );
};

const CounselCommentList = ({ target }: any) => {
  const { data: commentList } = useGetPetConsultComment(target);

  return (
    <CounselCommentListContainer>
      {commentList?.data
        ?.filter((temp: any) => temp.counselId === target)
        .map((comment: any) => {
          return <CounselCommentItem key={comment.id} comment={comment} />;
        })}
    </CounselCommentListContainer>
  );
};

const CounselCommentItem = ({ comment }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [onSetting, setOnSetting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [targetId, setTargetId] = useState("");
  const { mutate: editComment } = useEditCounselComment();
  const { mutate: deleteComment } = useDeletCounselComment();
  const [emptyComment, setEmptyComment] = useState(false);
  const [tooLongComment, setTooLongComment] = useState(false);
  const newEditCommentRef = useRef<HTMLInputElement>(null);

  const onSumbitNewComment = (
    event: React.FormEvent<HTMLFormElement>,
    comment: any,
  ) => {
    // 코멘트 수정
    event.preventDefault();
    if (
      newEditCommentRef?.current?.value === "" ||
      newEditCommentRef?.current?.value === undefined
    ) {
      setEmptyComment((prev) => !prev);
      return;
    } else {
      editComment({ ...comment, content: newEditCommentRef?.current?.value });
    }
  };
  const EditCommentInput = ({ comment }: any) => {
    return <CounselEditInput ref={newEditCommentRef} placeholder={comment} />;
  };

  const deleteReview = async () => {
    setOpenModal((prev) => !prev);
    await deleteComment(targetId);
  };

  const onDelete = (id: string) => {
    setOpenModal((prev) => !prev);
    setTargetId(id);
  };

  return (
    <>
      <UserProfileContainer>
        <UserProfile profileLink={comment.profileImg} />
        <div style={{ width: "100%" }}>
          <div>
            <div>{comment.nickname}</div>
            <div>{new Date(comment.createdAt).toLocaleString("ko-KR")}</div>
          </div>
          {!isEdit ? (
            <>
              <CounselContent>{comment.content}</CounselContent>
              <CounselContentButtonContainer>
                {(authService.currentUser?.uid === comment.uid ||
                  authService.currentUser === undefined) && (
                  <SettingButton onClick={() => setOnSetting((prev) => !prev)}>
                    <AiOutlineMore />
                  </SettingButton>
                )}
                {onSetting && (
                  <PostSettingButtons>
                    <PostSettingButton
                      onClick={() => {
                        setIsEdit((prev) => !prev);
                        setOnSetting(false);
                      }}
                    >
                      수정하기
                    </PostSettingButton>
                    <PostSettingButton onClick={() => onDelete(comment.id)}>
                      삭제하기
                    </PostSettingButton>
                  </PostSettingButtons>
                )}
              </CounselContentButtonContainer>
            </>
          ) : (
            <>
              <CommentForm
                onSubmit={(event) => onSumbitNewComment(event, comment)}
              >
                <EditCommentInput comment={comment.content} />
                <FormButtonContainer>
                  <button
                    type="button"
                    onClick={() => setIsEdit((prev) => !prev)}
                  >
                    취소
                  </button>
                  <button type="submit">확인</button>
                </FormButtonContainer>
              </CommentForm>
            </>
          )}
          <CoComentForm comment={comment} />
        </div>
      </UserProfileContainer>
      <CounselCoComment comment={comment} />
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
      {tooLongComment && (
        <CustomModal
          modalText1={"내용이 너무 깁니다.."}
          modalText2={"댓글은 최대 300글자까지만 작성해 주세요."}
        >
          <ModalButton onClick={() => setTooLongComment((prev) => !prev)}>
            닫기
          </ModalButton>
        </CustomModal>
      )}
    </>
  );
};

const CounselCoComment = ({ comment }: any) => {
  return (
    <CounselCoCommentListContainer>
      {comment.cocoment?.length > 0 &&
        comment.cocoment.map((coco: any) => {
          return (
            <CounselCoCommentItem
              key={coco.commentId}
              comment={comment}
              coco={coco}
            />
          );
        })}
    </CounselCoCommentListContainer>
  );
};

const CounselCoCommentItem = ({ comment, coco }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [targetId, setTargetId] = useState("");
  const { mutate: editComment } = useEditCounselComment();
  const newEditCoCommentRef = useRef<HTMLInputElement>(null);
  const [onSetting, setOnSetting] = useState(false);
  const [emptyComment, setEmptyComment] = useState(false);
  const [tooLongComment, setTooLongComment] = useState(false);

  const deleteCoComent = async (comment: any, id: any) => {
    const newCommentObj = {
      ...comment,
      cocoment: comment.cocoment.filter(
        (target: any) => target.commentId !== id,
      ),
    };
    await editComment(newCommentObj);
  };

  const onDelete = async (id: string) => {
    setTargetId(id);
    setOpenModal((prev) => !prev);
  };

  const EditCoCommentInput = ({ placeHolder }: any) => {
    return (
      <CounselEditInput ref={newEditCoCommentRef} placeholder={placeHolder} />
    );
  };

  const EditCoComent = async (
    comment: any,
    targetCocoment: any,
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    const idx = comment.cocoment.findIndex(
      (target: any) => target.commentId === targetCocoment.commentId,
    );

    if (
      newEditCoCommentRef.current?.value === "" ||
      newEditCoCommentRef.current?.value === undefined
    ) {
      setEmptyComment((prev) => !prev);
      return;
    } else if (newEditCoCommentRef.current?.value.length > 300) {
      setTooLongComment((prev) => !prev);
      return;
    } else {
      const newCommentObj = {
        ...comment,
        cocoment: [
          ...comment.cocoment.slice(0, idx),
          {
            ...targetCocoment,
            content: newEditCoCommentRef.current?.value,
          },
          ...comment.cocoment.slice(idx + 1),
        ],
      };
      await editComment(newCommentObj);
    }
  };

  return (
    <>
      <div>
        <UserProfileContainer>
          <UserProfile profileLink={coco.profileImage} />
          <div style={{ width: "100%" }}>
            <div style={{ width: "100%" }}>
              <div>
                <div>{coco.nickname}</div>
                <div>{coco.createdAt}</div>
              </div>
            </div>

            {!isEdit ? (
              <>
                <div>{coco.content}</div>
              </>
            ) : (
              <>
                <CoComentEditForm
                  onSubmit={(event) => EditCoComent(comment, coco, event)}
                >
                  <EditCoCommentInput placeHolder={coco.content} />
                  <FormButtonContainer>
                    <button
                      type="button"
                      onClick={() => setIsEdit((prev) => !prev)}
                    >
                      취소
                    </button>
                    <button type="submit">확인</button>
                  </FormButtonContainer>
                </CoComentEditForm>
              </>
            )}
            <>
              {(authService.currentUser?.uid === coco.uid ||
                authService.currentUser === undefined) && (
                <CounselContentButtonContainer>
                  <SettingButton onClick={() => setOnSetting((prev) => !prev)}>
                    <AiOutlineMore />
                  </SettingButton>
                  {onSetting && (
                    <PostSettingButtons>
                      <PostSettingButton
                        onClick={() => {
                          setIsEdit((prev) => !prev);
                          setOnSetting(false);
                        }}
                      >
                        수정
                      </PostSettingButton>
                      <PostSettingButton
                        onClick={() => onDelete(coco.commentId)}
                      >
                        삭제
                      </PostSettingButton>
                    </PostSettingButtons>
                  )}
                </CounselContentButtonContainer>
              )}
            </>
          </div>
        </UserProfileContainer>
      </div>
      {openModal && (
        <CustomModal
          modalText1={"입력하신 댓글을"}
          modalText2={"삭제 하시겠습니까?"}
        >
          <ModalButton onClick={() => setOpenModal((prev) => !prev)}>
            취소
          </ModalButton>
          <ModalButton onClick={() => deleteCoComent(comment, targetId)}>
            삭제
          </ModalButton>
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
      {tooLongComment && (
        <CustomModal
          modalText1={"내용이 너무 깁니다.."}
          modalText2={"댓글은 최대 300글자까지만 작성해 주세요."}
        >
          <ModalButton onClick={() => setTooLongComment((prev) => !prev)}>
            닫기
          </ModalButton>
        </CustomModal>
      )}
    </>
  );
};

const CoComentForm = ({ comment }: any) => {
  const [isEdit, setIsEdit] = useState(false);
  const newCoCommentRef = useRef<HTMLInputElement>(null);
  const { mutate: editComment } = useEditCounselComment();
  const [emptyComment, setEmptyComment] = useState(false);
  const [tooLongComment, setTooLongComment] = useState(false);

  const CoCommentInput = () => {
    return (
      <CounselEditInput
        ref={newCoCommentRef}
        disabled={authService.currentUser === null}
        placeholder={
          authService.currentUser === null
            ? "로그인 후 이용해 주세요"
            : "답글을 입력해 주세요."
        }
      />
    );
  };

  const onSubmitCoComent = (
    event: React.FormEvent<HTMLFormElement>,
    comment: any,
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
    if (
      newCoCommentRef.current?.value === "" ||
      newCoCommentRef.current?.value === undefined
    ) {
      setEmptyComment((prev) => !prev);
      return;
    } else if (newCoCommentRef.current?.value.length > 300) {
      setTooLongComment((prev) => !prev);
      return;
    } else {
      editComment(cocomentObj);
    }
  };

  return (
    <>
      <CoCommentContainer>
        {isEdit ? (
          <>
            <CoComentFormContainer
              onSubmit={(event) => onSubmitCoComent(event, comment)}
            >
              <CoCommentInput />
              <FormButtonContainer>
                <button
                  type="button"
                  onClick={() => setIsEdit((prev) => !prev)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={authService.currentUser === null}
                >
                  등록
                </button>
              </FormButtonContainer>
            </CoComentFormContainer>
          </>
        ) : (
          <CoComentFormButton onClick={() => setIsEdit((prev) => !prev)}>
            답글
          </CoComentFormButton>
        )}
      </CoCommentContainer>
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
      {tooLongComment && (
        <CustomModal
          modalText1={"내용이 너무 깁니다.."}
          modalText2={"댓글은 최대 300글자까지만 작성해 주세요."}
        >
          <ModalButton onClick={() => setTooLongComment((prev) => !prev)}>
            닫기
          </ModalButton>
        </CustomModal>
      )}
    </>
  );
};

export default CounselComments;

const CommentFormButton = styled.button`
  color: #15b5bf;
  border-radius: 999px;
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  background-color: transparent;
  &:hover {
    background-color: rgba(101, 216, 223, 0.3);
  }
`;

const SettingButton = styled.button`
  background-color: transparent;
  border: none;
`;

const CoComentEditForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const CoComentFormContainer = styled.form`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const CounselCoCommentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 64px;
`;

const CounselCommentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

const CommentForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  & button:nth-of-type(1) {
    background-color: transparent;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
  }

  & button:nth-of-type(2) {
    color: #15b5bf;
    border-radius: 999px;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    background-color: transparent;
    &:hover {
      background: rgba(101, 216, 223, 0.3);
    }
  }
`;

const CoComentFormButton = styled.div`
  font-weight: 400;
  font-size: 0.8rem;
  line-height: 14px;
  color: #15b5bf;
  padding: 8px 0;
`;

const CoCommentContainer = styled.div``;

const PostSettingButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 8px;
  gap: 8px;
  width: 104px;
  height: 32px;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  font-family: "Pretendard";
  font-size: 12px;
  color: #9f9f9f;
`;

const PostSettingButtons = styled.div`
  position: absolute;
  /* top: 16px; */
  right: 0;
  & button:nth-of-type(1) {
    border-bottom: 0.4px solid #9f9f9f;
  }
  filter: drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.2));
  display: flex;
  flex-direction: column;
  background-color: white;
`;

const CounselContentButtonContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  border-radius: 4px;
`;

const CounselContent = styled.div`
  padding: 4px 0;
`;

const UserProfileContainer = styled.div`
  display: flex;
  position: relative;
  & div:nth-of-type(1) {
    display: flex;
    gap: 8px;

    align-items: stretch;
    & div:nth-of-type(1) {
      font-weight: 500;
      font-size: 0.9rem;
    }
    & div:nth-of-type(2) {
      font-weight: 500;
      font-size: 0.7rem;
      line-height: 14px;
      color: #c5c5c5;
    }
  }
`;

const CounselCOmmentContainer = styled.div`
  margin-left: 16px;
`;

const FormButtonContainer = styled.div`
  padding-top: 12px;
  text-align: right;
  & button:nth-of-type(1) {
    background-color: transparent;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
  }

  & button:nth-of-type(2) {
    color: #15b5bf;
    border-radius: 999px;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    background-color: transparent;
    &:hover {
      background: rgba(101, 216, 223, 0.3);
    }
  }
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

const CounselCommentForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  & div:nth-of-type(1) {
    display: flex;
  }
  & button:nth-of-type(1) {
    background-color: transparent;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
  }

  & button:nth-of-type(2) {
    color: #15b5bf;
    border-radius: 999px;
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    background-color: transparent;
    &:hover {
      background: rgba(101, 216, 223, 0.3);
    }
  }
`;

const CounselInput = styled.input`
  border: none;
  border-bottom: 1px solid #c5c5c5;
  padding: 10px 0 10px 5px;
  margin-left: 10px;
  flex-grow: 1;
`;

const CounselEditInput = styled.input`
  border: none;
  border-bottom: 1px solid #c5c5c5;
  padding: 10px 0 10px 5px;
  margin-left: 10px;
  width: 100%;
`;
