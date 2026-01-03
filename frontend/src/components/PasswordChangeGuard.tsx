import { useAuth } from "@/context/AuthContext";
import { ChangePasswordModal } from "./ChangePasswordModal";

export const PasswordChangeGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { requirePasswordChange, changePassword } = useAuth();

  if (requirePasswordChange) {
    return (
      <ChangePasswordModal
        isFirstTime={true}
        onClose={() => {}}
        onSubmit={changePassword}
      />
    );
  }

  return <>{children}</>;
};
