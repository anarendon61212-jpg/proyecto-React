import { User } from "../models/User";
import { StorageProvider } from "../storage/StorageProvider";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import { store } from "../store/store";
import { setUser } from "../store/userSlice";
import { api } from "../interceptors/authInterceptor";
import { extractRoleFromObject } from "../utils/roleUtils";

class SecurityService extends EventTarget {
    private readonly keyToken: string;
    private readonly userKey: string;
    private user: User | null;
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
        console.log(" Enviando login request con datos:", JSON.stringify(user));
        try {
            const response = await api.post(`/auth/login`, user);
            console.log(" Response del backend:", response.data);
            if (response.status !== 200) {
                throw new Error(`Login failed with status ${response.status}`);
            }

            // Backend retorna estructura que puede variar, extraer usuario y token correctamente
            let userData, token;
            
            if (response.data.data) {
                // Estructura: { data: { user: {...}, access_token: "..." } }
                userData = response.data.data.user;
                token = response.data.data.access_token;
            } else if (response.data.user) {
                // Estructura: { user: {...}, access_token: "..." }
                userData = response.data.user;
                token = response.data.access_token;
            } else {
                // Estructura directa: { user: {...}, access_token: "..." }
                userData = response.data;
                token = response.data.access_token;
            }

            console.log(" Usuario extraído:", userData);
            console.log(" Token extraído:", token);

            const normalizedUser = {
                ...userData,
                role: extractRoleFromObject(userData) || "STUDENT",
            };

            this.user = normalizedUser;

            this.storage.setItem(this.userKey, JSON.stringify(this.user));

            if (token) {
                this.storage.setItem(this.keyToken, token);
            }

            store.dispatch(setUser(this.user));
            this.dispatchEvent(new CustomEvent("userChange", { detail: this.user }));

            return this.user;
        } catch (error: any) {
            console.error(" Error en login:", error.response?.data || error.message);
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
        const guestUser: User = {
            id: "0",
            email: 'guest@example.com',
            code: 'GUEST',
            role: 'STUDENT',
            is_active: true,
            profile: {
                first_name: 'Invitado',
                last_name: 'Sistema',
                identification: '0',
            }
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