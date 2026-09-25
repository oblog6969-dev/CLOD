import type { Locale } from "../language";
import { checkInPrompts } from "../domain";
import { CHECKINS_AR } from "./checkins-ar.mjs";

export function getCheckInPrompts(locale: Locale): readonly string[] {
  return locale === "ar" ? CHECKINS_AR : checkInPrompts;
}
