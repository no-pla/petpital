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
import { Map, MapMarker } from "react-kakao-maps-sdk";

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

export function getServerSideProps({ query }: any) {
  // if query object was received, return it as a router prop:
  if (query.id) {
    return { props: { router: { query } } };
  }
  // obtain candidateId elsewhere, redirect or fallback to some default value:
  /* ... */
  return { props: { router: { query: { target: "target", id: "id" } } } };
}

const SearchHospital = () => {
  const router = useRouter();
  const {
    query: { target, hospitalName, id },
  } = router;
  const [place, setPlace] = useState<string | string[]>("");
  const [info, setInfo] = useState<any>();
  const [markers, setMarkers] = useState<any>([]);
  const [map, setMap] = useState<any>();
  const [hospitalList, setHospitalList] = useState<any>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [targetHospitalData, setTargetHospitalData] = useState<any>([]);
  const targetHospital = useRef<HTMLInputElement>(null);

  const Input = () => {
    return (
      <SearchInput
        ref={targetHospital}
        placeholder="동물병원을 입력해 보세요."
        type="text"
        autoFocus
        defaultValue={place}
      />
    );
  };

  // 헤더로 통해 들어가면 2번째 open x
  useEffect(() => {
    // 최초 1번과 target이 바뀔 때마다 재실행
    if (hospitalName) {
      setPlace(hospitalName);
      setIsDetailOpen(true);
    }
    if (target !== undefined) {
      setPlace(target);
    }
  }, [target, hospitalName]);
  // console.log(hospitalName);

  useEffect(() => {
    if (!map) return;
    const ps = new kakao.maps.services.Places();

    ps.keywordSearch(place + " 동물병원", (data, status, pagination) => {
      if (data.length === 0) {
        setHospitalList([]);
        setPlace("");
      }
      Pagnation(pagination);

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
          // setHospitalList((prev: any) => [...prev, marker]);
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

  const Pagnation = (pagination: any) => {
    console.log("pagination", pagination);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetHospital.current?.value === "") {
      alert("비어있음"); // 추후 모달로 수정 예정
      return;
    } else if (targetHospital.current?.value !== undefined) {
      setIsDetailOpen(false);
      setPlace(targetHospital.current?.value);
    }
  };

  const onClick = (id: string, targetHospital: IHospital) => {
    // 병원 이름만 적으려 했으나 동일 이름의 병원이 존재해 placeName=[병원이름]&id[placeId]로 설정
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + "?hospitalName=" + id,
    );
    setIsDetailOpen(true);
    setTargetHospitalData(targetHospital);
  };

  return (
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
        <>
          <BoardContainer>
            <HospitalListContainer>
              <SearchForm onSubmit={onSubmit}>
                <Input />
              </SearchForm>
              {hospitalList.length > 0
                ? hospitalList.map((hospital: IHospital) => {
                    return (
                      <div
                        key={hospital.id}
                        onClick={() =>
                          onClick(
                            hospital.place_name + "&id=" + hospital.id,
                            hospital,
                          )
                        }
                      >
                        {hospital.place_name}
                      </div>
                    );
                  })
                : "데이터가 없습니다."}
            </HospitalListContainer>
            {isDetailOpen && (
              <HospitalDetailListContainer>
                {targetHospitalData.place_name}
              </HospitalDetailListContainer>
            )}
          </BoardContainer>
        </>
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
  );
};

const BoardContainer = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  z-index: 50;
`;

const HospitalDetailListContainer = styled.div`
  z-index: 50;
  width: 33vw;
  max-width: 375px;
  height: 100vh;
  margin: 60px 0 50px 0;
  background: #ffffff;
  box-shadow: 4px 0px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid gray;
`;

const MapContainer = styled.div`
  position: relative;
`;

const HospitalListContainer = styled.div`
  z-index: 50;
  width: 33vw;
  max-width: 375px;
  height: 100vh;
  top: 0;
  margin: 60px 0 50px 0;
  background: #ffffff;
  box-shadow: 4px 0px 4px rgba(0, 0, 0, 0.1);
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

export default SearchHospital;
//
