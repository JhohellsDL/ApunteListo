import React from 'react';
import { Text } from 'react-native';
import type { Quiz } from '../../domain/types';
import { Header, Panel, Screen, styles } from '../ui';

export function QuizMaterialScreen({ quiz, onBack }: { quiz: Quiz; onBack: () => void }) {
  return (
    <Screen>
      <Header
        back={onBack}
        label="MATERIAL DE ESTUDIO"
        title={quiz.title}
        subtitle="Texto revisado al crear este quiz."
      />
      {quiz.pages.map((page, index) => (
        <Panel key={index}>
          <Text style={styles.eyebrow}>PÁGINA {index + 1}</Text>
          <Text selectable style={styles.body}>
            {page.text || 'Esta página quedó sin texto.'}
          </Text>
        </Panel>
      ))}
    </Screen>
  );
}

