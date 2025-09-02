export function getThemeSelector(getTheme, name) {
  const className = getTheme()?.[name];
  if (typeof className !== "string") {
    throw new Error(
      `getThemeClass: required theme property ${name} not defined`
    );
  }
  return className
    .split(/\s+/g)
    .map((cls) => `.${cls}`)
    .join();
}
