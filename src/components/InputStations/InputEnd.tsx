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
  endPoint: DataType;
  onChangeEndPoint(data: DataType): void;
}

const InputEnd: React.FC<Props> = (props) => {
  const {endPoint, onChangeEndPoint} = props;

  const setSubwayLine = useSetRecoilState(subwayLineState);

  const [error, setError] = useState<boolean>(endPoint.error);

  const isFocused = useIsFocused();

  const ttsSet = async () => {
    await Tts.setDefaultLanguage('ko-KR');
  };

  const voiceSet = () => {
    Voice.onSpeechResults = _onSpeechResultsStart;
    Voice.onSpeechError = _onSpeechError;
    Voice.onSpeechEnd = _onSpeechEnd;
    Voice.onSpeechStart = _onSpeechStart;
  };

  useEffect(() => {
    ttsSet();
    voiceSet();

    setTimeout(() => {
      Tts.getInitStatus().then(() => {
        isFocused && inputEndPoint();
      });
    }, 1000);

    return () => {
      Voice.destroy().then(() => Voice.removeAllListeners());
      Tts.removeAllListeners('tts-string');
    };
  }, []);

  const inputEndPoint = async () => {
    const ttsString = '도착지를 입력해 주세요.';
    await Tts.speak(error ? '도착지 입력 오류.' + ttsString : ttsString);
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
    const res: string = event.value[0];
    res.trim();
    const titleText = res.replace(' ', '');
    const deleteStation =
      titleText[titleText.length - 1] === '역'
        ? titleText.slice(0, -1)
        : titleText;
    showStationInfo(deleteStation);
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
    if (titleText.length > 0) {
      await axios
        .get(
          `http://openAPI.seoul.go.kr:8088/65476b4d496a773638325a6974724d/json/SearchInfoBySubwayNameService/1/5/${titleText}/`,
        )
        .then((res) => {
          const subwayCode =
            res.data.SearchInfoBySubwayNameService.row[0].FR_CODE;
          setError(false);
          setSubwayLine((prev) => [
            ...prev,
            res.data.SearchInfoBySubwayNameService.row[0].LINE_NUM,
          ]);
          onChangeEndPoint({
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
      isFocused && inputEndPoint();
    }
  }, [error]);

  return (
    <Container>
      <Title>도착지</Title>
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

export default InputEnd;
