import CustomModal, { ModalButton } from "../components/custom/ErrorModal";
import { useGetReviews } from "../hooks/useGetReviews";
import { currentUserUid, mainPetpitalList } from "../share/atom";
import styled from "@emotion/styled";
import axios from "axios";
import { useRouter } from "next/router";
import React, {
  useState,
  useEffect,
  useRef,
  ReactElement,
  ReactFragment,
  ReactPortal,
  JSXElementConstructor,
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
import { REVIEW_SERVER, REVIEW_SITE } from "../share/server";
import { CiEdit } from "react-icons/ci";
import { CiTrash } from "react-icons/ci";
import shortUUID from "short-uuid";
import { RxShare2 } from "react-icons/rx";
import Image from "next/image";
import { AiOutlineArrowLeft, AiOutlineClose } from "react-icons/ai";
import { authService } from "@/firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Head from "next/head";

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

function useAuth() {
  const [currentUser, setCurrentUser] = useState<any>();
  useEffect(() => {
    const unsub = onAuthStateChanged(authService, (user) =>
      setCurrentUser(user),
    );
    return unsub;
  }, []);

  return currentUser;
}

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
  const currentUser = useAuth();
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
  const { recentlyReview, isLoading, isrecentlyRefetch } = useGetReviews(
    `?_sort=date&_order=desc&hospitalId=${placeId}`,
  );
  const [openDeleteReivewModal, setOpenDeleteReivewModal] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState("");
  const [state, setState] = useState({
    center: {
      lat: 33.450701,
      lng: 126.570667,
    },
    errMsg: null,
    isLoading: true,
  });
  const setNewSearch = useSetRecoilState(mainPetpitalList); //최근 검색된 데이터

  useEffect(() => {
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
  const userUid = authService.currentUser?.uid;

  // console.log("userUid", userUid);

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
    if (hospitalName && placeId) {
      setPlace(hospitalName);
      setIsSearchOpen(true);
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
    // console.log("검색리로드 왜리로드안됨");
    if (target) {
      setPlace(target);
      setIsSearchOpen(true);
    }
    // 병원을 검색했을 때 실행

    if (!place) return;
    if (!map) return;

    const ps = new kakao.maps.services.Places();
    // 키워드에 맞는 동물병원 표시

    ps.keywordSearch(place + " 동물병원", (data, status, pagination) => {
      setNewSearch(place);

      if (data.length === 0) {
        setHospitalList([]);
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
  }, [place, target, map]);

  useEffect(() => {
    const tempArray: any[] = [];
    // // 병원 아이디 가져오기
    hospitalList.map((hospital: IHospital) => {
      tempArray.push(hospital.id);
    });

    // 별점 저장 / 리뷰 저장
    const promiseCosts = tempArray.map(async (hospital: any) => {
      const tempRateArray: any[] | PromiseLike<any[]> = [];
      const tempCountArray: any[] = [];

      await axios
        .get(
          `${REVIEW_SERVER}posts?_sort=date&_order=desc&hospitalId=${hospital}`,
        )
        .then((res) =>
          res.data.map((data: any) => {
            tempCountArray.push({
              nickname: data.displayName,
              reviewImage: data.downloadUrl,
              profileImage: data.profileImage,
              id: data.id,
            });
            tempRateArray.push(data.rating);
          }),
        );
      return [tempRateArray, tempCountArray];
    });

    Promise.all(promiseCosts).then(async (results) => {
      const tempRate = results.map((item) => item[0]); // 첫 번째 배열들을 묶음
      const tempReview: any = results.map((item) => item[1]); // 두 번째 배열들을 묶음

      const tempArray: (string | number)[] = [];
      const tempCount: (string | number)[] = [];
      const tempCurrentReview: any[] = [];

      tempRate.forEach((cost) => {
        // console.log(cost);
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
      tempReview.forEach((review: string | any[]) => {
        if (review.length > 0) {
          tempCurrentReview.push(review.slice(0, 3));
        } else {
          tempCurrentReview.push([
            {
              reviewImage:
                "https://firebasestorage.googleapis.com/v0/b/gabojago-ab30b.appspot.com/o/asset%2Fno_image_info.svg?alt=media&token=c770159e-01d1-443e-89d9-0e14dea7ebdd",
              id: shortUUID.generate(),
            },
          ]);
        }
      });
      setHospitalReviewCount(tempCount);
      setHospitalRate(tempArray);
      setHospitalReview(tempCurrentReview);
    });
  }, [hospitalList]);

  // console.log(hospitalReview);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetHospital.current?.value === "") {
      setEmptyComment((prev) => !prev);
      return;
    } else if (targetHospital.current?.value !== undefined) {
      setIsSearchOpen(true);
      setIsDetailOpen(false);
      setPlace(targetHospital.current?.value);
      router.push(
        {
          pathname: "/searchHospital",
          query: {
            target: targetHospital.current?.value,
          },
        },
        undefined,
        { shallow: true },
      );
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
    (id: string) =>
      axios.delete(`${REVIEW_SERVER}posts/${id}`).then((res) => res.data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["getrecentlyReview"]);
      },
    },
  );

  const handleDelete = async () => {
    await deleteMutate(deleteTargetId);
    setOpenDeleteReivewModal((prev: any) => !prev);
  };

  // console.log("targetHospitalData", targetHospitalData);

  // 리뷰수
  const totalReview = recentlyReview?.data?.filter(
    (item: any) => item.hospitalId === placeId,
  ).length;
  // console.log("totalReview", totalReview);

  // // 유저별 방문수
  // const personTotalReview = recentlyReview?.data.filter(
  //   (review: any) => review.hospitalId === placeId,
  // ).length;
  // console.log("personTotalReview", personTotalReview);

  return (
    <>
      <Head>
        <title>펫피탈 | 병원 검색</title>
      </Head>
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

      <MapContainer>
        <Map // 로드뷰를 표시할 Container
          center={{
            lat: 37.566826,
            lng: 126.9786567,
          }}
          style={{
            width: "1200px",
            height: "100vh",
            position: "fixed",
            bottom: 0,
          }}
          level={4}
          onCreate={setMap}
        >
          {/* <MapTypeControl position={kakao.maps.ControlPosition?.TOPRIGHT} /> */}
          <SearchForm onSubmit={onSubmit}>
            <button type="button">
              <FormLogo
                onClick={() => router.push("/", undefined, { shallow: true })}
                backgroundImage="https://user-images.githubusercontent.com/88391843/224016702-e3591270-1b05-4d05-8bf0-ebe5a68aab54.png"
              />
            </button>
            <Input />
          </SearchForm>
          <BoardContainer>
            <HospitalListContainer>
              {isSearchOpen && (
                <DashBoard>
                  <DashBoardHeader
                    style={{
                      width: "375px",
                      top: "0",
                    }}
                    backgroundColor="#15B5BF"
                  >
                    <button
                      onClick={() =>
                        router.push("/", undefined, { shallow: true })
                      }
                    >
                      <AiOutlineArrowLeft size={24} />
                      <div>이전으로</div>
                    </button>
                    <button
                      onClick={() => {
                        setIsDetailOpen(false);
                        setIsSearchOpen((prev) => !prev);
                      }}
                    >
                      <AiOutlineClose size={24} />
                    </button>
                  </DashBoardHeader>
                  {hospitalList.length > 0 ? (
                    // 1번째 대시보드
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
                              <HospitalName>
                                {hospital?.place_name}
                              </HospitalName>
                              <HospitalType>동물병원</HospitalType>
                            </div>
                            <CopyToClipboard
                              text={`${REVIEW_SITE}searchHospital/?hospitalName=${hospital.place_name}&placeId=${hospital.id}`}
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
                              {hospitalReview &&
                                hospitalReview[index]?.map((review: any) => {
                                  return (
                                    <CurrentReview
                                      key={review.reviewId}
                                      bgImage={review?.reviewImage}
                                    >
                                      <CurrentReviewWriter>
                                        <CurrentReviewUser
                                          src={review?.profileImage}
                                        />
                                        <CurrentReviewNickname>
                                          {review?.nickname}
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
                  ) : (
                    <NoData>로딩중</NoData>
                  )}
                </DashBoard>
              )}
            </HospitalListContainer>
            {isDetailOpen && (
              // 2번째 대시보드
              <DashBoard>
                <DashBoardHeader
                  style={{
                    width: "375px",
                    top: "0",
                  }}
                  backgroundColor={"transparent"}
                >
                  <button onClick={() => setIsDetailOpen((prev) => !prev)}>
                    <AiOutlineArrowLeft size={24} />
                    <div>이전으로</div>
                  </button>
                  <button onClick={() => setIsDetailOpen((prev) => !prev)}>
                    <AiOutlineClose size={24} />
                  </button>
                </DashBoardHeader>
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
                        {targetHospitalData?.address_name}
                      </div>
                    </div>
                  </HospitalInfoTopWrap>
                </HospitalInfoWrap>
                <ReviewInfoWrap>
                  <div style={{ display: "flex" }}>
                    <div style={{ color: "#15B5BF", fontSize: "15px" }}>
                      영수증리뷰({totalReview})
                    </div>
                  </div>
                  <WriteButton
                    disabled={currentUser === null}
                    onClick={onClickWriteButton}
                  >
                    {currentUser === null
                      ? "로그인 후 참여해주세요"
                      : "리뷰 참여하기"}
                  </WriteButton>
                </ReviewInfoWrap>

                {!isLoading &&
                  recentlyReview?.data?.map((review: any) => {
                    return (
                      <>
                        <ReviewContainer key={review.id}>
                          <ReviewBox>
                            <ReviewTopContainer>
                              <ReviewProfileLeft>
                                <Image
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
                                    objectFit: "cover",
                                  }}
                                ></Image>
                                <div style={{ marginLeft: "10px" }}>
                                  {review?.displayName}
                                </div>
                              </ReviewProfileLeft>
                              <ReviewProfileRight>
                                {Number(review.totalCost)?.toLocaleString(
                                  "ko-KR",
                                )}
                                원
                              </ReviewProfileRight>
                            </ReviewTopContainer>
                            <ReviewMiddleContainer>
                              <Image
                                src={review?.downloadUrl}
                                alt="게시글 이미지"
                                width={339}
                                height={200}
                                style={{ objectFit: "cover" }}
                              />
                              <div>{review?.title}</div>
                              <div
                                style={{
                                  width: "339px",
                                  marginTop: "5px",
                                  fontSize: "13px",
                                  padding: "3px",
                                  overflowY: "scroll",
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
                                  {review.selectedColors?.map((color: any) => {
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
                                    color: "#15b5bf",
                                    marginRight: "15px",
                                  }}
                                >
                                  ★{review.rating}/5
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
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      color: "gray",
                                    }}
                                  >
                                    {review.date.slice(6, 8)}월
                                    {review.date.slice(10, 12)}일
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      color: "gray",
                                      marginLeft: "5px",
                                    }}
                                  ></div>
                                </div>
                                {userUid === review?.userId ? (
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
                                        setDeleteTargetId(review.id);
                                        setOpenDeleteReivewModal(
                                          (prev) => !prev,
                                        );
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
                        </ReviewContainer>
                      </>
                    );
                  })}
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
              <>
                <CustomOverlayMap
                  key={`marker-${marker.content}-${marker.position.lat},${marker.position.lng}`}
                  position={{
                    lat: marker.position.lat,
                    lng: marker.position.lng,
                  }}
                >
                  <MarkerItem className="overlay">{marker.content}</MarkerItem>
                </CustomOverlayMap>
                <MapMarker // 마커를 생성합니다
                  key={`${marker.position.lng},${marker.position.lat}=marker-${marker.content}`}
                  position={{
                    // 마커가 표시될 위치입니다
                    lat: marker.position.lat,
                    lng: marker.position.lng,
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
                />
              </>
            ),
          )}
          {/* 현재 접속 위치 표시 */}
          {!state.isLoading && (
            <MapMarker position={state.center}>
              <div style={{ textAlign: "center" }}>
                {state.errMsg ? state.errMsg : "현재 위치입니다."}
              </div>
            </MapMarker>
          )}
        </Map>
      </MapContainer>
      {!openDeleteReivewModal && (
        <CustomModal
          modalText1={"입력하신 리뷰를"}
          modalText2={"삭제 하시겠습니까?"}
        >
          <ModalButton
            onClick={() => setOpenDeleteReivewModal((prev: any) => !prev)}
          >
            취소
          </ModalButton>
          <ModalButton onClick={handleDelete}>삭제</ModalButton>
        </CustomModal>
      )}
    </>
  );
};

const NoData = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
`;

const HospitalListContainer = styled.div`
  margin-top: 100px;
  padding-bottom: 20px;
`;

const FormLogo = styled.div<{ backgroundImage: string }>`
  /* background-color: rebeccapurple; */
  background-image: url(${(props) => props.backgroundImage});
  width: 40px;
  height: 40px;
  background-position: center;
  background-repeat: no-repeat;
  cursor: pointer;
`;

const DashBoardHeaderContainer = styled.header`
  width: calc(min(1200px, 100vw));
`;

const DashBoardHeader = styled.div<{ backgroundColor: string }>`
  height: 50px;
  background-color: ${(props) => props.backgroundColor};
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
  position: fixed;
  & > button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    color: white;
  }
  & > button:nth-of-type(1) {
    display: flex;
    gap: 8px;
    align-items: center;
  }
`;

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
  overflow-y: scroll;
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
  position: fixed;
  top: 50px;
  z-index: 100;
  width: 375px;
  padding: 8px;
  background-color: #15b5bf;
  display: flex;
  box-sizing: border-box;
  border: none;
  > button {
    background-color: transparent;
    border: none;
  }
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
  justify-content: space-between;
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
  &::before {
    content: "진료비 ";
  }
  background-color: #15b5bf;
  width: 120px;
  border: 1px solid #15b5bf;
  border-radius: 5px;
  font-size: 12px;
  padding: 3px;
  display: flex;
  align-items: center;
  color: #fff;
  justify-content: center;
  gap: 4px;
`;

const HospitalInfoTop = styled.div`
  /* background-color: red; */
  display: flex;
`;

const WriteButton = styled.button`
  cursor: pointer;
  background-color: #15b5bf;
  /* position: fixed; */
  width: 100px;
  height: 28px;
  bottom: 79px;
  left: 628px;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  color: white;
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
