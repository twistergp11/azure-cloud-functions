import { AzureFunction, Context } from "@azure/functions";
import csv from "csv-parser";
import * as azure from "azure-storage";
import * as stream from "stream";

// in this method i enable this trigger 
// when a file is uploaded in the blobFiles storage
// and parse it  as csv

const tableName = 'outcome';

const blobTrigger: AzureFunction = async function(
  context: Context,
  myBlob: any
): Promise<void> {
  const entGen = azure.TableUtilities.entityGenerator;

  const tableService = azure.createTableService(
    "CONNECTION_STRING"
  );

  tableService.createTableIfNotExists(tableName, (err, data) => {
    if (err) console.log("err service", err);
    console.log("table created ");
  });

  //what this trigger gets from blobFiles (that's how i named my storage folder)
  // is a type buffer, so you have to make this buffer into stream in order to parse it!

  const bufferStream = new stream.PassThrough();

  bufferStream.end(new Buffer(myBlob));

  let results: any[] = [];
  bufferStream
    .pipe(csv())
    .on("data", (data: any) => results.push(data))
    .on("end", async () => {

      // code here....

     const dataFromCsv = {
         // your parsed data
        };

        tableService.insertOrReplaceEntity(tableName, dataFromCsv, (err, data) => {
          if (err){
            console.log("err123 ", err);
          } 
          console.log("data added successfully!!");
        });
      
    });
};

export default blobTrigger;
