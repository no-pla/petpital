import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import {
  SearchOutlined,
  CaretLeftFilled,
  CaretRightFilled,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { imageSearch } from "../share/api";

declare const window: typeof globalThis & {
  kakao: any;
};

const KAKAO_API_KEY = process.env.NEXT_PUBLIC_KAKAO_API_KEY;

export default function SearchMap(props: any) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(true);
  const [isOpen1, setIsOpen1] = useState(false);
  const router = useRouter();

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
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&libraries=services&autoload=false`;

    document.head.appendChild(script);

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

        const ps = new window.kakao.maps.services.Places();

        const infowindow = new window.kakao.maps.InfoWindow({ zIndex: 1 });

        const searchForm = document.getElementById("submit_btn");
        searchForm?.addEventListener("click", function (e) {
          e.preventDefault();
          searchPlaces();
        });

        const searchForm1 = document.getElementById("form");
        searchForm1?.addEventListener("enter", function (e) {
          e.preventDefault();
          searchPlaces();
        });

        function searchPlaces() {
          const keyword = (
            document.getElementById("keyword") as HTMLInputElement
          ).value;

          if (!keyword.replace(/^\s+|\s+$/g, "")) {
            alert("키워드를 입력해주세요!");
            return false;
          }

          ps.keywordSearch(keyword, placesSearchCB);
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

          itemStr += '<span class="tel">' + places.phone + "</span>";
          itemStr +=
            "<a href=" + places.place_url + ">병원 정보 보기</a>" + "</div>";
          el.innerHTML = itemStr;
          el.className = "item";

          return el;
        }

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
        function displayInfowindow(marker: any, title: any, places: any) {
          const content1 = `<div style="padding:10px;min-width:200px">${title}</div>`;
          const roadviewContainer = document.getElementById("roadview"); //로드뷰를 표시할 div
          const roadview = new window.kakao.maps.Roadview(roadviewContainer); //로드뷰 객체
          const roadviewClient = new window.kakao.maps.RoadviewClient(); //좌표로부터 로드뷰 파노ID를 가져올 로드뷰 helper객체

          const position = new window.kakao.maps.LatLng(places.y, places.x);

          // 특정 위치의 좌표와 가까운 로드뷰의 panoId를 추출하여 로드뷰를 띄운다.
          roadviewClient.getNearestPanoId(position, 50, function (panoId: any) {
            roadview.setPanoId(panoId, position); //panoId와 중심좌표를 통해 로드뷰 실행
          });

          const content = `         
          <div class="item">
          <div id="roadview"></div>
            <h5>${title}</h5>
            <div class="info">
              <span class="gray">${places.road_address_name}</span>
              <span>${places.address_name}</span>
              <span class="tel">${places.phone}</span>
              <a href="${places.place_url}" target="_blank">상세보기</a>
            </div>
          </div>
        `;
          const menuWrap = document.getElementById("menu_wrap1");
          if (menuWrap) menuWrap.innerHTML = content;

          setIsOpen1(!isOpen1);
          console.log(places);
          infowindow.setContent(content1);
          infowindow.open(map, marker);
        }

        // 검색결과 목록의 자식 Element를 제거하는 함수입니다
        function removeAllChildNods(el: any) {
          while (el.hasChildNodes()) {
            el.removeChild(el.lastChild);
          }
        }
      });
    };
  }, []);

  return (
    <MapSection className="map_wrap" isOpen={isOpen} isOpen1={isOpen1}>
      <div id="map"></div>

      <div id="menuDiv">
        <div id="menu_wrap" className="bg_white">
          <div className="option">
            <div>
              <div id="map_title">
                <div>동물병원 리스트</div>
              </div>

              <form id="form">
                <input
                  type="text"
                  value={search}
                  id="keyword"
                  onChange={onchangeSearch}
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
  }

  #menu_wrap {
    position: relative;
    width: 400px;
    height: 100vh;
    border-radius: 20px;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.7);
    display: ${(props: ISearchBarOpen) => (props.isOpen ? "" : "none")};
  }

  #menu_wrap1 {
    position: relative;
    width: 400px;
    height: 100vh;
    border-radius: 20px;
    overflow-y: auto;
    background: rgba(255, 255, 255, 0.7);
    display: ${(props: ISearchBarOpen) => (props.isOpen1 ? "" : "none")};
  }
  #roadview {
    width: 200px;
    height: 200px;
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
    background-color: #ff6e30;
    border: none;
    outline: none;
  }

  #placesList h5 {
    color: #ff6e30;
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
    color: #ff6e30;
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
    background-color: #ffa230;
    border: none;
    outline: none;
  }
`;

export const SearchIcon = styled(SearchOutlined)`
  color: #fff;
  cursor: pointer;
`;

export const LeftDisplayButton = styled(CaretLeftFilled)`
  color: #fff;
  cursor: pointer;
`;
export const RightDisplayButton = styled(CaretRightFilled)`
  color: #fff;
`;
