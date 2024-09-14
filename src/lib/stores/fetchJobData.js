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

async function fetchJobData(jobId, pdfId = null, dispatch) {
	try {
		let accessToken = getCookie('ea_access_token');

		if (!accessToken) {
			throw new Error('No access token found');
		}

		let url = `${BASE_URL}/api/job/${jobId}/`;
		if (pdfId) {
			url += `?pdf_id=${pdfId}`;
		}

		const fetchWithAuth = async (token) => {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${token}`
				}
			});

			if (response.status === 401) {
				const newToken = await refreshToken();
				return fetchWithAuth(newToken);
			}

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			return response.json();
		};

		const data = await fetchWithAuth(accessToken);

		const pdfs = data.pdfs;
		const selectedPdf = data.current_pdf;

		dispatch('jobDataFetched', data);

		toast.success('Job data fetched successfully');
		return { pdfs, selectedPdf, data };
	} catch (error) {
		console.error('Error fetching job data:', error);
		if (error.message === 'No access token found' || error.message === 'Failed to refresh token') {
			toast.error('Authentication failed. Please log in again.');
		} else {
			toast.error(`Failed to fetch job data: ${error.message}`);
		}
		throw error;
	}
}

export { fetchJobData };
