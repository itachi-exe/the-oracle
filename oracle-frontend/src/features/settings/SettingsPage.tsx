import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IdentityAvatar } from "@/components/ui/IdentityAvatar";
import { truncateAddress, useWalletStore } from "@/features/wallet/useWalletStore";
import { fetchProfile, updateProfile } from "@/lib/api";
import { demoAddress } from "@/lib/mockData";

export function SettingsPage() {
  const address = useWalletStore((s) => s.address) ?? demoAddress;
  const disconnect = useWalletStore((s) => s.disconnect);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notify, setNotify] = useState(true);
  const [displayNameDraft, setDisplayNameDraft] = useState<string | null>(null);

  const profile = useQuery({ queryKey: ["profile", address], queryFn: () => fetchProfile(address) });

  const save = useMutation({
    mutationFn: updateProfile,
    onSuccess: (saved) => queryClient.setQueryData(["profile", address], saved),
  });

  function handleDisconnect() {
    disconnect();
    navigate("/");
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !profile.data) return;
    const reader = new FileReader();
    reader.onload = () => save.mutate({ ...profile.data!, avatar: reader.result as string });
    reader.readAsDataURL(file);
  }

  function handleRemoveAvatar() {
    if (!profile.data) return;
    save.mutate({ ...profile.data, avatar: undefined });
  }

  function handleNameBlur() {
    if (!profile.data || displayNameDraft === null || displayNameDraft === profile.data.displayName) return;
    save.mutate({ ...profile.data, displayName: displayNameDraft });
  }

  if (profile.isLoading || !profile.data) {
    return <div className="p-7 text-sm text-ink-6">Loading…</div>;
  }

  const avatar = profile.data.avatar;

  return (
    <div className="flex flex-col gap-[22px] p-7" style={{ maxWidth: 520 }}>
      <div className="flex items-center gap-[18px]">
        <IdentityAvatar seed={address} size={64} src={avatar} />
        <div>
          <label className="inline-block cursor-pointer rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground">
            Upload avatar
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          {avatar && (
            <button
              type="button"
              onClick={handleRemoveAvatar}
              className="ml-2.5 inline-block cursor-pointer rounded-md border border-line-7 px-4 py-2 text-[13px] text-danger"
            >
              Remove avatar
            </button>
          )}
          <div className="mt-2 text-xs text-ink-7">PNG or JPG. Replaces your generated avatar everywhere.</div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-[13px] text-ink-5">Display name</div>
        <input
          defaultValue={profile.data.displayName}
          onChange={(e) => setDisplayNameDraft(e.target.value)}
          onBlur={handleNameBlur}
          className="w-full rounded-lg border border-line-5 bg-panel-2 px-3.5 py-[11px] text-sm text-ink-1 focus:outline-none"
        />
      </div>

      <div>
        <div className="mb-2 text-[13px] text-ink-5">Connected wallet</div>
        <div className="flex items-center justify-between rounded-lg border border-line-5 bg-panel-2 px-3.5 py-3">
          <span className="font-mono text-[13.5px] text-ink-3">{truncateAddress(address)}</span>
          <button type="button" onClick={handleDisconnect} className="cursor-pointer text-xs text-danger">
            Disconnect
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-line-2 pt-5">
        <span className="text-sm text-ink-2">Notifications on resolve</span>
        <button
          type="button"
          onClick={() => setNotify((n) => !n)}
          className="relative h-6 w-[42px] cursor-pointer rounded-full"
          style={{ background: notify ? "var(--color-ink-1)" : "var(--color-panel-3)" }}
          aria-pressed={notify}
        >
          <span
            className="absolute top-[3px] size-[18px] rounded-full bg-[#0c0c0c] transition-all"
            style={{ left: notify ? 21 : 3 }}
          />
        </button>
      </div>
    </div>
  );
}
