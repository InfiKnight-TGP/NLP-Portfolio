// A deliberately tiny, illustrative rule set for the in-browser demo.
// This is NOT Fisher's engine: no Unicode normalisation pipeline, no transliteration, no evaluation.

export const RULES = [
  { id: "urgency", label: "Urgency or pressure", re: /\b(urgent(ly)?|immediately|within \d+ hours?|expir(e|es|ed|ing)|suspend(ed)?|blocked|turant|jaldi)\b|तुरंत|जल्दी/giu },
  { id: "credentials", label: "Asks for credentials", re: /\b(otp|pin|password|cvv|kyc|verify|login)\b/giu },
  { id: "action", label: "Pushes a link or action", re: /https?:\/\/\S+|\bwww\.\S+|\b(click|tap) (here|the link|below)\b/giu },
  { id: "money", label: "Money or prize", re: /₹|\b(rs\.?|rupees|lottery|prize|refund|cashback)\b/giu },
] as const;

export type DemoResult = {
  verdict: "High-risk patterns found" | "Worth a closer look" | "No clear pattern match" | "Could not analyze";
  hits: { label: string; matches: string[] }[];
};

export function classify(text: string): DemoResult {
  if (!text.trim()) return { verdict: "Could not analyze", hits: [] };
  const hits = RULES.flatMap((r) => {
    const matches = [...new Set(Array.from(text.matchAll(r.re), (m) => m[0].toLowerCase()))];
    return matches.length ? [{ label: r.label, matches }] : [];
  });
  const verdict =
    hits.length >= 2 ? "High-risk patterns found" : hits.length === 1 ? "Worth a closer look" : "No clear pattern match";
  return { verdict, hits };
}
