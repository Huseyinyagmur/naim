import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, StatusBar, TextInput } from 'react-native';
import { Settings, Play, Cpu, ShieldAlert, Activity, RefreshCw } from 'lucide-react-native';
import levelData from './level.json';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#040406', // Deep cyber dark
  gameBg: '#08080C',
  turkuaz: '#00F0FF',
  pembe: '#FF003C',
  neon: '#FAFF00',
  text: '#E0E5EC',
  textMuted: '#686D76',
  panelBg: '#0D0D14',
  border: '#1E1E28',
  glowTurkuaz: 'rgba(0, 240, 255, 0.4)',
  glowPembe: 'rgba(255, 0, 60, 0.4)',
};

export default function App() {
  const [blocks, setBlocks] = useState([]);
  const [commandText, setCommandText] = useState('');
  const [agentMessage, setAgentMessage] = useState('Yapay zeka çekirdeği tam kapasite çalışıyor. Bir sonraki mutasyon aşaması için beklemede.');
  const [ballColor, setBallColor] = useState('#FF003C');

  const handleEvolve = () => {
    const cmd = commandText.trim().toLowerCase();
    if (cmd === 'top rengini yeşil yap') {
      setBallColor('#00FF00');
      setAgentMessage('Yapay zeka analiz etti: Top rengi başarıyla yeşil yapıldı. (Evrim başarılı).');
    } else {
      setAgentMessage("Üzgünüm, bu spesifik evrim komutunu henüz yorumlayamıyorum. Şu an sadece 'top rengini yeşil yap' komutunu test edebilirim.");
    }
  };

  useEffect(() => {
    if (levelData && levelData.rows) {
      setBlocks(levelData.rows);
    }
  }, []);

  const getBlockColor = (colorName) => {
    switch(colorName?.toLowerCase()) {
      case 'turkuaz': return COLORS.turkuaz;
      case 'pembe': return COLORS.pembe;
      case 'neon': return COLORS.neon;
      default: return '#555';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      {/* HEADER BAR */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Activity color={COLORS.turkuaz} size={22} />
          <Text style={styles.headerTitle}>NEXBLOCK V1.0</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>SENKRONİZASYON...</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP HUD */}
        <View style={styles.hudRow}>
          <View style={styles.hudItem}>
            <ShieldAlert color={COLORS.turkuaz} size={14} />
            <Text style={styles.hudLabel}>BÜTÜNLÜK</Text>
            <Text style={styles.hudValue}>%88.4</Text>
          </View>
          <View style={styles.hudItem}>
            <RefreshCw color={COLORS.neon} size={14} />
            <Text style={styles.hudLabel}>DÖNGÜLER</Text>
            <Text style={styles.hudValue}>0422</Text>
          </View>
        </View>

        {/* GAME AREA - BLOCK BREAKER STYLE */}
        <View style={styles.gameAreaWrapper}>
          <View style={styles.gameAreaHeader}>
            <Text style={styles.gameAreaTitle}>OYUN ALANI</Text>
            <Text style={styles.gameAreaSubtitle}>SEKTÖR 7</Text>
          </View>
          
          <View style={styles.gameBoard}>
            {/* Bricks Field */}
            <View style={styles.bricksContainer}>
              {blocks.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.brickRow}>
                  {row.map((block, colIndex) => {
                    const color = getBlockColor(block);
                    return (
                      <View 
                        key={`col-${rowIndex}-${colIndex}`} 
                        style={[styles.brick, { borderColor: color, shadowColor: color }]}
                      >
                        <View style={[styles.brickInner, { backgroundColor: color }]} />
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>

            {/* Static Ball & Paddle for aesthetic */}
            <View style={[styles.ball, { backgroundColor: ballColor, shadowColor: ballColor }]} />
            <View style={styles.paddle} />
          </View>
        </View>

        {/* EVRIM MERKEZI (SISTEM AJANI KUTUSU) */}
        <View style={styles.agentBox}>
          <View style={styles.agentBoxHeader}>
            <Cpu color={COLORS.pembe} size={18} />
            <Text style={styles.agentBoxTitle}>SİSTEM AJANI (EVRİM MERKEZİ)</Text>
          </View>
          <Text style={styles.agentBoxDesc}>
            {agentMessage}
          </Text>
          
          <TextInput 
            style={styles.commandInput} 
            placeholder="Evrim komutunu girin..."
            placeholderTextColor={COLORS.textMuted}
            value={commandText}
            onChangeText={setCommandText}
          />

          <TouchableOpacity style={styles.evolveButton} activeOpacity={0.8} onPress={handleEvolve}>
            <Text style={styles.evolveText}>EVRİMLEŞTİR</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Play color={COLORS.turkuaz} size={24} />
          <Text style={[styles.navText, { color: COLORS.turkuaz }]}>OYUN</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Cpu color={COLORS.textMuted} size={24} />
          <Text style={styles.navText}>EVRİM</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Settings color={COLORS.textMuted} size={24} />
          <Text style={styles.navText}>AYARLAR</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.panelBg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: process.env.EXPO_OS === 'web' ? 'monospace' : 'System',
    fontWeight: '900',
    letterSpacing: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.neon,
    shadowColor: COLORS.neon,
    shadowOpacity: 1,
    shadowRadius: 5,
    elevation: 5,
  },
  syncText: {
    color: COLORS.neon,
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  hudRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  hudItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.panelBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
    flex: 0.48,
  },
  hudLabel: {
    color: COLORS.textMuted,
    fontSize: 9,
    letterSpacing: 1,
  },
  hudValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  gameAreaWrapper: {
    backgroundColor: COLORS.panelBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glowTurkuaz,
    shadowColor: COLORS.turkuaz,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    overflow: 'hidden',
    marginBottom: 24,
  },
  gameAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.glowTurkuaz, // highly transparent
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glowTurkuaz,
  },
  gameAreaTitle: {
    color: COLORS.turkuaz,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  gameAreaSubtitle: {
    color: COLORS.turkuaz,
    fontSize: 10,
    opacity: 0.8,
    letterSpacing: 1,
  },
  gameBoard: {
    height: 300,
    backgroundColor: COLORS.gameBg,
    padding: 12,
    position: 'relative',
  },
  bricksContainer: {
    gap: 6,
  },
  brickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  brick: {
    flex: 1,
    height: 18,
    borderWidth: 1,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 4,
    padding: 1,
  },
  brickInner: {
    flex: 1,
    borderRadius: 1,
    opacity: 0.8,
  },
  ball: {
    position: 'absolute',
    bottom: 50,
    left: '45%',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.turkuaz,
    shadowColor: COLORS.turkuaz,
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
  },
  paddle: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    width: 60,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.neon,
    shadowColor: COLORS.neon,
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  },
  agentBox: {
    backgroundColor: COLORS.panelBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.glowPembe,
    padding: 20,
    shadowColor: COLORS.pembe,
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  agentBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  agentBoxTitle: {
    color: COLORS.pembe,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  agentBoxDesc: {
    color: COLORS.textMuted,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 16,
  },
  commandInput: {
    backgroundColor: '#050508',
    borderWidth: 1,
    borderColor: '#1E1E28',
    borderRadius: 8,
    color: '#E0E5EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    marginBottom: 20,
  },
  evolveButton: {
    backgroundColor: COLORS.pembe,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: COLORS.pembe,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 6,
  },
  evolveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 3,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: 24, // safe area padding
    paddingTop: 16,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  navText: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  }
});
