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

interface IComment {
  comment: {
    cocoment: {
      commentId: string;
      content: string;
      createdAt: string;
      id: string;
      nickname: string;
      profileImage: string;
      targetNickname: string;
      uid: string;
    }[];
    content: string;
    counselId: string;
    createdAt: number;
    id: string;
    nickname: string;
    profileImg: string;
    uid: string;
  };
}

const CounselComments = ({ target }: any) => {
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const [isOpenComment, setIsOpenComment] = useState<boolean[]>([]);
  const [emptyComment, setEmptyComment] = useState(false);
  const { mutate: addNewComment } = useAddCounselComment();
  const { mutate: editComment } = useEditCounselComment();
  const { data: commentList } = useGetPetConsultComment();
  const { mutate: deleteComment } = useDeletCounselComment();
  const newCommentRef = useRef<HTMLInputElement>(null);
  const newEditCommentRef = useRef<HTMLInputElement>(null);
  const newCoCommentRef = useRef<HTMLInputElement>(null);
  const newEditCoCommentRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 리뷰 개별 수정 가능하기 위해 추가
    // if (commentList?.data) {
    //   for (let i = 0; i < commentList.data.length; i++) {
    //     setIsOpen((prev) => [...prev, false]);
    //     setIsOpenComment((prev) => [...prev, false]);
    //   }
    // }
  }, [commentList]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // 새로운 코맨트 작성
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

  const EditCoCommentInput = () => {
    return <CounselEditInput ref={newEditCoCommentRef} />;
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
      // isOpenComment[index] = false;
    }
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
    if (newEditCoCommentRef.current?.value !== "") {
      console.log();
      // data.findIndex((item) => item.id === idToFind);

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
      // console.log(newCommentObj);
      await editComment(newCommentObj);
    }
  };

  const Comment = ({ comment }: IComment) => {
    const [isEdit, setIsEdit] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [targetId, setTargetId] = useState("");

    // 삭제
    const deleteReview = async () => {
      setOpenModal((prev) => !prev);
      await deleteComment(targetId);
    };

    const onDelete = (id: string) => {
      setOpenModal((prev) => !prev);
      setTargetId(id);
    };

    // 수정
    const onSumbitNewComment = (
      event: React.FormEvent<HTMLFormElement>,
      comment: any,
    ) => {
      // 코멘트 수정
      event.preventDefault();
      if (newEditCommentRef?.current?.value === "") {
        // setEmptyComment((prev) => !prev);
      } else {
        editComment({ ...comment, content: newEditCommentRef?.current?.value });
      }
    };

    return (
      <div>
        {comment.counselId === target && (
          <>
            {isEdit ? (
              <form onSubmit={(event) => onSumbitNewComment(event, comment)}>
                <EditCommentInput comment={comment.content} />
                <button
                  type="button"
                  onClick={() => setIsEdit((prev) => !prev)}
                >
                  수정 취소
                </button>
                <button>작성</button>
              </form>
            ) : (
              <>
                <div>{comment.content}</div>
                <button onClick={() => setIsEdit((prev) => !prev)}>
                  댓글수정
                </button>
                <button onClick={() => onDelete(comment.id)}>댓글삭제</button>
              </>
            )}
            <CoComment key={comment.id} comment={comment} />
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
          </>
        )}
      </div>
    );
  };

  const CoComment = ({ comment }: IComment) => {
    // 대댓글
    const [openModal, setOpenModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [target, setTarget] = useState("");

    return (
      <>
        {isEdit ? (
          <>
            <form onSubmit={(event) => onSubmitCoComent(event, comment)}>
              <CoCommentInput />
            </form>
            <button onClick={() => setIsEdit((prev) => !prev)}>
              대대댓 등록 닫기
            </button>
          </>
        ) : (
          <button onClick={() => setIsEdit((prev) => !prev)}>
            대댓 작성 버튼
          </button>
        )}

        {comment.cocoment.map((cocomentItem: any) => {
          return (
            <CoComentForm
              key={cocomentItem.commentId}
              comment={{ ...comment, cocomentItem }}
              cocomentItem={cocomentItem}
            />
          );
        })}
      </>
    );
  };

  const CoComentForm = ({ comment, cocomentItem }: any) => {
    const [isEdit, setIsEdit] = useState(false);
    const [target, setTarget] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const deleteCoComent = (comment: any, id: any) => {
      const newCommentObj = {
        ...comment,
        cocoment: comment.cocoment.filter((test: any) => test.commentId !== id),
      };
      editComment(newCommentObj);
    };
    const onDelete = async (id: string) => {
      setTarget(id);
      setOpenModal((prev) => !prev);
    };

    return (
      <>
        {!isEdit ? (
          <div>
            <div>대댓입니다 ----- {cocomentItem.content}</div>
            <button onClick={() => setIsEdit((prev) => !prev)}>
              대댓수정하기
            </button>
            <button onClick={() => onDelete(cocomentItem.commentId)}>
              삭제대댓삭제
            </button>
          </div>
        ) : (
          <div>
            <form
              onSubmit={(event) => EditCoComent(comment, cocomentItem, event)}
            >
              <EditCoCommentInput />
              {/* <button onClick={() => onDelete(coco.commentId)}>
                삭제대댓삭제
              </button>{" "} */}
            </form>
            <button onClick={() => setIsEdit((prev) => !prev)}>
              수정취소하기
            </button>
          </div>
        )}
        {openModal && (
          <CustomModal
            modalText1={"입력하신 댓글을"}
            modalText2={"삭제 하시겠습니까?"}
          >
            <ModalButton onClick={() => setOpenModal((prev) => !prev)}>
              취소
            </ModalButton>
            <ModalButton onClick={() => deleteCoComent(comment, target)}>
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
      </>
    );
  };

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
      <div>
        {commentList?.data?.map((comment: any) => {
          return <Comment key={comment.id} comment={comment} />;
        })}
      </div>
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
