import fs from "fs";

const dateTime = new Date();
const date = dateTime.getDate();

let dayString = date.toString();
if (date === 1) {
  dayString += "st";
} else if (date === 2) {
  dayString += "nd";
} else if (date === 3) {
  dayString += "rd";
} else {
  dayString += "th";
}

const months = [
  "January",
  "Febuary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "November",
  "December",
];

const monthString = months[dateTime.getMonth()];

const yearString = dateTime.getFullYear().toString();

const dateString = "Updated on " + dayString + " of " + monthString + " " + yearString + ".";

function updatePackageJson() {
  fs.readFile("./package.json", (err, data) => {
    if (err) throw err;

    let packageJsonObj = JSON.parse(data);
    packageJsonObj.date = dateString;
    packageJsonObj = JSON.stringify(packageJsonObj, null, "\t");

    fs.writeFile("./package.json", packageJsonObj, err => {
      if (err) throw err;
      console.log("Date in package.json has been updated.");
    });
  });
}

updatePackageJson();