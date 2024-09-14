import { writable } from 'svelte/store';
import { BASE_URL } from '$lib/constants';

export const jobStore = writable({
	pending: [],
	inProcess: [],
	completed: [],
	error: [],
	sent: [],
})

let retryCount = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getListKeyForStatus(status) {
	switch (status) {
		case 'PENDING':
			return 'pending'
		case 'PROCESSING':
			return 'inProcess'
		case 'COMPLETED':
			return 'completed'
		case 'FAILED':
			return 'error'
		case 'SENT':
			return 'sent'
		default:
			return 'pending'
	}
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchWithRetry(url, options) {
	try {
		const response = await fetch(url, options);
		if (!response.ok) {
			if (response.status === 401) {
				// Token might be expired, try to refresh
				await refreshToken();
				// Retry the original request with the new token
				return fetchWithRetry(url, options);
			}
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		retryCount = 0; // Reset retry count on successful fetch
		return await response.json();
	} catch (error) {
		if (retryCount < MAX_RETRIES) {
			retryCount++;
			console.log(`Retrying fetch (${retryCount}/${MAX_RETRIES})...`);
			await delay(RETRY_DELAY);
			return fetchWithRetry(url, options);
		} else {
			console.error('Max retries exceeded:', error);
			console.log('Please refresh the page.');
			throw error;
		}
	}
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
}

export async function fetchJobs() {
	const url = `${BASE_URL}/api/dashboard/`;
	const accessToken = getCookie('ea_access_token');

	if (!accessToken) {
		console.error('No access token found');
		return;
	}

	const fetchOptions = {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		credentials: 'include'
	};

	try {
		const data = await fetchWithRetry(url, fetchOptions);
		jobStore.update((currentData) => {
			const newData = {
				pending: [],
				inProcess: [],
				completed: [],
				error: [],
				sent: [],
			}

			for (const job of data.jobs) {
				const updatedJob = {
					id: job.id,
					status: job.status,
					created_at: job.created_at,
					started_at: job.started_at,
					completed_at: job.completed_at,
					email_id: job.email_id,
					email_subject: job.email_subject,
					file_count: job.file_count,
					elapsed:
						job.status === 'PROCESSING' ? Date.now() - new Date(job.started_at).getTime() : null
				};

				// Update the job's elapsed time
				if (job.status === 'PROCESSING' && job.started_at) {
					const startedDate = new Date(job.started_at);
					const now = new Date();
					const elapsed = now - startedDate;
					console.log(`Job ${job.id} has been running for ${elapsed}ms`);
				}

				// Add the job to the appropriate list
				const listKey = getListKeyForStatus(job.status);
				newData[listKey].push(updatedJob);
			}

			// Sort each list
			for (const key in newData) {
				newData[key].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
			}

			return newData;
		});
	} catch (error) {
		console.error('Error fetching jobs:', error);
	}
}
