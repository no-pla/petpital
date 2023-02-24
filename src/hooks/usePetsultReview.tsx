import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

// 타입 지정

// 상담 게시글 불러오기

export const useGetPetConsultComment = () => {
  const { data, refetch } = useQuery(["getComments"], () => {
    return axios.get(
      `https://swift-flash-alfalfa.glitch.me/comments?_sort=createdAt&_order=desc`,
    );
  });

  return { data, refetch };
};

// 상담 게시글 코멘트 추가

const addCounselComment = (newCounselComment: any) => {
  return axios.post(
    `https://swift-flash-alfalfa.glitch.me/comments`,
    newCounselComment,
  );
};

export const useAddCounselComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCounselComment,
    onMutate: async (newCounselComment: any) => {
      // mutation 취소
      queryClient.cancelQueries({ queryKey: ["getComments"] });
      // 낙관적 업데이트를 하면 성공을 가졍하고 업데이트하는데 실패시 롤덱용 스냅샷을 만든다.
      const oldCounselComment = queryClient.getQueryData(["getComments"]);
      queryClient.setQueriesData(["getCounsel"], newCounselComment);
      return { oldCounselComment, newCounselComment };
      //낙관적 업데이트를 통해 캐시 수정
    },
    onError: (error, newCounsel, context) => {
      // 실패 시 실행. 롤백을 해주어야 함
      console.log("실패", error);
      queryClient.setQueryData(["getCounsel"], context?.oldCounselComment);
    },
    onSettled: () => {
      // 무조건 실행
      queryClient.invalidateQueries({ queryKey: ["getComments"] });
    },
  });
};

// 상담 게시글 코멘트 수정

const editCounselComment = (newCounselComment: any) => {
  return axios.patch(
    `https://swift-flash-alfalfa.glitch.me/comments/${newCounselComment.id}`,
    newCounselComment,
  );
};

export const useEditCounselComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editCounselComment,
    onMutate: async (newCounselComment: any) => {
      // mutation 취소
      await queryClient.cancelQueries({ queryKey: ["getComments"] });
      const oldCounsel = queryClient.getQueriesData(["getComments"]);
      queryClient.setQueriesData(["getComments"], newCounselComment);
      return { oldCounsel, newCounselComment };
      // 낙관적 업데이트를 하면 성공을 가졍하고 업데이트하는데 실패시 롤덱용 스냅샷을 만든다.
      //낙관적 업데이트를 통해 캐시 수정
    },
    onSuccess() {
      // 성공 시 실행
      // console.log("성공");
    },
    onError(error: any) {
      console.log(error);
    },
    onSettled() {
      queryClient.invalidateQueries({ queryKey: ["getComments"] });
    },
  });
};

// 상담 코멘트 삭제

const deleteCounselComment = (targetId: any) => {
  return axios.delete(
    `https://swift-flash-alfalfa.glitch.me/comments/${targetId}`,
  );
};

export const useDeletCounselComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // useMutation은 쿼리키, api호출함수, 옵션 3개의 인자를 답는다.
    mutationFn: deleteCounselComment,
    mutationKey: ["getComments"],
    onMutate: async (newCounsel) => {
      // mutation 취소
      await queryClient.cancelQueries({ queryKey: ["getComments"] });
      const oldCounsel = queryClient.getQueriesData(["getComments"]);
      queryClient.setQueriesData(["getComments"], newCounsel);
      return { oldCounsel, newCounsel };
      // 낙관적 업데이트를 하면 성공을 가졍하고 업데이트하는데 실패시 롤덱용 스냅샷을 만든다.
      // 낙관적 업데이트를 통해 캐시 수정
    },
    onSuccess(data, variables, context) {
      // 성공 시 실행
      //   console.log("성공");
    },
    onError: (error, newCounsel, context) => {
      // 실패 시 실행. 롤백을 해주어야 함
      console.log("실패", error);
      queryClient.setQueryData(["getComments"], context?.oldCounsel);
    },
    onSettled: () => {
      // 무조건 실행
      queryClient.invalidateQueries({ queryKey: ["getComments"] });
    },
  });
};
