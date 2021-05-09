import React, {useState, useEffect} from 'react';
import styled from 'styled-components/native';
import Voice from '@react-native-voice/voice';
import {useNavigation, useRoute} from '@react-navigation/native';
import {STRING} from '../assets/string';
import axios from 'axios';

export const ShowRoute = () => {
  const [data, setData] = useState({startCode: '', endCode: ''});
  const navigation = useNavigation();
  const route = useRoute();
  const API_KEY = 'xUQGbrtq5/4KHQtgcEK2jSdXF7I2SnhpKm6Vfvoayx0'; //'bq4DHENm4M1n96fEetwYdg'; //'xUQGbrtq5/4KHQtgcEK2jSdXF7I2SnhpKm6Vfvoayx0';

  useEffect(() => {
    setData({startCode: route.params.startCode, endCode: route.params.endCode});
    console.log(API_KEY);
    console.log(encodeURIComponent(API_KEY));
  }, []);

  const onPressButton = () => {
    fetchRoute();
  };

  const fetchRoute = async () => {
    await axios
      .get(
        `https://api.odsay.com/v1/api/subwayPath?apiKey=${decodeURIComponent(
          API_KEY,
        )}&CID=1000&SID=${data.startCode}&EID=${data.endCode}`,
      )
      .then((res) => console.log(res));
  };

  return (
    <Container>
      <Title>{data.startCode}</Title>
      <Title>{data.endCode}</Title>
      <ButtonRecord title={'hhh'} onPress={onPressButton} />
    </Container>
  );
};

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
