import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";

// 게시글 수정

const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async (updatedPost) => {
      const response = await axios.put(
        `/api/posts/${updatedPost.id}`,
        updatedPost,
      );
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("posts");
      },
    },
  );
};

export default useUpdatePost;
