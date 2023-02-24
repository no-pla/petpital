import { useEffect, useRef, useState } from "react";
import { hospitalData } from "../share/atom";
import { useSetRecoilState, useRecoilValue } from "recoil";
import styled from "@emotion/styled";
import {
  SearchOutlined,
  CaretLeftFilled,
  CaretRightFilled,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { Roadview } from "react-kakao-maps-sdk";
import Script from "next/script";
import { mainPetpitalList } from "../share/atom";
import { useGetReviews } from "../hooks/useGetReviews";
import CreateAddModal from "../components/custom/CreateAddModal";
import CreatePost from "../components/CreatePost";
import { createRoot } from "react-dom/client";
import Link from "next/link";
import { FaStar } from "react-icons/fa";

declare const window: typeof globalThis & {
  kakao: any;
};

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_API_KEY;

export default function SearchMap(props: any) {
  const [search, setSearch] = useState<any>("");
  const [isOpen, setIsOpen] = useState(true);
  const [isOpen1, setIsOpen1] = useState(false);
  const { recentlyReview, isLoading } = useGetReviews("");

  const setNewSearch = useSetRecoilState(mainPetpitalList);

  const router = useRouter();
  const {
    query: { target },
  } = router;

  const initialPlace = useRecoilValue(hospitalData);
  const placesData = useSetRecoilState(hospitalData);

  const onchangeSearch = (event: any) => {
    setSearch(event?.target.value);
  };

  const onClickSearchBarOpen = () => {
    setIsOpen(!isOpen);
  };
  const onClickSearchBarOpen1 = () => {
    setIsOpen1(!isOpen1);
  };

  useEffect(() => {
    if (!router.isReady) return;

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`;

    document.head.appendChild(script);
    if (router.query.target !== undefined) {
      // 메인 화면에서 타고 들어왔을 떄
      setSearch(target);
      document.getElementById("form")?.focus();
      setIsOpen1(true);
    }

    script.onload = () => {
      window.kakao.maps.load(function () {
        let markers: any[] = [];

        const container = document.getElementById("map");
        const options = {
          center: new window.kakao.maps.LatLng(37.566826, 126.9786567),
          level: 8,
        };
        const map = new window.kakao.maps.Map(container, options);

        const markerPosition = new window.kakao.maps.LatLng(
          37.566826,
          126.9786567,
        );

        const marker = new window.kakao.maps.Marker({
          position: markerPosition,
        });

        marker.setMap(map);
        //--------------------------------------------------

        // 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
        const mapTypeControl = new window.kakao.maps.MapTypeControl();

        // 지도에 컨트롤을 추가해야 지도위에 표시됩니다
        // kakao.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
        map.addControl(
          mapTypeControl,
          window.kakao.maps.ControlPosition.TOPRIGHT,
        );

        // 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
        const zoomControl = new window.kakao.maps.ZoomControl();
        map.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT);
        //-----------------------------------------------------
        // HTML5의 geolocation으로 사용할 수 있는지 확인합니다
        if (navigator.geolocation) {
          // GeoLocation을 이용해서 접속 위치를 얻어옵니다
          navigator.geolocation.getCurrentPosition(function (position) {
            const lat = position.coords.latitude, // 위도
              lon = position.coords.longitude; // 경도

            const locPosition = new window.kakao.maps.LatLng(lat, lon), // 마커가 표시될 위치를 geolocation으로 얻어온 좌표로 생성합니다
              message = '<div style="padding:5px;">여기에 계신가요?!</div>'; // 인포윈도우에 표시될 내용입니다

            // 마커와 인포윈도우를 표시합니다
            displayMarkers(locPosition, message);
          });
        } else {
          // HTML5의 GeoLocation을 사용할 수 없을때 마커 표시 위치와 인포윈도우 내용을 설정합니다

          const locPosition = new window.kakao.maps.LatLng(
              33.450701,
              126.570667,
            ),
            message = "geolocation을 사용할수 없어요..";

          displayMarkers(locPosition, message);
        }

        // 지도에 마커와 인포윈도우를 표시하는 함수입니다
        function displayMarkers(locPosition: any, message: any) {
          // 마커를 생성합니다
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: locPosition,
          });

          const iwContent = message, // 인포윈도우에 표시할 내용
            iwRemoveable = true;

          // 인포윈도우를 생성합니다
          const infowindow = new window.kakao.maps.InfoWindow({
            content: iwContent,
            removable: iwRemoveable,
          });

          // 인포윈도우를 마커위에 표시합니다
          infowindow.open(map, marker);

          // 지도 중심좌표를 접속위치로 변경합니다
          map.setCenter(locPosition);
        }
        //-----------------------------------------------------

        const panTo = () => {
          // 이동할 위도 경도 위치를 생성합니다
          const moveLatLon = navigator.geolocation;

          // 지도 중심을 부드럽게 이동시킵니다
          // 만약 이동할 거리가 지도 화면보다 크면 부드러운 효과 없이 이동합니다
          map.panTo(moveLatLon);
        };

        //----------------------------------
        const ps = new window.kakao.maps.services.Places();

        const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });

        const searchForm = document.getElementById("submit_btn");
        searchForm?.addEventListener("click", function (e) {
          e.preventDefault();
          searchPlaces(search);
        });

        const searchForm1 = document.getElementById("form");
        searchForm1?.addEventListener("enter", function (e) {
          e.preventDefault();
        });

        function searchPlaces(target: any) {
          const keyword = (
            document.getElementById("keyword") as HTMLInputElement
          ).value;

          if (!keyword.replace(/^\s+|\s+$/g, "")) {
            alert("키워드를 입력해주세요!");
            return false;
          }
          setNewSearch(keyword);
          ps.keywordSearch(keyword + " 근처의 동물병원", placesSearchCB);
        }

        if (target) {
          searchPlaces(target);
        }
        function placesSearchCB(data: any, status: any, pagination: any) {
          if (status === window.kakao.maps.services.Status.OK) {
            // 정상적으로 검색이 완료됐으면
            // 검색 목록과 마커를 표출합니다
            displayPlaces(data);

            // 페이지 번호를 표출합니다
            displayPagination(pagination);

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            const bounds = new window.kakao.maps.LatLngBounds();

            for (let i = 0; i < data.length; i++) {
              displayMarker(data[i]);
              bounds.extend(new window.kakao.maps.LatLng(data[i].y, data[i].x));
            }

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
            map.setBounds(bounds);
          } else if (status === window.kakao.maps.services.Status.ZERO_RESULT) {
            alert("검색 결과가 존재하지 않습니다.");
            return;
          } else if (status === window.kakao.maps.services.Status.ERROR) {
            alert("검색 결과 중 오류가 발생했습니다.");
            return;
          }
        }

        function displayMarker(place: any) {
          // 마커를 생성하고 지도에 표시합니다
          const marker = new window.kakao.maps.Marker({
            map: map,
            position: new window.kakao.maps.LatLng(place.y, place.x),
          });

          // 마커에 클릭이벤트를 등록합니다
          window.kakao.maps.event.addListener(marker, "click", function () {
            router.push(place.place_url);
            // 마커를 클릭하면 장소명이 인포윈도우에 표출됩니다
            infowindow.setContent(
              '<div style="padding:5px;font-size:12px;">' +
                place.place_name +
                "</div>",
            );

            infowindow.open(map, marker);
          });
        }

        function displayPlaces(places: any) {
          const listEl = document.getElementById("placesList"),
            menuEl = document.getElementById("menu_wrap"),
            fragment = document.createDocumentFragment(),
            bounds = new window.kakao.maps.LatLngBounds(),
            listStr = "";

          // 검색 결과 목록에 추가된 항목들을 제거합니다
          removeAllChildNods(listEl);

          // 지도에 표시되고 있는 마커를 제거합니다
          removeMarker();

          for (let i = 0; i < places.length; i++) {
            // 마커를 생성하고 지도에 표시합니다
            const placePosition = new window.kakao.maps.LatLng(
                places[i].y,
                places[i].x,
              ),
              marker = addMarker(placePosition, i),
              itemEl = getListItem(i, places[i]); // 검색 결과 항목 Element를 생성합니다

            // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
            // LatLngBounds 객체에 좌표를 추가합니다
            bounds.extend(placePosition);

            // 마커와 검색결과 항목에 click 했을때
            // 해당 장소에 인포윈도우에 장소명을 표시합니다
            // mouseout 했을 때는 인포윈도우를 닫습니다
            (function (marker, title) {
              window.kakao.maps.event.addListener(marker, "click", function () {
                displayInfowindow(marker, title, places[i]);
              });

              window.kakao.maps.event.addListener(
                marker,
                "mouseout",
                function () {
                  infowindow.close();
                },
              );

              itemEl.onclick = function () {
                displayInfowindow(marker, title, places[i]);
                // router.push('/searchMap/${places.id}')
              };

              itemEl.onmouseout = function () {
                infowindow.close();
              };
            })(marker, places[i].place_name);

            fragment.appendChild(itemEl);
          }

          // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
          listEl?.appendChild(fragment);
          if (menuEl) menuEl.scrollTop = 0;

          // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
          map.setBounds(bounds);
        }

        function getListItem(index: any, places: any) {
          let el = document.createElement("li"),
            itemStr =
              '<span class="markerbg marker_' +
              (index + 1) +
              '"></span>' +
              '<div class="info">' +
              "<h5>" +
              places.place_name +
              "</h5>";

          if (places.road_address_name) {
            itemStr +=
              "<span>" +
              places.road_address_name +
              "</span>" +
              '<span class="jibun gray">' +
              places.address_name +
              "</span>";
          } else {
            itemStr += "<span>" + places.address_name + "</span>";
          }

          itemStr += '<span class="tel">' + places.phone + "</span>" + "</div>";
          el.innerHTML = itemStr;
          el.className = "item";
          // placesData(places);
          return el;
        }
        // localStorage.setItem("places", JSON.stringify(places));
        // 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다

        function addMarker(position: any, idx: any) {
          const imageSrc =
              "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png", // 마커 이미지 url, 스프라이트 이미지를 씁니다
            imageSize = new window.kakao.maps.Size(36, 37), // 마커 이미지의 크기
            imgOptions = {
              spriteSize: new window.kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
              spriteOrigin: new window.kakao.maps.Point(0, idx * 46 + 10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
              offset: new window.kakao.maps.Point(13, 37), // 마커 좌표에 일치시킬 이미지 내에서의 좌표
            },
            markerImage = new window.kakao.maps.MarkerImage(
              imageSrc,
              imageSize,
              imgOptions,
            ),
            marker = new window.kakao.maps.Marker({
              position: position, // 마커의 위치
              image: markerImage,
            });

          marker.setMap(map); // 지도 위에 마커를 표출합니다
          markers.push(marker); // 배열에 생성된 마커를 추가합니다

          return marker;
        }

        // 지도 위에 표시되고 있는 마커를 모두 제거합니다
        function removeMarker() {
          for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
          }
          markers = [];
        }

        // 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
        function displayPagination(pagination: any) {
          let paginationEl = document.getElementById("pagination"),
            fragment = document.createDocumentFragment(),
            i;

          // 기존에 추가된 페이지번호를 삭제합니다
          while (paginationEl?.hasChildNodes()) {
            if (paginationEl.lastChild)
              paginationEl.removeChild(paginationEl.lastChild);
          }

          for (i = 1; i <= pagination.last; i++) {
            const el = document.createElement("a");
            el.href = "#";
            String(i);

            if (i === pagination.current) {
              el.className = "on";
            } else {
              el.onclick = (function (i) {
                return function () {
                  pagination.gotoPage(i);
                };
              })(i);
            }

            fragment.appendChild(el);
          }
          if (paginationEl) paginationEl.appendChild(fragment);
        }

        // 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
        // 인포윈도우에 장소명을 표시합니다

        async function displayInfowindow(marker: any, title: any, places: any) {
          placesData(places);
          const content1 = `<div style="padding:10px;min-width:200px">${title}</div>`;
          const content = `                  
          <div class="item">
          <div id="roadview"></div>  
          <div style="margin-left:10px">
            <h2>${title}</h2>
            <span class="tel">${places.phone}</span>
            
            <div class="info">
              <span class="gray">${places.road_address_name}</span>
              <br>
              <span> ${places.address_name}</span>
              </div>
              <br>
              <div>
              <a href="${places.place_url}" target="_blank"
              class="detailButton" >상세정보 및 공유, 데이터 보기</a>
              </div>  
              <div style="margin-top:10px">
              <a class="reviewButton" href="/posts/createPost">리뷰 참여하기</a>
              </div>
              
              <div id="reviewList"></div>          
        </div>
      </div>
    `;

          const menuWrap = document.getElementById("menu_wrap1");
          if (menuWrap) menuWrap.innerHTML = content;

          const { x, y } = places;
          const roadview = document.getElementById("roadview"); // 로드뷰를 표시할 HTML 요소
          // console.log("콘솔: ", menuWrap, roadview);
          if (roadview) {
            const root1 = createRoot(roadview);
            root1.render(
              <Roadview
                position={{
                  lat: y,
                  lng: x,
                  radius: 50,
                }}
                style={{ width: "100%", height: "200px" }}
              />,
            );
          }

          const reviewList = document.getElementById("reviewList");
          if (reviewList) {
            const root2 = createRoot(reviewList);
            root2.render(
              <ReviewList>
                {!isLoading &&
                  recentlyReview?.data
                    .map((review) => {
                      if (places.id == review.hospitalId) {
                        return (
                          <Review key={review.id}>
                            <ReviewImgContainer>
                              <ReviewImg src={review.downloadUrl} alt="" />
                            </ReviewImgContainer>
                            <ReviewInfo>
                              <UserContainer>
                                <ProfileImg src={review.profileImage} />
                                <ProfileName>{review.displayName}</ProfileName>
                                <StarRating>
                                  <FaStar size="15" color="#ffc107" />
                                  {review.rating}/5
                                </StarRating>
                              </UserContainer>

                              <ContentsWrap>
                                <ReviewTitle>{review.title}</ReviewTitle>

                                <ReviewContents>
                                  {review.contents}
                                </ReviewContents>
                              </ContentsWrap>
                              <PetpitalPrice>
                                <PetpitalHighPrice>
                                  {review.totalCost}원
                                </PetpitalHighPrice>
                              </PetpitalPrice>
                              <TagWrap>
                                <TagTop>
                                  {review.selectedColors?.map((c) => {
                                    if (c === "깨끗해요") {
                                      return <TagFirst key={c}>{c}</TagFirst>;
                                    } else if (c === "시설이좋아요") {
                                      return <TagSecond key={c}>{c}</TagSecond>;
                                    } else if (c === "친절해요") {
                                      return <TagThird key={c}>{c}</TagThird>;
                                    }
                                  })}
                                </TagTop>
                                <TagBottom>
                                  {review.selectedColors?.map((c) => {
                                    if (c === "꼼꼼해요") {
                                      return <TagFourth key={c}>{c}</TagFourth>;
                                    } else if (c === "저렴해요") {
                                      return <TagFifth key={c}>{c}</TagFifth>;
                                    }
                                  })}
                                  <DateWrap>{review.date}</DateWrap>
                                </TagBottom>
                              </TagWrap>
                            </ReviewInfo>
                          </Review>
                        );
                      }
                    })
                    .reverse()}
              </ReviewList>,
            );
          }

          setIsOpen1(!isOpen1);
          infowindow.setContent(content1);
          infowindow.open(map, marker);
        }

        // 검색결과 목록의 자식 Element를 제거하는 함수입니다
        function removeAllChildNods(el: any) {
          while (el?.hasChildNodes()) {
            el.removeChild(el.lastChild);
          }
        }
      });
    };
  }, [recentlyReview, router.isReady]);

  return (
    <MapSection className="map_wrap" isOpen={isOpen} isOpen1={isOpen1}>
      <Script
        src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`}
      ></Script>
      <div id="map"></div>

      <div id="menuDiv">
        <div id="menu_wrap" className="bg_white">
          <div className="option">
            <div>
              <div id="map_title">
                <Link
                  href="/"
                  style={{
                    position: "absolute",
                    left: "10px",
                    fontSize: "14px",
                    backgroundColor: "gray",
                    color: "white",
                  }}
                >
                  뒤로가기
                </Link>
                <div
                  style={{ color: "blue", fontWeight: "700", fontSize: "20px" }}
                >
                  동물병원 리스트
                </div>
              </div>

              <form id="form">
                <input
                  type="text"
                  value={search}
                  id="keyword"
                  placeholder="찾으실 동물병원의 (시)도 + 구 + 읍(면,동)을 입력하세요"
                  onChange={onchangeSearch}
                  style={{ fontSize: "13px" }}
                />

                <button id="submit_btn" type="submit">
                  <SearchIcon />
                </button>
              </form>
            </div>
          </div>

          <ul id="placesList"></ul>
          <div id="pagination"></div>
        </div>

        <div id="menu_wrap1" className="bg_white">
          <div className="option">
            <div></div>
          </div>
        </div>

        <div id="btnDiv">
          {isOpen ? (
            <div id="btnOn">
              <button
                id="searchBtn"
                onClick={onClickSearchBarOpen}
                type="button"
              >
                <LeftDisplayButton />
              </button>
            </div>
          ) : (
            <div id="btnOn">
              <button
                id="searchBtn"
                onClick={onClickSearchBarOpen}
                type="button"
              >
                <RightDisplayButton />
              </button>
            </div>
          )}

          {isOpen && isOpen1 ? (
            <div id="btnOn">
              <button
                id="searchBtn"
                onClick={onClickSearchBarOpen1}
                type="button"
              >
                <LeftDisplayButton />
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </MapSection>
  );
}

interface ISearchBarOpen {
  isOpen: boolean;
  isOpen1: boolean;
}

export const MapSection = styled.div`
  padding-top: 70px;
  display: flex;
  #map {
    width: 1200px;
    height: 1080px;
    position: absolute;
    overflow: hidden;
    border-radius: 20px;
  }

  .map1 {
    width: 300px;
    height: 300px;
    position: absolute;
    overflow: hidden;
    border-radius: 20px;
  }
  #menuDiv {
    display: flex;
    position: relative;
    z-index: 2;
    font-size: 12px;
    top: 0;
    left: 0;
  }

  #menu_wrap {
    position: relative;
    width: 400px;
    height: 1080px;
    border-radius: 20px;
    overflow-y: scroll;
    background: rgba(255, 255, 255, 0.7);
    display: ${(props: ISearchBarOpen) => (props.isOpen ? "" : "none")};
  }

  #menu_wrap1 {
    position: relative;
    width: 400px;
    height: 1080px;
    border-radius: 20px;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.7);
    display: ${(props: ISearchBarOpen) => (props.isOpen1 ? "" : "none")};
  }

  #map_title {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 10px;
  }

  #form {
    display: flex;
    justify-content: space-between;
    padding: 0px 15px 10px 15px;
  }

  #keyword {
    width: 100%;
    border: none;
    outline: none;
  }

  #submit_btn {
    background-color: #65d8df;
    border: none;
    outline: none;
  }

  #placesList h5 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  #placesList li {
    list-style: square;
  }
  #placesList .item {
    border-bottom: 1px solid #888;
    overflow: hidden;
    cursor: pointer;
  }

  #placesList .item .info {
    padding: 10px 0 10px 5px;
  }

  #placesList .item span {
    display: block;
    margin-top: 4px;
  }
  #placesList .info .gray {
    color: #8a8a8a;
  }

  #placesList .info .tel {
    color: #009900;
    font-size: 14px;
  }

  #btnDiv {
    display: flex;
    flex-direction: column;
  }

  #pagination {
    margin: 10px auto;
    text-align: center;
  }
  #pagination a {
    display: inline-block;
    margin-right: 10px;
    color: #7b7b7b;
  }
  #pagination .on {
    font-weight: bold;
    cursor: default;
    color: #65d8df;
  }

  #btnOn {
    position: absolute;
    height: 600px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  #searchBtn {
    width: 20px;
    padding: 0px;
    height: 70px;
    background-color: #65d8df;
    border: none;
    outline: none;
    cursor: pointer;
  }
  .reviewButton {
    display: flex;
    font-size: 15px;
    color: #fff;
    bottom: 0px;
    cursor: pointer;
    background: #15b5bf;
    padding: 15px 145px 15px 145px;
    text-align: center;
    width: 100%;
  }
  .detailButton {
    display: flex;
    font-size: 15px;
    color: #fff;
    bottom: 0px;
    cursor: pointer;
    background: #1182ce;
    padding: 15px 80px 15px 80px;
    text-align: center;
    width: 100%;
  }
  .tel {
    display: flex;
    justify-content: end;
    font-size: 16px;
    color: #0f8b0f;
    margin-right: 20px;
  }
`;

// 리뷰 스타일
const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 15px;
  width: 100%;
`;

const Review = styled.div`
  background-color: #f7f3f3e8;
  border-radius: 5px;
  display: flex;
  width: 100%;
  height: 200px;
  margin-top: 10px;
`;

const ReviewImgContainer = styled.div`
  width: 260px;
  height: 100%;
`;

const ReviewImg = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 4px 0px 0px 4px;
  object-fit: cover;
`;

const UserContainer = styled.div`
  width: 100%;
  height: 15%;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #dddde2;
`;

const StarRating = styled.div`
  width: 30%;
  height: 60%;
  font-size: 15px;
  margin-left: 20px;
  /* position: absolute; */
`;

const ProfileImg = styled.img`
  width: 10%;
  height: 70%;
  border-radius: 100%;
  object-fit: cover;
`;

const ProfileName = styled.div`
  width: 70%;
  height: 70%;
  font-size: 18px;
  margin-left: 5px;
  display: flex;
  align-items: center;
  white-space: no-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContentsWrap = styled.div`
  width: 100%;
  height: 65%;
  display: flex;
  flex-direction: column;
`;

const ReviewTitle = styled.div`
  height: 20%;
  width: 220px;
  font-size: 20px;
  display: flex;
  align-items: center;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ReviewContents = styled.div`
  font-size: 15px;
  width: 100%;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const ReviewInfo = styled.div`
  display: flex;
  margin-left: 4px;
  flex-direction: column;
  width: 100%;
`;

const PetpitalPrice = styled.div`
  position: absolute;
  left: 10px;
  margin-top: 2px;
`;

const PetpitalHighPrice = styled.span`
  color: #fff;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #65d8df;
  &::before {
    content: "진료비 : ";
    color: #fff;
  }
  white-space: no-wrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagWrap = styled.div`
  display: flex;
  flex-direction: column;
  height: 20%;
  width: 100%;
`;

const TagTop = styled.div`
  display: flex;
  flex-direction: row;
  height: 40%;
  width: 100%;
`;

const TagBottom = styled.div`
  display: flex;
  flex-direction: row;
  height: 40%;
  width: 100%;
  margin-top: 5px;
`;

const TagFirst = styled.div`
  background-color: #00b8d9;
  width: 56px;
  height: 20px;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

const TagSecond = styled.div`
  background-color: #0052cc;
  width: 76px;
  height: 20px;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

const TagThird = styled.div`
  background-color: #5243aa;
  width: 56px;
  height: 20px;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

const TagFourth = styled.div`
  background-color: #ff5630;
  width: 56px;
  height: 20px;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

const TagFifth = styled.div`
  background-color: #ff8b00;
  width: 56px;
  height: 20px;
  color: white;
  padding: 2px;
  cursor: default;
  justify-content: center;
  display: flex;
  margin-left: 5px;
  opacity: 0.7;
`;

const DateWrap = styled.div`
  position: absolute;
  right: 2px;
  font-size: 7px;
`;

export const SearchIcon = styled(SearchOutlined)`
  color: #fff;
  cursor: pointer;
`;
export const LeftDisplayButton = styled(CaretLeftFilled)`
  color: #fff;
`;
export const RightDisplayButton = styled(CaretRightFilled)`
  color: #fff;
`;
