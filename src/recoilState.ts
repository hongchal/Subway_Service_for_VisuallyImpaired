import {atom} from 'recoil';

export const subwayLineState = atom({
  key: 'subwayLineState',
  default: '',
});
//todo: 지하철경로 출력시 거쳐가야하는 호선 수를 Array로 넣어야함

export const isClientRideState = atom<boolean>({
  key: 'isClientRideState',
  default: false,
});
