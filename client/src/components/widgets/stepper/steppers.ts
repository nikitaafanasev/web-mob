import { LitElement, html, nothing } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { Router, routerContext } from '../../../router.js';
import sharedStyle from '../../shared.css?inline';
import componentStyle from './stepper.css?inline';
import { classMap } from 'lit/directives/class-map.js';
import { repeat } from 'lit/directives/repeat.js';

export const BILL_TITLE = 'Bill';

export type StepperItems = {
  label: string;
  optional?: boolean;
}[];

@customElement('app-stepper')
class StepperComponent extends LitElement {
  static styles = [sharedStyle, componentStyle];

  @consume({ context: routerContext, subscribe: true })
  router!: Router;

  @property({ type: Array })
  items: StepperItems = [];

  // count from 0
  @property({ type: Number })
  activeStep = 0;

  render() {
    return this.renderStepper();
  }

  renderStepper() {
    return html`<div class="stepper-horizontal">
      ${repeat(
        this.items,
        (item, index) =>
          html` <div class="${classMap({ step: true, active: this.isActive(index), done: this.isDone(index) })}">
            <div class="step-circle"><span>${this.isDone(index) ? '✓' : index + 1}</span></div>
            <div class="step-title">${item.label}</div>
            ${item.optional ? html`<div class="step-optional">Optional</div>` : nothing}
            <div class="step-bar-left"></div>
            <div class="step-bar-right"></div>
          </div>`
      )}
    </div> `;
  }

  isDone(index: number) {
    return index < this.activeStep;
  }

  isActive(index: number) {
    return index === this.activeStep;
  }
}
