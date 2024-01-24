import { LitElement, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';

import sharedStyle from '../../shared.css?inline';
import componentStyle from './home.css?inline';
import { emit } from '../../../event.js';
import { User, userContext } from '../../../models/user.js';
import { Plugins } from '@capacitor/core';
import { CameraResultType, CameraSource } from '@capacitor/camera';

export const HOME_TITLE = 'Home';
const { Camera } = Plugins;

@customElement('app-home')
class HomeComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @consume({ context: userContext, subscribe: true })
  user?: User;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', { title: HOME_TITLE });
  }

  async firstUpdated() {}

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });
      // Hier kannst du mit dem aufgenommenen Bild arbeiten (image.path enthält den Dateipfad).
      console.log('Bildpfad:', image.path);
      const img = `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      alert('Plugin not available');
    }
  }

  async scanQrCode() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera
      });

      // Bild oder den Base64-String verwenden
      const imageUrl = image && image.base64Data ? `data:image/jpeg;base64,${image.base64Data}` : '';

      // weitere Aktionen mit dem gescannten QR-Code-Bild durchführen
      console.log('QR-Code-Image:', imageUrl);

      // Zeige das gescannte Bild an
      this.renderedImage = imageUrl;
    } catch (error) {
      console.error('Fehler beim Öffnen der Kamera:', error);
      alert('Plugin not available');
    }
  }

  private renderedImage: string | undefined = '';

  render() {
    return html`
      <div class="responsive padding">
        <div class="centered">
          <ion-img src="logo.jpg"></ion-img>
        </div>
        <h1>Hello dear customer!</h1>
        <p>
          Welcome to our restaurant. Please scan the QR-Code to continue the express sign in. If you have any problems
          with the qr code, dont hesitate to ask our staff for help.
        </p>
        <p>If you don't have a QR-code you can also use the log in to continue.</p>
      </div>
      <p class="centered">
        <ion-button expand="block" @click=${this.takePicture}>
          <ion-icon name="qr-code-outline"></ion-icon>
          <span>Scan QR-Code</span>
        </ion-button>
      </p>
      <p class="centered">or</p>
      <p class="centered">
        <ion-button expand="block" fill="outline" @click=${() => this.router.goto('/sign-in')}>
          <ion-icon name="log-in-outline"></ion-icon>
          <span>Sign in</span>
        </ion-button>
      </p>
    `;
  }

  showErrorMessageQRCode() {
    emit(this, 'app-open-toast', { message: 'Currently this function is not available', mode: 'danger' });
  }
}

function setImage(img: string) {
  throw new Error('Function not implemented.');
}
