import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

/**
 * Type-safe navigation hook
 * Usage: const navigation = useTypedNavigation();
 */
export function useTypedNavigation() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList>>();
}

/**
 * Type-safe navigation hook for specific stack
 */
export function useTypedNavigationStack<T extends keyof RootStackParamList>() {
  return useNavigation<NativeStackNavigationProp<RootStackParamList, T>>();
}








