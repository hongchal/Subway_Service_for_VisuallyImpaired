import {atom} from 'recoil';

export const subwayLineState = atom<Array<string>>({
  key: 'subwayLineState',
  default: [],
});

export const numberOfSubwayLineState = atom<number>({
  key: 'numberOfSubwayLineState',
  default: 0,
});
//todo: 장애인이 하차를 입력했을 경우 +1

export const isClientRideState = atom<boolean>({
  key: 'isClientRideState',
  default: false,
});

export const isClientDepartDestinationState = atom<boolean>({
  key: 'isClientDepartDestinationState',
  default: false,
});
