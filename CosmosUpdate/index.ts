import { AzureFunction, Context, HttpRequest } from "@azure/functions"
import { CosmosClient } from "@azure/cosmos";

const endpoint = ""; // Add your endpoint
const key =""; // Add the masterkey of the endpoint

const client = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    if (req.query.id && req.body.id) {
      await client
        .database("xaxaDB")
        .container("xaxaCONT")
        .item(req.query.id)
        .replace(req.body)
      context.res = {
        status: 200,
        body: "updated"
      };
    } else {
      context.res = {
        status: 400,
        body: "id is required both in req.query and req.body"
      };
    }
  } catch (err) {
    console.log(err);
    context.res = {
      status: 404,
      body: "db not found"
    };
  }
};

export default httpTrigger;