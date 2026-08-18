import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {Leaf, TreePine} from 'lucide-react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {colors} from '../../constants/colors';
import type {AuthStackParamList} from '../../navigation/types';
import {useAuth} from '../../auth/AuthContext';
import {ApiError} from '../../services/apiClient';
import {getMyProfile} from '../../services/userService';
import {getUserTasks} from '../../services/userTaskService';
import {
  getAccessToken,
  isOnboardingComplete,
} from '../../storage/authStorage';
import {getApiOrigin, saveApiOrigin} from '../../storage/apiConfigStorage';

type Props = NativeStackScreenProps<
  AuthStackParamList,
  'Splash'
>;

export function SplashScreen({navigation}: Props) {
  const {setUser} = useAuth();
  const [restoring, setRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [apiOrigin, setApiOrigin] = useState('');
  const [serverConfigError, setServerConfigError] = useState<string | null>(null);
  const [savingServer, setSavingServer] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  const restoreSession = useCallback(async () => {
    setRestoring(true);
    setError(null);

    try {
      const token = await getAccessToken();
      if (!token) {
        const completed = await isOnboardingComplete();
        navigation.reset({
          index: 0,
          routes: [{name: completed ? 'Login' : 'Onboarding'}],
        });
        return;
      }

      const profile = await getMyProfile();
      setUser(profile);
      const userTasks = await getUserTasks(1, 20);
      const activeManualCheckin = userTasks.items.find(
        item =>
          item.status === 'IN_PROGRESS' &&
          item.verificationStatus === 'IN_PROGRESS' &&
          item.task.verificationType === 'MANUAL_CHECKIN',
      );

      if (activeManualCheckin) {
        navigation.reset({
          index: 1,
          routes: [
            {name: 'Home'},
            {
              name: 'ManualCheckin',
              params: {userTaskId: activeManualCheckin._id},
            },
          ],
        });
      } else {
        navigation.reset({index: 0, routes: [{name: 'Home'}]});
      }
    } catch (restoreError) {
      if (restoreError instanceof ApiError && restoreError.status === 401) {
        setUser(null);
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
        return;
      }

      setError(
        restoreError instanceof Error
          ? restoreError.message
          : 'Không thể khôi phục phiên đăng nhập.',
      );
      setRestoring(false);
    }
  }, [navigation, setUser]);

  async function openServerConfig() {
    setApiOrigin(await getApiOrigin());
    setServerConfigError(null);
    setShowServerConfig(true);
  }

  async function saveServerAndRetry() {
    if (savingServer) return;
    setSavingServer(true);
    setServerConfigError(null);
    try {
      await saveApiOrigin(apiOrigin);
      setShowServerConfig(false);
      await restoreSession();
    } catch (saveError) {
      setServerConfigError(
        saveError instanceof Error
          ? saveError.message
          : 'Không thể lưu địa chỉ máy chủ.',
      );
    } finally {
      setSavingServer(false);
    }
  }

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 550,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 55,
        useNativeDriver: true,
      }),
    ]).start();

    restoreSession();
  }, [opacity, restoreSession, scale]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topGlow} />
      <View style={styles.bottomGlow} />

      <Leaf
        size={28}
        color={colors.primaryButton}
        style={styles.leftLeaf}
      />
      <Leaf
        size={21}
        color={colors.forest}
        style={styles.rightLeaf}
      />

      <Animated.View
        style={[
          styles.content,
          {
            opacity,
            transform: [{scale}],
          },
        ]}>
        <View style={styles.logo}>
          <TreePine
            size={58}
            color="#FFFFFF"
            strokeWidth={2.3}
          />
          <View style={styles.logoDot} />
        </View>

        <Text style={styles.title}>Touch Grass</Text>
        <Text style={styles.subtitle}>
          Kết nối lại với thiên nhiên
        </Text>
      </Animated.View>

      <View style={styles.pagination}>
        {restoring ? (
          <ActivityIndicator color={colors.primaryButton} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={restoreSession}>
              <Text style={styles.retryText}>Thử lại</Text>
            </Pressable>
            <Pressable style={styles.serverButton} onPress={openServerConfig}>
              <Text style={styles.serverButtonText}>Đổi địa chỉ kết nối</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <Modal
        visible={showServerConfig}
        transparent
        animationType="fade"
        onRequestClose={() => setShowServerConfig(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.serverCard}>
            <Text style={styles.serverTitle}>Địa chỉ kết nối</Text>
            <Text style={styles.serverDescription}>
              Máy ảo dùng 10.0.2.2. Điện thoại thật dùng địa chỉ LAN của máy tính cung cấp dịch vụ.
            </Text>
            <TextInput
              value={apiOrigin}
              onChangeText={setApiOrigin}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
              placeholder="http://192.168.1.10:3000"
              placeholderTextColor={colors.placeholder}
              style={styles.serverInput}
            />
            {serverConfigError ? <Text style={styles.serverError}>{serverConfigError}</Text> : null}
            <View style={styles.serverActions}>
              <Pressable
                disabled={savingServer}
                style={styles.cancelButton}
                onPress={() => setShowServerConfig(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>
              <Pressable
                disabled={savingServer}
                style={[styles.saveButton, savingServer && styles.disabled]}
                onPress={saveServerAndRetry}>
                {savingServer
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.saveText}>Lưu và thử lại</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
  topGlow: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(176, 242, 103, 0.18)',
  },
  bottomGlow: {
    position: 'absolute',
    bottom: 40,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(36, 107, 5, 0.08)',
  },
  leftLeaf: {
    position: 'absolute',
    top: 155,
    left: 32,
    opacity: 0.24,
    transform: [{rotate: '-28deg'}],
  },
  rightLeaf: {
    position: 'absolute',
    top: 210,
    right: 44,
    opacity: 0.2,
    transform: [{rotate: '38deg'}],
  },
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  logo: {
    width: 104,
    height: 104,
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: colors.primaryButton,
    shadowColor: colors.primaryButton,
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.32,
    shadowRadius: 20,
    elevation: 10,
  },
  logoDot: {
    position: 'absolute',
    top: 22,
    right: 21,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.lime,
  },
  title: {
    marginBottom: 10,
    color: colors.primary,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '800',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  pagination: {
    position: 'absolute',
    bottom: 72,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
  },
  errorBox: {paddingHorizontal: 24, alignItems: 'center', rowGap: 10},
  errorText: {color: colors.error, fontSize: 12, textAlign: 'center'},
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.primaryButton,
  },
  retryText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
  serverButton: {paddingHorizontal: 18, paddingVertical: 9},
  serverButtonText: {color: colors.primaryButton, fontSize: 12, fontWeight: '700'},
  modalBackdrop: {flex: 1, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(21,66,18,0.42)'},
  serverCard: {width: '100%', padding: 22, borderRadius: 22, backgroundColor: colors.surface},
  serverTitle: {color: colors.text, fontSize: 19, fontWeight: '800'},
  serverDescription: {marginTop: 7, color: colors.textSecondary, fontSize: 12, lineHeight: 18},
  serverInput: {height: 50, marginTop: 16, paddingHorizontal: 14, borderWidth: 1.5, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.inputBackground, color: colors.text, fontSize: 14},
  serverError: {marginTop: 7, color: colors.error, fontSize: 11},
  serverActions: {marginTop: 18, flexDirection: 'row', columnGap: 10},
  cancelButton: {height: 46, flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primaryButton, borderRadius: 23},
  cancelText: {color: colors.primaryButton, fontSize: 13, fontWeight: '700'},
  saveButton: {height: 46, flex: 1.4, alignItems: 'center', justifyContent: 'center', borderRadius: 23, backgroundColor: colors.primaryButton},
  saveText: {color: '#FFFFFF', fontSize: 13, fontWeight: '700'},
  disabled: {opacity: 0.6},
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryButton,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
});
