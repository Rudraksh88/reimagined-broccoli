import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { BASE_URL } from '$lib/constants';

function createAuthStore() {
	const { subscribe, set, update } = writable({
		isAuthenticated: false,
		username: null
	});

	// Helper function to get cookie value
	function getCookie(name) {
		if (!browser) return null;
		const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
		if (match) return match[2];
		return null;
	}

	return {
		subscribe,
		setUser: (user) => set(user),
		logout: () => {
			set({ isAuthenticated: false });
			if (browser) {
				document.cookie = 'ea_access_token=; Max-Age=-99999999;';
				document.cookie = 'ea_refresh_token=; Max-Age=-99999999;';
			}
		},
		checkAuth: async () => {
			if (browser) {
				const token = getCookie('ea_access_token'); // Get token from cookie
				if (token) {
					try {
						set({ isAuthenticated: true });
					} catch (error) {
						console.error('Error verifying token:', error);
					}
				} else {
					// If no access token, log out
					this.logout();
				}
			}
		}
	};
}

export const authStore = createAuthStore();

export async function refreshToken() {
	if (browser) {
		const refreshToken = getCookie('ea_refresh_token'); // Get refresh token from cookie
		if (refreshToken) {
			try {
				const response = await fetch(`${BASE_URL}/api/refresh/`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ refresh: refreshToken })
				});
				if (response.ok) {
					const data = await response.json();
					document.cookie = `ea_access_token=${data.access}; path=/`;
					document.cookie = `ea_refresh_token=${data.refresh}; path=/`;
					authStore.setUser({ isAuthenticated: true, username: 'User' });
					return true;
				}
			} catch (error) {
				console.error('Token refresh error:', error);
			}
		}
	}
	authStore.logout();
	return false;
}

export function logout() {
	authStore.logout();
}

// Initialize auth state
if (browser) {
	authStore.checkAuth();
}
