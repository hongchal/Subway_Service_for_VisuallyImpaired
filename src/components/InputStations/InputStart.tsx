import React, {useEffect, useRef, useState} from 'react';
import {DataType} from '../../screen/InputStations';
import Tts from 'react-native-tts';
import Voice from '@react-native-voice/voice';
import axios from 'axios';
import {useSetRecoilState} from 'recoil';
import {subwayLineState} from '../../recoilState';
import styled from 'styled-components/native';
import {useIsFocused} from '@react-navigation/native';

interface Props {
  startPoint: DataType;
  onChangeStartPoint(data: DataType): void;
}

const InputStart: React.FC<Props> = (props) => {
  const {startPoint, onChangeStartPoint} = props;

  const setSubwayLine = useSetRecoilState(subwayLineState);

  const [error, setError] = useState<boolean>(startPoint.error);

  const isFocused = useIsFocused();

  const ttsSet = async () => {
    await Tts.setDefaultLanguage('ko-KR');
  };

  const voiceSet = () => {
    Voice.onSpeechPartialResults = _onSpeechResultsStart;
    Voice.onSpeechError = _onSpeechError;
    Voice.onSpeechEnd = _onSpeechEnd;
    Voice.onSpeechStart = _onSpeechStart;
  };

  useEffect(() => {
    ttsSet();
    voiceSet();

    setTimeout(() => {
      Tts.getInitStatus().then(() => {
        isFocused && inputStartPoint();
      });
    }, 1000);

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
      Tts.removeAllListeners('tts-string');
    };
  }, []);

  const inputStartPoint = async () => {
    const ttsString = '출발지를 입력해 주세요.';
    await Tts.speak(error ? '출발지 입력 오류.' + ttsString : ttsString);
  };

  const voiceOn = async () => {
    isFocused && (await Voice.start('ko-KR'));
  };
  useEffect(() => {
    Tts.addEventListener('tts-finish', voiceOn);
    return () => {
      Tts.removeEventListener('tts-finish', voiceOn);
    };
  }, [isFocused]);

  const _onSpeechResultsStart = (event: any) => {
    console.log('onEnterStart', event);
    const res: string = event.value[0];
    res.trim();
    const titleText = res.replace(' ', '');
    titleText.length > 0 && showStationInfo(titleText);
  };
  const _onSpeechError = () => {
    onError();
  };

  const _onSpeechEnd = () => {};

  const _onSpeechStart = () => {
    setError(false);
  };

  const onError = () => {
    error && setError(false);
    setError(true);
  };

  const showStationInfo = async (titleText: string) => {
    if (titleText.length > 1) {
      await axios
        .get(
          `http://openAPI.seoul.go.kr:8088/65476b4d496a773638325a6974724d/json/SearchInfoBySubwayNameService/1/5/${titleText}/`,
        )
        .then((res) => {
          const subwayCode =
            res.data.SearchInfoBySubwayNameService.row[0].FR_CODE;
          setError(false);
          setSubwayLine([
            res.data.SearchInfoBySubwayNameService.row[0].LINE_NUM,
          ]);
          onChangeStartPoint({
            title: titleText,
            code: subwayCode,
            error: false,
          });
        })
        .catch((e) => {
          console.log(e);
          onError();
        });
    } else {
      onError();
    }
  };

  useEffect(() => {
    if (error) {
      isFocused && inputStartPoint();
    }
  }, [error]);

  return (
    <Container>
      <Title>출발지</Title>
    </Container>
  );
};

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #f5fcff;
`;
const Title = styled.Text`
  font-size: 40px;
  font-family: 'Apple SD Gothic Neo';
  font-weight: bold;
`;

export default InputStart;
