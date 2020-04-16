# Azure function to store csv data in Cosmos DB - Table API

This is a http trigger function written in Typescript in Visual Studio Code. It processed a csv file and store the data on Cosmos DB

## Technology stack  
* Typescript version 3.8.3 https://www.npmjs.com/package/typescript
* Azure functions version 1.2 
* Azure Storage 2.10.3 to connect to the Cosmos DB Table API
* CSV Parser version 2.3.2 to parse the csv content
* File stream 0.0.1 to read the csv file

## Code snippets
### Retrieve the database storage account
