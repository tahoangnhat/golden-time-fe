import type { PremiumChatTurn, PremiumHealthProfile } from "@/lib/api";

export const PREMIUM_MEMBERSHIP_UPDATED_EVENT = "golden-time-premium-membership-updated";

type PremiumAssistantSession = {
  ownerId: number | null;
  messages: PremiumChatTurn[];
  profile: PremiumHealthProfile | null;
  recommendedProductIds: number[];
  aiConsent: boolean;
};

let session: PremiumAssistantSession = {
  ownerId: null,
  messages: [],
  profile: null,
  recommendedProductIds: [],
  aiConsent: false,
};

export function bindPremiumAssistantOwner(ownerId: number): boolean {
  if (session.ownerId !== null && session.ownerId !== ownerId) {
    session = { ownerId, messages: [], profile: null, recommendedProductIds: [], aiConsent: false };
    return true;
  }
  session = { ...session, ownerId };
  return false;
}

export function readPremiumAssistantSession(): PremiumAssistantSession {
  return {
    ...session,
    messages: [...session.messages],
    recommendedProductIds: [...session.recommendedProductIds],
  };
}

export function setPremiumAssistantContext(profile: PremiumHealthProfile, recommendedProductIds: number[]) {
  session = { ...session, profile, recommendedProductIds: [...recommendedProductIds] };
}

export function setPremiumAssistantConsent(aiConsent: boolean) {
  session = { ...session, aiConsent };
}

export function appendPremiumAssistantMessage(message: PremiumChatTurn) {
  session = { ...session, messages: [...session.messages, message] };
}
