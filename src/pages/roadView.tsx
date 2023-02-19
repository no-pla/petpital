import React from "react";
import { Roadview } from "react-kakao-maps-sdk";

function roadView() {
  return (
    <Roadview // 로드뷰를 표시할 Component
      position={{
        // 지도의 중심좌표
        lat: 33.450701,
        lng: 126.570667,
        radius: 50,
      }}
      // 지도의 크기
      style={{ width: "380px", height: "300px" }}
    />
  );
}

export default roadView;
