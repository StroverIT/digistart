"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EMPTY_SOCIAL_CHANNEL,
  type OnboardingRequirements,
  type SocialChannelInput,
} from "@/lib/onboarding/requirements";

type OnboardingIntegrationsStepProps = {
  requirements: OnboardingRequirements;
  channels: SocialChannelInput[];
  onChannelsChange: (channels: SocialChannelInput[]) => void;
  googleBusinessUrl: string;
  onGoogleBusinessUrlChange: (value: string) => void;
};

export function OnboardingIntegrationsStep({
  requirements,
  channels,
  onChannelsChange,
  googleBusinessUrl,
  onGoogleBusinessUrlChange,
}: OnboardingIntegrationsStepProps) {
  const updateChannel = (index: number, patch: Partial<SocialChannelInput>) => {
    const next = channels.map((c, i) => (i === index ? { ...c, ...patch } : c));
    onChannelsChange(next);
  };

  const addChannel = () => {
    onChannelsChange([...channels, { ...EMPTY_SOCIAL_CHANNEL }]);
  };

  const removeChannel = (index: number) => {
    if (channels.length <= 1) return;
    onChannelsChange(channels.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Добавете социалните мрежи на бизнеса си - платформа и линк към профила.
        </p>
        {channels.map((channel, index) => (
          <div key={index} className="rounded-lg border border-border p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium">Социална мрежа {index + 1}</p>
              {channels.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => removeChannel(index)}
                  aria-label={`Премахни социална мрежа ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`channel-label-${index}`}>Платформа</Label>
              <Input
                id={`channel-label-${index}`}
                value={channel.label ?? ""}
                onChange={(e) => updateChannel(index, { label: e.target.value })}
                placeholder="Facebook, Instagram, TikTok..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`channel-url-${index}`}>Линк към профила</Label>
              <Input
                id={`channel-url-${index}`}
                value={channel.profileUrl}
                onChange={(e) => updateChannel(index, { profileUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addChannel} className="gap-2">
          <Plus className="h-4 w-4" />
          Добави социална мрежа
        </Button>
      </div>

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
