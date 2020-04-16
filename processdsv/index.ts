import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { AppConfiguration } from "read-appsettings-json";
import { Course } from "./course";

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    context.log('HTTP trigger function processed a request.');

    const account = AppConfiguration.Setting().accountName;
    const key = AppConfiguration.Setting().key;
    const endpoint  = AppConfiguration.Setting().endpoint;

    var azure = require('azure-storage');
    var tableService = azure.createTableService(account, key, endpoint);

    const table = AppConfiguration.Setting().table;

    await tableService.createTableIfNotExists(table, async function(error: any, result: { created: any; }, response: any) {
        if (!error) {
          // result contains true if created; false if already exists
          if(result.created){
            context.log('New table is created : ' + table);
          }
          else{
            context.log('Table already exists: ' + table);
          }
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
                await tableService.insertEntity(table, task,  function (error: any, result: any, response: any) {
                    if(!error){
                      // Entity inserted
                      if(result){
                        context.log('Entity created Row key - ' + task.RowKey + ' Partition key - ' + task.PartitionKey);
                      }
                    }
                  });
          });
          });

        }

      });
      context.res = {
        status: 200,
        body: "Cosmos DB - Table API example database is created."
    };
await tableService.retrieveEntity(table, "Computer System Architecture", "Greg Graffin", function(error, result, response){
  if(!error){
    var row = result;
  }
});

};

export default httpTrigger;

async function readdata (){
    return new Promise(async (resolve, reject) => {
        var courses = [];

        const csv = require('csv-parser');
        const fs = require('fs');
    
        await fs.createReadStream('courses.csv')
        .pipe(csv())
        .on('data', (item: { Subject: string; Instructor: string; Lectures: string; Labs: string; Points: string; IsWeekend: boolean; }) => {
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
