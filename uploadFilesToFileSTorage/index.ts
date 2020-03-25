import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import * as azure from "azure-storage";
import { tmpdir } from "os";
import { createWriteStream } from "fs";
import { join } from "path";
import * as Busboy from "busboy";
import * as uuid from "uuid/v1";

// let fileUrl=''
const connString =
"DefaultEndpointsProtocol=https;AccountName=loulou3storage;AccountKey=0ne4QnfD5iONecUt4w8rdjyO+91nYA+jYDH0WFN3vmhbxbPL4AiDf8qO2Rit3Ve1pJdVxYW3CFs2c8QxfkHPaw==;EndpointSuffix=core.windows.net";

const fileService = azure.createFileService(connString);
const fileshare = `fileshare1`;
const dir = "dir_" + uuid();

fileService.createShareIfNotExists(fileshare, (err, data) => {
if (err) {
  console.log(err);
}
console.log("fileshare created");
});
fileService.createDirectoryIfNotExists(fileshare, dir, (err, data) => {
if (err) {
  console.log(err);
}
console.log("dir created", dir);
});

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

      fileService.createFile(fileshare, dir, filename, filepath.length, function (error, result, response) {
          if (error) {
            console.log(error);
          }
        });
          let fileUrl= fileService.getUrl(fileshare, dir, filename, '',true)
           console.log('fileurl: ', fileUrl);
           
        });
      

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
  // console.log('fileUrl: ');
  // console.log(fileUrl);
  console.log("upload is fully done");
};

export default httpTrigger;
