import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, Switch, ScrollView, TouchableOpacity, Image, Animated, Dimensions } from 'react-native';
import { Settings, Volume2, Monitor, Vibrate, Terminal, User, Camera as CameraIcon } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLORS = {
  background: '#040406',
  panelBg: '#0D0D14',
  turkuaz: '#00F0FF',
  pembe: '#FF003C',
  neon: '#FAFF00',
  text: '#E0E5EC',
  textMuted: '#686D76',
  border: '#1E1E28',
};

const STORAGE_KEY = '@nexblock_profile_pic';

export default function SettingsScreen() {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [highDpiEnabled, setHighDpiEnabled] = useState(false);

  // Identity States
  const [photoUri, setPhotoUri] = useState(null);
  const [showCameraView, setShowCameraView] = useState(false);
  const [cameraRef, setCameraRef] = useState(null);

  // Camera Permissions (Expo SDK 50+)
  const [permission, requestPermission] = useCameraPermissions();

  // Scanner Animation
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadProfilePic = async () => {
      try {
        const uri = await AsyncStorage.getItem(STORAGE_KEY);
        if (uri) setPhotoUri(uri);
      } catch (e) {
        console.error('Fotoğraf yüklenemedi:', e);
      }
    };
    loadProfilePic();
  }, []);

  useEffect(() => {
    if (showCameraView) {
      if (!permission?.granted) {
        requestPermission();
      }
      
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.stopAnimation();
      scanAnim.setValue(0);
    }
  }, [showCameraView, permission]);

  const takePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({ quality: 0.8 });
        setPhotoUri(photo.uri);
        await AsyncStorage.setItem(STORAGE_KEY, photo.uri);
        setShowCameraView(false);
      } catch (error) {
        console.error("Fotoğraf çekilirken hata oluştu:", error);
      }
    }
  };

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, SCREEN_HEIGHT - 100], 
  });

  const SettingsRow = ({ icon: Icon, title, description, value, onValueChange, iconColor }) => (
    <View style={styles.settingRow}>
      <View style={styles.iconBox}>
        <Icon color={iconColor} size={22} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDesc}>{description}</Text>
      </View>
      <Switch
        trackColor={{ false: COLORS.border, true: COLORS.turkuaz + '80' }}
        thumbColor={value ? COLORS.turkuaz : '#f4f3f4'}
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );

  if (showCameraView) {
    if (!permission) {
      return (
        <SafeAreaView style={styles.container}>
          <Text style={{ color: COLORS.text, textAlign: 'center', marginTop: 50 }}>İzinler Yükleniyor...</Text>
        </SafeAreaView>
      );
    }
    
    if (!permission.granted) {
      return (
        <SafeAreaView style={styles.container}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: COLORS.pembe, textAlign: 'center', marginBottom: 20 }}>
              Sistem Mimarı Kimliği İçin Kamera Erişimi Gereklidir.
            </Text>
            <TouchableOpacity style={styles.avatarBtn} onPress={requestPermission}>
              <Text style={styles.avatarBtnText}>İzin Ver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.avatarBtn, { borderColor: COLORS.pembe, marginTop: 20 }]} onPress={() => setShowCameraView(false)}>
              <Text style={[styles.avatarBtnText, { color: COLORS.pembe }]}>Geri Dön</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.cameraContainer}>
        <StatusBar hidden />
        <CameraView 
          style={styles.camera} 
          facing="front" 
          ref={(ref) => setCameraRef(ref)}
        >
          <View style={styles.cameraOverlay}>
             <Animated.View style={[styles.scanLine, { transform: [{ translateY }] }]} />
             
             <View style={styles.cameraHeader}>
               <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCameraView(false)}>
                 <Text style={styles.cancelBtnText}>İPTAL</Text>
               </TouchableOpacity>
             </View>
             
             <View style={styles.cameraFooter}>
               <TouchableOpacity style={styles.takePicBtn} onPress={takePicture}>
                 <View style={styles.takePicInner} />
               </TouchableOpacity>
             </View>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Settings color={COLORS.turkuaz} size={24} />
        <Text style={styles.headerTitle}>SİSTEM AYARLARI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* IDENTITY SECTION */}
        <View style={styles.identitySection}>
          <Text style={styles.sectionHeader}>KİMLİK VERİSİ (SYSTEM ARCHITECT)</Text>
          <View style={styles.identityCard}>
            <View style={styles.avatarFrame}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.avatarImage} />
              ) : (
                <User color={COLORS.turkuaz} size={36} />
              )}
            </View>
            <TouchableOpacity style={styles.avatarBtn} onPress={() => setShowCameraView(true)}>
              <CameraIcon color={COLORS.turkuaz} size={16} />
              <Text style={styles.avatarBtnText}>Kimlik Fotoğrafı Çek / Güncelle</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>DUYUSAL ARAYÜZ (AUDIO/HAPTICS)</Text>
          
          <SettingsRow
            icon={Volume2}
            iconColor={COLORS.turkuaz}
            title="Cyberpunk SFX"
            description="Dijital ortam ses efektlerini aktif eder."
            value={sfxEnabled}
            onValueChange={setSfxEnabled}
          />

          <SettingsRow
            icon={Vibrate}
            iconColor={COLORS.pembe}
            title="Dokunsal Geribildirim"
            description="Çarpışma anlarında cihaz titreşimi."
            value={hapticsEnabled}
            onValueChange={setHapticsEnabled}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>GÖRSEL MOTOR (GRAPHICS)</Text>
          
          <SettingsRow
            icon={Monitor}
            iconColor={COLORS.neon}
            title="Yüksek Neon Filtresi"
            description="Performans modunu kapatarak glow efektini artırır."
            value={highDpiEnabled}
            onValueChange={setHighDpiEnabled}
          />
        </View>

      </ScrollView>

      {/* GLOWING SYSTEM FOOTER */}
      <View style={styles.footer}>
        <Terminal color={COLORS.neon} size={16} />
        <View>
          <Text style={[styles.footerText, { color: COLORS.turkuaz }]}>Sistem Mimarı: Hüseyin</Text>
          <Text style={[styles.footerText, { color: COLORS.textMuted, marginTop: 4 }]}>NexBlock OS v1.2</Text>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.panelBg,
    gap: 12,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    color: COLORS.turkuaz,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
    opacity: 0.8,
  },

  // Identity Styles
  identitySection: {
    marginBottom: 32,
  },
  identityCard: {
    backgroundColor: COLORS.panelBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  avatarFrame: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.turkuaz,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.turkuaz,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.05)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.turkuaz,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 8,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  avatarBtnText: {
    color: COLORS.turkuaz,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textShadowColor: COLORS.turkuaz,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panelBg,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  settingTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  settingDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.panelBg,
    gap: 12,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    textShadowColor: COLORS.turkuaz,
  },

  // Camera Styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,255,255,0.05)',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: COLORS.turkuaz,
    shadowColor: COLORS.turkuaz,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  cameraHeader: {
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
  },
  cancelBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.pembe,
  },
  cancelBtnText: {
    color: COLORS.pembe,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  cameraFooter: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  takePicBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    shadowColor: COLORS.turkuaz,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  takePicInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.turkuaz,
  }
});
