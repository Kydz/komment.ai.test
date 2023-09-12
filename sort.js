const fs = require('fs');
const dataFolder = `./jsons`;

fs.readdir(dataFolder, {recursive: true}, (error, files) => {
  const jsonFolders = files.filter(file => file.startsWith('json'));
  jsonFolders.forEach(jsonFolder => {
    handleFolder(jsonFolder);
  });
});

function handleFolder(jsonFolder) {
  fs.mkdir(`${dataFolder}/${jsonFolder}/sorted`, {recursive: true}, (err) => {
    if (err) {
      console.log('failed to make dir: ', err);
    }
  });
  fs.readdir(`${dataFolder}/${jsonFolder}`, {recursive: true}, (error, files) => {
    handleFiles(files, jsonFolder)
  });
}

function handleFiles(files, jsonFolder) {
  const jsons = files.filter(file => file.endsWith('.json'));
  let nameDataMapping = [];
  jsons.forEach(json => {
    nameDataMapping = processJSON(json, jsonFolder)
  });
  const sortedByDate = nameDataMapping.filter(d => !!d.date).sort((a, b) => b.date - a.date);
  sortedByDate.forEach((item, index) => {
    copyFile(item, index, jsonFolder);
  });
  const withoutDate = nameDataMapping.filter(d => !d.date);
  withoutDate.forEach(item => {
    console.log('no date: ', `${dataFolder}/${jsonFolder}/${item.name}`);
  });
}

function processJSON(json, jsonFolder) {
  const nameDataMapping = [];
  const rawdata = fs.readFileSync(`${dataFolder}/${jsonFolder}/${json}`);
  const data = JSON.parse(rawdata);
  const foundKey = Object.keys(data).find(key => key.startsWith('date'));
  if (foundKey) {
    nameDataMapping.push({name: json, date: new Date(data[foundKey])});
  } else {
    nameDataMapping.push({name: json, date: undefined});
  }
  return nameDataMapping;
}

function copyFile(item, index, jsonFolder) {
  const newName = `${index + 1}-${item.date.toLocaleDateString().replaceAll('/', '.')}-${item.name}`;
  fs.copyFile(`${dataFolder}/${jsonFolder}/${item.name}`, `${dataFolder}/${jsonFolder}/sorted/${newName}`, (err) => {
    if (err) {
      console.log('source: ', `${dataFolder}/${jsonFolder}/${item.name}`);
      console.log('failed to copy file: ', err);
    }
  });
}
