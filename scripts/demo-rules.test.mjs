// Self-check for the simplified regex demo. Run: npm test
import assert from "node:assert/strict";
import { classify } from "../src/lib/demoRules.ts";

assert.equal(classify("   ").verdict, "Could not analyze");
assert.equal(classify("See you at lunch tomorrow").verdict, "No clear pattern match");
assert.equal(classify("Your parcel is waiting, click here").verdict, "Worth a closer look");

const high = classify("URGENT: share your OTP immediately or your account is blocked. https://x.example");
assert.equal(high.verdict, "High-risk patterns found");
assert.deepEqual(high.hits.find((h) => h.label === "Asks for credentials").matches, ["otp"]);

// Romanized and Devanagari urgency words.
assert.equal(classify("turant reply karo").hits[0].label, "Urgency or pressure");
assert.equal(classify("तुरंत कार्रवाई करें").hits[0].label, "Urgency or pressure");

// Global regexes must not keep state between calls.
assert.equal(classify("OTP").verdict, classify("OTP").verdict);

console.log("demo rules: all checks passed");
