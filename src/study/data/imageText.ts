import { PermissionsAndroid, Platform } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import MlkitOcr from 'rn-mlkit-ocr';

export async function pickStudyImages(source: 'camera' | 'library', remaining: number): Promise<string[]> {
  if (remaining < 1) return [];
  if (source === 'camera' && Platform.OS === 'android') {
    const permission = PermissionsAndroid.PERMISSIONS.CAMERA;
    const granted = await PermissionsAndroid.check(permission) ||
      await PermissionsAndroid.request(permission) === PermissionsAndroid.RESULTS.GRANTED;
    if (!granted) throw new Error('Habilita el permiso de cámara en Ajustes o usa la galería.');
  }
  const options = { mediaType: 'photo' as const, maxWidth: 2400, maxHeight: 3200, quality: 1 as const };
  const result = source === 'camera'
    ? await launchCamera({ ...options, saveToPhotos: false })
    : await launchImageLibrary({ ...options, selectionLimit: remaining });

  if (result.didCancel) return [];
  if (result.errorCode === 'camera_unavailable') throw new Error('La cámara no está disponible. Puedes usar una captura.');
  if (result.errorCode === 'permission') throw new Error('Revisa los permisos de la app en Ajustes.');
  if (result.errorCode) throw new Error('No pudimos abrir la imagen. Intenta otra vez.');
  const assets = result.assets ?? [];
  if (assets.length > remaining) {
    throw new Error(`Puedes agregar hasta ${remaining} ${remaining === 1 ? 'imagen más' : 'imágenes más'}.`);
  }
  const uris = assets.flatMap(asset => asset.uri ? [asset.uri] : []);
  if (uris.length !== assets.length) throw new Error('Una imagen no está disponible en el dispositivo.');
  return uris;
}

export async function recognizeImage(uri: string): Promise<string> {
  if (!/^(?:file:\/\/|content:\/\/)/.test(uri)) {
    throw new Error('Selecciona una imagen disponible en el dispositivo.');
  }
  const result = await MlkitOcr.recognizeText(uri, 'latin');
  return result.text.trim();
}
