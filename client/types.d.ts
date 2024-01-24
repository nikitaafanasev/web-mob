declare module '*.css?inline' {
  import { CSSResult } from 'lit';
  const css: CSSResult;
  export default css;
}

declare module '*.svg?raw&inline' {
  export default '';
}
