import axios from "axios";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";

const short = require("short-uuid");

const CounselComments = ({ target }: any) => {
  const [enteredComment, setEnteredComment] = useState("");
  const [newComment, setNewComent] = useState("");
  const [isOpen, setIsOpen] = useState<boolean[]>([]);
  const { data: commentList, refetch } = useQuery("getComments", () => {
    return axios.get(`http://localhost:3001/qnaReview`);
  });

  useEffect(() => {
    // 리뷰 개별 수정 가능하기 위해 추가
    if (commentList) {
      for (let i = 0; i < commentList.data.length; i++) {
        setIsOpen((prev) => [...prev, false]);
      }
    }
    refetch();
  }, [commentList]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
    axios.post(`http://localhost:3001/qnaReview`, newComment);
    setEnteredComment("");
  };

  const onDelete = (id: string) => {
    return axios.delete(`http://localhost:3001/qnaReview/${id}`);
  };

  const onSumbitNewComment = (
    event: React.FormEvent<HTMLFormElement>,
    comment: any,
    index: any,
  ) => {
    event.preventDefault();
    if (newComment === "") {
      alert("빈탄");
    } else {
      const newArray = [...isOpen];
      newArray[index] = false;
      setIsOpen(newArray);
      return axios.patch(`http://localhost:3001/qnaReview/${comment.id}`, {
        ...comment,
        content: newComment,
      });
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
    <>
      <form onSubmit={onSubmit}>
        <input
          value={enteredComment}
          onChange={(event) => {
            setEnteredComment(event.target.value);
          }}
        />
      </form>
      <ul>
        {commentList?.data.map((comment: any, index: any) => {
          return (
            comment.counselId === target && (
              <li key={comment.id}>
                {!isOpen[index] ? (
                  <div>{comment.content}</div>
                ) : (
                  <form
                    onSubmit={(event) =>
                      onSumbitNewComment(event, comment, index)
                    }
                  >
                    <input
                      placeholder={comment.content}
                      onChange={(event) => setNewComent(event?.target.value)}
                    />
                    <button type="submit">등록하기</button>
                    <button type="button" onClick={() => closeIpt(index)}>
                      취소하기
                    </button>
                  </form>
                )}
                <button onClick={() => onDelete(comment.id)}>삭제</button>
                {!isOpen[index] && (
                  <button onClick={() => openIpt(index)}>수정</button>
                )}
              </li>
            )
          );
        })}
      </ul>
    </>
  );
};

export default CounselComments;
