/**
 * Landing atmosphere: a pale sky with soft cloud washes.
 * Photography is not used — the product should look like a tool, not a brochure.
 */
export function Hero({ children }: { children: React.ReactNode }) {
  return (
    <div className="ambient relative isolate flex min-h-dvh flex-col">{children}</div>
  );
}
