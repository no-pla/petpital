import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

// 타입 지정
interface INewPetsult {
  filter(arg0: (log: any) => void): INewPetsult;
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
          `https://swift-flash-alfalfa.glitch.me/posts?_sort=createdAt&_order=desc${limit}`,
        );
      },
    });
  return { isLoadingPetConsult, petConsult };
};

const addCounsel = (newCounsult: any) => {
  return axios.post("https://swift-flash-alfalfa.glitch.me/posts", newCounsult);
};

export const useAddCounsel = () => {
  return useMutation(addCounsel);
};

// 상담 게시글 불러오기

export const useGetCounselTarget = (id: any) => {
  const { data } = useQuery(
    ["getCounsels", id],
    () => {
      return axios.get(`https://swift-flash-alfalfa.glitch.me/posts/${id}`);
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
  return { data };
};

export const useGetCounselList = (targetTime: any) => {
  const { data, isLoading } = useQuery(
    "getCounsel",
    () => {
      return axios.get(
        `https://swift-flash-alfalfa.glitch.me/posts?_sort=createdAt&_order=desc&createdAt_lte=${targetTime}`,
      );
    },
    {
      // targetTime이 존재할 때만 실행
      enabled: !!targetTime,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      cacheTime: 0,
    },
  );

  return { data, isLoading };
};
// 상담 게시글 수정

const editCounsel = (newCounsel: any) => {
  return axios.patch(
    `https://swift-flash-alfalfa.glitch.me/posts/${newCounsel.id}`,
    newCounsel,
  );
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
      queryClient.invalidateQueries({ queryKey: ["getCounsel"] });
    },
  });
};

// 상담 게시글 삭제

const deleteCounsel = (targetId: any) => {
  return axios.delete(
    `https://swift-flash-alfalfa.glitch.me/posts/${targetId}`,
  );
};

export const useDeletCounsel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // useMutation은 쿼리키, api호출함수, 옵션 3개의 인자를 답는다.
    mutationFn: deleteCounsel,
    mutationKey: ["getCounsel"],
    onMutate: async (newCounsel) => {
      // mutation 취소
      await queryClient.cancelQueries({ queryKey: ["getCounsel"] });
      const oldCounsel = queryClient.getQueriesData(["getCounsel"]);
      queryClient.setQueriesData(["getCounsel"], newCounsel);
      return { oldCounsel, newCounsel };
      // 낙관적 업데이트를 하면 성공을 가졍하고 업데이트하는데 실패시 롤덱용 스냅샷을 만든다.
      // 낙관적 업데이트를 통해 캐시 수정
    },
    onSuccess(data, variables, context) {
      // 성공 시 실행
      // console.log("성공");
    },
    onError: (error, newCounsel, context) => {
      // 실패 시 실행. 롤백을 해주어야 함
      console.log("실패", error, newCounsel, context);
      queryClient.setQueryData(["getCounsel"], context?.oldCounsel);
    },
    onSettled: () => {
      // 무조건 실행
      queryClient.invalidateQueries({ queryKey: ["infiniteComments"] });
    },
  });
};
