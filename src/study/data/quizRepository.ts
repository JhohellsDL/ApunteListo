import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Quiz } from '../domain/types';

const PREFIX = '@repaso-offline/v1/quiz/';

export async function loadQuizzes(): Promise<Quiz[]> {
  const keys = (await AsyncStorage.getAllKeys()).filter(key => key.startsWith(PREFIX));
  const entries = await Promise.all(keys.map(key => AsyncStorage.getItem(key)));
  return entries.flatMap(value => value ? [JSON.parse(value) as Quiz] : [])
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function storeQuiz(quiz: Quiz): Promise<void> {
  await AsyncStorage.setItem(PREFIX + quiz.id, JSON.stringify(quiz));
}

export async function deleteQuiz(id: string): Promise<void> {
  await AsyncStorage.removeItem(PREFIX + id);
}
