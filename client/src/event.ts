export function emit(elem: HTMLElement, eventType: string, eventData = {}) {
  const event = new CustomEvent(eventType, {
    detail: eventData,
    bubbles: true,
    composed: true
  });
  elem.dispatchEvent(event);
}
