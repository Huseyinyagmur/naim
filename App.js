import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, StatusBar, TextInput, PanResponder, Animated } from 'react-native';
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
  const [ballBorder, setBallBorder] = useState('transparent');
  const [paddleWidth, setPaddleWidth] = useState(60);

  const [paddleColor, setPaddleColor] = useState(COLORS.neon);
  const [paddleBorder, setPaddleBorder] = useState('transparent');
  const [boardDim, setBoardDim] = useState({ width: 0, height: 300 });
  const [activeBlocks, setActiveBlocks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gamePhase, setGamePhase] = useState('IDLE');
  const glowAnim = useRef(new Animated.Value(0)).current;

  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (gamePhase === 'IDLE') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.2, duration: 600, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true })
        ])
      ).start();
    } else {
      blinkAnim.stopAnimation();
    }
  }, [gamePhase]);

  useEffect(() => {
    if (gamePhase === 'GAMEOVER' || gamePhase === 'WIN') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(glowAnim, { toValue: 0.3, duration: 800, useNativeDriver: true })
        ])
      ).start();
    } else {
      glowAnim.stopAnimation();
      glowAnim.setValue(0);
    }
  }, [gamePhase]);

  const gameStateRef = useRef({
    ballX: -100,
    ballY: 150,
    dx: 5,
    dy: -5,
    paddleX: -100,
    paddleWidth: 60,
    phase: 'IDLE',
  });
  
  const [uiState, setUiState] = useState({
    ballX: -100,
    ballY: 150,
    paddleX: -100
  });

  const requestRef = useRef();
  const paddleStartRef = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        const phase = gameStateRef.current.phase;
        if (phase === 'IDLE') {
          setIsPlaying(true);
          setGamePhase('PLAYING');
          gameStateRef.current.phase = 'PLAYING';
          gameStateRef.current.dx = 5;
          gameStateRef.current.dy = -5;
        }
        paddleStartRef.current = gameStateRef.current.paddleX;
      },
      onPanResponderMove: (evt, gestureState) => {
        let newX = paddleStartRef.current + gestureState.dx;
        if (newX < 0) newX = 0;
        const currentPW = gameStateRef.current.paddleWidth;
        if (boardDim.width > 0 && newX > boardDim.width - currentPW) newX = boardDim.width - currentPW;
        gameStateRef.current.paddleX = newX;
        setUiState(prev => {
          const nextUiState = { ...prev, paddleX: newX };
          if (gameStateRef.current.phase === 'IDLE') {
             nextUiState.ballX = newX + currentPW / 2 - 5;
             gameStateRef.current.ballX = nextUiState.ballX;
          }
          return nextUiState;
        });
      }
    })
  ).current;

  const handleEvolve = () => {
    const cmd = commandText.trim().toLowerCase();
    let actions = [];
    
    if (cmd.includes('yeni seviye') || cmd.includes('yeni level')) {
      let totalRows = 3;
      if (cmd.includes('çok blok') || cmd.includes('fazla blok')) {
        totalRows = 6;
        actions.push('Daha fazla bloklu yeni seviye oluşturuldu');
      } else {
        actions.push('Yeni seviye oluşturuldu');
      }
      
      const flatBlocks = [];
      const cols = 7;
      const colors = ['turkuaz', 'neon', 'pembe', 'turkuaz', 'neon', 'pembe', 'turkuaz'];
      const newRows = Array.from({ length: totalRows }, () => colors);
      setBlocks(newRows);
      
      for (let rIdx = 0; rIdx < totalRows; rIdx++) {
        for (let cIdx = 0; cIdx < cols; cIdx++) {
          flatBlocks.push({
            row: rIdx,
            col: cIdx,
            color: colors[cIdx % colors.length],
            isDestroyed: false
          });
        }
      }
      setActiveBlocks(flatBlocks);
      
      const initPW = gameStateRef.current.paddleWidth;
      const startX = boardDim.width > 0 ? (boardDim.width - initPW) / 2 : 150;
      const ballStartX = startX + initPW / 2 - 5;
      setIsPlaying(false);
      setGamePhase('IDLE');
      gameStateRef.current.phase = 'IDLE';
      setUiState(prev => ({ ...prev, paddleX: startX, ballX: ballStartX, ballY: 266 }));
      gameStateRef.current.paddleX = startX;
      gameStateRef.current.ballX = ballStartX;
      gameStateRef.current.ballY = 266;
    }
    
    if (cmd.includes('küçük çubuk') || cmd.includes('çubuğu küçült')) {
      setPaddleWidth(prev => {
        const newer = Math.max(20, prev - 40);
        gameStateRef.current.paddleWidth = newer;
        return newer;
      });
      actions.push('Çubuk küçültüldü');
    }
    
    if (cmd.includes('büyük çubuk') || cmd.includes('çubuğu büyüt')) {
      setPaddleWidth(prev => {
        const newer = Math.min(boardDim.width || 300, prev + 40);
        gameStateRef.current.paddleWidth = newer;
        return newer;
      });
      actions.push('Çubuk büyütüldü');
    }
    
    if (cmd.includes('çubuk') || cmd.includes('tahta')) {
      if (cmd.includes('kırmızı')) { setPaddleColor('#FF003C'); setPaddleBorder('transparent'); actions.push('Evrim başarılı: Çubuk rengi güncellendi.'); }
      else if (cmd.includes('yeşil')) { setPaddleColor('#00FF00'); setPaddleBorder('transparent'); actions.push('Evrim başarılı: Çubuk rengi güncellendi.'); }
      else if (cmd.includes('mavi')) { setPaddleColor('#00FFFF'); setPaddleBorder('transparent'); actions.push('Evrim başarılı: Çubuk rengi güncellendi.'); }
      else if (cmd.includes('siyah')) { setPaddleColor('#000000'); setPaddleBorder('#00FFFF'); actions.push('Evrim başarılı: Çubuk rengi güncellendi.'); }
    } else {
      if (cmd.includes('siyah')) {
        setBallColor('#000000'); setBallBorder('#00FFFF'); actions.push('Top siyah yapıldı');
      } else if (cmd.includes('yeşil')) {
        setBallColor('#00FF00'); setBallBorder('transparent'); actions.push('Top yeşil yapıldı');
      } else if (cmd.includes('mavi')) {
        setBallColor('#00FFFF'); setBallBorder('transparent'); actions.push('Top mavi yapıldı');
      } else if (cmd.includes('kırmızı')) {
        setBallColor('#FF003C'); setBallBorder('transparent'); actions.push('Top kırmızı yapıldı');
      }
    }
    
    if (cmd.includes('hızlandır') || cmd.includes('daha hızlı')) {
      gameStateRef.current.dx *= 1.5;
      gameStateRef.current.dy *= 1.5;
      actions.push('Oyun hızı artırıldı');
    }
    
    if (cmd.includes('yavaşlat') || cmd.includes('daha yavaş')) {
      gameStateRef.current.dx *= 0.6;
      gameStateRef.current.dy *= 0.6;
      actions.push('Oyun hızı düşürüldü');
    }
    
    if (actions.length > 0) {
      setAgentMessage('Evrim Raporu: ' + actions.join(', '));
    } else {
      setAgentMessage('Komut anlaşılamadı. Yeniden deneyin.');
    }
    
    setCommandText('');
  };

  useEffect(() => {
    if (levelData && levelData.rows) {
      setBlocks(levelData.rows);
      
      const flatBlocks = [];
      levelData.rows.forEach((row, rIdx) => {
        row.forEach((color, cIdx) => {
          flatBlocks.push({
            row: rIdx,
            col: cIdx,
            color: color,
            isDestroyed: false
          });
        });
      });
      setActiveBlocks(flatBlocks);
    }
  }, []);

  useEffect(() => {
    if (boardDim.width > 0 && !isPlaying && uiState.ballX === -100) {
      const initPaddleX = (boardDim.width - paddleWidth) / 2;
      const initBallX = initPaddleX + paddleWidth / 2 - 5;
      
      gameStateRef.current.paddleX = initPaddleX;
      gameStateRef.current.ballX = initBallX;
      gameStateRef.current.ballY = 266;
      
      setUiState({
        ballX: initBallX,
        ballY: 266,
        paddleX: initPaddleX,
      });
    }
  }, [boardDim.width, isPlaying]);

  const gameLoop = () => {
    if (!isPlaying) return;

    const state = gameStateRef.current;
    let nextX = state.ballX + state.dx;
    let nextY = state.ballY + state.dy;
    
    if (nextX <= 0) {
      nextX = 0;
      state.dx *= -1;
    } else if (nextX >= boardDim.width - 10) {
      nextX = boardDim.width - 10;
      state.dx *= -1;
    }
    
    if (nextY <= 0) {
      nextY = 0;
      state.dy *= -1;
    }

    const paddleTop = 300 - 16 - 8;
    if (
      nextY + 10 >= paddleTop && 
      nextY <= paddleTop + 8 &&
      nextX + 10 >= state.paddleX && 
      nextX <= state.paddleX + state.paddleWidth
    ) {
      nextY = paddleTop - 10;
      state.dy = -Math.abs(state.dy);
    }
    
    if (nextY > 300) {
      setIsPlaying(false);
      setGamePhase('GAMEOVER');
      state.phase = 'GAMEOVER';
      
      setTimeout(() => {
        const resetX = state.paddleX + state.paddleWidth / 2 - 5;
        const resetY = 266;
        state.ballX = resetX;
        state.ballY = resetY;
        
        setUiState(prev => ({
          ...prev,
          ballX: resetX,
          ballY: resetY
        }));
        
        setActiveBlocks(orig => orig.map(b => ({ ...b, isDestroyed: false })));
        setGamePhase('IDLE');
        state.phase = 'IDLE';
      }, 2000);
      return;
    }

    const cols = levelData?.rows?.[0]?.length || 7;
    let anyLeft = false;
    
    setActiveBlocks(prevBlocks => {
      let hit = false;
      const nextBlocks = prevBlocks.map(block => {
        if (block.isDestroyed) return block;
        
        const blockW = (boardDim.width - (cols - 1) * 4) / cols;
        const startX = block.col * (blockW + 4);
        const endX = startX + blockW;
        const startY = block.row * (18 + 6);
        const endY = startY + 18;
        
        if (
          !hit &&
          nextX + 10 >= startX && nextX <= endX &&
          nextY + 10 >= startY && nextY <= endY
        ) {
          hit = true;
          state.dy *= -1;
          return { ...block, isDestroyed: true };
        }
        anyLeft = true;
        return block;
      });
      
      if (hit && !anyLeft) {
        setTimeout(() => {
          setIsPlaying(false);
          setGamePhase('WIN');
          state.phase = 'WIN';
        }, 0);
      }
      return nextBlocks;
    });

    // Prevent further state updates if WIN triggered this loop
    if (state.phase === 'WIN') return;

    state.ballX = nextX;
    state.ballY = nextY;
    
    setUiState(prev => ({
      ...prev,
      ballX: nextX,
      ballY: nextY
    }));

    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [isPlaying]);

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
          
          <View 
            style={styles.gameBoard} 
            onLayout={(e) => setBoardDim(e.nativeEvent.layout)}
            {...panResponder.panHandlers}
          >
            {/* Bricks Field */}
            <View style={styles.bricksContainer}>
              {blocks.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.brickRow}>
                  {row.map((blockColorName, colIndex) => {
                    const blockObj = activeBlocks.find(b => b.row === rowIndex && b.col === colIndex);
                    if (blockObj && blockObj.isDestroyed) {
                      return <View key={`col-${rowIndex}-${colIndex}`} style={[styles.brick, { borderWidth: 0, shadowOpacity: 0, elevation: 0 }]} />;
                    }
                    const color = getBlockColor(blockColorName);
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

            {/* Interactive Ball & Paddle */}
            <View 
              style={[
                styles.ball, 
                { 
                  backgroundColor: ballColor, 
                  shadowColor: ballColor,
                  borderColor: ballBorder !== 'transparent' ? ballBorder : undefined,
                  borderWidth: ballBorder !== 'transparent' ? 2 : 0,
                  left: uiState.ballX,
                  top: uiState.ballY,
                  bottom: undefined
                }
              ]} 
            />
            <View 
              style={[
                styles.paddle,
                {
                  backgroundColor: paddleColor,
                  shadowColor: paddleColor,
                  borderColor: paddleBorder !== 'transparent' ? paddleBorder : undefined,
                  borderWidth: paddleBorder !== 'transparent' ? 2 : 0,
                  width: paddleWidth,
                  left: uiState.paddleX,
                  alignSelf: 'auto'
                }
              ]}
            />
            
            {/* CYBERPUNK OVERLAYS */}
            {gamePhase === 'IDLE' && (
              <Animated.View style={[styles.overlayContainer, { backgroundColor: 'transparent', opacity: blinkAnim }]} pointerEvents="none">
                <Text style={styles.overlayTextSubGreen}>BAŞLAMAK İÇİN EKRANA DOKUN</Text>
              </Animated.View>
            )}

            {gamePhase === 'GAMEOVER' && (
              <Animated.View style={[styles.overlayContainer, { opacity: glowAnim }]} pointerEvents="none">
                <ShieldAlert color="#FF003C" size={48} />
                <Text style={styles.overlayTextRed}>SİSTEM ÇÖKTÜ</Text>
                <Text style={styles.overlayTextSubRed}>YENİDEN BAŞLATILIYOR...</Text>
              </Animated.View>
            )}
            
            {gamePhase === 'WIN' && (
              <Animated.View style={[styles.overlayContainer, { opacity: glowAnim }]} pointerEvents="none">
                <Activity color="#00FF00" size={48} />
                <Text style={styles.overlayTextGreen}>SEVİYE TAMAMLANDI</Text>
                <Text style={styles.overlayTextSubGreen}>YENİ SEVİYE İÇİN AJANA KOMUT VERİN</Text>
              </Animated.View>
            )}
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
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(8, 8, 12, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  overlayTextRed: {
    color: '#FF003C',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
    marginTop: 16,
    textShadowColor: 'rgba(255, 0, 60, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  overlayTextSubRed: {
    color: '#FF003C',
    fontSize: 12,
    marginTop: 8,
    letterSpacing: 2,
    opacity: 0.8,
  },
  overlayTextGreen: {
    color: '#00FF00',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 16,
    textShadowColor: 'rgba(0, 255, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  overlayTextSubGreen: {
    color: '#00FFFF',
    fontSize: 10,
    marginTop: 8,
    letterSpacing: 2,
    opacity: 0.9,
  }
});
