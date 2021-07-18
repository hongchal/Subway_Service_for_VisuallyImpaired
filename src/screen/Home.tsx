import React, {useEffect, useState} from 'react';
import Tts from 'react-native-tts';
import {Text, TouchableWithoutFeedback} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {STRING} from '../assets/string';

const Home: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [inProgressSpeak, setInProgressSpeak] = useState<boolean>(true);

  const ttsSet = async () => {
    await Tts.setDefaultLanguage('ko-KR');
  };

  const onPressScreen = () => {
    navigation.navigate(STRING.NAVIGATION.INPUT_START);
  };
  const speakIntro = async () => {
    const res = await Tts.speak(
      '시각 장애인을 위한 지하철 안내 시스템입니다. 준비가 되면 화면을 터치해주세요.',
    );
    console.log(res);
  };

  useEffect(() => {
    ttsSet();
    speakIntro();
    Tts.addEventListener('tts-finish', (event) => setInProgressSpeak(false));
    return () => {};
  }, []);

  useEffect(() => {
    if (route.params) {
      if (route.params.departDestination) {
        //todo:하차하는 곳으로 가슈
        navigation.navigate(STRING.NAVIGATION.DETECT_BEACON_WHEN_QUIT);
      }
    }
  }, [route.params]);

  return (
    <TouchableWithoutFeedback
      disabled={inProgressSpeak}
      onPress={onPressScreen}>
      <WholeWrapper>
        <Text>시각 장애인을 위한 지하철 안내 시스템</Text>
      </WholeWrapper>
    </TouchableWithoutFeedback>
  );
};
const WholeWrapper = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export default Home;
