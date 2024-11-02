const fs = require('fs');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');


const numRows = Math.floor((250 * 1024 * 1024) / 100); 


const generateRandomData = (numRows) => {
  const data = [];
  const column2Options = ['A', 'B', 'C', 'D'];
  const column4Options = ['apple', 'banana', 'cherry', 'date'];
  const column9Options = ['X', 'Y', 'Z'];

  for (let i = 0; i < numRows; i++) {
    data.push({
      Column1: Math.floor(Math.random() * 100000), 
      Column2: column2Options[Math.floor(Math.random() * column2Options.length)],
      Column3: Math.random() * 100 - 50, 
      Column4: column4Options[Math.floor(Math.random() * column4Options.length)],
      Column5: Math.floor(Math.random() * 50000), 
      Column6: Math.random(), 
      Column7: Math.floor(Math.random() * 99) + 1, 
      Column8: Math.floor(Math.random() * 9999) + 1, 
      Column9: column9Options[Math.floor(Math.random() * column9Options.length)],
      Column10: Math.random(), 
    });
  }
  return data;
};


const data = generateRandomData(numRows);


const csvWriter = createObjectCsvWriter({
  path: path.join(__dirname, 'large_file.csv'), 
  header: [
    { id: 'Column1', title: 'Column1' },
    { id: 'Column2', title: 'Column2' },
    { id: 'Column3', title: 'Column3' },
    { id: 'Column4', title: 'Column4' },
    { id: 'Column5', title: 'Column5' },
    { id: 'Column6', title: 'Column6' },
    { id: 'Column7', title: 'Column7' },
    { id: 'Column8', title: 'Column8' },
    { id: 'Column9', title: 'Column9' },
    { id: 'Column10', title: 'Column10' },
  ],
});


csvWriter
  .writeRecords(data)
  .then(() => {
    console.log('CSV generated in:', __dirname);
  })
  .catch((error) => {
    console.error('Error generating csv:', error);
  });
