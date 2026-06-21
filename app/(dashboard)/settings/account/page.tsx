"use client";

import { useState } from "react";
import { motion }   from "framer-motion";
import { User, Mail, Shield, LogOut, Check, Loader2, Camera } from "lucide-react";
import { useSession }  from "@/lib/auth/use-session";
import { GlassCard, Button, Input, Badge } from "@/components/ui";
import { QuantumOrb }  from "@/components/ui/QuantumOrb";
import toast from "react-hot-toast";

export default function AccountPage() {
  const { user, loading, signOut } = useSession();
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [name,    setName]    = useState(user?.name  ?? "");
  const [nameSet, setNameSet] = useState(false);

  // Sync name from session once loaded
  if (user && !nameSet) {
    setName(user.name);
    setNameSet(true);
  }

  const saveProfile = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings/profile", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name }),
      });
      setSaved(true);
      toast.success("Profile updated");
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={20} className="animate-spin text-violet-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto px-6 py-8 space-y-5">

        {/* Avatar section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="relative">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-violet-500/30"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-violet-800 flex items-center justify-center text-2xl font-bold text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                    {user?.name?.charAt(0)?.toUpperCase() ?? "A"}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[var(--color-surface-2)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer hover:bg-[var(--color-surface-3)] transition-colors">
                  <Camera size={11} className="text-[var(--color-text-muted)]" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-[15px] font-semibold text-[var(--color-text-primary)] truncate">
                  {user?.name ?? "AYRA User"}
                </h2>
                <p className="text-[12px] text-[var(--color-text-muted)] mt-0.5 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="violet" dot>Neon Auth</Badge>
                  <Badge variant="emerald" dot>Active</Badge>
                </div>
              </div>

              <QuantumOrb size={36} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Profile */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <User size={14} className="text-violet-400" />
              Profile
            </h3>
            <div className="space-y-4">
              <Input
                label="Display name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                leftIcon={<User size={13} />}
              />
              <Input
                label="Email address"
                value={user?.email ?? ""}
                readOnly
                leftIcon={<Mail size={13} />}
                className="opacity-60 cursor-not-allowed"
              />
              <p className="text-[11px] text-[var(--color-text-muted)]">
                Email is managed by Neon Auth and cannot be changed here.
              </p>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  loading={saving}
                  leftIcon={saved ? <Check size={13} /> : undefined}
                  onClick={saveProfile}
                >
                  {saved ? "Saved!" : "Save profile"}
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-6">
            <h3 className="text-[13px] font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Shield size={14} className="text-cyan-400" />
              Security
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2.5 border-b border-[rgba(255,255,255,0.05)]">
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--color-text-primary)]">Password</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Managed by Neon Auth
                  </p>
                </div>
                <Button variant="secondary" size="sm">Change</Button>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--color-text-primary)]">Sessions</p>
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                    Sign out all other devices
                  </p>
                </div>
                <Button variant="secondary" size="sm">Revoke all</Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">Sign out</p>
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  You'll be redirected to the sign-in page.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                leftIcon={<LogOut size={13} />}
                onClick={signOut}
              >
                Sign out
              </Button>
            </div>
          </GlassCard>
        </motion.div>

      </div>
    </div>
  );
}
