/**
 * Font loader — call once at composition root level.
 * Loads Inter (display/body) and JetBrains Mono (code) via @remotion/google-fonts.
 */
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";

let fontsLoaded = false;

export function loadFonts(): void {
  if (fontsLoaded) return;
  fontsLoaded = true;

  // Load normal weight Inter in key weights
  loadInter("normal", {
    weights: ["400", "500", "600", "700", "800", "900"],
    subsets: ["latin"],
  });

  // Load JetBrains Mono for code blocks
  loadJetBrains("normal", {
    weights: ["400", "500", "700"],
    subsets: ["latin"],
  });
}
