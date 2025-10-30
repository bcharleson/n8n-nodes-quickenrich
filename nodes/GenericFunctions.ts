import {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IHttpRequestOptions,
	IHttpRequestMethods,
	IDataObject,
	NodeApiError,
} from 'n8n-workflow';

/**
 * Normalize a URL by removing protocol and www prefix
 * Examples:
 * - http://www.topoffunnel.com -> topoffunnel.com
 * - https://topoffunnel.com -> topoffunnel.com
 * - www.topoffunnel.com -> topoffunnel.com
 * - topoffunnel.com -> topoffunnel.com
 */
export function normalizeUrl(url: string): string {
	if (!url) return url;

	// Remove protocol (http://, https://)
	let normalized = url.replace(/^https?:\/\//, '');

	// Remove www. prefix
	normalized = normalized.replace(/^www\./, '');

	// Remove trailing slash
	normalized = normalized.replace(/\/$/, '');

	return normalized;
}

/**
 * Make an API request to QuickEnrich
 */
export async function quickEnrichApiRequest(
	this: IHookFunctions | IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
): Promise<any> {
	const options: IHttpRequestOptions = {
		method,
		url: `https://app.quickenrich.io${endpoint}`,
		headers: {
			'Accept': 'application/json',
		},
		qs: {
			...qs,
		},
		json: true,
	};

	// Only set Content-Type and include body for requests that have data
	if (Object.keys(body).length > 0) {
		options.headers!['Content-Type'] = 'application/json';
		options.body = body;
	}

	try {
		const response = await this.helpers.httpRequestWithAuthentication.call(
			this,
			'quickEnrichApi',
			options,
		);

		// QuickEnrich API returns responses in format: { success, message, code, data }
		// Extract and return the data field if it exists
		if (response && typeof response === 'object') {
			if (response.success === false) {
				// Handle 404 (not found) as a valid empty result for search operations
				if (response.code === 404) {
					return {
						success: false,
						message: response.message || 'Employee not found',
						data: null,
					};
				}

				// Handle other API error responses
				const errorMessage = response.message || 'Unknown error occurred';
				const errorCode = response.code || 500;
				throw new NodeApiError(this.getNode(), {
					message: errorMessage,
					description: `QuickEnrich API error (${errorCode})`,
				});
			}
			// Return the data field if it exists, otherwise return the full response
			return response.data || response;
		}

		return response;
	} catch (error) {
		// Handle HTTP errors
		if (error instanceof NodeApiError) {
			throw error;
		}

		const err = error as any;
		if (err.response) {
			const statusCode = err.response.statusCode || err.statusCode;
			const errorBody = err.response.body || {};

			// Handle specific error codes
			if (statusCode === 401) {
				throw new NodeApiError(this.getNode(), {
					message: 'Invalid API key',
					description: 'Please check your QuickEnrich API key in the credentials.',
				});
			} else if (statusCode === 429) {
				throw new NodeApiError(this.getNode(), {
					message: 'Rate limit exceeded',
					description: 'You have exceeded the API rate limit. Please try again later.',
				});
			} else if (statusCode === 404) {
				// Handle 404 (not found) as a valid empty result for search operations
				return {
					success: false,
					message: errorBody.message || 'Employee not found',
					data: null,
				};
			} else if (statusCode === 400) {
				const message = errorBody.message || 'Invalid request parameters';
				throw new NodeApiError(this.getNode(), {
					message,
					description: 'Please check your search parameters and try again.',
				});
			}

			// Generic error handling
			const message = errorBody.message || err.message || 'Unknown error occurred';
			throw new NodeApiError(this.getNode(), {
				message: `QuickEnrich API error [${statusCode}]: ${message}`,
			});
		}

		throw error;
	}
}

