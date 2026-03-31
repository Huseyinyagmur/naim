import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, TextInput } from 'react-native';
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

const commandData = [
  {
    category: 'Renk Mutasyonları',
    icon: Palette,
    color: '#00FFFF',
    items: [
      "'Topu yeşil/mavi/siyah yap'",
      "'Çubuğu kırmızı vb. yap'",
      "'Kırmızı top gönder'"
    ]
  },
  {
    category: 'Fiziksel Değişimler',
    icon: Move,
    color: '#FF003C',
    items: [
      "'Çubuğu büyüt / daralt'",
      "'Topu hızlandır / uçur'",
      "'Oyunu yavaşlat / fren yap'"
    ]
  },
  {
    category: 'Sektör Kontrolü',
    icon: Cpu,
    color: '#00FF00',
    items: [
      "'Blok sayısını artır / doldur'",
      "'Blokları seyrelt / temizle'",
      "'Yeni seviye / sıfırla'"
    ]
  },
  {
    category: 'Saha Anomalileri',
    icon: Zap,
    color: '#FAFF00',
    items: [
      "'Ekrana nitro / turbo at'",
      "'Tuzak / buz ekle'"
    ]
  },
  {
    category: 'Saldırı & Savunma',
    icon: Shield,
    color: '#FF00FF',
    items: [
      "'Lazerleri kuşan / ateşle'",
      "'Kalkan aç / koruma bariyeri'"
    ]
  },
  {
    category: 'Atmosfer & Güçler',
    icon: Sparkles,
    color: '#00F0FF',
    items: [
      "'Topu çoğalt / ikile'",
      "'Yağmur yağdır / fırtına'",
      "'Topa iz / parlama ekle'"
    ]
  }
];

export default function EvolutionScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = commandData.map(section => {
    const q = searchQuery.toLowerCase();
    const matchesCategory = section.category.toLowerCase().includes(q);
    const matchingItems = section.items.filter(item => 
      item.toLowerCase().includes(q)
    );
    
    if (matchesCategory || matchingItems.length > 0) {
      return {
        ...section,
        items: matchesCategory ? section.items : matchingItems
      };
    }
    return null;
  }).filter(Boolean);

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

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Sistem Veri Tabanında Ara..."
          placeholderTextColor="rgba(0, 255, 255, 0.4)"
          value={searchQuery}
          onChangeText={setSearchQuery}
          selectionColor={COLORS.turkuaz}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtext}>
          Sistem Ajanı, algıladığı doğal dil komutlarıyla (NLP) fizik motorunu gerçek zamanlı mutasyona uğratır. Aşağıdaki terminal komutlarını deneyin.
        </Text>

        {filteredData.length > 0 ? (
          filteredData.map((section, idx) => (
            <GuideSection 
              key={idx}
              title={section.category} 
              icon={section.icon} 
              color={section.color} 
              items={section.items} 
            />
          ))
        ) : (
          <View style={styles.noResultContainer}>
            <Text style={styles.noResultText}>EŞLEŞEN VERİ BULUNAMADI</Text>
          </View>
        )}

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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
  },
  searchInput: {
    backgroundColor: COLORS.panelBg,
    borderColor: '#00FFFF',
    borderWidth: 1,
    borderRadius: 6,
    color: '#00FFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 4,
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
  noResultContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  noResultText: {
    color: '#FF003C',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(255, 0, 60, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  footerSpacing: {
    height: 40,
  }
});
