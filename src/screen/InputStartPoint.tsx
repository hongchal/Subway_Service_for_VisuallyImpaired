import React, {useEffect, useState} from 'react';
import styled from 'styled-components/native';
import Voice from '@react-native-voice/voice';
import {useNavigation} from '@react-navigation/native';
import {STRING} from '../assets/string';
import axios from 'axios';
import {useRecoilState} from 'recoil';
import {subwayLineState} from '../recoilState';
import {Alert} from 'react-native';
import Tts from 'react-native-tts';

export interface dataProps {
  isRecord: boolean;
  title: string;
  focused: boolean;
  code: string;
}

export const InputStartPoint = () => {
  const [startPoint, setStartPoint] = useState<dataProps>({
    isRecord: false,
    title: '',
    focused: false,
    code: '',
  });

  const [endPoint, setEndPoint] = useState<dataProps>({
    isRecord: false,
    title: '',
    focused: false,
    code: '',
  });

  const [isEnteredStart, setIsEnteredStart] = useState<boolean>(false);
  const [isEnteredEnd, setIsEnteredEnd] = useState<boolean>(false);

  const [subwayLine, setSubwayLine] = useRecoilState(subwayLineState);

  const buttonLabelStartPoint = startPoint.isRecord ? 'Stop' : 'Start';
  const buttonLabelEndPoint = endPoint.isRecord ? 'Stop' : 'Start';

  const voiceLabelStartPoint = startPoint.title
    ? startPoint.title
    : startPoint.isRecord
    ? 'Say something...'
    : 'press Start button';
  const voiceLabelEndPoint = endPoint.title
    ? endPoint.title
    : endPoint.isRecord
    ? 'Say something...'
    : 'press Start button';

  const navigation = useNavigation();

  const _onSpeechStart = () => {
    console.log('start');
  };
  const _onSpeechEnd = () => {
    console.log('onSpeechEnd');
    Voice.destroy();
    if (startPoint.isRecord && !endPoint.isRecord) {
      setIsEnteredStart(true);
    } else if (startPoint.isRecord && endPoint.isRecord) {
      setIsEnteredEnd(true);
    }
  };
  const _onSpeechResultsStart = (event) => {
    console.log('onSpeechResults');
    console.log(event);
    const res: string = event.value[0];
    res.trim();
    console.log('start:', res);
    setStartPoint({
      title: res.replace(' ', ''),
      isRecord: false,
      focused: false,
      code: '',
    });
  };
  const _onSpeechResultsEnd = (event) => {
    console.log('onSpeechResults');
    const res: string = event.value[0];
    res.trim();
    console.log('end:', res);
    setEndPoint({
      title: res.replace(' ', ''),
      isRecord: false,
      focused: false,
      code: '',
    });
  };
  const _onSpeechError = (event) => {
    console.log('_onSpeechError');
    console.log(event.error);
  };

  const _onRecordVoiceStartPoint = () => {
    Voice.onSpeechPartialResults = _onSpeechResultsStart;
    if (!startPoint.isRecord) {
      Voice.start('ko-KR');
    } else {
      Voice.stop();
    }
    startPoint.isRecord = !startPoint.isRecord;
  };
  const _onRecordVoiceEndPoint = () => {
    Voice.onSpeechPartialResults = _onSpeechResultsEnd;
    if (!endPoint.isRecord) {
      Voice.start('ko-KR');
    } else {
      Voice.stop();
    }
    endPoint.isRecord = !endPoint.isRecord;
  };

  const showStationInfo = async () => {
    if (startPoint.title.length > 0 && endPoint.title.length > 0) {
      const stationArr: Array<string> = [];

      await axios
        .get(
          `http://openAPI.seoul.go.kr:8088/65476b4d496a773638325a6974724d/json/SearchInfoBySubwayNameService/1/5/${startPoint.title}/`,
        )
        .then((res) => {
          setSubwayLine(res.data.SearchInfoBySubwayNameService.row[0].LINE_NUM);
          stationArr.push(
            res.data.SearchInfoBySubwayNameService.row[0].LINE_NUM,
          );

          startPoint.code =
            res.data.SearchInfoBySubwayNameService.row[0].FR_CODE;
          console.log(startPoint.code);
          //startPoint.code = res;
        })
        .catch((e) => {
          Alert.alert('출발지 입력 오류', '출발지를 다시 확인하세요', [
            {text: '확인', onPress: () => {}},
          ]);
          Tts.speak('출발지 입력 오류. 다시 입력하세요.');
          return;
        });

      await axios
        .get(
          `http://openAPI.seoul.go.kr:8088/65476b4d496a773638325a6974724d/json/SearchInfoBySubwayNameService/1/5/${endPoint.title}/`,
        )
        .then((res) => {
          stationArr.push(
            res.data.SearchInfoBySubwayNameService.row[0].LINE_NUM,
          );
          endPoint.code = res.data.SearchInfoBySubwayNameService.row[0].FR_CODE;
          console.log(endPoint.code);
        })
        .catch((e) => {
          Alert.alert('도착지 입력 오류', '도착지를 다시 확인하세요', [
            {text: '확인', onPress: () => {}},
          ]);
          Tts.speak('도착지 입력 오류. 다시 입력하세요.');
          return;
        });

      setSubwayLine(stationArr);

      navigation.navigate(STRING.NAVIGATION.SHOW_ROUTE, {
        startPoint: startPoint,
        endPoint: endPoint,
      });
    } else if (startPoint.title.length === 0) {
      Tts.speak('출발지 입력 오류. 다시 입력하세요.');
      setTimeout(() => {
        startPoint.isRecord = false;
        inputStartPoint();
      }, 3000);
    } else if (endPoint.title.length === 0) {
      Tts.speak('도착지 입력 오류. 다시 입력하세요.');
      setTimeout(() => {
        endPoint.isRecord = false;
        inputEndPoint();
      }, 3000);
    }
  };

  useEffect(() => {
    Voice.onSpeechStart = _onSpeechStart;
    Voice.onSpeechEnd = _onSpeechEnd;
    Voice.onSpeechError = _onSpeechError;

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    startPoint.code != '' &&
      endPoint.code != '' &&
      navigation.navigate(STRING.NAVIGATION.SHOW_ROUTE, {
        startCode: startPoint.title,
        endCode: endPoint.title,
      });
  }, [startPoint.title, endPoint.title]);

  const ttsSet = async () => {
    await Tts.setDefaultLanguage('ko-KR');
  };

  useEffect(() => {
    ttsSet();

    setTimeout(() => {
      inputStartPoint();
    }, 2000);
  }, []);

  useEffect(() => {
    if (isEnteredStart) {
      inputEndPoint();
    }
  }, [isEnteredStart]);

  useEffect(() => {
    if (isEnteredEnd && isEnteredStart) {
      showStationInfo();
    }
  }, [isEnteredEnd, isEnteredStart, endPoint.title, startPoint.title]);

  const inputStartPoint = async () => {
    await Tts.getInitStatus().then(() => Tts.speak('출발지를 입력해 주세요.'));
    setTimeout(async () => {
      startPoint.focused = true;
      await _onRecordVoiceStartPoint();
    }, 3000);
  };

  const inputEndPoint = async () => {
    await Tts.speak('도착지를 입력해 주세요.');
    setTimeout(async () => {
      endPoint.focused = true;
      await _onRecordVoiceEndPoint();
    }, 3000);
  };

  return (
    <>
      <Container>
        <Title>출발지 입력</Title>
        <VoiceText>{voiceLabelStartPoint}</VoiceText>
        <ButtonRecord
          onPress={() => {
            startPoint.focused = true;
            _onRecordVoiceStartPoint();
          }}
          title={buttonLabelStartPoint}
        />
      </Container>
      <Container>
        <Title>도착지 입력</Title>
        <VoiceText>{voiceLabelEndPoint}</VoiceText>
        <ButtonRecord
          onPress={() => {
            endPoint.focused = true;
            _onRecordVoiceEndPoint();
          }}
          title={buttonLabelEndPoint}
        />
      </Container>

      <Container>
        <Title>지하철 정보</Title>
        <ButtonRecord onPress={showStationInfo} title={'지하철 정보 출력'} />
      </Container>
    </>
  );
};

const Container = styled.View`
  flex: 0.5;
  justify-content: center;
  align-items: center;
  background-color: #f5fcff;
`;
const ButtonRecord = styled.Button``;
const VoiceText = styled.Text`
  margin: 32px;
  font-family: 'Apple SD Gothic Neo';
`;
const Title = styled.Text`
  font-size: 40px;
  font-family: 'Apple SD Gothic Neo';
  font-weight: bold;
`;

const ScrollView = styled.ScrollView`
  flex: 1;
`;
