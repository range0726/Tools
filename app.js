const fs = require('fs');
const moment = require('moment');
const zip = require('zip-local');
const path = require('path');
var archiver = require('archiver');
const express = require('express');
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send(`
  <div>
    <h1>Backup paths</h1>
    <form action="/submit" method="POST">
        <label for="clientSource">Client Source:</label>
        <input type="text" id="clientSource" name="clientSource"><br><br>

        <label for="serverSource">Server Source:</label>
        <input type="text" id="serverSource" name="serverSource"><br><br>

        <label for="databaseSource">Database Source:</label>
        <input type="text" id="databaseSource" name="databaseSource"><br><br>

        <label for="destination">Destination:</label>
        <input type="text" id="destination" name="destination"><br><br>

        <input type="submit" value="Save">
    </form>
  </div>
  `)
});

let clientSource = "";
let serverSource = "";
let databaseSource = "";
let destination = "";

app.post('/submit', (req, res) => {
  console.log(req.body);

  let backupClick = req.body.backup ? req.body.backup : undefined;
  let zipClick = req.body.zip ? req.body.zip : undefined;

  clientSource = req.body.clientSource ? req.body.clientSource : clientSource;
  serverSource = req.body.serverSource ? req.body.serverSource : serverSource;
  databaseSource = req.body.databaseSource ? req.body.databaseSource : databaseSource;
  destination = req.body.destination ? req.body.destination : destination;

  if (backupClick == 'backup' && destination && (clientSource || serverSource || databaseSource)) {
    copyFiles(clientSource, serverSource, databaseSource, destination);
  }

  if(zipClick == 'zip' && destination){
    archiveFolders(destination);
  }

  res.send(`
    Client Source: ${clientSource}<br>
    Server Source: ${serverSource}<br>
    Database Source: ${databaseSource}<br>
    Destination: ${destination}
    <form action="/submit" method="POST">
      <input type="submit" name="backup" value="backup">
      <input type="submit" name="zip" value="zip">
    </form>
    `);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});



function copyFiles(clientSource, serverSource, databaseSource, destination) {
  const sources = [
    { name: 'Client', path: clientSource },
    { name: 'Service', path: serverSource },
    { name: 'Database', path: databaseSource },
  ];
  
  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    if (source.path) {
      fs.cp(source.path, `${destination}/backup/${source.name}`, { recursive: true }, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  }
}

function archiveFolders(destinationPath){
  var output = fs.createWriteStream(`${destinationPath}/${moment().format('YYYYMMDDmm')}.zip`);
  var archive = archiver('zip');

  output.on('close', function () {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
  });

  archive.on('error', function(err){
      throw err;
  });

  archive.pipe(output);

  archive.directory(`${destinationPath}/backup`, 'Project');

  archive.finalize();
}

function main(clientSource, serverSource, databaseSource, destination) {
  // const sources = [
  //   { name: 'Client', path: './source/Folder_1' },
  //   { name: 'Service', path: './source/src' },
  //   { name: 'Database', path: './source/src' },
  // ];
  // const destinationPath = './destination';
}


// main();



