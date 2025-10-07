import {
	IAuthenticateGeneric,
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class QuickEnrichApi implements ICredentialType {
	name = 'quickEnrichApi';
	displayName = 'QuickEnrich API';
	documentationUrl = 'https://app.quickenrich.io/docs';
	icon = 'file:quickenrich.svg' as const;
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your QuickEnrich API key. You can find this in your QuickEnrich dashboard under Settings > API.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Authorization': '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://app.quickenrich.io',
			url: '/api/employees/search',
			method: 'GET',
			qs: {
				linkedin_url: 'https://www.linkedin.com/in/test',
			},
		},
	};
}

