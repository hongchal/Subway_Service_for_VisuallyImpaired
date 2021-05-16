import React from 'react';
import {SafeAreaView} from 'react-native';
import {RootNavigation} from './src/RootNavigation';
import {RecoilRoot} from "recoil";

const App = () => {
  return (
    <RecoilRoot>
      <RootNavigation />
    </RecoilRoot>
  );
};

export default App;
