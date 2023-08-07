// persist conf
import Conf from "conf";

// terminal styling
import chalk from "chalk";

// http requests
import got from "got";

// weather icons
import { getIcon } from "./resources/weather_icons.js";

import stringLength from "string-length";

// Config
const config = new Conf({ projectName: "weather-cli" });

// API key
const API_KEY = config.get("api");

const UNIT_MODE = config.get("unit");

const API_URL_FORECAST = "http://api.weatherapi.com/v1/forecast.json?key=" + API_KEY + "&q=";

const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Input: Location name

export const tripleForecast = async location => {
  const requestURL = API_URL_FORECAST + location + "&days=3&aqi=no&alerts=no";
  await got(requestURL)
    .json()
    .then(response => {
      for (let i = 0; i < response.forecast.forecastday.length; i++) {
        displayTripleForecast(response.forecast.forecastday[i]);
      }
    })
    .catch(error => {
      console.log(error);
    });
};

// Input: Forecast.Forecastday[date] (whole forecast data of one day)
const displayTripleForecast = date => {
  // TODO: Table overview
  console.log(getTableHeader(date.date) + getTableColumns(date) + "\n" + getTableCloser() + "\n");
};

// Input: Date (YYYY-MM-DD)
// Output: Table Header with outer border and day title
function getTableHeader(inputDate) {
  // dateFmt := "┤ " + day.Date.Format("Mon 02. Jan") + " ├"
  // get Day of Week
  let DayOfWeek = week[new Date(inputDate).getDay()];
  // get Day of Month
  const DayOfMonth = new Date(inputDate).getDate();
  if (DayOfMonth < 10) {
    // Make sure that the table is aligned
    DayOfWeek += " ";
  }
  // get Month
  const Month = month[new Date(inputDate).getMonth()];
  const dateHeader = DayOfWeek + " " + DayOfMonth + ". " + Month;
  let ret = "".padEnd(61, " ") + "┌─────────────┐                                                     \n";
  ret +=
    "┌" +
    "─".padEnd(33, "─") +
    "┬" +
    "─".padEnd(26, "─") +
    "┤ " +
    dateHeader.padEnd(12, " ") +
    "├" +
    "─".padEnd(26, "─") +
    "┬" +
    "─".padEnd(33, "─") +
    "┐\n";
  ret +=
    "│              Morning            │               Noon       └──────┬──────┘      Evening             │              Night              │\n";
  ret +=
    "├" +
    "─".padEnd(33, "─") +
    "┼" +
    "─".padEnd(33, "─") +
    "┼" +
    "─".padEnd(33, "─") +
    "┼" +
    "─".padEnd(33, "─") +
    "┤\n";
  return ret;
}

// Input: Forecast.Forecastday[date] (whole forecast data of one day)
// Output: Table Columns with inner border
function getTableColumns(date) {
  let ret = "";
  for (let i = 0; i < 4; i++) {
    // each column needs to be added side by side
    ret += getTableColumn(date, i) + "\n";
  }
  // ret += "\n";
  return postColumns(ret);
}
// Input: Forecast.Forecastday[date] (whole forecast data of one day)
// Input: index (0-3)
// Output: Table Column with inner border
function getTableColumn(date, index) {
  // to get Icons use the following
  // string preparation needed
  const iconString = getIcon(date.hour[index * 6].condition.code);
  const dataString = (
    colorizeTemperature(getTemperatureInUnit(date.hour[index * 6])) +
    "\n" +
    date.hour[index * 6].condition.text
  ).padEnd(20, " ");
  return splitIconDataStrings(iconString, dataString);
}

// Output: Table Closer with outer border
function getTableCloser() {
  return (
    "└" + "─".padEnd(33, "─") + "┴" + "─".padEnd(33, "─") + "┴" + "─".padEnd(33, "─") + "┴" + "─".padEnd(33, "─") + "┘"
  );
}

function splitIconDataStrings(iconString, dataString) {
  const iconLines = iconString.split("\n");
  const dataLines = prepareDataStrings(dataString.split("\n"));
  const ret = [];
  for (let i = 0; i < iconLines.length; i++) {
    const iconString = String(iconLines[i]);
    const dataString = String(dataLines[i]).trim();
    if (dataLines[i] === undefined || dataLines[i] === "") {
      if (iconString === undefined || iconString === "") {
        ret.push("│ " + betterPadEnd("", 32));
      } else {
        ret.push("│ " + betterPadEnd(iconString, 32));
      }
    } else {
      const returnString = String(iconString + " " + dataString);
      ret.push("│ " + betterPadEnd(returnString, 32));
    }
  }
  return ret.join("\n");
}

function betterPadEnd(data, length) {
  // split string in 2 lines if string is longer than length
  // if (stringLength(data) > length) {
  //   const splitIndex = Math.floor(stringLength(data) / 2);
  //   const data1 = data.substring(0, splitIndex);
  //   const data2 = data.substring(splitIndex);
  //   return data1 + "\n" + betterPadEnd(data2, length);
  // }
  while (stringLength(data) < length) {
    data += " ";
  }
  return data;
}

// gets an array of strings as input
// returns an array of strings with a maximum length of 22
function prepareDataStrings(dataString) {
  const maxLength = 18;
  // Split each line in N lines if line is longer than 22
  const ret = [];
  for (let i = 0; i < dataString.length; i++) {
    if (stringLength(dataString[i]) > maxLength) {
      const data1 = dataString[i].substring(0, maxLength);
      const data2 = dataString[i].substring(maxLength).trim();
      if (stringLength(data1) > maxLength) {
        const data3 = data1.substring(0, maxLength);
        const data4 = data1.substring(maxLength).trim();
        ret.push(data3);
        ret.push(data4);
      } else {
        ret.push(data1);
      }
      if (stringLength(data2) > maxLength) {
        const data3 = data2.substring(0, maxLength);
        const data4 = data2.substring(maxLength).trim();
        ret.push(data3);
        ret.push(data4);
      } else {
        ret.push(data2);
      }
    } else {
      ret.push(dataString[i]);
    }
  }
  return ret;
}

// Input: String of Array ret
// Process: 5 lines line by line, then side by side
function postColumns(data) {
  const lines = data.split("\n");
  const ret = ["", "", "", "", ""];
  for (let i = 0; i < lines.length; i++) {
    if (ret[i % 5] === undefined) {
      ret[i % 5] = "";
    }
    ret[i % 5] = ret[i % 5] + lines[i];
  }
  // add most right border
  for (let i = 0; i < ret.length; i++) {
    ret[i] += "│";
  }
  return ret.join("\n");
}

// Colorize String based on temperature (color ramp)
function colorizeTemperature(data) {
  if (UNIT_MODE === "imperial") {
    const temp = parseFloat(data);
    const tempString = String(temp) + "°F";
    let coloredString = "";
    if (temp < 32) {
      coloredString = chalk.blue(tempString);
    } else if (temp < 41) {
      coloredString = chalk.cyan(tempString);
    } else if (temp < 50) {
      coloredString = chalk.green(tempString);
    } else if (temp < 59) {
      coloredString = chalk.yellow(tempString);
    } else if (temp < 68) {
      coloredString = chalk.rgb(252, 144, 3)(tempString);
    } else if (temp < 77) {
      coloredString = chalk.red(tempString);
    }
    return coloredString;
  } else {
    const temp = parseFloat(data);
    const tempString = String(temp) + "°C";
    let coloredString = "";
    if (temp < 0) {
      coloredString = chalk.blue(tempString);
    } else if (temp < 5) {
      coloredString = chalk.cyan(tempString);
    } else if (temp < 10) {
      coloredString = chalk.green(tempString);
    } else if (temp < 15) {
      coloredString = chalk.yellow(tempString);
    } else if (temp < 20) {
      coloredString = chalk.rgb(252, 144, 3)(tempString);
    } else if (temp < 25) {
      coloredString = chalk.red(tempString);
    } else {
      coloredString = chalk.magenta(tempString);
    }
    return coloredString;
  }
}

function getTemperatureInUnit(data) {
  if (UNIT_MODE === "metric") {
    return data.temp_c;
  } else {
    return data.temp_f;
  }
}
