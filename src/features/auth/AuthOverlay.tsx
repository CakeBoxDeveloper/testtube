"use client";

import { Modal } from "@/components/ui/Modal";
import { useAuthOverlayStore } from "@/stores/useAuthOverlayStore";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { LogoutForm } from "./LogoutForm";

export function AuthOverlay() {
  const open = useAuthOverlayStore((s) => s.open);
  const mode = useAuthOverlayStore((s) => s.mode);
  const setMode = useAuthOverlayStore((s) => s.setMode);
  const close = useAuthOverlayStore((s) => s.close);

  return (
    <Modal open={open} onClose={close}>
      {mode === "login" && (
        <LoginForm onSuccess={close} onSwitchToRegister={() => setMode("register")} />
      )}
      {mode === "register" && (
        <RegisterForm onSuccess={close} onSwitchToLogin={() => setMode("login")} />
      )}
      {mode === "logout" && <LogoutForm onClose={close} />}
    </Modal>
  );
}
