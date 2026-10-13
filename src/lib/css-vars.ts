/** Writes custom properties as inline styles on an element. */
export function applyCssVars(element: HTMLElement, vars: Record<string, string>): void {
  for (const [name, value] of Object.entries(vars)) element.style.setProperty(name, value);
}

/** Removes inline custom properties from an element, so the stylesheet values apply again. */
export function clearCssVars(element: HTMLElement, names: readonly string[]): void {
  for (const name of names) element.style.removeProperty(name);
}
