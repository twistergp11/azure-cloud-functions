import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const endpoint = ""; // Add your endpoint
const key =
  ""; // Add the masterkey of the endpoint
const client = new CosmosClient({ endpoint, key });




const httpTrigger: AzureFunction = async function(
    context: Context,
    req: HttpRequest
    ): Promise<void> {
        
        client.databases.createIfNotExists({id: 'xaxaDB'})
        client.database('xaxaDB').containers.createIfNotExists({ id: 'xaxaCONT' })

  try {
    if (req.body.id) {
      client
        .database("xaxaDB")
        .container("xaxaCONT")
        .items.create(req.body)
        .then(data => {
          console.log(data);
        })
        .catch(e => {
          console.log(e);
        });
      context.res = {
        status: 201,
        body: "item created"
      };
    } else {
      context.res = {
        status: 400,
        body: "id is required"
      };
    }
  } catch (err) {
    console.log(err);
    context.res = {
      status: 404,
      body: "db not found"
    };
  }
  context.res={
    status:200,
    body: 'data successfully added!!'
  }
};

export default httpTrigger;
