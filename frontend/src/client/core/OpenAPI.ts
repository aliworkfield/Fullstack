import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiRequestOptions } from './ApiRequestOptions';

type Headers = Record<string, string>;
type Middleware<T> = (value: T) => T | Promise<T>;
type Resolver<T> = (options: ApiRequestOptions<T>) => Promise<T>;

export class Interceptors<T> {
  _fns: Middleware<T>[];

  constructor() {
    this._fns = [];
  }

  eject(fn: Middleware<T>): void {
    const index = this._fns.indexOf(fn);
    if (index !== -1) {
      this._fns = [...this._fns.slice(0, index), ...this._fns.slice(index + 1)];
    }
  }

  use(fn: Middleware<T>): void {
    this._fns = [...this._fns, fn];
  }
}

export type OpenAPIConfig = {
	BASE: string;
	CREDENTIALS: 'include' | 'omit' | 'same-origin';
	ENCODE_PATH?: ((path: string) => string) | undefined;
	HEADERS?: Headers | Resolver<Headers> | undefined;
	PASSWORD?: string | Resolver<string> | undefined;
	TOKEN?: string | Resolver<string> | undefined;
	USERNAME?: string | Resolver<string> | undefined;
	VERSION: string;
	WITH_CREDENTIALS: boolean;
	interceptors: {
		request: Interceptors<AxiosRequestConfig>;
		response: Interceptors<AxiosResponse>;
	};
};

// Import keycloak here to get the token
import keycloak from '@/keycloak';
export const OpenAPI: OpenAPIConfig = {
	BASE: '',
	CREDENTIALS: 'include',
	ENCODE_PATH: undefined,
	HEADERS: undefined,
	PASSWORD: undefined,
	TOKEN: async () => {
		// Ensure the token is valid and refresh if needed
		if (!keycloak.token) {
			return ''; // Return empty string instead of undefined
		}
		
		// Check if token needs refresh
		try {
			const isTokenExpired = keycloak.isTokenExpired();
			if (isTokenExpired) {
				const refreshed = await keycloak.updateToken(5); // Refresh if expiring in 5 seconds
				if (!refreshed) {
					console.warn('Failed to refresh Keycloak token');
					return ''; // Return empty string instead of undefined
				}
			}
			return keycloak.token;
		} catch (error) {
			console.error('Error getting Keycloak token:', error);
			return ''; // Return empty string instead of undefined
		}
	},	USERNAME: undefined,
	VERSION: '0.1.0',
	WITH_CREDENTIALS: false,
	interceptors: {
		request: new Interceptors(),
		response: new Interceptors(),
	},
};