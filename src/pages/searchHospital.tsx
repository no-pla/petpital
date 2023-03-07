import { useGetReviews } from "@/hooks/useGetReviews";
import { currentUserUid, mainPetpitalList } from "@/share/atom";
import styled from "@emotion/styled";
import { useRouter } from "next/router";
import {
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  ReactPortal,
  useState,
  useEffect,
  useRef,
} from "react";
import {
  Map,
  MapMarker,
  MapTypeControl,
  Roadview,
  ZoomControl,
} from "react-kakao-maps-sdk";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import { hospitalData, modalState } from "../share/atom";
import CreatePostModal from "../components/custom/CreatePostModal";
import EditPostModal from "../components/custom/EditPostModal";
import { useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { REVIEW_SERVER } from "@/share/server";
import { CiEdit } from "react-icons/ci";
import { CiTrash } from "react-icons/ci";

interface IHospital {
  address_name: string;
  category_group_code: string;
  category_group_name: string;
  category_name: string;
  distance: string;
  id: string;
  phone: string;
  place_name: string;
  place_url: string;
  road_address_name: string;
  x: string;
  y: string;
}

/* 
  1. 로드뷰
  2. 내 위치 표시
  3. 스카이뷰 지도 전환 컨트롤
  4. 페이지네이션
*/

export function getServerSideProps({ query }: any) {
  // if query object was received, return it as a router prop:
  if (query.id) {
    return { props: { router: { query } } };
  }
  // obtain candidateId elsewhere, redirect or fallback to some default value:
  /* ... */
  return { props: { router: { query: { target: "target", placeId: "id" } } } };
}

const SearchHospital = () => {
  const router = useRouter();
  const {
    query: { target, hospitalName, placeId, hospitalAddress },
  } = router;
  const [place, setPlace] = useState<string | string[]>("");
  const [info, setInfo] = useState<any>();
  const [markers, setMarkers] = useState<any>([]);
  const [map, setMap] = useState<any>();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [hospitalList, setHospitalList] = useState<any>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [postId, setPostId] = useState("");
  const [targetHospitalData, setTargetHospitalData] =
    useRecoilState<any>(hospitalData);
  const targetHospital = useRef<HTMLInputElement>(null);
  const { recentlyReview, isLoading, recentlyRefetch } = useGetReviews("");
  console.log("recentlyReview", recentlyReview);
  const setNewSearch = useSetRecoilState(mainPetpitalList); //최근 검색된 데이터
  const HospitalData = targetHospitalData;
  const userUid = useRecoilValue(currentUserUid);
  console.log("userUid", userUid);

  // 바깥으로 빼라!
  const Input = () => {
    return (
      <SearchInput
        ref={targetHospital}
        placeholder="찾으실 동물병원의 (시)도 + 구 + 읍(면,동)을 입력하세요"
        type="text"
        autoFocus
        defaultValue={place}
      />
    );
  };

  useEffect(() => {
    // 상세 페이지 열면 hospitalId => 병원 공유 통해서 들어왔을 때 or 병원 클릭 시
    if (hospitalName) {
      setPlace(hospitalName);
    }
  }, []);

  useEffect(() => {
    if (target) {
      console.log(target);
      // 메인 화면 병원 클릭 / 리뷰 클릭 시 / 헤더 통한 검색 / 검색 => target
      // 검색 데이터가 존재하면 place에 저장
      setPlace(target);
    }
    if (!map) return;
    const ps = new kakao.maps.services.Places();
    // 키워드에 맞는 동물병원 표시
    ps.keywordSearch(place + " 동물병원", (data, status, pagination) => {
      if (data.length === 0) {
        setHospitalList([]);
        setPlace("");
      }

      if (status === kakao.maps.services.Status.OK) {
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
        // LatLngBounds 객체에 좌표를 추가합니다
        const bounds = new kakao.maps.LatLngBounds();
        let markers: {
          position: { lat: string; lng: string };
          content: string;
        }[] = [];

        const tempArray: any = [];

        data.forEach((marker) => {
          tempArray.push(marker);
          markers.push({
            position: {
              lat: marker.y,
              lng: marker.x,
            },
            content: marker.place_name,
          });
          bounds.extend(new kakao.maps.LatLng(+marker.y, +marker.x));
        });
        setMarkers(markers);
        setHospitalList(tempArray);
        // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
        map.setBounds(bounds);
      }
    });
  }, [target, place, map]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetHospital.current?.value === "") {
      alert("비어있음"); // 추후 모달로 수정 예정
      return;
    } else if (targetHospital.current?.value !== undefined) {
      setIsDetailOpen(false);
      setPlace(targetHospital.current?.value);
      router.push({
        pathname: "/searchHospital",
        query: {
          target: targetHospital.current?.value,
        },
      });
    }
  };

  const onClick = (targetHospital: IHospital) => {
    // 병원 이름만 적으려 했으나 동일 이름의 병원이 존재해 placeName=[병원이름]&id[placeId]로 설정
    router.push(
      {
        pathname: "/searchHospital",
        query: {
          hospitalName: targetHospital.place_name,
          placeId: targetHospital.id,
        },
      },
      undefined,
      { shallow: true },
    );
    setCreateModalOpen(false);
    setIsDetailOpen(true);
    setTargetHospitalData(targetHospital);
  };

  const onClickWriteButton = () => {
    console.log(placeId);
    setCreateModalOpen(true);
  };

  const onClickEditButton = (id: any) => {
    setIsEdit(true);
    setPostId(id);
  };

  const queryClient = useQueryClient();
  // 게시글 삭제
  const { mutate: deleteMutate } = useMutation(
    (id) =>
      axios.delete(`${REVIEW_SERVER}/posts/${id}`).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getrecentlyReview"]);
      },
    },
  );

  const handleDelete = async (id: any) => {
    deleteMutate(id);
  };

  // console.log("targetHospitalData", targetHospitalData);

  // 리뷰수
  const totalReview = recentlyReview?.data.filter(
    (item: any) => item.hospitalId === placeId,
  ).length;
  console.log("totalReview", totalReview);

  // // 유저별 방문수
  // const personTotalReview = recentlyReview?.data.filter(
  //   (review: any) => review.hospitalId === placeId,
  // ).length;
  // console.log("personTotalReview", personTotalReview);

  return (
    <>
      {createModalOpen && (
        <CreatePostModal setCreateModalOpen={setCreateModalOpen} />
      )}
      {isEdit && <EditPostModal setIsEdit={setIsEdit} id={postId} />}
      <MapContainer>
        <Map // 로드뷰를 표시할 Container
          center={{
            lat: 37.566826,
            lng: 126.9786567,
          }}
          style={{
            width: "100%",
            height: "100vh",
          }}
          level={3}
          onCreate={setMap}
        >
          <BoardContainer>
            <DashBoard>
              <SearchForm onSubmit={onSubmit}>
                <Input />
              </SearchForm>
              {hospitalList.length > 0
                ? // 1번째 대시보드
                  hospitalList.map((hospital: IHospital) => {
                    return (
                      <div key={hospital.id} onClick={() => onClick(hospital)}>
                        {hospital.place_name}
                      </div>
                    );
                  })
                : "데이터가 없습니다."}
            </DashBoard>
            {isDetailOpen && (
              // 2번째 대시보드
              <DashBoard>
                {/* <div>{targetHospitalData.place_name}</div> */}
                <Roadview // 로드뷰를 표시할 Container
                  position={{
                    // 지도의 중심좌표
                    lat: targetHospitalData.y,
                    lng: targetHospitalData.x,
                    radius: 50,
                  }}
                  style={{
                    // 지도의 크기
                    width: "100%",
                    height: "200px",
                  }}
                />
                <HospitalInfoWrap>
                  <HospitalInfoTopWrap>
                    <HospitalInfoTop>
                      <div style={{ fontWeight: "bold", fontSize: "18px" }}>
                        {hospitalName}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          marginLeft: "5px",
                          marginTop: "2px",
                        }}
                      >
                        {targetHospitalData.phone}
                      </div>
                    </HospitalInfoTop>
                    <div
                      style={{
                        fontSize: "13px",
                        display: "flex",
                        justifyContent: "space-between",
                        // backgroundColor: "red",
                      }}
                    >
                      <div>{targetHospitalData.address_name}</div>
                    </div>
                  </HospitalInfoTopWrap>
                </HospitalInfoWrap>
                <ReviewInfoWrap>
                  <div style={{ color: "#15B5BF" }}>
                    영수증리뷰({totalReview})
                  </div>
                  <div style={{ color: "lightgray", marginLeft: "10px" }}>
                    최신순
                  </div>
                  <button onClick={onClickWriteButton}>리뷰 참여하기</button>
                </ReviewInfoWrap>

                {!isLoading &&
                  recentlyReview?.data
                    .filter(
                      (target) => target.hospitalId === targetHospitalData.id,
                    )
                    .map((review) => {
                      return (
                        <ReviewContainer key={review.id}>
                          <ReviewTopContainer>
                            <ReviewProfileLeft>
                              <img
                                src={
                                  review.profileImage
                                    ? review.profileImage
                                    : "https://media.istockphoto.com/id/1300845620/vector/user-icon-flat-isolated-on-white-background-user-symbol-vector-illustration.jpg?s=612x612&w=0&k=20&c=yBeyba0hUkh14_jgv1OKqIH0CCSWU_4ckRkAoy2p73o="
                                }
                                alt="프로필 이미지"
                                width={40}
                                height={40}
                                style={{
                                  borderRadius: "50%",
                                }}
                              ></img>
                              <div style={{ marginLeft: "10px" }}>
                                {review.displayName}
                              </div>
                            </ReviewProfileLeft>
                            <ReviewProfileRight>
                              진료비 {review.totalCost}원
                            </ReviewProfileRight>
                          </ReviewTopContainer>
                          <ReviewMiddleContainer>
                            <img
                              src={review.downloadUrl}
                              alt="게시글 이미지"
                              width={339}
                              height={200}
                            />
                            <div>{review.title}</div>
                            <div
                              style={{
                                // backgroundColor: "red",
                                width: "339px",
                                marginTop: "5px",
                                fontSize: "13px",
                                padding: "3px",
                              }}
                            >
                              {review.contents}
                            </div>
                          </ReviewMiddleContainer>
                          <ReviewBottomContainer>
                            <div style={{ display: "flex" }}>
                              {review.selectedColors?.map((color) => {
                                if (color === "깨끗해요") {
                                  return (
                                    <ReviewTagFirst key={color}>
                                      {color}
                                    </ReviewTagFirst>
                                  );
                                } else if (color === "친절해요") {
                                  return (
                                    <ReviewTagFirst key={color}>
                                      {color}
                                    </ReviewTagFirst>
                                  );
                                } else if (color === "꼼꼼해요") {
                                  return (
                                    <ReviewTagFirst key={color}>
                                      {color}
                                    </ReviewTagFirst>
                                  );
                                } else if (color === "저렴해요") {
                                  return (
                                    <ReviewTagFirst key={color}>
                                      {color}
                                    </ReviewTagFirst>
                                  );
                                }
                              })}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                padding: "10px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  // backgroundColor: "red",
                                }}
                              >
                                <div
                                  style={{ fontSize: "13px", color: "gray" }}
                                >
                                  {review.date.slice(6, 8)}월{" "}
                                  {review.date.slice(10, 12)}일
                                </div>
                                <div
                                  style={{
                                    fontSize: "13px",
                                    color: "gray",
                                    marginLeft: "5px",
                                  }}
                                >
                                  {/* • {personTotalReview}번째 방문 */}
                                </div>
                              </div>

                              {userUid === review.userId ? (
                                <div style={{ display: "flex" }}>
                                  <div
                                    style={{
                                      cursor: "pointer",
                                      marginRight: "5px",
                                    }}
                                    onClick={() => {
                                      onClickEditButton(review.id);
                                    }}
                                  >
                                    <CiEdit size={18} />
                                  </div>
                                  <div
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                      handleDelete(review.id);
                                    }}
                                  >
                                    <CiTrash size={18} />
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                            </div>
                          </ReviewBottomContainer>
                        </ReviewContainer>
                      );
                    })
                    .reverse()}
              </DashBoard>
            )}
          </BoardContainer>
          {/* 마커 표시 */}
          {markers.map(
            (marker: {
              content:
                | string
                | number
                | boolean
                | ReactElement<any, string | JSXElementConstructor<any>>
                | ReactFragment
                | ReactPortal
                | null
                | undefined;
              position: { lat: any; lng: any };
            }) => (
              <MapMarker
                key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
                position={marker.position}
                onClick={() => setInfo(marker)}
              >
                {info && info.content === marker.content && (
                  <div style={{ color: "#000" }}>{marker.content}</div>
                )}
              </MapMarker>
            ),
          )}
        </Map>
      </MapContainer>
    </>
  );
};

const ViewContreoler = styled.div`
  margin-top: 800px;
`;

const DashBoard = styled.div`
  width: 375px;
  height: 100vh;
  background-color: white;
  box-shadow: 4px 0px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid gray;
  padding-top: 60px;
  /* display: none; */
  overflow: auto;
`;

const BoardContainer = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  z-index: 50;
`;

const MapContainer = styled.div`
  position: relative;
`;

const SearchForm = styled.form`
  top: 0;
  z-index: 100;
  padding: 8px;
  background-color: #15b5bf;
`;

const SearchInput = styled.input`
  border: 0.4px solid #000000;
  border-radius: 2px;
  padding: 12px 40px 12px 10px;
  width: 100%;
`;

// ----- 리뷰 css -----
const HospitalInfoWrap = styled.div`
  /* background-color: blue; */
`;
const HospitalInfoTopWrap = styled.div`
  /* background-color: red; */
  height: 60px;
  padding: 10px;
`;
const ReviewInfoWrap = styled.div`
  /* background-color: purple; */
  display: flex;
  align-items: center;
  height: 40px;
  border-top: 1px solid lightgray;
  border-bottom: 1px solid lightgray;
  padding: 10px;
`;

const ReviewContainer = styled.div`
  /* background-color: red; */
  padding: 10px;
`;
const ReviewTopContainer = styled.div`
  display: flex;
  justify-content: space-between;
  /* background-color: red; */
  height: 50px;
  padding: 6px;
`;

const ReviewMiddleContainer = styled.div`
  /* background-color: blue; */
  height: 350px;
  padding: 7px;
  width: 373px;
  display: flex;
  /* justify-content: center; */
  flex-direction: column;
`;

const ReviewBottomContainer = styled.div`
  /* background-color: purple; */
  height: 50px;
`;

const ReviewProfileLeft = styled.div`
  display: flex;
  align-items: center;
  /* background-color: red; */
  width: 150px;
`;

const ReviewProfileRight = styled.div`
  background-color: #15b5bf;
  width: 105px;
  border: 1px solid #15b5bf;
  border-radius: 5px;
  font-size: 12px;
  padding: 3px;
  display: flex;
  align-items: center;
  color: #fff;
  justify-content: center;
`;

const HospitalInfoTop = styled.div`
  /* background-color: red; */
  display: flex;
`;

// ---------- tag 색깔 -------------
const ReviewTagFirst = styled.div`
  width: 60px;
  height: 26px;
  background-color: #fff;
  color: #00b8d9;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
  border: 1.5px solid #00b8d9;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const ReviewTagSecond = styled.div`
  width: 100px;
  height: 28px;
  background-color: #0052cc;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;
const ReviewTagThird = styled.div`
  width: 100px;
  height: 28px;
  background-color: #5243aa;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

const ReviewTagFourth = styled.div`
  width: 100px;
  height: 28px;
  background-color: #ff5630;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;
const ReviewTagFifth = styled.div`
  width: 100px;
  height: 28px;
  background-color: #ff8b00;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

export default SearchHospital;
//
