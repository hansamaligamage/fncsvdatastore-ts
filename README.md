# Azure function to store csv data in Cosmos DB - Table API

This is a http trigger function written in Typescript in Visual Studio Code. It processed a csv file and store the data on Cosmos DB

## Technology stack  
* Typescript version 3.8.3 https://www.npmjs.com/package/typescript
* Azure functions for typescript version 1.2 https://www.npmjs.com/package/@azure/functions 
* Azure Storage 2.10.3 to connect to the Cosmos DB Table API https://www.npmjs.com/package/azure-storage
* CSV Parser version 2.3.2 to convert the csv content to json https://www.npmjs.com/package/csv-parser
* File stream 0.0.1 to read the csv file https://www.npmjs.com/package/fs

## Code snippets
### Create Azure Table service
```
    const account = AppConfiguration.Setting().accountName;
    const key = AppConfiguration.Setting().key;
    const endpoint  = AppConfiguration.Setting().endpoint;

    var azure = require('azure-storage');
    var tableService = azure.createTableService(account, key, endpoint);
```

### Create Table
```
    const table = AppConfiguration.Setting().table;

    await tableService.createTableIfNotExists(table, async function(error: any, result: { created: any; }, 
        response: any) {
        if (!error) {
          // result contains true if created; false if already exists
          if(result.created){
            context.log('New table is created : ' + table);
          }
          else{
            context.log('Table already exists: ' + table);
          }
        
          });
  ```
  
  ### Read the csv file
  ```
  async function readdata (){
        return new Promise(async (resolve, reject) => {
        var courses = [];

        const csv = require('csv-parser');
        const fs = require('fs');
    
        await fs.createReadStream('courses.csv')
        .pipe(csv())
        .on('data', (item: { Subject: string; Instructor: string; Lectures: string; Labs: string; Points: string;
            IsWeekend: boolean; }) => {
            console.log(item);
            var course = new Course();
            course.Subject = item.Subject;
            course.Instructor = item.Instructor;
            course.Lectures = item.Lectures;
            course.Labs = item.Labs;
            course.Points = item.Points;
            course.IsWeekend = item.IsWeekend;
            courses.push(course);
      }).on('end', () => {
            console.log('CSV file successfully processed');
      resolve(courses);
      });
    });
}
  ```
  
  ### Create table schema
  ```
     await readdata().then(result => {
     var entityGenerator = azure.TableUtilities.entityGenerator;
     let courses = result as Course[];
     courses.forEach(async element => {
     var task = {
        PartitionKey: entityGenerator.String(element.Subject),
        RowKey: entityGenerator.String(element.Instructor),
        lectures: entityGenerator.String(element.Lectures),
        labs: entityGenerator.String(element.Labs),
        points : entityGenerator.String(element.Points),
        isWeekend : entityGenerator.String(element.IsWeekend)
        };
 });
});
  ```
  
### Insert a row
```
    await tableService.insertEntity(table, task,  function (error: any, result: any, response: any) {
    if(!error){
        // Entity inserted
        if(result){
            context.log('Entity created Row key - ' + task.RowKey + ' Partition key - ' + task.PartitionKey);
         }
   }
});
 ```
 
 ### Read an entity from table API
 ```
  await tableService.retrieveEntity(table, "Computer System Architecture", "Greg Graffin", 
      function(error, result, response){
    if(!error){
      var row = result;
    }
});
 ```
