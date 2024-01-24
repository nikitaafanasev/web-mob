import { LitElement, TemplateResult, html } from 'lit';

export interface AppModal {
  header: {
    buttons: {
      left: string;
      right: string;
    };
    title: string;
  };
  content: TemplateResult;
  formDefaultValues?: Record<string, unknown>;
  context: LitElement;
}

