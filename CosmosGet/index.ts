import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

const endpoint = ""; // Add your endpoint
const key =""; // Add the masterkey of the endpoint
const client = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    // client.databases.createIfNotExists({id: 'xaxa-DB'})
    //     client.database('xaxa-DB').containers.createIfNotExists({ id: 'xaxa-CONT' })

  try {
      client
        .database("xaxaDB")
        .container("xaxaCONT")
        .items.readAll().fetchAll()
        .then(data => {
          console.log(data);
        })
        .catch(e => {
          console.log(e);
        });
      context.res = {
        status: 201,
        body: "item found"
      };
   
  } catch (err) {
    console.log(err);
    context.res = {
      status: 404,
      body: "db not found"
    };
  }

};

export default httpTrigger;