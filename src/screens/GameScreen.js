import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, ScrollView, Dimensions, StatusBar, TextInput, PanResponder, Animated } from 'react-native';
import { Settings, Play, Cpu, ShieldAlert, Activity, RefreshCw, Mic } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import levelData from '../../level.json';

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

// NLP Synonyms
const growWords = ['büyüt', 'genişlet', 'uzat', 'büyük'];
const shrinkWords = ['küçült', 'daralt', 'ufalt', 'kısalt'];
const hardModeWords = ['zorlaştır', 'çok blok', 'kalabalık', 'doldur', 'fazla blok', 'blok sayısını artır', 'daha zor', 'blokla doldur', 'daha blok ekle', 'biraz daha blok', 'blok ekle', 'blok diz', 'ekranı blokla doldur'];
const reduceWords = ['azalt', 'seyrelt', 'az blok', 'temizle', 'kolaylaştır', 'sil'];
const newLevelWords = ['yeni seviye', 'yeni level', 'yeni', 'baştan', 'sıfırla', 'reset', 'geç', 'başka seviye'];
const spawnSpeedWords = ['hızlandırıcı', 'nitro', 'turbo', 'hız noktası', 'hız at', 'hız ekle', 'hızlandırıcı atar mısın', 'hızlandırıcı ekle'];
const spawnSlowWords = ['yavaşlatıcı', 'tuzak', 'fren', 'buz', 'yavaşlatma ekle', 'yavaşlatıcı atar mısın', 'fren atar mısın'];

const multiBallWords = ['topu çoğalt', 'ikile', 'böl', 'iki top', 'multi'];
const weatherWords = ['yağmur', 'fırtına', 'şimşek', 'hava durumu'];
const trailWords = ['iz ekle', 'kuyruk', 'parlama'];
const laserWords = ['lazer', 'silah', 'ateş', 'saldırı'];
const shieldWords = ['kalkan', 'koruma', 'bariyer'];

const colorWords = {
  red: ['kırmızı', 'yakut', 'kan', 'alev'],
  green: ['yeşil', 'zümrüt', 'doğa'],
  blue: ['mavi', 'safir', 'okyanus'],
  navy: ['lacivert', 'gece mavisi'],
  black: ['siyah', 'obsidyen', 'karanlık', 'gölge'],
  yellow: ['sarı', 'limon', 'güneş', 'altın'],
  orange: ['turuncu', 'portakal', 'ateş'],
  purple: ['mor', 'ametist', 'eflatun'],
  pink: ['pembe', 'fuşya', 'şeker'],
  white: ['beyaz', 'inci', 'kar'],
  gray: ['gri', 'gümüş', 'kül', 'kurşun'],
  cyan: ['turkuaz', 'camgöbeği', 'neon mavi']
};

export default function GameScreen() {
  const [blocks, setBlocks] = useState([]);
  const [commandText, setCommandText] = useState('');
  const [isListening, setIsListening] = useState(false);
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
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  // VOICE RECOGNITION
  useSpeechRecognitionEvent('start', () => setIsListening(true));
  useSpeechRecognitionEvent('end', () => setIsListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript;
    if (text) {
      setCommandText(text);
      if (event.isFinal) {
        handleEvolve(text);
      }
    }
  });

  const startVoiceCommand = async () => {
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      alert("Sistem Mikrofon İzni Reddedildi.");
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: 'tr-TR',
      interimResults: true,
      maxAlternatives: 1,
    });
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.8, duration: 800, useNativeDriver: true })
      ])
    ).start();
  }, []);

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
    balls: [{ x: -100, y: 266, dx: 5, dy: -5, id: 'b0', history: [] }],
    paddleX: -100,
    paddleWidth: 60,
    phase: 'IDLE',
    powerUps: [],
    blocks: [],
    lasers: [],
    shieldActive: false,
    trailActive: false,
    lasersActive: false,
    laserCooldown: 0,
    totalCycles: 0,
  });

  const [uiState, setUiState] = useState({
    balls: [{ x: -100, y: 266, dx: 5, dy: -5, id: 'b0', history: [] }],
    paddleX: -100,
    powerUps: [],
    lasers: [],
    shieldActive: false,
    trailActive: false,
    lasersActive: false,
    weatherType: null,
    totalCycles: 0,
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
          if (gameStateRef.current.balls.length > 0) {
            gameStateRef.current.balls[0].dx = 5;
            gameStateRef.current.balls[0].dy = -5;
          }
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
          if (gameStateRef.current.phase === 'IDLE' && nextUiState.balls.length > 0) {
            nextUiState.balls[0].x = newX + currentPW / 2 - 5;
            gameStateRef.current.balls[0].x = nextUiState.balls[0].x;
          }
          return nextUiState;
        });
      }
    })
  ).current;

  const handleEvolve = (overrideCmd) => {
    const finalCmd = typeof overrideCmd === 'string' ? overrideCmd : commandText;
    const cmd = finalCmd.trim().toLowerCase();
    let actions = [];

    if (hardModeWords.some(w => cmd.includes(w))) {
      let totalRows = 7;
      actions.push('Oyun alanına maksimum blok dolduruldu');
      
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
      gameStateRef.current.blocks = flatBlocks;
      setActiveBlocks(flatBlocks);
    }

    if (reduceWords.some(w => cmd.includes(w))) {
      let totalRows = 2;
      actions.push('Bloklar seyreltildi');
      const flatBlocks = [];
      const cols = 7;
      const colors = ['turkuaz', 'neon', 'pembe', 'turkuaz', 'neon', 'pembe', 'turkuaz'];
      const newRows = Array.from({ length: totalRows }, () => colors);
      setBlocks(newRows);
      for (let rIdx = 0; rIdx < totalRows; rIdx++) {
        for (let cIdx = 0; cIdx < cols; cIdx++) {
          flatBlocks.push({
            row: rIdx, col: cIdx, color: colors[cIdx % colors.length], isDestroyed: false
          });
        }
      }
      gameStateRef.current.blocks = flatBlocks;
      setActiveBlocks(flatBlocks);
    }

    if (newLevelWords.some(w => cmd.includes(w))) {
      if (!hardModeWords.some(w => cmd.includes(w))) {
        let totalRows = 3;
        actions.push('Yeni seviye oluşturuldu');
        
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
        gameStateRef.current.blocks = flatBlocks;
        setActiveBlocks(flatBlocks);
      } else {
        actions.push('Yeni seviye sıfırlandı');
      }
      
      const initPW = gameStateRef.current.paddleWidth;
      const startX = boardDim.width > 0 ? (boardDim.width - initPW) / 2 : 150;
      const ballStartX = startX + initPW / 2 - 5;
      setIsPlaying(false);
      setGamePhase('IDLE');
      gameStateRef.current.phase = 'IDLE';
      gameStateRef.current.powerUps = [];
      gameStateRef.current.lasers = [];
      gameStateRef.current.shieldActive = false;
      gameStateRef.current.trailActive = false;
      gameStateRef.current.lasersActive = false;
      gameStateRef.current.balls = [{ x: ballStartX, y: 266, dx: 5, dy: -5, id: 'b0', history: [] }];
      gameStateRef.current.paddleX = startX;

      setUiState(prev => ({ 
        ...prev, 
        paddleX: startX, 
        balls: [{ x: ballStartX, y: 266, dx: 5, dy: -5, id: 'b0', history: [] }], 
        powerUps: [], 
        lasers: [], 
        shieldActive: false, 
        trailActive: false, 
        lasersActive: false,
        weatherType: null 
      }));
    }

    if (shrinkWords.some(w => cmd.includes(w))) {
      setPaddleWidth(prev => {
        const newer = Math.max(20, prev - 40);
        gameStateRef.current.paddleWidth = newer;
        return newer;
      });
      actions.push('Çubuk küçültüldü');
    }

    if (growWords.some(w => cmd.includes(w))) {
      setPaddleWidth(prev => {
        const newer = Math.min(boardDim.width || 300, prev + 40);
        gameStateRef.current.paddleWidth = newer;
        return newer;
      });
      actions.push('Çubuk büyütüldü');
    }

    const isPaddle = ['çubuk', 'cubuk', 'çubuğ', 'cubug', 'tahta', 'paddle'].some(w => cmd.includes(w));
    const isBall = ['top', 'küre', 'ball'].some(w => cmd.includes(w));

    let targetColor = null;
    let targetBorder = 'transparent';

    if (colorWords.red.some(w => cmd.includes(w))) { targetColor = '#FF003C'; }
    else if (colorWords.green.some(w => cmd.includes(w))) { targetColor = '#00FF00'; }
    else if (colorWords.blue.some(w => cmd.includes(w))) { targetColor = '#00A2FF'; }
    else if (colorWords.navy.some(w => cmd.includes(w))) { targetColor = '#000080'; targetBorder = '#00FFFF'; }
    else if (colorWords.black.some(w => cmd.includes(w))) { targetColor = '#000000'; targetBorder = '#00FFFF'; }
    else if (colorWords.yellow.some(w => cmd.includes(w))) { targetColor = '#FAFF00'; }
    else if (colorWords.orange.some(w => cmd.includes(w))) { targetColor = '#FF8C00'; }
    else if (colorWords.purple.some(w => cmd.includes(w))) { targetColor = '#800080'; targetBorder = '#FF00FF'; }
    else if (colorWords.pink.some(w => cmd.includes(w))) { targetColor = '#FF00FF'; }
    else if (colorWords.white.some(w => cmd.includes(w))) { targetColor = '#FFFFFF'; }
    else if (colorWords.gray.some(w => cmd.includes(w))) { targetColor = '#6B7280'; targetBorder = '#FFFFFF'; }
    else if (colorWords.cyan.some(w => cmd.includes(w))) { targetColor = '#00F0FF'; }

    if (targetColor) {
      if (isPaddle && !isBall) {
        setPaddleColor(targetColor); setPaddleBorder(targetBorder); actions.push('Çubuk rengi güncellendi');
      } else if (isBall && !isPaddle) {
        setBallColor(targetColor); setBallBorder(targetBorder); actions.push('Top rengi güncellendi');
      } else if (isPaddle && isBall) {
        setPaddleColor(targetColor); setPaddleBorder(targetBorder);
        setBallColor(targetColor); setBallBorder(targetBorder);
        actions.push('Çubuk ve Top rengi güncellendi');
      } else {
        setBallColor(targetColor); setBallBorder(targetBorder); actions.push('Top rengi güncellendi');
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

    let spawnedAnomaly = false;

    if (spawnSpeedWords.some(w => cmd.includes(w))) {
      const radius = 15;
      const x = Math.max(radius, Math.min(boardDim.width - radius, Math.random() * boardDim.width));
      const y = Math.max(120, Math.min(240, Math.random() * 120 + 120));
      gameStateRef.current.powerUps.push({ id: Date.now() + 'spd', type: 'speed', x, y, radius });
      spawnedAnomaly = true;
    }

    if (spawnSlowWords.some(w => cmd.includes(w))) {
      const radius = 15;
      const x = Math.max(radius, Math.min(boardDim.width - radius, Math.random() * boardDim.width));
      const y = Math.max(120, Math.min(240, Math.random() * 120 + 120));
      gameStateRef.current.powerUps.push({ id: Date.now() + 'slw', type: 'slow', x, y, radius });
      spawnedAnomaly = true;
    }

    if (multiBallWords.some(w => cmd.includes(w))) {
      const gState = gameStateRef.current;
      if (gState.balls.length > 0) {
        actions.push('Toplar çoğaltıldı');
        const extras = gState.balls.map(b => ({
          ...b,
          dx: -b.dx,
          id: `b${Date.now()}_${Math.random()}`
        }));
        gState.balls.push(...extras);
        setUiState(prev => ({ ...prev, balls: [...gState.balls] }));
      }
    }

    if (weatherWords.some(w => cmd.includes(w))) {
      actions.push('Fırtına başladı');
      setUiState(prev => ({ ...prev, weatherType: 'rain' }));
    }

    if (trailWords.some(w => cmd.includes(w))) {
      gameStateRef.current.trailActive = true;
      actions.push('Neon iz aktif');
      setUiState(prev => ({ ...prev, trailActive: true }));
    }

    if (laserWords.some(w => cmd.includes(w))) {
      gameStateRef.current.lasersActive = true;
      actions.push('Silah sistemi aktif (Lazer)');
      setUiState(prev => ({ ...prev, lasersActive: true }));
    }

    if (shieldWords.some(w => cmd.includes(w))) {
      gameStateRef.current.shieldActive = true;
      actions.push('Kalkan aktif');
      setUiState(prev => ({ ...prev, shieldActive: true }));
    }

    if (spawnedAnomaly) {
      actions.push('Evrim başarılı: Sektöre anomaliler eklendi.');
      setUiState(prev => ({ ...prev, powerUps: [...gameStateRef.current.powerUps] }));
    }


    if (cmd.includes('döngüleri sıfırla')) {
      gameStateRef.current.totalCycles = 0;
      AsyncStorage.removeItem('@nexblock_cycles');
      setUiState(prev => ({ ...prev, totalCycles: 0 }));
      actions.push('Zaman çizgisi çökertildi: Döngüler sıfırlandı');
    }

    if (actions.length > 0) {
      setAgentMessage('Evrim Raporu: ' + actions.join(', '));
    } else {
      setAgentMessage('Komut anlaşılamadı. Yeniden deneyin.');
    }

    setCommandText('');
  };

  useEffect(() => {
    const loadCycles = async () => {
      try {
        const stored = await AsyncStorage.getItem('@nexblock_cycles');
        if (stored !== null) {
          const val = parseInt(stored, 10);
          gameStateRef.current.totalCycles = val;
          setUiState(prev => ({ ...prev, totalCycles: val }));
        }
      } catch (e) {
        console.log('Failed to load cycles', e);
      }
    };
    loadCycles();

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
      gameStateRef.current.blocks = flatBlocks;
      setActiveBlocks(flatBlocks);
    }
  }, []);

  useEffect(() => {
    if (boardDim.width > 0 && !isPlaying && uiState.balls.length > 0 && uiState.balls[0].x === -100) {
      const initPaddleX = (boardDim.width - paddleWidth) / 2;
      const initBallX = initPaddleX + paddleWidth / 2 - 5;

      gameStateRef.current.paddleX = initPaddleX;
      gameStateRef.current.balls[0].x = initBallX;
      gameStateRef.current.balls[0].y = 266;

      setUiState(prev => {
        const resetBalls = [...prev.balls];
        resetBalls[0].x = initBallX;
        resetBalls[0].y = 266;
        return {
          ...prev,
          balls: resetBalls,
          paddleX: initPaddleX,
        };
      });
    }
  }, [boardDim.width, isPlaying]);

  const gameLoop = () => {
    if (!isPlaying) return;

    const state = gameStateRef.current;
    
    // Laser logic
    if (state.lasersActive) {
      state.laserCooldown -= 1;
      if (state.laserCooldown <= 0) {
        state.lasers.push({ x: state.paddleX + 4, y: 300 - 24 - 8, id: 'L' + Date.now() });
        state.lasers.push({ x: state.paddleX + state.paddleWidth - 8, y: 300 - 24 - 8, id: 'R' + Date.now() });
        state.laserCooldown = 60; // shoot every 60 frames
      }
    }
    
    let hitAnyBlock = false;
    const cols = levelData?.rows?.[0]?.length || 7;
    let availableBlocksCount = 0;

    // Process Lasers
    if (state.lasers.length > 0) {
      state.lasers = state.lasers.filter(laser => {
        laser.y -= 10;
        if (laser.y < 0) return false;
        
        let laserHit = false;
        state.blocks = state.blocks.map(block => {
          if (block.isDestroyed || laserHit) {
            if (!block.isDestroyed) availableBlocksCount++;
            return block;
          }
          
          const blockW = (boardDim.width - (cols - 1) * 4) / cols;
          const startX = block.col * (blockW + 4);
          const endX = startX + blockW;
          const startY = block.row * (18 + 6);
          const endY = startY + 18;
          
          if (laser.x + 4 >= startX && laser.x <= endX && laser.y <= endY && laser.y + 10 >= startY) {
            laserHit = true;
            hitAnyBlock = true;
            state.totalCycles += 1;
            return { ...block, isDestroyed: true };
          }
          availableBlocksCount++;
          return block;
        });
        return !laserHit; 
      });
    } else {
       state.blocks.forEach(b => { if (!b.isDestroyed) availableBlocksCount++; });
    }

    const paddleTop = 300 - 16 - 8;
    const ballRadius = 5;
    
    // Process Balls
    let anyBallLost = false;
    let anyPowerUpConsumed = false;

    for (let i = 0; i < state.balls.length; i++) {
      let b = state.balls[i];
      if (!b.history) b.history = [];
      
      // History trail processing
      if (state.trailActive) {
        b.history.unshift({ x: b.x, y: b.y });
        if (b.history.length > 5) b.history.pop();
      } else {
        b.history = [];
      }

      let nextX = b.x + b.dx;
      let nextY = b.y + b.dy;

      // X Boundaries
      if (nextX <= 0) {
        nextX = 0;
        b.dx *= -1;
      } else if (nextX >= boardDim.width - 10) {
        nextX = boardDim.width - 10;
        b.dx *= -1;
      }

      // Y Boundaries & Shield
      if (nextY <= 0) {
        nextY = 0;
        b.dy *= -1;
      } else if (state.shieldActive && nextY + 10 >= 290) {
        nextY = 290 - 10;
        b.dy = -Math.abs(b.dy);
        state.shieldActive = false;
      }

      // Paddle Collision
      if (
        nextY + 10 >= paddleTop &&
        nextY <= paddleTop + 8 &&
        nextX + 10 >= state.paddleX &&
        nextX <= state.paddleX + state.paddleWidth
      ) {
        nextY = paddleTop - 10;
        b.dy = -Math.abs(b.dy);
      }

      // Bottom death
      if (nextY > 300) {
        anyBallLost = true;
      }

      // Block Collision
      state.blocks = state.blocks.map(block => {
        if (block.isDestroyed) return block;
        
        const blockW = (boardDim.width - (cols - 1) * 4) / cols;
        const startX = block.col * (blockW + 4);
        const endX = startX + blockW;
        const startY = block.row * (18 + 6);
        const endY = startY + 18;
        
        if (
          nextX + 10 >= startX && nextX <= endX &&
          nextY + 10 >= startY && nextY <= endY
        ) {
          hitAnyBlock = true;
          b.dy *= -1;
          availableBlocksCount--;
          state.totalCycles += 1;
          return { ...block, isDestroyed: true };
        }
        return block;
      });

      // Power Up Collision
      const ballCenterX = nextX + ballRadius;
      const ballCenterY = nextY + ballRadius;

      state.powerUps = state.powerUps.filter(pu => {
        const dist = Math.hypot(ballCenterX - pu.x, ballCenterY - pu.y);
        if (dist < ballRadius + pu.radius) {
          anyPowerUpConsumed = true;
          if (pu.type === 'speed') {
            b.dx *= 1.5;
            b.dy *= 1.5;
            setTimeout(() => {
               if (state.balls.find(bl => bl.id === b.id)) {
                 b.dx /= 1.5;
                 b.dy /= 1.5;
                 setAgentMessage('Efekt sona erdi, normal hıza dönüldü');
               }
            }, 5000);
          } else if (pu.type === 'slow') {
            b.dx *= 0.6;
            b.dy *= 0.6;
            setTimeout(() => {
               if (state.balls.find(bl => bl.id === b.id)) {
                 b.dx /= 0.6;
                 b.dy /= 0.6;
                 setAgentMessage('Efekt sona erdi, normal hıza dönüldü');
               }
            }, 5000);
          }
          return false;
        }
        return true;
      });

      // Apply speeds and limits
      const maxSpeedX = 12;
      const minSpeedX = 2;
      const maxSpeedY = 12;
      const minSpeedY = 2;

      let currentSpeedX = Math.abs(b.dx);
      let currentSpeedY = Math.abs(b.dy);

      if (currentSpeedX > maxSpeedX) b.dx = maxSpeedX * Math.sign(b.dx);
      if (currentSpeedY > maxSpeedY) b.dy = maxSpeedY * Math.sign(b.dy);
      if (currentSpeedX < minSpeedX) b.dx = minSpeedX * Math.sign(b.dx === 0 ? 1 : b.dx);
      if (currentSpeedY < minSpeedY) b.dy = minSpeedY * Math.sign(b.dy === 0 ? -1 : b.dy);

      b.x = nextX;
      b.y = nextY;
    }

    if (hitAnyBlock) {
      setActiveBlocks(state.blocks);
      AsyncStorage.setItem('@nexblock_cycles', state.totalCycles.toString());
    }
    
    // Death conditions
    if (anyBallLost) {
      state.balls = state.balls.filter(b => b.y <= 300);
      if (state.balls.length === 0) {
        setIsPlaying(false);
        setGamePhase('GAMEOVER');
        state.phase = 'GAMEOVER';
        
        setTimeout(() => {
          const resetX = state.paddleX + state.paddleWidth / 2 - 5;
          const resetY = 266;
          state.balls = [{ x: resetX, y: resetY, dx: 5, dy: -5, id: 'b0', history: [] }];
          state.powerUps = [];
          state.lasers = [];
          state.shieldActive = false;
          state.weatherType = null;
          state.trailActive = false;
          state.lasersActive = false;
          
          setUiState(prev => ({
            ...prev,
            balls: [{ x: resetX, y: resetY, dx: 5, dy: -5, id: 'b0', history: [] }],
            powerUps: [],
            lasers: [],
            shieldActive: false,
            weatherType: null,
            trailActive: false,
            lasersActive: false
          }));

          state.blocks = state.blocks.map(b => ({ ...b, isDestroyed: false }));
          setActiveBlocks(state.blocks);
          setGamePhase('IDLE');
          state.phase = 'IDLE';
        }, 2000);
        return;
      }
    }

    // Win condition
    if (hitAnyBlock && availableBlocksCount <= 0 && state.phase !== 'WIN') {
      setTimeout(() => {
        setIsPlaying(false);
        setGamePhase('WIN');
        state.phase = 'WIN';
      }, 0);
      return;
    }

    // Prevent state updates if winning
    if (state.phase === 'WIN') return;

    // Send visual state
    const uiUpdate = {
      balls: state.balls.map(b => ({ ...b, history: [...b.history] })),
      totalCycles: state.totalCycles,
    };
    if (anyPowerUpConsumed) {
      uiUpdate.powerUps = [...state.powerUps];
    }
    if (state.lasersActive) {
      uiUpdate.lasers = [...state.lasers];
    }

    setUiState(prev => ({ ...prev, ...uiUpdate }));
    requestRef.current = requestAnimationFrame(gameLoop);
  };

  useFocusEffect(
    useCallback(() => {
      let allowLoop = true;
      if (isPlaying) {
        requestRef.current = requestAnimationFrame(gameLoop);
      }
      return () => {
        allowLoop = false;
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
      };
    }, [isPlaying])
  );

  const getBlockColor = (colorName) => {
    switch (colorName?.toLowerCase()) {
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
            <Text style={styles.hudValue}>{uiState.totalCycles.toString().padStart(4, '0')}</Text>
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

            {/* WEATHER OVERLAY */}
            {uiState.weatherType === 'rain' && (
              <View style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, overflow: 'hidden' }} pointerEvents="none">
                 <Animated.View style={{ width: '100%', height: '100%', opacity: blinkAnim, flexDirection: 'row', justifyContent: 'space-around' }}>
                    {Array.from({length: 15}).map((_, i) => (
                       <View key={i} style={{ width: 1, height: '100%', backgroundColor: COLORS.neon, opacity: 0.1 + (i % 3)*0.1 }} />
                    ))}
                 </Animated.View>
              </View>
            )}

            {/* LASERS */}
            {uiState.lasersActive && uiState.lasers && uiState.lasers.map(l => (
              <View 
                key={l.id} 
                style={{ position: 'absolute', left: l.x, top: l.y, width: 4, height: 16, backgroundColor: COLORS.neon, shadowColor: COLORS.neon, shadowOpacity: 1, shadowRadius: 5, elevation: 3, zIndex: 5 }} 
              />
            ))}

            {/* BALLS AND TRAILS */}
            {uiState.balls && uiState.balls.map(ball => (
              <React.Fragment key={ball.id}>
                {uiState.trailActive && ball.history && ball.history.map((h, i) => (
                  <View 
                    key={`hist_${i}_${ball.id}`}
                    style={[
                      styles.ball, 
                      { 
                        left: h.x, top: h.y, 
                        opacity: 0.8 - (i * 0.15), 
                        backgroundColor: ballColor, 
                        shadowColor: ballColor,
                        zIndex: 4
                      }
                    ]} 
                  />
                ))}
                <View
                  style={[
                    styles.ball,
                    {
                      backgroundColor: ballColor,
                      shadowColor: ballColor,
                      borderColor: ballBorder !== 'transparent' ? ballBorder : undefined,
                      borderWidth: ballBorder !== 'transparent' ? 2 : 0,
                      left: ball.x,
                      top: ball.y,
                      bottom: undefined,
                      zIndex: 5
                    }
                  ]}
                />
              </React.Fragment>
            ))}

            {/* PADDLE & CANNONS */}
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
                  alignSelf: 'auto',
                  zIndex: 6
                }
              ]}
            >
              {uiState.lasersActive && (
                <>
                  <View style={{ position: 'absolute', left: 4, top: -6, width: 4, height: 6, backgroundColor: COLORS.neon, shadowColor: COLORS.neon, shadowOpacity: 1, shadowRadius: 5 }} />
                  <View style={{ position: 'absolute', right: 4, top: -6, width: 4, height: 6, backgroundColor: COLORS.neon, shadowColor: COLORS.neon, shadowOpacity: 1, shadowRadius: 5 }} />
                </>
              )}
            </View>

            {/* SHIELD WALL */}
            {uiState.shieldActive && (
              <View style={{ position: 'absolute', left: 0, top: 290, width: '100%', height: 4, backgroundColor: COLORS.turkuaz, shadowColor: COLORS.turkuaz, shadowOpacity: 1, shadowRadius: 10, elevation: 5, zIndex: 4 }} />
            )}

            {/* POWER-UPS ANOMALIES */}
            {uiState.powerUps && uiState.powerUps.map(pu => (
              <Animated.View
                key={pu.id}
                style={{
                  position: 'absolute',
                  left: pu.x - pu.radius,
                  top: pu.y - pu.radius,
                  width: pu.radius * 2,
                  height: pu.radius * 2,
                  borderRadius: pu.radius,
                  backgroundColor: pu.type === 'speed' ? '#00FFFF' : '#FF5500',
                  shadowColor: pu.type === 'speed' ? '#00FFFF' : '#FF5500',
                  shadowOpacity: 0.8,
                  shadowRadius: 10,
                  elevation: 5,
                  transform: [{ scale: pulseAnim }],
                  zIndex: 10,
                }}
              />
            ))}

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

          {isListening && (
            <Text style={{color: '#FF0000', fontSize: 10, letterSpacing: 2, marginBottom: 8, fontWeight: 'bold', alignSelf: 'center'}}>SİSTEM DİNLEMEDE... (SES KAYDEDİLİYOR)</Text>
          )}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.commandInputWithMic}
              placeholder="Evrim komutunu girin..."
              placeholderTextColor={COLORS.textMuted}
              value={commandText}
              onChangeText={setCommandText}
            />
            <TouchableOpacity 
              style={[styles.micButton, isListening && styles.micButtonActive]} 
              onPress={startVoiceCommand}
            >
              <Mic color={isListening ? '#FF0000' : COLORS.turkuaz} size={20} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.evolveButton} activeOpacity={0.8} onPress={() => handleEvolve()}>
            <Text style={styles.evolveText}>EVRİMLEŞTİR</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
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
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  commandInputWithMic: {
    flex: 1,
    backgroundColor: '#050508',
    borderWidth: 1,
    borderColor: '#1E1E28',
    borderRadius: 8,
    color: '#E0E5EC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
  },
  micButton: {
    backgroundColor: '#050508',
    borderWidth: 1,
    borderColor: COLORS.turkuaz,
    borderRadius: 8,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micButtonActive: {
    borderColor: '#FF0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    shadowColor: '#FF0000',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 5,
  }
});
