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


  const pool = new sql.ConnectionPool(config);
try{

  await pool
    .connect()
    .then(() => {
      console.log("connected");

      pool
        .request()
        .query("Select * from [dbo].[tableLoulis]")
        .then((result: any) => {
         
          console.log("all the data are: ");
          console.log(result);
         
          return result
          
        })
      })
      context.res = {
        status:200,
        body: 'result'
      }
  }catch(err){
    console.log(err);
    context.res = {
      status: 404,
      body: "db not found"
    };
  }
    
   

};

export default httpTrigger;
