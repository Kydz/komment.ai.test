const fs = require('fs');
const dataFolder = `./jsons`;

fs.readdir(dataFolder, {recursive: true}, (error, files) => {
  const jsonFolders = files.filter(file => file.startsWith('json'));
  jsonFolders.forEach(jsonFolder => {
    handleFolder(jsonFolder);
  });
});

/**
* @description The function handleFolder creates a directory if it does not already 
* exist, then reads the contents of a folder and calls the handleFiles function with 
* the files and the folder name.
* 
* @param { string } jsonFolder - The `jsonFolder` input parameter is passed to the 
* `fs.readdir()` method and is used to specify the directory to read files from.
*/
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

/**
* @description This function handles files and processes JSON files in a folder, 
* sorting and copying files based on their date.
* 
* @param { array } files - The `files` input parameter is an array of files that are 
* passed to the `handleFiles` function.
* 
* @param { string } jsonFolder - The `jsonFolder` input parameter specifies the 
* folder where the JSON files are located.
*/
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

/**
* @description The function processJSON takes two arguments, json and jsonFolder, 
* and returns an array of objects containing the name and date information from a 
* JSON file. It reads the file, parses the JSON data, and searches for a key starting 
* with "date" to extract the date information.
* 
* @param { string } json - The `json` input parameter is passed a JSON object and 
* is used to extract the data from the JSON object.
* 
* @param { string } jsonFolder - The `jsonFolder` input parameter specifies the 
* folder where the JSON files are located.
* 
* @returns { object } - The output returned by this function is an array of objects, 
* where each object has two properties: "name" and "date".
*/
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

/**
* @description The function copyFile copies a file from one location to another, 
* renaming the copied file based on a specific format.
* 
* @param { object } item - The `item` input parameter is passed to the function as 
* a file object, and it is used as the source file for copying.
* 
* @param { number } index - The `index` input parameter in the `copyFile` function 
* is used to generate a unique name for the copied file.
* 
* @param { string } jsonFolder - The `jsonFolder` input parameter in the `copyFile` 
* function specifies the folder containing the JSON files to be copied.
*/
function copyFile(item, index, jsonFolder) {
  const newName = `${index + 1}-${item.date.toLocaleDateString().replaceAll('/', '.')}-${item.name}`;
  fs.copyFile(`${dataFolder}/${jsonFolder}/${item.name}`, `${dataFolder}/${jsonFolder}/sorted/${newName}`, (err) => {
    if (err) {
      console.log('source: ', `${dataFolder}/${jsonFolder}/${item.name}`);
      console.log('failed to copy file: ', err);
    }
  });
}
