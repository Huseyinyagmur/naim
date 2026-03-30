import React, { useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, StatusBar, Switch, ScrollView } from 'react-native';
import { Settings, Volume2, Monitor, Vibrate, Terminal } from 'lucide-react-native';

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

export default function SettingsScreen() {
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [highDpiEnabled, setHighDpiEnabled] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Settings color={COLORS.turkuaz} size={24} />
        <Text style={styles.headerTitle}>SİSTEM AYARLARI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
  }
});
