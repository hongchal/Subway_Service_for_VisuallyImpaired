import React, {useEffect} from 'react';
import styled from 'styled-components/native';
import {PermissionsAndroid, Text} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {STRING} from '../assets/string';
import {useRecoilValue} from 'recoil';
import {numberOfSubwayLineState, subwayLineState} from '../recoilState';
//todo: 목적지 입력 후, 경로가 정해지면 상행선 or 하행선인지 판별 후 해당 screen으로
//todo: 출발지에서 탄 것을 탐지 => 현재 출발지 station에 있는 열차의 trainNo가 현재 사용자가 탄 지하철
const ShowSubwayLocation = () => {
  const subwayLine = useRecoilValue(subwayLineState);
  const subwayLineIdx = useRecoilValue(numberOfSubwayLineState);

  const navigation = useNavigation();

  const route = useRoute();

  useEffect(() => {
    if (route.params) {
      if (route.params.UpDown === 'up') {
        navigation.navigate(STRING.NAVIGATION.SUBWAY_LOCATION_UP, {
          lineNumber: subwayLine[subwayLineIdx],
          startPoint: route.params.startPoint,
          endPoint: route.params.endPoint,
        });
      } else {
        navigation.navigate(STRING.NAVIGATION.SUBWAY_LOCATION_DOWN, {
          lineNumber: subwayLine[subwayLineIdx],
          startPoint: route.params.startPoint,
          endPoint: route.params.endPoint,
        });
      }
    }
    console.log(route.params);
  }, [route.params]);

  return (
    <Wrapper>
      <Button
        onPress={() =>
          navigation.navigate(STRING.NAVIGATION.SUBWAY_LOCATION_UP, {
            lineNumber: subwayLine[subwayLineIdx],
            startPoint: '남성',
            endPoint: '학동',
          })
        }>
        <ButtonWrapper>
          <Text>상행선</Text>
        </ButtonWrapper>
      </Button>
      <Button
        onPress={() =>
          navigation.navigate(STRING.NAVIGATION.SUBWAY_LOCATION_DOWN, {
            lineNumber: subwayLine[subwayLineIdx],
            startPoint: '남성',
            endPoint: '철산',
          })
        }>
        <ButtonWrapper>
          <Text>하행선</Text>
        </ButtonWrapper>
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled.View`
  flex: 1;
  justify-content: space-evenly;
  align-items: center;
  flex-direction: row;
`;

const Button = styled.TouchableOpacity``;
const ButtonWrapper = styled.View`
  width: 120px;
  height: 50px;
  background-color: white;
  border-radius: 12px;
  border-width: 1px;
  justify-content: center;
  align-items: center;
`;

export default ShowSubwayLocation;
