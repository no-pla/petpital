import CustomModal, { ModalButton } from "@/components/custom/ErrorModal";
import { useGetReviews } from "@/hooks/useGetReviews";
import { currentUserUid, mainPetpitalList } from "@/share/atom";
import styled from "@emotion/styled";
import axios from "axios";
import { checkPrimeSync } from "crypto";
import { useRouter } from "next/router";
import React, {
  ReactElement,
  JSXElementConstructor,
  ReactFragment,
  ReactPortal,
  useState,
  useEffect,
  useRef,
} from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import {
  CustomOverlayMap,
  Map,
  MapInfoWindow,
  MapMarker,
  MapTypeControl,
  Roadview,
} from "react-kakao-maps-sdk";
import { useSetRecoilState, useRecoilValue, useRecoilState } from "recoil";
import { hospitalData, modalState } from "../share/atom";
import CreatePostModal from "../components/custom/CreatePostModal";
import EditPostModal from "../components/custom/EditPostModal";
import { useMutation, useQueryClient } from "react-query";
import { REVIEW_SERVER } from "@/share/server";
import { CiEdit } from "react-icons/ci";
import { CiTrash } from "react-icons/ci";
import ConfirmModal from "@/components/custom/ConfirmModal";
import shortUUID from "short-uuid";
import { FaSlideshare } from "react-icons/fa";
import { GrShare } from "react-icons/gr";
import { RxShare2 } from "react-icons/rx";

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
  return {
    props: {
      router: {
        query: {
          target: "target",
          placeId: "id",
          hospitalName: "hospitalName",
        },
      },
    },
  };
}

declare const window: typeof globalThis & {
  kakao: any;
};

const SearchHospital = () => {
  const router = useRouter();
  const {
    query: { target, hospitalName, placeId },
  } = router;
  const [place, setPlace] = useState<string | string[]>("");
  const [info, setInfo] = useState<any>();
  const [markers, setMarkers] = useState<any>([]);
  const [map, setMap] = useState<any>();
  const [emptyComment, setEmptyComment] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [hospitalList, setHospitalList] = useState<any>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [postId, setPostId] = useState<any>("");
  const [postTitle, setPostTitle] = useState([]);
  const [postContents, setPostContents] = useState([]);
  const [postTotalCost, setPostTotalCost] = useState([]);
  const [postDownloadUrl, setPostDownloadUrl] = useState([]);
  const [postRating, setPostRating] = useState([]);
  const [postSelect, setPostSelect] = useState([]);
  const [targetHospitalData, setTargetHospitalData] =
    useRecoilState<any>(hospitalData);
  const [hospitalRate, setHospitalRate] = useState<any[]>([]);
  const [hospitalReview, setHospitalReview] = useState<any[]>([]);
  const [hospitalReviewCount, setHospitalReviewCount] = useState<any[]>([]);
  const targetHospital = useRef<HTMLInputElement>(null);
  const { recentlyReview, isLoading, recentlyRefetch } = useGetReviews("");
  const [state, setState] = useState({
    center: {
      lat: 33.450701,
      lng: 126.570667,
    },
    errMsg: null,
    isLoading: true,
  });
  const setNewSearch = useSetRecoilState(mainPetpitalList); //최근 검색된 데이터

  // console.log(hospitalRate, hospitalReview, hospitalReviewCount);

  useEffect(() => {
    if (target) {
      setPlace(target);
    }
    if (navigator.geolocation) {
      // GeoLocation을 이용해서 접속 위치를 얻어옵니다
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState((prev) => ({
            ...prev,
            center: {
              lat: position.coords.latitude, // 위도
              lng: position.coords.longitude, // 경도
            },
            isLoading: false,
          }));
        },
        (err) => {
          setState((prev: any) => ({
            ...prev,
            errMsg: err.message,
            isLoading: false,
          }));
        },
      );
    } else {
      // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다
      setState((prev: any) => ({
        ...prev,
        errMsg: "geolocation을 사용할수 없어요..",
        isLoading: false,
      }));
    }
  }, []);

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
    console.log("id리로드 왜리로드안됨");

    // 상세 페이지 열면 hospitalId => 병원 공유 통해서 들어왔을 때 or 병원 클릭 시
    if (hospitalName && placeId) {
      setPlace(hospitalName);
      setIsDetailOpen(true);
    }

    if (!map) return;
    if (!hospitalName) return;
    const ps = new kakao.maps.services.Places();
    // 키워드에 맞는 동물병원 표시
    ps.keywordSearch(hospitalName, (data, status, pagination) => {
      if (data.length === 0) {
        setHospitalList([]);
        setPlace("");
      } else if (data.length === 1) {
        setTargetHospitalData(data[0]);
      } else if (data.length > 1) {
        setTargetHospitalData(
          data.filter((target: any) => target.id === placeId)[0],
        );
        // setTargetHospitalData();
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
  }, [map]);

  useEffect(() => {
    console.log("검색리로드 왜리로드안됨");

    // 병원을 검색했을 때 실행
    if (!place) return;
    if (!map) return;
    const ps = new kakao.maps.services.Places();
    // 키워드에 맞는 동물병원 표시
    ps.keywordSearch(place + " 동물병원", (data, status, pagination) => {
      if (data.length === 0) {
        setHospitalList([]);
        // setPlace("");
        return;
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
  }, [place, target]);

  useEffect(() => {
    console.log("리로드 별점왜리로드안됨");
    const tempArray: any[] = [];
    const tempCountArray: any[] = [];
    // // 병원 아이디 가져오기
    hospitalList.map((hospital: IHospital) => {
      tempArray.push(hospital.id);
    });

    // 별점 저장 / 리뷰 수 저장
    const promiseCosts = tempArray.map(async (hospital: any) => {
      const tempCostArray: any[] | PromiseLike<any[]> = [];
      await axios
        .get(`${REVIEW_SERVER}posts?hospitalId=${hospital}`)
        .then((res) =>
          res.data.map((data: any) => {
            // console.log(data);
            tempCountArray.push(data);
            tempCostArray.push(data.rating);
          }),
        );
      return tempCostArray;
    });

    Promise.all(promiseCosts).then(async (results) => {
      // console.log(results);
      const tempArray: (string | number)[] = [];
      const tempCount: (string | number)[] = [];
      results.forEach((cost) => {
        tempCount.push(cost.length);
        if (cost.length > 0) {
          tempArray.push(
            Number(
              (
                cost.reduce(
                  (acc: string | number, cur: string | number) => +acc + +cur,
                ) / cost.length
              ).toFixed(2),
            ).toLocaleString("ko-KR"),
          );
        } else {
          tempArray.push("정보 없음");
        }
      });
      setHospitalReviewCount(tempCount);
      setHospitalRate(tempArray);
    });

    // 리뷰 저장
    const promiseReview = tempArray.map(async (hospital: any) => {
      const tempReviewArray: any[] = [];

      await axios
        .get(
          `${REVIEW_SERVER}posts?_sort=createdAt&_order=desc&hospitalId=${hospital}`,
        )
        .then((res) =>
          res.data.map((data: any) => {
            if (tempReviewArray.length < 3) {
              const tempObj = {
                id: data.id,
                nickname: data.displayName,
                profileImage: data.profileImage,
                photo: data.downloadUrl,
              };
              tempReviewArray.push(tempObj);
            }
          }),
        );
      return tempReviewArray;
    });

    Promise.all(promiseReview).then(async (results) => {
      const tempArray: any[] = [];
      results.forEach((review: string | any[]) => {
        if (review.length > 0) {
          tempArray.push(review);
        } else {
          tempArray.push([
            {
              photo:
                "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2Fno_image_info.svg?alt=media&token=c770159e-01d1-443e-89d9-0e14dea7ebdd",
              id: shortUUID,
            },
          ]);
        }
      });
      setHospitalReview(tempArray);
    });

    console.log(tempCountArray);
  }, [hospitalList]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetHospital.current?.value === "") {
      setEmptyComment((prev) => !prev);
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
  //
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

  const onClickEditButton = (review: any) => {
    setIsEdit(true);
    setPostId(review.id);
    setPostTitle(review.title);
    setPostContents(review.contents);
    setPostTotalCost(review.totalCost);
    setPostDownloadUrl(review.downloadUrl);
    setPostRating(review.rating);
    setPostSelect(review.selectedColors);
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
      {isEdit && (
        <EditPostModal
          setIsEdit={setIsEdit}
          id={postId}
          postTitle={postTitle}
          postContents={postContents}
          postTotalCost={postTotalCost}
          postDownloadUrl={postDownloadUrl}
          postRating={postRating}
        />
      )}
      {/* {showConfirmModal && (
        <ConfirmModal
          message="정말 삭제하시겠습니까?"
          onCancel={() => {
            setShowConfirmModal(false);
          }}
          onConfirm={() => {
            setShowConfirmModal(false);
          }}
        />
      )} */}
      <MapContainer>
        <Map // 로드뷰를 표시할 Container
          center={{
            lat: 37.566826,
            lng: 126.9786567,
          }}
          style={{
            width: "1200px",
            height: `calc(100vh - 80px)`,
            position: "fixed",
            bottom: 0,
          }}
          level={4}
          onCreate={setMap}
        >
          {/* <MapTypeControl position={kakao.maps.ControlPosition?.TOPRIGHT} /> */}
          <BoardContainer>
            <DashBoard>
              <SearchForm onSubmit={onSubmit}>
                <Input />
              </SearchForm>
              {hospitalList.length > 0
                ? // 1번째 대시보드
                  hospitalList.map((hospital: IHospital, index: number) => {
                    return (
                      <HospitalItem
                        key={hospital.id}
                        onClick={() => onClick(hospital)}
                        style={{
                          backgroundColor:
                            index % 2 === 0 ? "#FAFAFA" : "#FFFFFF",
                        }}
                      >
                        <HospotalInfo>
                          <div>
                            <HospitalNumber>{`${String.fromCharCode(
                              65 + index,
                            )}`}</HospitalNumber>
                            <HospitalName>{hospital.place_name}</HospitalName>
                            <HospitalType>동물병원</HospitalType>
                          </div>
                          <CopyToClipboard
                            text={`http://localhost:3000/searchHospital?hospitalName=${hospital.place_name}&placeId=${hospital.id}`}
                          >
                            <ShareButton>
                              <RxShare2 size={16} />
                            </ShareButton>
                          </CopyToClipboard>
                        </HospotalInfo>
                        <ReviewRate>
                          <div>★ {hospitalRate[index]}</div>
                          <ReviewCount>
                            <div>방문자 리뷰</div>
                            <span>{hospitalReviewCount[index]}</span>
                          </ReviewCount>
                        </ReviewRate>
                        <ReviewPhoto>
                          <CurrentReviewContainer>
                            {hospitalReview[index]?.map((review: any) => {
                              return (
                                <CurrentReview
                                  key={review.id}
                                  bgImage={review.photo}
                                >
                                  <CurrentReviewWriter>
                                    <CurrentReviewUser
                                      src={review.profileImage}
                                    />
                                    <CurrentReviewNickname>
                                      {review.nickname}
                                    </CurrentReviewNickname>
                                  </CurrentReviewWriter>
                                </CurrentReview>
                              );
                            })}
                          </CurrentReviewContainer>
                        </ReviewPhoto>
                      </HospitalItem>
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
                    lat: targetHospitalData?.y,
                    lng: targetHospitalData?.x,
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
                      <div style={{ fontWeight: "bold", fontSize: "17px" }}>
                        {hospitalName}
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          marginLeft: "5px",
                          marginTop: "2px",
                          opacity: "0.6",
                        }}
                      >
                        {targetHospitalData?.phone}
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
                      <div style={{ opacity: "0.6" }}>
                        {targetHospitalData.address_name}
                      </div>
                    </div>
                  </HospitalInfoTopWrap>
                </HospitalInfoWrap>
                <ReviewInfoWrap>
                  <div style={{ color: "#15B5BF", fontSize: "15px" }}>
                    영수증리뷰({totalReview})
                  </div>
                  <div
                    style={{
                      color: "lightgray",
                      marginLeft: "10px",
                      fontSize: "15px",
                    }}
                  >
                    최신순
                  </div>
                </ReviewInfoWrap>

                {!isLoading &&
                  recentlyReview?.data
                    .filter(
                      (target) => target.hospitalId === targetHospitalData.id,
                    )
                    .map((review) => {
                      return (
                        <>
                          <ReviewContainer key={review.id}>
                            <ReviewBox>
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
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                  }}
                                >
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
                                  <div style={{ marginRight: "15px" }}>
                                    ⭐{review.rating}/5
                                  </div>
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
                                      style={{
                                        fontSize: "13px",
                                        color: "gray",
                                      }}
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
                                          onClickEditButton(review);
                                        }}
                                      >
                                        <CiEdit size={18} />
                                      </div>
                                      <div
                                        style={{ cursor: "pointer" }}
                                        onClick={() => {
                                          handleDelete(review.id);
                                          // setShowConfirmModal(true);
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
                            </ReviewBox>
                            {/* <WriteButton onClick={onClickWriteButton}>
                              리뷰 참여하기
                            </WriteButton> */}
                          </ReviewContainer>
                        </>
                      );
                    })
                    .reverse()}
                <WriteButton onClick={onClickWriteButton}>
                  리뷰 참여하기
                </WriteButton>
              </DashBoard>
            )}
          </BoardContainer>
          {/* 마커 표시 */}

          {/* <MapMarker // 마커를 생성합니다
            position={{
              // 마커가 표시될 위치입니다
              lat: 37.54699,
              lng: 127.09598,
            }}
            image={{
              src: "https://user-images.githubusercontent.com/88391843/223596598-ab6d0473-fb00-4e1b-bd99-9effebe7ca1f.svg", // 마커이미지의 주소입니다
              size: {
                width: 64,
                height: 69,
              }, // 마커이미지의 크기입니다
              options: {
                offset: {
                  x: 27,
                  y: 69,
                }, // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
              },
            }}
          ></MapMarker> */}
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
              <MapMarker // 마커를 생성합니다
                key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
                position={{
                  // 마커가 표시될 위치입니다
                  lat: 37.54699,
                  lng: 127.09598,
                }}
                image={{
                  src: "https://user-images.githubusercontent.com/88391843/223596598-ab6d0473-fb00-4e1b-bd99-9effebe7ca1f.svg", // 마커이미지의 주소입니다
                  size: {
                    width: 64,
                    height: 69,
                  }, // 마커이미지의 크기입니다
                  options: {
                    offset: {
                      x: 27,
                      y: 69,
                    }, // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다.
                  },
                }}
              ></MapMarker>
            ),
          )}
          {/* 현재 접속 위치 표시 */}
          {!state.isLoading && (
            <MapMarker position={state.center}>
              <div style={{ padding: "5px", color: "#000" }}>
                {state.errMsg ? state.errMsg : "현재 위치입니다."}
              </div>
            </MapMarker>
          )}
        </Map>
      </MapContainer>
    </>
  );
};

const MarkerItem = styled.div`
  border: 2px solid #15b5bf;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
  font-size: 0.7rem;
  background-color: white;
  padding: 4px;
`;

const OpenDashBoardButton = styled.button`
  position: absolute;
  top: 50%;
  right: 0;
`;

const ShareButton = styled.button`
  background-color: transparent;
  border: none;
`;

const CurrentReviewNickname = styled.div`
  color: #ffffff;
  text-shadow: 0px 1px 4px rgba(0, 0, 0, 0.2);
  font-size: 0.9rem;
`;

const CurrentReviewUser = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const CurrentReviewWriter = styled.div`
  position: absolute;
  bottom: 4px;
  left: 4px;
  display: flex;
  align-items: center;
  gap: 11px;
`;

const CurrentReview = styled.div<{ bgImage: string }>`
  background-image: url(${(props) => props.bgImage});
  border-radius: 4px;
  position: relative;
  background-size: cover;
  background-position: center;
`;

const CurrentReviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 156px);
  grid-auto-rows: 156px;
  gap: 4px;
  margin: 0 13px;
`;

const ReviewPhoto = styled.div`
  margin: 16px 0;
  height: 180px;
  overflow-x: scroll;
`;

const HospitalNumber = styled.div`
  font-weight: 700;
  font-size: 1.2rem;
  line-height: 24px;
  color: #15b5bf;
  padding-right: 12px;
`;

const ReviewCount = styled.div`
  display: flex;
  color: #9f9f9f;
  font-size: 0.8rem;
  gap: 4px;
`;

const HospitalItem = styled.div`
  padding: 14px;
  background-color: calc(odd);
`;

const HospotalInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  & div {
    display: flex;
    align-items: center;
    gap: 4px;
  }
`;

const ReviewRate = styled.div`
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 15px;
  & > div:nth-of-type(1) {
    color: #15b5bf;
  }
`;

const HospitalName = styled.div`
  font-weight: 700;
  font-size: 16px;
`;

const HospitalType = styled.span`
  font-size: 0.8rem;
  line-height: 14px;
  color: #9f9f9f;
`;
const ViewContreoler = styled.div`
  margin-top: 800px;
`;

const DashBoard = styled.div`
  width: 375px;
  height: 100vh;
  background-color: white;
  box-shadow: 4px 0px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid gray;
  padding-top: 80px;
  overflow-y: scroll;
  /* display: none; */
  overflow: auto;
  position: relative;
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

const ReviewBox = styled.div`
  /* background-color: blue; */
  height: 475px;
  border-bottom: 1px solid lightgray;
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

const WriteButton = styled.button`
  cursor: pointer;
  background-color: #15b5bf;
  position: fixed;
  width: 375px;
  height: 56px;
  bottom: 79px;
  left: 505px;
  border: none;
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

export default React.memo(SearchHospital);
