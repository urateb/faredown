/**
 * Landing atmosphere: a dark canvas with a faint grid and a teal wash.
 * Photography is not used — the product should look like a tool, not a brochure.
 */
export function Hero({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient relative isolate flex min-h-dvh flex-col">{children}</div>
  );
}
