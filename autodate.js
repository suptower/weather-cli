import fs from "fs";

const dateTime = new Date();
const date = dateTime.getDate();

let dayString = date.toString();
const lastDigit = dayString.charAt(dayString.length - 1);
if (dayString === "11" || dayString === "12" || dayString === "13") {
  dayString += "th";
} else if (lastDigit === "1") {
  dayString += "st";
} else if (lastDigit === "2") {
  dayString += "nd";
} else if (lastDigit === "3") {
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
