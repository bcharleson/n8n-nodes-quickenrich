# n8n-nodes-quickenrich

This is an n8n community node for integrating with the [QuickEnrich](https://quickenrich.io) API. It provides access to QuickEnrich's email enrichment and employee data search platform, allowing you to find employee contact information directly from n8n workflows.

## Installation

### Community Nodes (Recommended)

For users on n8n v0.187.0+, install directly through the n8n interface:

1. Go to **Settings > Community Nodes**
2. Click **Install**
3. Enter `n8n-nodes-quickenrich`
4. Click **Download**

### Manual Installation

```bash
npm install n8n-nodes-quickenrich
```

## Quick Setup

1. **Get API Key**: Go to [QuickEnrich Dashboard](https://app.quickenrich.io) → Settings → API
2. **Add Node**: In n8n, search for "QuickEnrich" in the node palette
3. **Configure Credentials**: Enter your QuickEnrich API key
4. **Select Search Method**: Choose between LinkedIn URL or Company + Name search

## Features

🔍 **Employee Data Search**: Find employee contact information using two search methods
📧 **Email Enrichment**: Get verified email addresses and contact details
🎯 **Exact Match Search**: Precise matching using LinkedIn URLs or company + name combinations
⚡ **Simple Integration**: Single-endpoint API with straightforward parameters
🔒 **Secure Authentication**: API key-based authentication with proper credential management

## Supported Operations

### 🔍 **Employee Search**

Search for employee data using one of two methods:

#### Method 1: LinkedIn URL Search
- **LinkedIn URL**: Search by LinkedIn profile URL (exact match)
- Returns complete employee profile including email, phone, title, and company information

#### Method 2: Company + Name Search
- **Company URL**: Company website URL (exact match)
- **First Name**: Employee first name (exact match)
- **Last Name**: Employee last name (exact match)
- Returns complete employee profile when all three parameters match

### Response Data

The node returns comprehensive employee information including:
- First Name
- Last Name
- Job Title
- Email Address
- Phone Number
- LinkedIn Profile URL
- Email Verification Date
- Company URL
- Company Name
- Email Domain

## Usage Examples

### Example 1: Search by LinkedIn URL

```
Input:
- Search Method: LinkedIn URL
- LinkedIn URL: https://linkedin.com/in/johndoe

Output:
{
  "first_name": "John",
  "last_name": "Doe",
  "title": "Senior Software Engineer",
  "email": "john.doe@company.com",
  "employee_phone": "+1-555-0123",
  "employee_linkedin": "https://linkedin.com/in/johndoe",
  "email_verification_date": "2024-01-15",
  "company_url": "https://techcorp.com",
  "company_name": "Tech Corp",
  "email_domain": "company.com"
}
```

### Example 2: Search by Company + Name

```
Input:
- Search Method: Company + Name
- Company URL: https://techcorp.com
- First Name: John
- Last Name: Doe

Output:
{
  "first_name": "John",
  "last_name": "Doe",
  "title": "Senior Software Engineer",
  "email": "john.doe@company.com",
  ...
}
```

### Example 3: Bulk Enrichment Workflow

1. **Trigger**: Schedule or webhook
2. **Read CSV**: Load list of LinkedIn URLs
3. **QuickEnrich**: Search employee data for each URL
4. **Filter**: Remove entries without email addresses
5. **Write to Database**: Store enriched data

## Error Handling

The node handles common API errors gracefully:

- **401 Unauthorized**: Invalid API key - check your credentials
- **429 Too Many Requests**: Rate limit exceeded (1000 requests/minute)
- **400 Bad Request**: Invalid parameters or missing required fields

Enable "Continue on Fail" in the node settings to handle errors without stopping the workflow.

## Requirements

- n8n v0.187.0 or higher
- QuickEnrich account with API access
- Valid QuickEnrich API key

## API Documentation

For detailed API information, visit the [QuickEnrich API Documentation](https://app.quickenrich.io/docs).

## Rate Limits

- Default: 1000 requests per minute per API key
- Rate limit information is included in response headers
- Contact QuickEnrich support for custom rate limits

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/bcharleson/n8n-nodes-quickenrich/issues)
- **Email**: 170791+bcharleson@users.noreply.github.com

## License

[MIT](LICENSE.md)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Changelog

### 0.1.0 (Initial Release)
- Employee search by LinkedIn URL
- Employee search by Company + Name
- Comprehensive error handling
- Rate limit support
- Full API response data

