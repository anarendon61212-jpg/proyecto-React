// authInterceptor.ts

import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { LocalStorageProvider } from "../storage/LocalStorageProvider";
import { StorageProvider } from "../storage/StorageProvider";

export class AuthInterceptor {
    private api: AxiosInstance;
    private storage: StorageProvider;

    private EXCLUDED_ROUTES = ["/auth/login", "/auth/register"];

    constructor() {
        this.storage = new LocalStorageProvider();

        const rawBase = import.meta.env.VITE_API_URL || '';
        let normalizedBase = '';
        if (!rawBase) {
            normalizedBase = '/api';
        } else {
            // Ensure base URL ends with '/api' so service paths can be relative
            if (rawBase.endsWith('/api')) {
                normalizedBase = rawBase.replace(/\/$/, '');
            } else if (rawBase.endsWith('/')) {
                normalizedBase = `${rawBase.replace(/\/$/, '')}/api`;
            } else {
                normalizedBase = `${rawBase}/api`;
            }
        }

        this.api = axios.create({
            baseURL: normalizedBase,
            headers: { "Content-Type": "application/json" },
        });

        this.initializeInterceptors();
    }

    /**
     * Interceptor de request
     * - Agrega el token automáticamente si existe
     * - Evita rutas públicas
     */
    private handleRequest(config: InternalAxiosRequestConfig) {
        const token = this.storage.getItem("token");

        // Evitar agregar token en rutas excluidas
        if (this.EXCLUDED_ROUTES.some((route) => config.url?.includes(route))) {
            return config;
        }

        // Agregar header Authorization
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    }

    /**
     * Interceptor de errores
     * - Maneja sesiones expiradas (401)
     */
    private handleResponseError(error: any) {
        if (error.response?.status === 401) {
            console.log("No autorizado, redirigiendo a login...");
            window.location.href = "/auth/signin";
        }

        return Promise.reject(error);
    }

    /**
     * Inicializa interceptores
     */
    private initializeInterceptors() {
        this.api.interceptors.request.use(
            this.handleRequest.bind(this),
            (error) => Promise.reject(error)
        );

        this.api.interceptors.response.use(
            (response) => response,
            this.handleResponseError.bind(this)
        );
    }

    /**
     * Expone instancia de axios
     */
    public get instance(): AxiosInstance {
        return this.api;
    }
}

// Instancia global reutilizable
export const api = new AuthInterceptor().instance;

