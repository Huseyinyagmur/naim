import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar } from 'react-native';
import { Cpu, Zap, Shield, Sparkles, Move, Palette } from 'lucide-react-native';

const COLORS = {
  background: '#040406',
  panelBg: '#0D0D14',
  turkuaz: '#00F0FF',
  pembe: '#FF003C',
  neon: '#FAFF00',
  text: '#E0E5EC',
  border: '#1E1E28',
};

export default function EvolutionScreen() {
  const GuideSection = ({ title, icon: Icon, color, items }) => (
    <View style={[styles.sectionCard, { borderColor: color }]}>
      <View style={styles.sectionHeader}>
        <Icon color={color} size={20} />
        <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      </View>
      <View style={styles.itemList}>
        {items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <View style={[styles.bullet, { backgroundColor: color }]} />
            <Text style={styles.itemText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      
      <View style={styles.header}>
        <Cpu color={COLORS.turkuaz} size={24} />
        <Text style={styles.headerTitle}>EVRİM REHBERİ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtext}>
          Sistem Ajanı, algıladığı doğal dil komutlarıyla (NLP) fizik motorunu gerçek zamanlı mutasyona uğratır. Aşağıdaki terminal komutlarını deneyin.
        </Text>

        <GuideSection 
          title="Renk Mutasyonları" 
          icon={Palette} 
          color="#00FFFF" 
          items={[
            "'Topu yeşil/mavi/siyah yap'",
            "'Çubuğu kırmızı vb. yap'",
            "'Kırmızı top gönder'"
          ]} 
        />

        <GuideSection 
          title="Fiziksel Değişimler" 
          icon={Move} 
          color="#FF003C" 
          items={[
            "'Çubuğu büyüt / daralt'",
            "'Topu hızlandır / uçur'",
            "'Oyunu yavaşlat / fren yap'"
          ]} 
        />

        <GuideSection 
          title="Sektör Kontrolü" 
          icon={Cpu} 
          color="#00FF00" 
          items={[
            "'Blok sayısını artır / doldur'",
            "'Blokları seyrelt / temizle'",
            "'Yeni seviye / sıfırla'"
          ]} 
        />

        <GuideSection 
          title="Saha Anomalileri" 
          icon={Zap} 
          color="#FAFF00" 
          items={[
            "'Ekrana nitro / turbo at'",
            "'Tuzak / buz ekle'"
          ]} 
        />

        <GuideSection 
          title="Saldırı & Savunma" 
          icon={Shield} 
          color="#FF00FF" 
          items={[
            "'Lazerleri kuşan / ateşle'",
            "'Kalkan aç / koruma bariyeri'"
          ]} 
        />

        <GuideSection 
          title="Atmosfer & Güçler" 
          icon={Sparkles} 
          color="#00F0FF" 
          items={[
            "'Topu çoğalt / ikile'",
            "'Yağmur yağdır / fırtına'",
            "'Topa iz / parlama ekle'"
          ]} 
        />

        <View style={styles.footerSpacing} />
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
    padding: 16,
  },
  subtext: {
    color: '#A0AAB5',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  sectionCard: {
    backgroundColor: COLORS.panelBg,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 10,
    marginBottom: 12,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.5,
  },
  itemList: {
    gap: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  itemText: {
    color: COLORS.text,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  footerSpacing: {
    height: 40,
  }
});
