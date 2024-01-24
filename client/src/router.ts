import { createContext } from '@lit/context';

import { ReactiveControllerHost } from 'lit';
import { BaseRouteConfig, Router as LitRouter, RouteConfig } from '@lit-labs/router';

export const routerContext = createContext<Router>('router');

export class Router {
  private router: LitRouter;
  constructor(
    host: ReactiveControllerHost & HTMLElement,
    routes: Array<RouteConfig>,
    options?: {
      fallback?: BaseRouteConfig;
    }
  ) {
    this.router = new LitRouter(host, routes, options);
  }

  outlet() {
    return this.router.outlet();
  }

  async goto(relURL: string) {
    await this.router.goto(relURL);
    window.history.pushState({}, '', relURL);
  }

  back() {
    if (window.history.length > 1) {
      window.history.back();
    }
  }
}
