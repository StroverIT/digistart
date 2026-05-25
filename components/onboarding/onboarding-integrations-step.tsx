"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OnboardingRequirements, SocialChannelInput } from "@/lib/onboarding/requirements";

type OnboardingIntegrationsStepProps = {
  requirements: OnboardingRequirements;
  channels: SocialChannelInput[];
  onChannelsChange: (channels: SocialChannelInput[]) => void;
  googleBusinessUrl: string;
  onGoogleBusinessUrlChange: (value: string) => void;
  storeFacebook: string;
  onStoreFacebookChange: (value: string) => void;
  storeInstagram: string;
  onStoreInstagramChange: (value: string) => void;
};

export function OnboardingIntegrationsStep({
  requirements,
  channels,
  onChannelsChange,
  googleBusinessUrl,
  onGoogleBusinessUrlChange,
  storeFacebook,
  onStoreFacebookChange,
  storeInstagram,
  onStoreInstagramChange,
}: OnboardingIntegrationsStepProps) {
  const updateChannel = (index: number, patch: Partial<SocialChannelInput>) => {
    const next = channels.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChannelsChange(next);
  };

  return (
    <div className="space-y-6">
      {requirements.socialChannelCount > 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            За всеки закупен канал посочете платформа (по избор) и линк към профила.
          </p>
          {channels.map((channel, index) => (
            <div key={index} className="rounded-lg border border-border p-4 space-y-3">
              <p className="text-sm font-medium">Канал {index + 1}</p>
              <div className="space-y-2">
                <Label htmlFor={`channel-label-${index}`}>Платформа (по избор)</Label>
                <Input
                  id={`channel-label-${index}`}
                  value={channel.label ?? ""}
                  onChange={(e) => updateChannel(index, { label: e.target.value })}
                  placeholder="Facebook, Instagram, TikTok..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`channel-url-${index}`}>Линк към профила *</Label>
                <Input
                  id={`channel-url-${index}`}
                  value={channel.profileUrl}
                  onChange={(e) => updateChannel(index, { profileUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {requirements.showStoreSocialFields ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Линкове към социалните профили на магазина (ако вече имате).
          </p>
          <div className="space-y-2">
            <Label htmlFor="storeFacebook">Facebook страница</Label>
            <Input
              id="storeFacebook"
              value={storeFacebook}
              onChange={(e) => onStoreFacebookChange(e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeInstagram">Instagram</Label>
            <Input
              id="storeInstagram"
              value={storeInstagram}
              onChange={(e) => onStoreInstagramChange(e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
        </div>
      ) : null}

      {requirements.showGoogleBusinessLink ? (
        <div className="space-y-2">
          <Label htmlFor="googleBusinessUrl">Google Business профил</Label>
          <Input
            id="googleBusinessUrl"
            value={googleBusinessUrl}
            onChange={(e) => onGoogleBusinessUrlChange(e.target.value)}
            placeholder="https://g.page/... или Maps линк"
          />
          <p className="text-xs text-muted-foreground">
            Ако вече имате профил в Google Business / Maps, поставете линка. Ако нямате - оставете
            празно и ще създадем профил за вас.
          </p>
        </div>
      ) : null}
    </div>
  );
}