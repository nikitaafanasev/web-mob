import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './edit.reservation.css?inline';
import { emit } from '../../../event.js';
import { httpClient, HttpError } from '../../../http-client';
import { ReservationService, reservationServiceContext } from '../../../services/reservation';
import { User, userContext } from '../../../models/user';
import { reservationContext } from '../../../models/reservation';
import { Entity } from '../../../models/entity';

export const RESERVATION_EDIT_TITLE = 'Edit Reservation'; // Change the title accordingly

@customElement('app-reservation-edit') // Change the component name
class ReservationEditComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({context: routerContext, subscribe: true})
  router!: Router;

  @consume({context: reservationServiceContext})
  reservationService!: ReservationService;

  @query('#date') dateInput!: HTMLInputElement;
  @query('#time') timeInput!: HTMLInputElement;
  @query('#partySize') partySizeInput!: HTMLInputElement;

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', {title: RESERVATION_EDIT_TITLE});
    emit(this, 'app-back-button-changed', {visible: true});
  }

  render() {
    return html`
      <div class="responsive padding centered">
        <form class="padding-y">
          <ion-list>
            <ion-item>
              <ion-input label="Reservation-Id" name="reservation-id" type="reservation-id" placeholder="12345"
                         class="custom-grey-input"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Firstname" name="firstname" type="firstname" clear-input="true" value="Adham"
                         class="custom-grey-input"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Lastname" name="lastname" type="lastname" clear-input="true" value="Hasan"
                         class="custom-grey-input"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Time" name="time" type="time" placeholder="12:30 pm"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Date" name="date" type="date" value="28.01.2024"></ion-input>
            </ion-item>
            <ion-item>
              <ion-input label="Phone" name="Phone" type="phone" clear-input="true" value="01778198294"
                         class="custom-grey-input"></ion-input>
            </ion-item>
          </ion-list>
          <div class="centered padding">
            <ion-button @click=${this.submit}
                        type="submit">Save Changes
            </ion-button>
          </div>
          <div class="centered padding">
            <ion-button @click=${this.submit}
                        type="submit">Cancel Reservation
            </ion-button>
          </div>
      </div>
      </form>


    `;
  }

  async submit() {
    emit(this, 'app-open-toast', {
      message: 'Data has been successfully changed',
      mode: 'success',
      duration: 9000 // Dauer in Millisekunden (hier 5000 ms oder 5 Sekunden)
    });
    emit(this, 'app-open-toast', {
      message: 'Reservation has been cancelled',
      mode: 'success',
      duration: 9000
    });
    this.router.back();
  }
}
