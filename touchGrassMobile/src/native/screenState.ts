import {NativeEventEmitter, NativeModules} from 'react-native';

export interface ScreenStateEvent {
  type: 'SCREEN_OFF' | 'SCREEN_ON';
  timestamp: string;
}

export interface ScreenEvents {
  screenOffAt: string | null;
  screenOnAt: string | null;
}

interface ScreenStateNativeModule {
  startListening(): Promise<void>;
  stopListening(): Promise<void>;
  getScreenEvents(): Promise<ScreenEvents>;
  addListener(eventName: string): void;
  removeListeners(count: number): void;
}

const nativeModule = NativeModules.ScreenState as
  | ScreenStateNativeModule
  | undefined;

function getModule(): ScreenStateNativeModule {
  if (!nativeModule) {
    throw new Error(
      'Module ScreenState chưa được cài. Hãy rebuild ứng dụng Android.',
    );
  }
  return nativeModule;
}

export const screenState = {
  startListening: () => getModule().startListening(),
  stopListening: () => getModule().stopListening(),
  getScreenEvents: () => getModule().getScreenEvents(),
  subscribe(listener: (event: ScreenStateEvent) => void) {
    const module = getModule();
    return new NativeEventEmitter(module).addListener(
      'ScreenStateChanged',
      listener,
    );
  },
};
