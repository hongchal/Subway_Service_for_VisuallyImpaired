import React, {useCallback, useEffect, useState} from 'react';
import {InputEnd, InputStart} from '../components/InputStations';
import {STRING} from '../assets/string';
import {useNavigation} from '@react-navigation/native';

enum InputStation {
  start,
  end,
  none,
}

export interface DataType {
  title: string;
  code: string;
  error: boolean;
}

const InputStations = () => {
  const navigation = useNavigation();

  const [startStation, setStartStation] = useState<DataType>({
    title: '',
    code: '',
    error: false,
  });
  const [endStation, setEndStation] = useState<DataType>({
    title: '',
    code: '',
    error: false,
  });

  const [input, setInput] = useState<InputStation>(InputStation.start);

  const onStartPoint = (data: DataType) => {
    setStartStation(data);
  };

  const onEndPoint = (data: DataType) => {
    setEndStation(data);
  };

  const InputSwitcher = useCallback(() => {
    switch (input) {
      case InputStation.start:
        return (
          <InputStart
            startPoint={startStation}
            onChangeStartPoint={onStartPoint}
          />
        );
      case InputStation.end:
        return <InputEnd endPoint={endStation} onChangeEndPoint={onEndPoint} />;
      case InputStation.none:
        return <React.Fragment />;
    }
  }, [input]);

  useEffect(() => {
    if (
      startStation.code.length > 0 &&
      startStation.title.length > 0 &&
      !startStation.error
    ) {
      setInput(InputStation.end);
    } else {
      setInput(InputStation.start);
    }
  }, [startStation, endStation]);

  useEffect(() => {
    if (startStation.code.length > 0 && endStation.code.length > 0) {
      setInput(InputStation.none);
      navigation.navigate(STRING.NAVIGATION.SHOW_ROUTE, {
        startPoint: startStation,
        endPoint: endStation,
      });
    }
  }, [startStation, endStation]);

  return (
    <React.Fragment>
      <InputSwitcher />
    </React.Fragment>
  );
};

export default InputStations;
