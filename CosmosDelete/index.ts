import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { CosmosClient } from "@azure/cosmos";

const endpoint = ""; // Add your endpoint
const key =""; // Add the masterkey of the endpoint

const client = new CosmosClient({ endpoint, key });

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    if (req.body.id) {
      await client
        .database("xaxaDB")
        .container("xaxaCONT")
        .item(req.query.id)
        .delete();
      context.res = {
        status: 200,
        body: "deleted"
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
};

export default httpTrigger;
