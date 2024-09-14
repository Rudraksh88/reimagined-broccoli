import { toast } from 'svelte-sonner';
import { BASE_URL } from '$lib/constants';

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

async function refreshToken() {
	const refreshToken = getCookie('ea_refresh_token');
	if (!refreshToken) {
		throw new Error('No refresh token available');
	}

	const response = await fetch(`${BASE_URL}/refresh/`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ refresh: refreshToken })
	});

	if (!response.ok) {
		throw new Error('Failed to refresh token');
	}

	const data = await response.json();
	document.cookie = `ea_access_token=${data.access}; path=/; max-age=${60 * 60 * 24}`; // 1 day
	document.cookie = `ea_refresh_token=${data.refresh}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days

	return data.access;
}

async function fetchEmails() {
	try {
		let accessToken = getCookie('ea_access_token');

		if (!accessToken) {
			throw new Error('No access token found');
		}

		const response = await fetch(`${BASE_URL}/api/dashboard/`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (response.status === 401) {
			accessToken = await refreshToken();
			return fetchEmails();
		}

		if (!response.ok) {
			throw new Error('Network response was not ok');
		}

		const data = await response.json();
		console.log(data.status);
		toast.success('Emails fetch triggered successfully');
		return data;
	} catch (error) {
		console.error('There was a problem with the fetch operation:', error);
		if (error.message === 'No access token found' || error.message === 'Failed to refresh token') {
			toast.error('Authentication failed. Please log in again.');
		} else {
			toast.error('Failed to fetch emails. Please try again later.');
		}
		throw error;
	}
}

export { fetchEmails };
