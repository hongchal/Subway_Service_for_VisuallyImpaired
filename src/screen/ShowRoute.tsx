import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import {StackActions, useNavigation, useRoute} from '@react-navigation/native';
import axios from 'axios';
import STATION from '../assets/stationCoordinate';
import SUBWAYDATA from '../assets/subwayData';
import {dataProps} from './InputStartPoint';
import {Alert} from 'react-native';
import Tts from 'react-native-tts';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {
  numberOfSubwayLineState,
  subwayLineState,
  subwayUpOrDownLineState,
} from '../recoilState';
import {STRING} from '../assets/string';

enum coordinateIndex {
  Y,
  X,
}

interface PathType {
  fid: Array<string>;
  fname: Array<string>; //시작역 이름
  fx: Array<string>;
  fy: Array<string>;
  railLinkList: Array<Array<Object>>;
  routeNm: Array<string>;
  tid: Array<string>;
  tname: Array<string>; // 도착역 이름
  tx: Array<string>;
  ty: Array<string>;
}

export const ShowRoute = () => {
  const [data, setData] = useState<{
    startPoint: dataProps;
    endPoint: dataProps;
  }>({startPoint: {}, endPoint: {}});
  const navigation = useNavigation();
  const route = useRoute();
  const API_KEY =
    'LxYoKzvAMQN8l6UBprXuyvvvCi9uunUiv9i3fJGwNMcgMoRq%2BTKFCnSpBNlJBKTmhpRT01Q%2F1KntzS%2FkIXTqvA%3D%3D';
  const [routes, setRoutes] = useState<Array<any>>([]);
  const [bestRoute, setBestRoute] = useState<Array<string>>([]);

  const stationLine = useRecoilValue(subwayLineState);
  const stationLineIdx = useRecoilValue(numberOfSubwayLineState);
  useEffect(() => {
    getData();
  }, []);

  const ttsSet = () => {
    Tts.setDefaultLanguage('ko-KR');
  };

  const fetchRoute = async () => {
    await axios
      .get(
        `http://ws.bus.go.kr/api/rest/pathinfo/getPathInfoBySubway?serviceKey=${API_KEY}&startX=${String(
          STATION.DATA[route.params.startPoint.title][coordinateIndex.X],
        )}&startY=${String(
          STATION.DATA[route.params.startPoint.title][coordinateIndex.Y],
        )}&endX=${String(
          STATION.DATA[route.params.endPoint.title][coordinateIndex.X],
        )}&endY=${String(
          STATION.DATA[route.params.endPoint.title][coordinateIndex.Y],
        )}`,
      )
      .then((res) => {
        var parseString = require('react-native-xml2js').parseString;
        var xml = res.data;
        parseString(xml, function (err: any, result: any) {
          const parsed = JSON.parse(JSON.stringify(result));
          const msgBody = parsed.ServiceResult.msgBody;
          msgBody.map((item: any) => {
            setRoutes(item.itemList);
          });
        });
      });
  };

  const processingRoute = () => {
    const arr: Array<Array<string>> = [];
    routes.map((route) => {
      const way: Array<string> = [];
      route.pathList.map((path: PathType) => {
        path.fname.map((name) => {
          way.push(name.replace('역', ''));
        });
        path.tname.map((name) => {
          way.push(name.replace('역', ''));
        });
      });
      const uniqueWay = way.filter((item, index) => {
        return way.indexOf(item) === index;
      });
      arr.push(uniqueWay);
    });
    const res = arr.reduce(function (minI, el, index, arr) {
      return el.length < arr[minI].length ? index : minI;
    }, 0);
    return arr[res];
  };

  const getData = async () => {
    await ttsSet();
    await setData({
      startPoint: route.params.startPoint,
      endPoint: route.params.endPoint,
    });
    await fetchRoute();
    Tts.speak(
      `출발지는 ${route.params.startPoint.title}역, 도착지는 ${route.params.endPoint.title}역 입니다.`,
    );
  };

  const onPressFunction = async () => {
    const res = await processingRoute();
    const stations: Array<{name: string; code: number}> = [];
    setBestRoute(res);
    let str: string = '';
    res.map((data, index) => {
      str += data + (index !== res.length - 1 ? ' → ' : '');
    });
    Tts.speak('최소 환승역은' + str + '입니다.');
    res.map((bestRoute) => {
      stations.push(getStationCodes(bestRoute));
    });
    const upOrDown = getUpOrDown(stations);
    console.log(stations);
    navigation.navigate(STRING.NAVIGATION.DETECT_BEACON, {
      UpDown: upOrDown,
      startPoint: stations[0].name,
      endPoint: stations[1].name,
    });
  };

  const getStationCodes = (bestRoute) => {
    const stationInfo = SUBWAYDATA.DATA;
    const res = stationInfo.filter(
      (station) =>
        station.station_nm.includes(bestRoute) &&
        station.line_num.includes(stationLine[stationLineIdx]),
    );
    if (res.length > 0) {
      return {code: res[0].station_cd, name: res[0].station_nm};
    }
  };

  const getUpOrDown = (stations: Array<{name: string; code: number}>) => {
    if (parseInt(stations[0].code) < parseInt(stations[1].code)) {
      return 'down';
    } else {
      return 'up';
    }
  };

  return (
    <WholeTouchable onPress={onPressFunction}>
      <Container>
        <TextWrapper>
          <Title>출발지 : {data.startPoint.title}</Title>
          <Title>도착지 : {data.endPoint.title}</Title>
        </TextWrapper>
      </Container>
    </WholeTouchable>
  );
};

const TextWrapper = styled.View`
  margin-bottom: 32px;
`;
const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f5fcff;
`;
const ButtonRecord = styled.Button``;
const VoiceText = styled.Text`
  margin: 32px;
`;
const Title = styled.Text`
  font-size: 40px;
  font-family: 'Apple SD Gothic Neo';
  font-weight: bold;
`;
const WholeTouchable = styled.TouchableWithoutFeedback``;
