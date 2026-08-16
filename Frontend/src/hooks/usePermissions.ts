import { useAppSelector } from "@/store/hooks";

export function usePermissions() {
    const status = useAppSelector((state) => state.auth.status);
    const role = useAppSelector((state) => state.auth.userData?.role);

    return {
        isGuest: !status,
        isAdmin: role === "ADMIN",
        isRegularUser: status && role !== "ADMIN",
        canSubmitFeedback: status && role !== "ADMIN",
    };
}
