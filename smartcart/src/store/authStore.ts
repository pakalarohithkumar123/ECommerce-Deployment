import { create } from "zustand";
import type {
    AuthResponse
} from "../types/auth";
interface AuthStore {
    user: AuthResponse | null;
    login: (
        user: AuthResponse
    ) => void;
    logout: () => void;
}
export const useAuthStore =
    create<AuthStore>((set) => ({
        user: null,
        login: (
            user
        ) => {
            set({
                user: user
            });
        },
        logout: () => {
            set({
                user: null
            });
        }
    }));
