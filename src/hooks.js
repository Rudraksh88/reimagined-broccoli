import { redirect } from '@sveltejs/kit'

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	const accessToken = event.cookies.get('access_token')

	if (!accessToken && !event.url.pathname.startsWith('/login')) {
		throw redirect(303, '/login')
	}

	const response = await resolve(event)
	return response
}
