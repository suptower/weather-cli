// persist conf
import Conf from "conf";

// terminal styling
// import chalk from "chalk";

// http requests
import got from "got";

// weather icons
import { getIcon } from "./resources/weather_icons.js";


// Config
const config = new Conf({ projectName: "weather-cli" })

// API key
const API_KEY = config.get("api");

const API_URL_FORECAST = "http://api.weatherapi.com/v1/forecast.json?key=" + API_KEY + "&q=";

const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov",  "Dec"];

// Input: Location name

export const tripleForecast = async (location) => {
  const requestURL = API_URL_FORECAST + location + "&days=3&aqi=no&alerts=no";
  await got(requestURL).json().then((response) => {
    for (let i = 0; i < response.forecast.forecastday.length; i++) {
      displayTripleForecast(response.forecast.forecastday[i]);
    }
  }).catch((error) => {
    console.log(error);
  }); 
};

// Input: Forecast.Forecastday[date] (whole forecast data of one day)
const displayTripleForecast = (date) => {
  // TODO: Table overview
  console.log(getTableHeader(date.date) + getTableColumns(date) + getTableCloser() + "\n");
};

// Input: Date (YYYY-MM-DD)
// Output: Table Header with outer border and day title
function getTableHeader(inputDate) {
  // dateFmt := "┤ " + day.Date.Format("Mon 02. Jan") + " ├"
  // get Day of Week
  let DayOfWeek = week[new Date(inputDate).getDay()]
  // get Day of Month
  const DayOfMonth = new Date(inputDate).getDate();
  if (DayOfMonth < 10) {
    // Make sure that the table is aligned
    DayOfWeek += " ";
  }
  // get Month
  const Month = month[new Date(inputDate).getMonth()];
  const dateHeader = DayOfWeek + " " + DayOfMonth + ". " + Month;
  let ret = "                                                       ┌─────────────┐                                                     \n";
  ret += "┌──────────────────────────────┬───────────────────────┤ " + dateHeader.padEnd(12, " ") + "├───────────────────────┬───────────────────────────────┐\n";
  ret += "│            Morning           │             Noon      └──────┬──────┘      Evening          │            Night              │\n";
  ret += "├──────────────────────────────┼──────────────────────────────┼──────────────────────────────┼───────────────────────────────┤\n";
  return ret;
}

// Input: Forecast.Forecastday[date] (whole forecast data of one day)
// Output: Table Columns with inner border
function getTableColumns(date) {
  let ret = "";
  for (let i = 0; i < 4; i++) {
    ret += "│ " + getTableColumn(date, i);
  }
  ret += " │\n";
  return ret;
}

// Input: Forecast.Forecastday[date] (whole forecast data of one day)
// Input: index (0-3)
// Output: Table Column with inner border
function getTableColumn(date, index) {
  // to get Icons use the following
  // string preparation needed
  // getIcon(date.hour[index * 6].condition.code) + 
  return (date.hour[index * 6].temp_c + "°C " + date.hour[index * 6].condition.text).padEnd(29, " ");
}

// Output: Table Closer with outer border
function getTableCloser() {
  return "└──────────────────────────────┴──────────────────────────────┴──────────────────────────────┴───────────────────────────────┘";
}

