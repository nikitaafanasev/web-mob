import { LitElement, html } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './reservation.css?inline';
import { emit } from '../../../event.js';
import {httpClient, HttpError} from "../../../http-client";
import {AppActionSheet} from "../../../action-sheet";
import {AppModal} from "../../../modal";



const FORM_DEFAULT_VALUES = {
  quantity: 1,
  instructions: ''
};
export const RESERVATION_TITLE = 'Reservation';


@customElement(                           'app-reservation')
class ReservationComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({context: routerContext, subscribe: true})
  router!: Router;
  private reservation: any;
  private ev: any;

  @query('ion-textarea[name="content"]')
  commentElement!: HTMLIonTextareaElement;

  @state()
  myRating = 0;
  private chosenDate: unknown;

  @query('ion-accordion-group')
  accordionGroupElement!: HTMLIonAccordionGroupElement;

  @query('ion-datetime')
  datetime!: HTMLIonDatetimeElement

  connectedCallback() {
    super.connectedCallback();
    emit(this, 'app-page-title-changed', {title: RESERVATION_TITLE});
  }

  async firstUpdated() {

  }


  render() {
    return html`
      <div xmlns="">
        <ion-img src="location.jpg"></ion-img>
        <div class="img-content-container centered space-between">
          <div class="action-button-wrapper">
            <div class="centered padding-left">
              <ion-icon name="cash-outline" role="img" class="md"></ion-icon>
              <span>$$$</span>
            </div>
            <div class="centered padding-x">
              <ion-icon name="star" role="img" class="md"></ion-icon>
              <ion-icon name="star" role="img" class="md"></ion-icon>
              <ion-icon name="star" role="img" class="md"></ion-icon>
              <ion-icon name="star" role="img" class="md"></ion-icon>
            </div>
          </div>
          <div class="action-button-wrapper">
            <div class="centered padding-right">
              <ion-icon @click=${this.openShareActionSheet} name="share-outline" size="large"></ion-icon>
            </div>
          </div>
        </div>
      </div>
        <ion-accordion-group>
          <ion-accordion value="first">
            <ion-item slot="header">
              <ion-label>Description</ion-label>
            </ion-item>
            <div class="padding accordion-element" slot="content">
              <iframe src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d9713.813270163892!2d13.3449058!3d52.5071348!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a851acba63a517%3A0x71281f74e7843189!2sHugos!5e0!3m2!1sen!2sde!4v1705874143836!5m2!1sen!2sde" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
              ${this.reservation?.description}
              <div class="padding accordion-element" slot="content" style="color: #e05b48;">
                Opening hours:
                Monday Closed
                Tuesday Closed
                Wednesday 6:30pm–12am
                Thursday 6:30pm–12am
                Friday 6:30pm–12am
                Saturday 6:30pm–12am
                Sunday Closed
              </div>
            </div>
          </ion-accordion>
          <ion-accordion-group>
            <ion-accordion value="first">
              <ion-item slot="header">
                <ion-label>Comments</ion-label>
              </ion-item>
              <ion-item slot="header" color="light">
                <ion-label>Other Comments</ion-label>
              </ion-item>
              <ion-item slot="content">
                <ion-list>
                  <ion-item *ngFor="example comments" style="color: #e05b48;">very nice view</ion-item>
                  <ion-item *ngFor="example comments" style="color: #e05b48;">modern location</ion-item>
                  <ion-item *ngFor="example comments" style="color: #e05b48;">nice waiters and very helpful</ion-item>
                </ion-list>
               
                <ion-infinite-scroll (ionInfinite)="loadMoreExampleComments($event)">
                  <ion-infinite-scroll-content loadingSpinner="bubbles" loadingText="Loading more comments..."></ion-infinite-scroll-content>
                </ion-infinite-scroll>
           
                <ion-item>
                  <ion-textarea placeholder="Add your comment..." [(ngModel)]="newComment"></ion-textarea>
                </ion-item>
                <ion-button expand="full" (click)="addComment()">Add Comment</ion-button>
              </ion-item>
            </ion-accordion>
          </ion-accordion-group>

          <ion-list>
            <ion-item>
              <ion-label position="stacked" style="font-size: 22px;">Party Size</ion-label>
              <ion-input type="number" min="1" max="12" placeholder="Enter party size"></ion-input>
            </ion-item>
          </ion-list>
          
          <ion-list>
            <ion-item>
              <ion-label class="item-label" color="primary">Table Size</ion-label>
              <ion-select>
                <ion-select-option value="round">Round</ion-select-option>
                <ion-select-option value="rectangular">Rectangular</ion-select-option>
                <ion-select-option value="square">Square</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>
          <ion-list>
            <ion-item>
              <ion-input label="Available Tables" value="5" disabled="true"></ion-input>
            </ion-item>
          </ion-list>

          <ion-datetime [(ngModel)]="selectedDate" display-format="MMM D, YYYY" [min]="minDate">
            <span slot="title" style="font-size: 20px;">Select a Reservation Date</span>
            <ion-buttons slot="buttons">
              <ion-button color="danger" (click)="resetForm()">Reset</ion-button>
              <ion-button color="primary" (click)="cancelForm()">Never mind</ion-button>
              <ion-button color="primary" (click)="confirmForm()">All Set</ion-button>
            </ion-buttons>
            
            <ion-item>
              <ion-label>Date:</ion-label>
              <ion-datetime display-format="MMM D, YYYY" value="2024-01-01" readonly></ion-datetime>
              <ion-label style="color: var(--ion-color-secondary);">Ausgebucht</ion-label>
            </ion-item>
          </ion-datetime>
          
          <form>
            <ion-label>Name:</ion-label>
            <ion-input type="text" required></ion-input>
            <ion-label>Phone number:</ion-label>
            <ion-input type="number" required></ion-input>
            <ion-label>Special Requests:</ion-label>
            <ion-input type="text" required></ion-input>
            <ion-checkbox>
              I agree to the <a href="#" onclick="showTermsAndConditions()">terms and conditions</a>
            </ion-checkbox>
            <ion-button @click=${this.submit}
                type="submit">Confirm Reservation</ion-button>
          </form>
          }`
  }
  async submit() {
    emit(this, 'app-open-toast', {
      message: 'Thank you for your Reservation, you will get a confirmation per mail',
      mode: 'success',
      duration: 8000 // Dauer in Millisekunden (hier 5000 ms oder 5 Sekunden)
    });
  }

  renderForm() {
    return html`
      <style>
        ion-range {
          margin-bottom: 1rem;
        }
      </style>
      <form>
        <ion-list>
              <ion-item>
                <ion-textarea label="Firstname" placeholder="Enter text"></ion-textarea>
              </ion-item>
              <ion-item>
                <ion-textarea label="Lastname" label-placement="fixed" placeholder="Enter text"></ion-textarea>
              </ion-item>
              <ion-item>
            <ion-textarea label="Phone Number" label-placement="fixed" placeholder="Enter number"></ion-textarea>
              </ion-item
          <ion-item>
            <ion-textarea
                label="Special Requests"
                label-placement="floating"
                placeholder="Enter text"
                auto-grow="true"
                value="${FORM_DEFAULT_VALUES.instructions}"
                name="instructions"
            ></ion-textarea>
          </ion-item>
        </ion-list>
      </form>`;
  }


  closeActionSheet() {
    emit(this, 'app-action-sheet-closed');
  }
  openShareActionSheet() {
    const actionSheet: AppActionSheet = {
      header: 'Share',
      buttons: [
        {
          text: 'Whatsapp',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Facebook',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Twitter',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Instagram',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'LinkedIn',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Pinterest',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Reddit',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Tumblr',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Email',
          data: {
            action: 'share'
          },
          handler: () => {
            this.closeActionSheet();
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: {
            action: 'cancel'
          },
          handler: () => {
            this.closeActionSheet();
          }
        }
      ]
    };
    emit(this, 'app-action-sheet-opened', actionSheet);
  }
  async submitComment(event: Event) {
    event.preventDefault();
    const data = {
      content: this.commentElement.value || ''
    }
  }
  openModal() {
    const modal: AppModal = {
      header: {
        buttons: {
          left: 'Cancel',
          right: 'Confirm'
        },
        title: this.reservation!.name
      },
      content: this.renderForm(),
      formDefaultValues: FORM_DEFAULT_VALUES,
      context: this
    };
    emit(this, 'app-modal-opened', { modal: { ...modal } });
  }
}
