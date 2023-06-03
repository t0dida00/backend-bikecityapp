const fs = require('fs');

function TripFile(file_path, delimiter = ',') {
  return new Promise((resolve, reject) => {

    fs.readFile(file_path, 'utf8', (err, data) => {
      if (err) {
        console.log('Failed to read CSV file')
        reject('Failed to read CSV file');
      } else {
        const lines = data.trim().split('\n');
        const headers = lines[0].split(delimiter).map((header) => header.replace(/[\r]+/g, ''));
        const result = [];
        for (let i = 1; i < lines.length; i++) {
          const obj = {};
          const currentLine = lines[i].split(delimiter);

          if (currentLine.length !== headers.length) {
            continue;
            //reject('Invalid CSV format');
          }
          else {
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentLine[j].trim()
            }

          }
          // Exclude journeys that lasted shorter than 10 second

          if (obj['Duration (sec)'] < 10) {
            continue;
          }
          // Exclude journeys that covered distances shorter than 10 meters
          if (obj['Covered distance (m)'] < 10) {
            continue;
          }
          else {
            result.push(obj);
          }
        }
        resolve(result);
      }
    });
  });
}



function StationFile(file_path, delimiter = ',') {
  return new Promise((resolve, reject) => {

    fs.readFile(file_path, 'utf8', (err, data) => {
      if (err) {
        console.log('Failed to read CSV file')
        reject('Failed to read CSV file');
      } else {
        const lines = data.trim().split('\n');
        const headers = lines[0].split(delimiter).map((header) => header.replace(/[\r]+/g, ''));
        const result = [];
        for (let i = 1; i < lines.length; i++) {
          const obj = {};
          // const trimmedInput = lines[i].slice(1, -2);
          // const regex = /'([^']*)'/g;
          // const test =lines[22].replace(/""/g, "'").replace(/"/g, '')
          // console.log(test)
          const currentLine = lines[i].split(delimiter)
          // const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
          // const currentLine = cleanedInput.split(regex);
          if (currentLine.length !== headers.length) {

            continue;
            //reject('Invalid CSV format');
          }
          else {
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = currentLine[j].trim()
            }

            result.push(obj);
          }


        }
        resolve(result);

      }
    });
  });
}
module.exports = {
    TripFile,
    StationFile
};