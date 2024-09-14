<script>
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { BASE_URL } from '$lib/constants';
	import { authStore } from '$lib/stores/authStore';

	let username = '';
	let password = '';

	$: if ($authStore.isAuthenticated) {
		goto('/');
	}

	async function handleSubmit() {
		if (!username || !password) {
			toast.error('Please fill in all required fields');
			return;
		}

		const endpoint = `${BASE_URL}/login/`;
		const body = { username, password };

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			});

			if (!response.ok) {
				throw new Error('Login request failed');
			}

			const data = await response.json();
			setCookie('ea_access_token', data.access, 1); // Set access token for 1 day
			setCookie('ea_refresh_token', data.refresh, 7); // Set refresh token for 7 days

			authStore.setUser({ username, isAuthenticated: true });

			toast.success('Login successful');
			goto('/'); // Redirect to home page
		} catch (error) {
			toast.error('Login failed');
		}
	}

	function setCookie(name, value, days) {
		let expires = '';
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = '; expires=' + date.toUTCString();
		}
		document.cookie = name + '=' + (value || '') + expires + '; path=/';
	}
</script>

<main class="container">
	<div class="">Login to EmailAgent</div>
	<form on:submit|preventDefault={handleSubmit} class="login-form">
		<div class="form-group">
			<label for="username">Username</label>
			<input type="text" id="username" bind:value={username} required />
		</div>
		<div class="form-group">
			<label for="password">Password</label>
			<input type="password" id="password" bind:value={password} required />
		</div>
		<button type="submit" class="login-btn">Login</button>
	</form>
</main>

<style>
	:global(body) {
		font-family: 'Roboto', sans-serif;
		background-color: #f4f7f9;
		margin: 0;
		padding: 0;
	}

	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100vh;
	}

	.title {
		font-size: 2rem;
		color: #333;
		margin-bottom: 1.5rem;
	}

	.login-form {
		background-color: #fff;
		border-radius: 10px;
		padding: 2rem;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 350px;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		font-size: 0.875rem;
		color: #555;
		margin-bottom: 0.5rem;
		display: block;
	}

	input {
		width: 100%;
		padding: 10px;
		border: 1px solid #ddd;
		border-radius: 5px;
		font-size: 1rem;
		background-color: #fafafa;
		outline: none;
	}

	input:focus {
		border-color: #007bff;
		box-shadow: 0 0 5px rgba(0, 123, 255, 0.2);
	}

	.login-btn {
		width: 100%;
		padding: 10px;
		background-color: black;
		color: white;
		border: none;
		border-radius: 5px;
		font-size: 1rem;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.login-btn:hover {
		background-color: #323232;
	}
</style>
