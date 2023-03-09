import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { REVIEW_SERVER } from "../share/server";

// 타입 지정
interface INewPetsult {
  data: {
    id: string;
    content: any;
    nickname: any;
    profileImg: any;
    createdAt: number;
    uid: any;
  }[];
}

// 상담 게시글 추가

export const useGetPetConsult = ({ limit }: any) => {
  const { data: petConsult, isLoading: isLoadingPetConsult } =
    useQuery<INewPetsult>({
      queryKey: ["getCounsel", limit],
      queryFn: () => {
        return axios.get(
          `${REVIEW_SERVER}qna?_sort=createdAt&_order=desc${limit}`,
        );
      },
    });
  return { isLoadingPetConsult, petConsult };
};

const addCounsel = (newCounsult: any) => {
  return axios.post(`${REVIEW_SERVER}qna`, newCounsult);
};

export const useAddCounsel = () => {
  console.log("작성 완료");
  return useMutation(addCounsel);
};

// 상담 게시글 불러오기

export const useGetCounselTarget = (id: any) => {
  const { data: targetTime } = useQuery(
    ["getCounsels", id],
    () => {
      return axios.get(`${REVIEW_SERVER}qna/${id}`);
    },
    {
      // id가 존재할 때만 실행
      enabled: !!id,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      cacheTime: 0,
      select: (data) => data?.data.createdAt,
    },
  );

  const { data: CounselList } = useQuery(
    ["infiniteComments", targetTime],
    async () =>
      await axios.get(
        `${REVIEW_SERVER}qna?_sort=createdAt&_order=desc&createdAt_lte=${targetTime}`,
      ),
    {
      enabled: !!targetTime,
      select: (data) => data?.data,
    },
  );

  return { CounselList };
};

// 상담 게시글 수정

const editCounsel = (newCounsel: any) => {
  return axios.patch(`${REVIEW_SERVER}qna/${newCounsel.id}`, newCounsel);
};

export const useEditCounsel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editCounsel,
    onMutate: async (newCounsel: any) => {
      // mutation 취소
      await queryClient.cancelQueries({ queryKey: ["getCounsel"] });
      const oldCounsel = queryClient.getQueriesData(["getCounsel"]);
      queryClient.setQueriesData(["getCounsel"], newCounsel);
      return { oldCounsel, newCounsel };
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
      queryClient.invalidateQueries({ queryKey: ["infiniteComments"] });
    },
  });
};

// 상담 게시글 삭제

const deleteCounsel = (targetId: any) => {
  console.log("deleteCOunsel");
  return axios.delete(`${REVIEW_SERVER}qna/${targetId}`);
};

export const useDeletCounsel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // useMutation은 쿼리키, api호출함수, 옵션 3개의 인자를 답는다.
    mutationFn: deleteCounsel,
    mutationKey: ["getCounsel"],
    onMutate: async (newCounsel) => {
      //     // mutation 취소
      await queryClient.cancelQueries({ queryKey: ["getCounsel"] });
      const oldCounsel = queryClient.getQueriesData(["getCounsel"]);
      queryClient.setQueriesData(["getCounsel"], newCounsel);
      return { oldCounsel, newCounsel };
      //     // 낙관적 업데이트를 하면 성공을 가졍하고 업데이트하는데 실패시 롤덱용 스냅샷을 만든다.
      //     // 낙관적 업데이트를 통해 캐시 수정
    },
    onSuccess(data, variables, context) {
      // 성공 시 실행
      console.log("qna 삭제 성공");
      queryClient.invalidateQueries(["infiniteComments", "pagnationCounsel"]);
    },
    onError: (error, newCounsel, context) => {
      // 실패 시 실행. 롤백을 해주어야 함
      console.log("실패", error, newCounsel, context);
      queryClient.setQueryData(["getCounsel"], context?.oldCounsel);
    },
    onSettled: () => {
      // 무조건 실행
      console.log("qna 삭제 실행");
      // queryClient.invalidateQueries(["infiniteComments", "pagnationCounsel"]);
    },
  });
};
