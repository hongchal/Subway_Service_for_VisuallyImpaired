import React, {useEffect, useRef, useState} from 'react';
import Tts from 'react-native-tts';
import {Text, TouchableWithoutFeedback} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {STRING} from '../assets/string';
import SystemSetting from 'react-native-system-setting';

const Home: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const [inProgressSpeak, setInProgressSpeak] = useState<boolean>(true);
  const bluetoothEnableRef = useRef<boolean>(false);
  const ttsSet = async () => {
    await Tts.setDefaultLanguage('ko-KR');
  };

  const onPressScreen = () => {
    navigation.navigate(STRING.NAVIGATION.INPUT_STATIONS);
  };
  const speakStartSystem = async () => {
    bluetoothEnableRef.current = true;
    const res = await Tts.speak(
      '시각 장애인을 위한 지하철 안내 시스템입니다. 준비가 되면 화면을 터치해주세요.',
    );
  };

  const speakSwitchOnBle = async () => {
    await Tts.speak('블루투스가 꺼져있습니다. 블루투스를 켜주세요.');
    const checkBle = setInterval(async () => {
      if (!bluetoothEnableRef.current) {
        SystemSetting.isBluetoothEnabled().then((enable) => {
          enable ? (
            (clearInterval(checkBle), speakStartSystem())
          ) : (
            <React.Fragment />
          );
        });
      }
    }, 3000);
  };

  const speakIntro = async () => {
    SystemSetting.isBluetoothEnabled().then((enable) => {
      enable ? speakStartSystem() : speakSwitchOnBle();
    });
  };

  useEffect(() => {
    ttsSet();
    speakIntro();
    Tts.addEventListener('tts-finish', (event) => {
      if (bluetoothEnableRef.current) {
        setInProgressSpeak(false);
      }
    });
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
