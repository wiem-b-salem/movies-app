import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  /** Returns a small base64 image, or null if the user cancelled. */
  async takePhoto(): Promise<string | null> {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
        promptLabelHeader: 'Photo de profil',
        promptLabelPhoto: 'Galerie',
        promptLabelPicture: 'Prendre une photo',
      });
      return image.dataUrl ? await this.resize(image.dataUrl, 300) : null;
    } catch {
      return null; // cancelled or permission denied
    }
  }

  private resize(dataUrl: string, max: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  }
}