/** "Scroll to climb" at the bottom of the stage; the scene fades it as soon as the reader moves. */
export function ScrollHint({ children }: { children: string }) {
  return (
    <p
      data-hint
      className="pointer-events-none absolute bottom-[18px] left-1/2 flex hint-tail -translate-x-1/2 flex-col items-center gap-[10px] font-sans text-[12px] tracking-[0.01em] text-faint motion-reduce:hidden tablet:bottom-7"
    >
      {children}
    </p>
  );
}
