import { URLPattern } from 'urlpattern-polyfill';

// @lit-labs/router verwendet die URL Pattern API, die derzeit u. a. von Safari und Firefox nicht unterstützt wird.
if (!('URLPattern' in globalThis)) {
  (globalThis as typeof globalThis & { URLPattern: typeof URLPattern }).URLPattern = URLPattern;
}
