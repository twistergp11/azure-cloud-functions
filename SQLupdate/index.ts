import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as sql from "mssql";

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
 
  const config = {
    server: "",
    database: "",
    user: "",
    password: "" 
  };

  try {
  if (req.body.id != null && req.body.age != null) {
      const query = "UPDATE [dbo].[tableLoulis] SET age = @age WHERE id = @id";
      const pool = new sql.ConnectionPool(config);
    await  pool
        .connect()
        .then(() => {
          console.log("connected");

          pool
            .request()
            .input("id", sql.Int, req.body.id)
            .input("age", sql.Int, req.body.age)
            .query(query);
        })
        context.res = {
          status: 200,
          body: "successfully updated"
        };
      } else {
        console.log("All fields are required!");
        context.res = {
          status: 400,
          body: "All fields are required!"
        };
      }
    } catch (err) {
      context.res = {
        status: 404,
        body: "db not found"
      };
      console.log(err);
    }
    
};

export default httpTrigger;
