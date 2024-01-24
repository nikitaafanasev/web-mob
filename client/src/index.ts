import './polyfills.js';
import './components/app/app.js';
import './components/pages/home/home.js';
import './components/pages/sign-in/sign-in.js';
import './components/pages/sign-up/sign-up.js';
import './components/pages/menu/menu.js';
import './components/pages/menu-item/menu-item.js';
import './components/pages/menu-item-edit/menu-item-edit.js';
import './components/pages/shopping-cart/shopping-cart.js';
import './components/pages/bill/bill.js';
import './components/pages/reservation/reservation.js';
import './components/pages/tasks/tasks.js';
import './components/pages/settings/settings.js';
import './components/pages/profile-edit/profile-edit.js';
import './components/widgets/stepper/steppers.js';
import './components/pages/orders/orders.js';
import './components/pages/edit-reservation/edit.reservation.js';

import { APP_TITLE } from './components/app/app.js';

import { IonApp } from '@ionic/core/components/ion-app.js';
import { IonHeader } from '@ionic/core/components/ion-header.js';
import { IonToolbar } from '@ionic/core/components/ion-toolbar.js';
import { IonTitle } from '@ionic/core/components/ion-title.js';
import { IonList } from '@ionic/core/components/ion-list.js';
import { IonItem } from '@ionic/core/components/ion-item.js';
import { IonContent } from '@ionic/core/components/ion-content.js';
import { IonButton } from '@ionic/core/components/ion-button.js';
import { IonIcon } from 'ionicons/components/ion-icon.js';
import { IonText } from '@ionic/core/components/ion-text.js';
import { IonInput } from '@ionic/core/components/ion-input.js';
import { IonLabel } from '@ionic/core/components/ion-label.js';
import { IonRow } from '@ionic/core/components/ion-row.js';
import { IonToast } from '@ionic/core/components/ion-toast.js';
import { IonTabs } from '@ionic/core/components/ion-tabs.js';
import { IonTab } from '@ionic/core/components/ion-tab.js';
import { IonTabBar } from '@ionic/core/components/ion-tab-bar.js';
import { IonTabButton } from '@ionic/core/components/ion-tab-button.js';
import { IonSearchbar } from '@ionic/core/components/ion-searchbar.js';
import { initialize } from '@ionic/core/components';
import { IonItemGroup } from '@ionic/core/components/ion-item-group.js';
import { IonItemDivider } from '@ionic/core/components/ion-item-divider.js';
import { IonNote } from '@ionic/core/components/ion-note.js';
import { IonCard } from '@ionic/core/components/ion-card.js';
import { IonCardHeader } from '@ionic/core/components/ion-card-header.js';
import { IonCardTitle } from '@ionic/core/components/ion-card-title.js';
import { IonCardSubtitle } from '@ionic/core/components/ion-card-subtitle.js';
import { IonCardContent } from '@ionic/core/components/ion-card-content.js';
import { IonImg } from '@ionic/core/components/ion-img.js';
import { IonItemSliding } from '@ionic/core/components/ion-item-sliding.js';
import { IonItemOptions } from '@ionic/core/components/ion-item-options.js';
import { IonItemOption } from '@ionic/core/components/ion-item-option.js';
import { IonBackButton } from '@ionic/core/components/ion-back-button.js';
import { IonModal } from '@ionic/core/components/ion-modal.js';
import { IonButtons } from '@ionic/core/components/ion-buttons.js';
import { IonRange } from '@ionic/core/components/ion-range.js';
import { IonTextarea } from '@ionic/core/components/ion-textarea.js';
import { IonAvatar } from '@ionic/core/components/ion-avatar.js';
import { IonBadge } from '@ionic/core/components/ion-badge.js';
import { IonAccordion } from '@ionic/core/components/ion-accordion.js';
import { IonAccordionGroup } from '@ionic/core/components/ion-accordion-group.js';
import { IonFab } from '@ionic/core/components/ion-fab.js';
import { IonFabButton } from '@ionic/core/components/ion-fab-button.js';
import { IonSelect } from '@ionic/core/components/ion-select.js';
import { IonSelectOption } from '@ionic/core/components/ion-select-option.js';
import { IonSegment } from '@ionic/core/components/ion-segment.js';
import { IonSegmentButton } from '@ionic/core/components/ion-segment-button.js';
import { IonDatetime } from '@ionic/core/components/ion-datetime.js';
import { IonRadio } from '@ionic/core/components/ion-radio.js';
import { IonRadioGroup } from '@ionic/core/components/ion-radio-group.js';
import { IonToggle } from '@ionic/core/components/ion-toggle.js';
import { IonActionSheet } from '@ionic/core/components/ion-action-sheet.js';
import { IonCheckbox } from '@ionic/core/components/ion-checkbox.js';
import { IonChip } from '@ionic/core/components/ion-chip.js';

import {
  star,
  checkmarkCircleOutline,
  warningOutline,
  home,
  settings,
  homeOutline,
  settingsOutline,
  cart,
  cartOutline,
  receipt,
  receiptOutline,
  calendarNumber,
  calendarNumberOutline,
  restaurant,
  restaurantOutline,
  funnel,
  funnelOutline,
  wine,
  wineOutline,
  person,
  personOutline,
  personCircle,
  personCircleOutline,
  bagHandleOutline,
  list,
  listOutline,
  ellipsisHorizontalCircle,
  fastFood,
  fastFoodOutline,
  starOutline,
  pencil,
  pencilOutline,
  documentAttach,
  documentAttachOutline,
  listCircle,
  listCircleOutline,
  bagCheck,
  bagCheckOutline,
  chevronForwardOutline,
  cash,
  cashOutline,
  wallet,
  walletOutline,
  chatbubbles,
  chatbubblesOutline,
  reader,
  readerOutline,
  menu,
  menuOutline,
  enter,
  enterOutline,
  exit,
  exitOutline,
  share,
  shareOutline,
  heart,
  heartOutline,
  idCard,
  idCardOutline,
  alertCircle,
  alertCircleOutline,
  filter,
  filterOutline,
  options,
  optionsOutline,
  lockClosed,
  lockClosedOutline,
  cloudUploadOutline,
  arrowBackOutline,
  arrowBack,
  arrowForward,
  arrowForwardOutline,
  logoApple,
  logoGoogle,
  logoPaypal,
  card,
  cardOutline,
  logIn,
  logInOutline,
  clipboardOutline,
  clipboard,
  save,
  saveOutline,
  qrCode,
  qrCodeOutline,
  documentOutline
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import '@ionic/core/css/ionic.bundle.css';
import { IonCol } from '@ionic/core/components/ion-col';

initialize();
addIcons({
  star,
  starOutline,
  checkmarkCircleOutline,
  warningOutline,
  home,
  settings,
  homeOutline,
  settingsOutline,
  cart,
  cartOutline,
  receipt,
  receiptOutline,
  calendarNumber,
  calendarNumberOutline,
  restaurant,
  restaurantOutline,
  funnel,
  funnelOutline,
  wine,
  wineOutline,
  person,
  personOutline,
  personCircle,
  personCircleOutline,
  bagHandleOutline,
  list,
  listOutline,
  ellipsisHorizontalCircle,
  fastFood,
  fastFoodOutline,
  pencil,
  pencilOutline,
  documentAttach,
  documentAttachOutline,
  listCircle,
  listCircleOutline,
  bagCheck,
  bagCheckOutline,
  chevronForwardOutline,
  cash,
  cashOutline,
  wallet,
  walletOutline,
  chatbubbles,
  chatbubblesOutline,
  reader,
  readerOutline,
  menu,
  menuOutline,
  exit,
  exitOutline,
  enter,
  enterOutline,
  share,
  shareOutline,
  heart,
  heartOutline,
  idCard,
  idCardOutline,
  alertCircle,
  alertCircleOutline,
  filter,
  filterOutline,
  options,
  optionsOutline,
  lockClosed,
  lockClosedOutline,
  cloudUploadOutline,
  arrowBackOutline,
  arrowBack,
  arrowForward,
  arrowForwardOutline,
  logoApple,
  logoGoogle,
  logoPaypal,
  card,
  cardOutline,
  logIn,
  logInOutline,
  clipboardOutline,
  clipboard,
  save,
  saveOutline,
  qrCode,
  qrCodeOutline,
  documentOutline
});
customElements.define('ion-app', IonApp);
customElements.define('ion-header', IonHeader);
customElements.define('ion-toolbar', IonToolbar);
customElements.define('ion-title', IonTitle);
customElements.define('ion-list', IonList);
customElements.define('ion-item', IonItem);
customElements.define('ion-content', IonContent);
customElements.define('ion-button', IonButton);
customElements.define('ion-icon', IonIcon);
customElements.define('ion-text', IonText);
customElements.define('ion-input', IonInput);
customElements.define('ion-label', IonLabel);
customElements.define('ion-row', IonRow);
customElements.define('ion-toast', IonToast);
customElements.define('ion-tabs', IonTabs);
customElements.define('ion-tab', IonTab);
customElements.define('ion-tab-bar', IonTabBar);
customElements.define('ion-tab-button', IonTabButton);
customElements.define('ion-searchbar', IonSearchbar);
customElements.define('ion-item-group', IonItemGroup);
customElements.define('ion-item-divider', IonItemDivider);
customElements.define('ion-note', IonNote);
customElements.define('ion-card', IonCard);
customElements.define('ion-card-title', IonCardTitle);
customElements.define('ion-card-subtitle', IonCardSubtitle);
customElements.define('ion-card-content', IonCardContent);
customElements.define('ion-card-header', IonCardHeader);
customElements.define('ion-img', IonImg);
customElements.define('ion-item-sliding', IonItemSliding);
customElements.define('ion-item-options', IonItemOptions);
customElements.define('ion-item-option', IonItemOption);
customElements.define('ion-back-button', IonBackButton);
customElements.define('ion-modal', IonModal);
customElements.define('ion-buttons', IonButtons);
customElements.define('ion-range', IonRange);
customElements.define('ion-textarea', IonTextarea);
customElements.define('ion-avatar', IonAvatar);
customElements.define('ion-badge', IonBadge);
customElements.define('ion-accordion', IonAccordion);
customElements.define('ion-accordion-group', IonAccordionGroup);
customElements.define('ion-fab', IonFab);
customElements.define('ion-fab-button', IonFabButton);
customElements.define('ion-select', IonSelect);
customElements.define('ion-select-option', IonSelectOption);
customElements.define('ion-segment', IonSegment);
customElements.define('ion-segment-button', IonSegmentButton);
customElements.define('ion-datetime', IonDatetime);
customElements.define('ion-radio', IonRadio);
customElements.define('ion-radio-group', IonRadioGroup);
customElements.define('ion-action-sheet', IonActionSheet);
customElements.define('ion-checkbox', IonCheckbox);
customElements.define('ion-toggle', IonToggle);
customElements.define('ion-col', IonCol);
customElements.define('ion-chip', IonChip);

document.documentElement.classList.add('ion-ce');
document.addEventListener('app-page-title-changed', event => {
  const title: string | undefined = (event as CustomEvent).detail.title;
  if (title) {
    document.title = `${APP_TITLE} | ${title}`;
  } else {
    document.title = APP_TITLE;
  }
});
