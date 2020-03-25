import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as azure from "azure-storage";
import { tmpdir } from "os";
import { createWriteStream } from "fs";
import { join } from "path";
import * as Busboy from "busboy";
import {uplodFilesToAzure} from './azure'

const httpTrigger: AzureFunction = async function(
  context: Context,
  req: HttpRequest
): Promise<void> {
  const busboy = new Busboy({ headers: req.headers });

  // Array of Promises -> files while downloading to tmpdir
  const uploadingFiles: Promise<any>[] = [];

  // for every file
  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const filepath = join(tmpdir(), filename);

    uploadingFiles.push(
      new Promise(resolve => {
        file.pipe(createWriteStream(filepath)).on("close", () => {
          resolve({
            filename,
            filepath,
            mimetype,
            encoding,
            success: true
          });
        });
        // in order not to fail the Promise.all()
        // return the file's data which failed
      }).catch(err => {
        console.error(`The Error in UploadFiles is ----> ${err}`);
        console.error(`The Error in UploadFiles is ----> ${err.message}`);
        return {
          filename,
          filepath,
          mimetype,
          success: false
        };
      })
    );
  });

  // resolving other type of data ex. an object
  busboy.on("field", async function(fieldname, val) {
    req.body[fieldname] = val;
  });

  // after parsing all files & fields
  busboy.on("finish", async () => {
    console.log(`busboy on finish started`);

    try {
      // Array where filedata are included
      const files = await Promise.all(uploadingFiles);
      // we continue ONLY AFTER all FILES are downloaded
      files.forEach(async ({ filename, filepath, mimetype }) => {
        // for every file, each file is uploaded
        // from the local tmp dir to the storage
        console.log("length ", filepath.length);

        uplodFilesToAzure(filename, filepath, mimetype)
      
      })


      //   console.log("context-res", context.res);
    } catch (err) {
      console.log("err is", err);
      if (err instanceof Error) {
        console.log(`${err.name}.${err.message}`, err);
      }
    }
  });

  // the entire request body
  // preparsed by firebase
  busboy.end(req.rawBody);
  context.res = {
    status: 200,
    body: "files uploaded successfully!!"
  };

  //   console.log('req121212121', req);
  //   console.log('context', context);

  // console.log('fileUrl: ');
  // console.log(fileUrl);
  console.log("upload is fully done");
};

export default httpTrigger;
