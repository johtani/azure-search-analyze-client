# azure-search-analyze-client README

The Client for [Analyze API of Azure Cognitive Search](https://docs.microsoft.com/en-us/rest/api/searchservice/test-analyzer).
The client provides viewer of Analyze API Response.

## Features

* Send Analyze Request in editor and view response in another editor with webview
  * Parameters can be set in the file that has `.analyze` extension.
* Create `.analyze` file from template

## Usage

1. Open "Command Pallete", use 'Create Azure Search Analyze Request' command. Plugin open text editor with 5 parameter names.
2. Set following parameters in editor. All parameters are required.
   1. apiVersion - `?api-version=2019-05-06`. [See detail](https://docs.microsoft.com/en-us/rest/api/searchservice/search-service-api-versions)
   2. serviceName - Azure Cognitive Searche Service name. [See official reference](https://docs.microsoft.com/en-us/azure/search/search-create-service-portal#name-the-service)
   3. apiKey - API key for search service. [See official reference how to get](https://docs.microsoft.com/en-us/azure/search/search-create-service-portal#get-a-key-and-url-endpoint)
   4. indexName - Index name that contains the field you want to analyze.
   5. analyzerNames - A list of analyze names. It can be specified 1 or more analyzers. e.g. `["ja.lucene", "ja.microsoft"]`
   6. text - Target text of analyze API.

3. Click gray text `Analyze text with analyzers` in editor. So the plugin calls Analyze API with your parameters, then open the response of Analyze API in another column.

## Release Notes

Not release yet.

### 0.1.0

First release. This is alpha version.
This plugin only support `analyzer` parameter of Analyze API..



## LICENSE

See LICENSE file.