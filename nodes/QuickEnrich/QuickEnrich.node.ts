import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

import { quickEnrichApiRequest } from '../GenericFunctions';

export class QuickEnrich implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'QuickEnrich',
		name: 'quickEnrich',
		icon: 'file:quickenrich.svg',
		group: ['transform'],
		version: 1,
		subtitle: 'Search Employee Data',
		description: 'Search for employee data using QuickEnrich API',
		defaults: {
			name: 'QuickEnrich',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'quickEnrichApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Employee',
						value: 'employee',
					},
				],
				default: 'employee',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['employee'],
					},
				},
				options: [
					{
						name: 'Search',
						value: 'search',
						description: 'Search for employee data',
						action: 'Search employee data',
					},
				],
				default: 'search',
			},
			{
				displayName: 'Search Method',
				name: 'searchMethod',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['search'],
					},
				},
				options: [
					{
						name: 'LinkedIn URL',
						value: 'linkedin',
						description: 'Search by LinkedIn profile URL (exact match)',
					},
					{
						name: 'Company + Name',
						value: 'company',
						description: 'Search by company URL, first name, and last name (all exact matches)',
					},
				],
				default: 'linkedin',
				description: 'Choose how to search for employee data',
			},
			// LinkedIn URL Search Parameters
			{
				displayName: 'LinkedIn URL',
				name: 'linkedinUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['search'],
						searchMethod: ['linkedin'],
					},
				},
				default: '',
				required: true,
				placeholder: 'https://linkedin.com/in/johndoe',
				description: 'The LinkedIn profile URL to search for (exact match required)',
			},
			// Company + Name Search Parameters
			{
				displayName: 'Company URL',
				name: 'companyUrl',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['search'],
						searchMethod: ['company'],
					},
				},
				default: '',
				required: true,
				placeholder: 'https://techcorp.com',
				description: 'The company website URL (exact match required)',
			},
			{
				displayName: 'First Name',
				name: 'firstName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['search'],
						searchMethod: ['company'],
					},
				},
				default: '',
				required: true,
				placeholder: 'John',
				description: 'Employee first name (exact match required)',
			},
			{
				displayName: 'Last Name',
				name: 'lastName',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['employee'],
						operation: ['search'],
						searchMethod: ['company'],
					},
				},
				default: '',
				required: true,
				placeholder: 'Doe',
				description: 'Employee last name (exact match required)',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'employee' && operation === 'search') {
					const searchMethod = this.getNodeParameter('searchMethod', i) as string;
					const queryParams: any = {};

					if (searchMethod === 'linkedin') {
						const linkedinUrl = this.getNodeParameter('linkedinUrl', i) as string;
						
						if (!linkedinUrl || linkedinUrl.trim() === '') {
							throw new NodeOperationError(
								this.getNode(),
								'LinkedIn URL is required for LinkedIn search method',
								{ itemIndex: i },
							);
						}

						queryParams.linkedin_url = linkedinUrl.trim();
					} else if (searchMethod === 'company') {
						const companyUrl = this.getNodeParameter('companyUrl', i) as string;
						const firstName = this.getNodeParameter('firstName', i) as string;
						const lastName = this.getNodeParameter('lastName', i) as string;

						if (!companyUrl || companyUrl.trim() === '') {
							throw new NodeOperationError(
								this.getNode(),
								'Company URL is required for company search method',
								{ itemIndex: i },
							);
						}

						if (!firstName || firstName.trim() === '') {
							throw new NodeOperationError(
								this.getNode(),
								'First Name is required for company search method',
								{ itemIndex: i },
							);
						}

						if (!lastName || lastName.trim() === '') {
							throw new NodeOperationError(
								this.getNode(),
								'Last Name is required for company search method',
								{ itemIndex: i },
							);
						}

						queryParams.company_url = companyUrl.trim();
						queryParams.first_name = firstName.trim();
						queryParams.last_name = lastName.trim();
					}

					// Make the API request
					const responseData = await quickEnrichApiRequest.call(
						this,
						'GET',
						'/api/employees/search',
						{},
						queryParams,
					);

					const executionData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray(responseData),
						{ itemData: { item: i } },
					);

					returnData.push(...executionData);
				}
			} catch (error) {
				if (this.continueOnFail()) {
					const executionData = this.helpers.constructExecutionMetaData(
						[{ json: { error: (error as Error).message } }],
						{ itemData: { item: i } },
					);
					returnData.push(...executionData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}

