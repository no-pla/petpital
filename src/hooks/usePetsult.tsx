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

// 메인 화면에서 Q&A 가져옴

export const useGetPetConsult = ({ limit }: any) => {
  const {
    data: petConsult,
    isLoading: isLoadingPetConsult,
    refetch: mainCounselRefetch,
  } = useQuery<INewPetsult>({
    queryKey: ["getCounsel", limit],
    queryFn: () => {
      return axios.get(
        `${REVIEW_SERVER}qna?_sort=createdAt&_order=desc${limit}`,
      );
    },
  });
  return { isLoadingPetConsult, petConsult, mainCounselRefetch };
};

const addCounsel = async (newCounsult: any) => {
  return await axios.post(`${REVIEW_SERVER}qna`, newCounsult);
};

export const useAddCounsel = () => {
  // console.log("작성 완료");
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
      cacheTime: 0,
      select: (data) => data?.data.createdAt,
    },
  );

  const {
    data: CounselList,
    isRefetching,
    refetch: counselRefetch,
  } = useQuery(["infiniteCounsel", targetTime], async () => {
    // const tempArray: any = [];
    return await axios.get(
      `${REVIEW_SERVER}qna?_sort=createdAt&_order=desc&createdAt_lte=${targetTime}`,
    );
    //   for (const qna of res.data) {
    //     const userData: any = await axios.get(`${REVIEW_SERVER}users/${qna.uid}`);
    //     tempArray.push({
    //       ...qna,
    //       nickname: userData?.data?.nickname,
    //       profileImg: userData?.data?.profileImage,
    //     });
    //   }
    //   return tempArray;
  });

  return { CounselList, isRefetching, counselRefetch };
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
      await queryClient.cancelQueries({ queryKey: ["getCounsels"] });
      const oldCounsel = queryClient.getQueriesData(["getCounsels"]);
      queryClient.setQueriesData(["getCounsels"], newCounsel);
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
      queryClient.invalidateQueries({
        queryKey: ["infiniteCounsel", "pagnationCounsel"],
      });
    },
  });
};

// // 상담 게시글 삭제

// const deleteCounsel = (targetId: any) => {
//   console.log("deleteCounsel");
//   return axios.delete(`${REVIEW_SERVER}qna/${targetId}`);
// };

// export const useDeletCounsel = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     // useMutation은 쿼리키, api호출함수, 옵션 3개의 인자를 답는다.
//     mutationFn: deleteCounsel,
//     mutationKey: ["infiniteCounsel"],
//     onMutate: async (newCounsel) => {
//       //     // mutation 취소
//       await queryClient.cancelQueries({
//         queryKey: ["infiniteCounsel"],
//       });
//       const oldCounsel = queryClient.getQueriesData([
//         "infiniteCounsel",
//         "pagnationCounsel",
//       ]);
//       queryClient.setQueriesData(
//         ["infiniteCounsel", "pagnationCounsel"],
//         newCounsel,
//       );
//       return { oldCounsel, newCounsel };
//       //     // 낙관적 업데이트를 하면 성공을 가졍하고 업데이트하는데 실패시 롤덱용 스냅샷을 만든다.
//       //     // 낙관적 업데이트를 통해 캐시 수정
//     },
//     onSuccess: async (data, variables, context) => {
//       // 성공 시 실행
//       console.log("qna 삭제 성공");
//       queryClient.invalidateQueries([
//         "infiniteCounsel",
//         "pagnationCounsel",
//         "getCounsels",
//       ]);
//     },
//     onError: async (error, newCounsel, context) => {
//       // 실패 시 실행. 롤백을 해주어야 함
//       console.log("실패", error, newCounsel, context);
//       queryClient.invalidateQueries(["infiniteCounsel", "pagnationCounsel"]);
//     },
//     onSettled: async () => {
//       // 무조건 실행
//       console.log("qna 삭제 실행 끝");
//       queryClient.invalidateQueries([
//         "infiniteCounsel",
//         "pagnationCounsel",
//         "getCounsels",
//       ]);
//     },
//   });
// };

const deleteCounsel = (targetId: any) => {
  return axios.delete(`${REVIEW_SERVER}qna/${targetId}`);
};

export const useDeletCounsel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // useMutation은 쿼리키, api호출함수, 옵션 3개의 인자를 답는다.
    mutationFn: deleteCounsel,
    mutationKey: ["infiniteCounsel"],
    onMutate: async (newCounsel) => {
      // mutation 취소
      await queryClient.cancelQueries({ queryKey: ["infiniteCounsel"] });
      const oldCounsel = queryClient.getQueriesData(["infiniteCounsel"]);
      queryClient.setQueriesData(["infiniteCounsel"], newCounsel);
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
      queryClient.setQueryData(["infiniteCounsel"], context?.oldCounsel);
    },
    onSettled: () => {
      // 무조건 실행
      queryClient.invalidateQueries({ queryKey: ["infiniteCounsel"] });
    },
  });
};
