/** Installs a static `window.matchMedia`; `matches` applies to every query. */
export function installMatchMedia(matches: boolean): void {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}
