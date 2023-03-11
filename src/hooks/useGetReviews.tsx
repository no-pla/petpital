import axios from "axios";
import { useQuery, useQueryClient } from "react-query";
import { REVIEW_SERVER } from "../share/server";

interface IReview {
  data: {
    title: string;
    contents: string;
    totalCost: string;
    rating: number;
    selectedColors: string[];
    downloadUrl: string;
    hospitalId: string;
    id: string;
    userId: any;
    profileImage: string;
    displayName: string;
    date: string;
    hospitalAddress: string;
    hospitalName: string;
    uid: any;
  }[];
}

export const useGetReviews = (limit: string) => {
  const {
    isLoading,
    data: recentlyReview,
    refetch: recentlyRefetch,
    isRefetching: isrecentlyRefetch,
  } = useQuery<any>(["getrecentlyReview", limit], async () => {
    // const tempArray: any = [];
    return await axios.get(`${REVIEW_SERVER}posts${limit}`);

    // for (const review of res.data) {
    //   const userData = await axios.get(
    //     `${REVIEW_SERVER}users/${review.userId}`,
    //   );

    //   const tempReview = {
    //     ...review,
    //     displayName: userData.data.nickname,
    //     profileImage: userData.data.profileImage,
    //   };
    //   tempArray.push(tempReview);
    // }
    // return tempArray;
  });

  return { recentlyReview, isLoading, recentlyRefetch, isrecentlyRefetch };
};
