const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');


const { 
    LANG,
    PORT, 
    HOST_NAME,
    STATIC_FILES_DIR,
    REQUEST_MAX_LIMIT,
    UPLOAD_MAX_SIZE
} = require('./core/upload/constants');

const {
    imgIncludeExtTypes
} = require('./core/upload/match');

const {
    binaryToBase64Str
} = require('./core/upload/helpers');

const {
    getPaletteData
} = require('./plugins/parse-image');




const port = PORT;
const app = express();

// enable files upload
app.use(fileUpload({
    createParentPath: true,
    limits: {
        fileSize: UPLOAD_MAX_SIZE //max file(s) size
    },
}));

//add other middleware
// HTTP request logger middleware for node.js
app.use(cors());

// "limit" is to avoid request errors: PayloadTooLargeError: request entity too large
app.use(bodyParser.json({limit: REQUEST_MAX_LIMIT}));
app.use(bodyParser.urlencoded({ extended: true, limit: REQUEST_MAX_LIMIT}));

// HTTP request logger middleware for node.js
app.use(morgan('dev'));


// Note: `app.use(..., express.static(...))` cannot be placed before `app.use(cors())`

// Static resources in plugins can be used dynamically (no need to redeploy)
// you can visit the static URL like this: http://localhost:4001/vars/custom-page/
app.use('/vars', express.static(STATIC_FILES_DIR));
// app.use('/vars', express.static(path.join(__dirname, '..', '/uploads/vars')));



/*
 ================================================
  SERVICE 1: upload .zip file
 ================================================
 */


app.post('/upload-plugin', async (req, res) => {


    try {
        if (!req.files) {
            res.send({
                status: false,
                message: LANG.en.noFile
            });
        } else {


            const currentFilesData = req.files.clientFiles;
            const filesName = [];
            const mvFun = (f) => {

                filesName.push(f.name);
                res.filepath = filesName;
                
                // Use the mv() method to place the file in upload directory (i.e. "'./uploads/'")
                // Note: res.send() cannot be written and reused in the function, and multiple files will report an error
                const uploadPath = path.join(__dirname, '..', `/${STATIC_FILES_DIR}/`, f.name);
                f.mv(uploadPath, function (err) {
                    if (err) {
                        res.send(err);
                    }
                });

                // Or use a synchronous method to write to <Buffer....>
                //fs.writeFileSync(uploadPath, f.data);

                
            };

            if (currentFilesData instanceof Array) {
                // for multiple files
                for (let i = 0; i < currentFilesData.length; i++) {
                    mvFun(currentFilesData[i]);
                }
            } else {
                // for single file
                mvFun(currentFilesData);
            }


            // Other asynchronous operations
            //const myPromise = await muFunc();
            
            res.send({
                status: true,
                message: `${filesName}${LANG.en.uploadedRes}`
            });


        }
    } catch (err) {
        res.status(500).send(err);
    }
});


// get page (It is also possible not to write the following code)
app.get('/plugins/*', async (req, res) => {
    let pagePath = req.path;   // /plugins/xxx/yyy/
    res.sendFile(path.join(__dirname, `../${pagePath}`));
});




/*
 ================================================
  SERVICE 2: parase image
 ================================================
 */
 app.post('/upload-image', async (req, res) => {

    try {
        if (!req.files) {
            res.send({
                "message": LANG.en.noFile,
                "code": 1000
            });
        } else {
            
            // Use the mv() method to place the file in upload directory (i.e. "'./uploads/'")
            // Note: if `mv()` uses a callback, ` res.send()` should be written in the callback function

            const currentFilesData = req.files.clientFiles;

            // for single file
            const f = currentFilesData;
            if ( imgIncludeExtTypes.test(f.name) ) {

                const tempPath = path.join(__dirname, '..', `/${STATIC_FILES_DIR}/_temp/`);
                const uploadPath = path.join(__dirname, '..', `/${STATIC_FILES_DIR}/_temp/`, f.name);
                if (!fs.existsSync(tempPath)){
                    fs.mkdirSync(tempPath, { recursive: true });
                }
                
                // move file
                fs.writeFileSync(uploadPath, f.data);

                // parse image
                const imgPath = `http://${HOST_NAME}:${PORT}/${STATIC_FILES_DIR}/_temp/${f.name}`;
                const paletteDataPromise = await getPaletteData(imgPath); // Promise
            
                
                // delete unnecessary files and folders
                fs.rmSync(tempPath, { recursive: true });
                console.log('\x1b[36m%s\x1b[0m', LANG.en.delete, `${STATIC_FILES_DIR}/_temp/`);

                
                //
                res.send({
                    "data": { "uploadedInfo": {
                        paletteData: paletteDataPromise,
                        imgData: `data:${f.mimetype};base64, ${binaryToBase64Str(f.data)}`
                    } },
                    "message": LANG.en.sendOk,
                    "code": 200
                });      

            }  

                
        }
    } catch (err) {
        res.status(500).send(err);
    }
});






 /*
 ================================================
  START APP
 ================================================
 */
require('./plugins/signal');
const server = app.listen(port, () => {
    const host = server.address().address;
    const port = server.address().port;
    console.log(LANG.en.serverRun, host, port);
});



/** How to:

---------------
HTML
---------------
<form onsubmit="fun()">
  <input class="uploadinput" type="file" id="upload-files" name="files" multiple>
  <label for="upload-files">Select files:</label>
  <input type="submit">
</form>


.uploadinput[type="file"] {
    border: 1px solid #333;
    display: none;
}

.uploadinput[type="file"]+label {
    padding: 5px;
    border-radius: 2px;
    font-size: 14px;
    cursor: pointer;
    background-color: rgb(54, 54, 54);
    color: #fff;
    border: 1px solid #333;
}

---------------
JS
---------------
const fileInput = document.getElementById('upload-files');
const curFiles = fileInput.files;
const formData = new FormData();
formData.append('action', 'upload_plug_action');

for (let i = 0; i < curFiles.length; i++) {
    formData.append("clientFiles", curFiles[i]);
}

axios.post('http://localhost:4001/upload-plugin', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
}).then(function (response) {
    const jsonData = response.data;
    console.log(jsonData);


}).catch(function (error) {
    if (error.response) {
        console.log(error.response.status);
    } else if (error.request) {
        console.log(error.request);
    } else {
        console.log(error.message);
    }
});
*/