import * as azure from "azure-storage";
import { CosmosClient } from "@azure/cosmos";
import * as settings from "./azureSettings";

const endpoint = settings.settings.endpoint; // Add your endpoint
const key = settings.settings.key;
const client = new CosmosClient({ endpoint, key });

const connString = settings.settings.connectionString;

const fileService = azure.createBlobService(connString);
const dir1 = "blob";
const db = "DB";
const container = "CONT";
fileService.createContainerIfNotExists(dir1, (err, data) => {
  if (err) {
    console.log(err);
  }
  console.log("blob container created");
  console.log(dir1);
});

const uplodFilesToAzure =  (
  filename: any,
  filepath: any,
  mimetype: any
) => {
  return new Promise( async resolve=>{

  fileService.createBlockBlobFromLocalFile(
    dir1,
    filename,
    filepath,
    (err, data) => {
      if (err) {
        console.log(err);
      }
    }
  );
  console.log("azure uploaded");

  const url = fileService.getUrl(dir1, filename, settings.settings.sasToken, true);

  


  client.databases.createIfNotExists({ id: db });
  client.database(db).containers.createIfNotExists({ id: container });

  const results = {
    filename,
    directory: `blob_storage--${dir1}`,
    mimetype
  };

  try {
    await client
      .database(db)
      .container(container)
      .items.create(results)
      .then(data => {
        console.log(data);
      })
      .catch(e => {
        console.log(e);
      });

      resolve('azure cosmos done')
  } catch (err) {
    console.log(err);

  }
})
};

export { uplodFilesToAzure };
