import {
  useAddCounselComment,
  useDeletCounselComment,
  useEditCounselComment,
  useGetPetConsultComment,
} from "@/Hooks/usePetsultReview";
import styled from "@emotion/styled";
import axios from "axios";
import { useEffect, useState } from "react";
import CustomModal, { ModalButton } from "./custom/CustomModal";

const short = require("short-uuid");

const CounselComments = ({ target }: any) => {
  const [enteredComment, setEnteredComment] = useState("");
  const [newComment, setNewComent] = useState("");
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [targetId, setTargetId] = useState("");
  const [emptyComment, setEmptyComment] = useState(false);
  const { mutate: addNewComment } = useAddCounselComment();
  const { mutate: editComment } = useEditCounselComment();
  const { data: commentList } = useGetPetConsultComment();
  const { mutate: deleteComment } = useDeletCounselComment();

  useEffect(() => {
    // 리뷰 개별 수정 가능하기 위해 추가
    if (commentList?.data) {
      for (let i = 0; i < commentList.data.length; i++) {
        setIsOpen((prev) => [...prev, false]);
      }
    }
  }, [commentList]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (enteredComment === "") {
      setEmptyComment((prev) => !prev);
      return;
    } else {
      const newComment = {
        counselId: target,
        id: short.generate(),
        content: enteredComment,
        nickname: "임시닉네임",
        profileImg:
          "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/1676431476796?alt=media&token=2a8e780a-d89b-4274-bfe4-2a4e375fa23a",
        createdAt: Date.now(),
        onEdit: false,
      };
      addNewComment(newComment);
      setEnteredComment("");
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
    comment: any,
    index: any,
  ) => {
    event.preventDefault();
    if (newComment === "") {
      setEmptyComment((prev) => !prev);
    } else {
      const newArray = [...isOpen];
      newArray[index] = false;
      setIsOpen(newArray);
      editComment({ ...comment, content: newComment });
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

  return (
    <CounselCommentContainer>
      <CounselCommentForm onSubmit={onSubmit}>
        <UserProfileImg src="https://i.pinimg.com/originals/09/4b/57/094b575671def2c7e7adb60becdee7c4.jpg" />
        <CounselInput
          placeholder="답변 추가"
          value={enteredComment}
          onChange={(event) => {
            setEnteredComment(event.target.value);
          }}
        />
        {/* <button>댓글 등록하기</button> */}
      </CounselCommentForm>
      <CounselLists>
        {commentList?.data?.map((comment: any, index: any) => {
          return (
            comment.counselId === target && (
              <CounselItem key={comment.id}>
                <CounselInfo>
                  <UserProfileImg src={comment.profileImg} />
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
                            onSumbitNewComment(event, comment, index)
                          }
                        >
                          <CounselEditInput
                            placeholder={comment.content}
                            onChange={(event) =>
                              setNewComent(event?.target.value)
                            }
                          />
                          <button type="submit">등록하기</button>
                          <button type="button" onClick={() => closeIpt(index)}>
                            취소하기
                          </button>
                        </CounselCommentForm>
                      )}
                    </div>
                  </UserInfo>
                </CounselInfo>
                <div>
                  {!isOpen[index] && (
                    <>
                      <button onClick={() => onDelete(comment.id)}>삭제</button>
                      <button onClick={() => openIpt(index)}>수정</button>
                    </>
                  )}
                </div>
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

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
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
`;

const CounselInfo = styled.div`
  display: flex;
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
`;

const CounselCommentContainer = styled.div`
  width: 80vw;
  margin: 0 auto;
  padding: 40px 0;
`;

const CounselCommentForm = styled.form`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0 auto;
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
`;

const CounselEditInput = styled.input`
  border: none;
  border-bottom: 1px solid #c5c5c5;
  padding: 10px 0 10px 5px;
  margin-left: 10px;
`;

export default CounselComments;
//
