import { User } from "../models/User";
import { StorageProvider } from "../storage/StorageProvider";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";
import { api } from "../interceptors/authInterceptor";

class SecurityService extends EventTarget {
    private readonly keyToken: string;
    private readonly userKey: string;
    private user: User | null;
    private theAuthProvider: any;
    private storage: StorageProvider;

    constructor(storage: StorageProvider = new LocalStorageProvider()) {
        super();

        this.storage = storage;
        this.keyToken = "token";
        this.userKey = "user";
        this.user = this.loadStoredUser();
    }

    private loadStoredUser(): User | null {
        const storedUser = this.storage.getItem(this.userKey);

        if (!storedUser) {
            return null;
        }

        try {
            return JSON.parse(storedUser);
        } catch (error) {
            console.error("Error parsing stored user:", error);
            this.storage.removeItem(this.userKey);
            return null;
        }
    }

    async login(user: User) {
        console.log("📤 Enviando login request con datos:", JSON.stringify(user));
        try {
            const response = await api.post(`/auth/login`, user);
            console.log("✅ Response del backend:", response.data);
            if (response.status !== 200) {
                throw new Error(`Login failed with status ${response.status}`);
            }

            // Backend retorna: { message: "...", data: { user: {...}, access_token: "..." } }
            const data = response.data.data;

            console.log("✅ Datos extraídos:", data);

            this.user = data.user;

            this.storage.setItem(this.userKey, JSON.stringify(this.user));

            if (data?.access_token) {
                this.storage.setItem(this.keyToken, data.access_token);
            }

            store.dispatch(setUser(this.user));
            this.dispatchEvent(new CustomEvent("userChange", { detail: this.user }));

            return this.user;
        } catch (error: any) {
            console.error("❌ Error en login:", error.response?.data || error.message);
            throw error;
        }
    }

    getUser() {
        return this.user;
    }

    logout() {
        this.user = null;

        this.storage.removeItem(this.userKey);
        this.storage.removeItem(this.keyToken);

        this.dispatchEvent(new CustomEvent("userChange", { detail: null }));
        store.dispatch(setUser(null));
    }

    loginAsGuest() {
        const guestUser = {
            id: 0,
            name: 'Invitado',
            email: 'guest@example.com',
            role: 'guest'
        };

        this.user = guestUser;
        this.storage.setItem(this.userKey, JSON.stringify(guestUser));
        this.storage.setItem(this.keyToken, 'guest-token');

        store.dispatch(setUser(guestUser));
        this.dispatchEvent(new CustomEvent("userChange", { detail: guestUser }));
    }

    isAuthenticated() {
        return this.storage.getItem(this.keyToken) !== null;
    }

    getToken() {
        return this.storage.getItem(this.keyToken);
    }
}

export default new SecurityService();
/////