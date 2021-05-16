import React, {useEffect, useRef, useState} from 'react';
import {useRecoilValue} from 'recoil';
import {subwayLineState} from '../recoilState';
import axios from 'axios';
import styled from 'styled-components/native';
import {ActivityIndicator, FlatList, Text} from 'react-native';
import SUBWAYDATA from '../assets/subwayData';

const ShowSubwayLocation = () => {
  const subwayLine = useRecoilValue(subwayLineState);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [upLine, setUpLine] = useState<Array<any>>([]);
  const [downLine, setDownLine] = useState<Array<any>>([]);
  const [subwayStations, setSubwayStations] = useState<Array<any>>([]);

  const getSubwayStations = () => {
    const subwayData = SUBWAYDATA.DATA;
    const res = subwayData
      .filter((data) => data.line_num === '07호선') //todo: subwayLine으로
      .sort(function (a, b) {
        return a.fr_code - b.fr_code;
      });
    setSubwayStations(res);
  };
  const getSubwayLocation = async () => {
    await axios
      .get(
        'http://swopenAPI.seoul.go.kr/api/subway/725864484a6a77363533536c565973/json/realtimePosition/0/20/7호선/',
      )
      .then((res) => {
        const upLineRes = res.data.realtimePositionList.filter(
          (data) => data.updnLine == 0,
        );
        const dnLineRes = res.data.realtimePositionList.filter(
          (data) => data.updnLine == 1,
        );
        setUpLine(upLineRes);
        setDownLine(dnLineRes);
      })
      .catch((e) => console.error(e));
  };

  const timeRef = useRef<null | NodeJS.Timeout>(null);

  useEffect(() => {
    getSubwayStations();
    getSubwayLocation();
    timeRef.current = setInterval(() => {
      getSubwayLocation();
    }, 15000);

    setIsLoaded(true);

    return () => {
      if (timeRef.current) {
        clearInterval(timeRef.current);
        timeRef.current = null;
      }
    };
  }, []);

  return (
    <Wrapper>
      {isLoaded ? (
        <FlatList
          data={subwayStations}
          renderItem={({item, index}) => {
            let isUp = false;
            let isDown = false;
            upLine.map((nowStation, index) => {
              if (nowStation.statnNm === item.station_nm) {
                isUp = true;
              }
            });
            downLine.map((nowStation, index) => {
              if (nowStation.statnNm === item.station_nm) {
                isDown = true;
              }
            });
            return (
              <FlatListSubwayBox>
                <UpDownItem>{isUp && <Text>up</Text>}</UpDownItem>
                <SubwayItem key={index}>
                  <Text>{item.station_nm}</Text>
                </SubwayItem>
                <UpDownItem>{isDown && <Text>down</Text>}</UpDownItem>
              </FlatListSubwayBox>
            );
          }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <ActivityIndicator size={'large'} color={'#000000'} />
      )}
    </Wrapper>
  );
};
//todo: 특정 구간에서 API끼리 name이 다른 경우 처리
const Wrapper = styled.View`
  flex: 1;
  padding: 20px;
  justify-content: center;
  align-items: center;
`;
const FlatListSubwayBox = styled.View`
  flex-direction: row;
`;
const SubwayItem = styled.View`
  height: 40px;
  width: 100px;
  justify-content: center;
  align-items: center;
  border-width: 1px;
  margin-bottom: 2px;
  background-color: white;
`;
const UpDownItem = styled.View`
  height: 40px;
  width: 40px;
  justify-content: center;
  align-items: center;
`;

export default ShowSubwayLocation;
