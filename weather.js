import Conf from "conf";
import got from "got";
import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";

const config = new Conf({ projectName: "weather-cli" });

const API_KEY = config.get("api");

const API_URL = "http://api.weatherapi.com/v1/current.json?key=" + API_KEY + "&q=";
const API_URL_FORECAST = "http://api.weatherapi.com/v1/forecast.json?key=" + API_KEY + "&q=";

export const weather = async location => {
  console.log();
  const loading = ora({
    text: "Loading weather for " + chalk.blue(location) + "...",
    spinner: "earth",
  });
  loading.start();
  const requestURL = API_URL + location + "&aqi=no";
  await got(requestURL)
    .json()
    .then(response => {
      loading.succeed(
        "The weather in " +
          chalk.blue(response.location.name) +
          " is " +
          chalk.blue(response.current.condition.text) +
          " with a temperature of " +
          chalk.blue(response.current.temp_c) +
          "°C.",
      );
    })
    .catch(error => {
      const reason = JSON.parse(error.response.body).error.message;
      loading.fail(chalk.red("Error: " + reason));
    });
};

export const weatherprompt = async () => {
  const response = await prompts({
    type: "text",
    name: "location",
    message: "Enter a location",
  });
  if (response.location) {
    const loading = ora({
      text: "Loading weather for " + chalk.blue(response.location) + "...",
      spinner: "earth",
    });
    loading.start();
    const requestURL = API_URL + response.location + "&aqi=no";
    await got(requestURL)
      .json()
      .then(response => {
        loading.succeed(
          "Weather information for " +
            chalk.blue(response.location.name) +
            " (local time: " +
            chalk.cyan(response.location.localtime) +
            " ) has been loaded.",
        );
        promptMenu(response);
      })
      .catch(error => {
        const reason = JSON.parse(error.response.body).error.message;
        loading.fail(chalk.red("Error: " + reason));
      });
  } else {
    console.log(chalk.red("Location undefined."));
  }
};

const promptMenu = async response => {
  const menu = await prompts({
    type: "select",
    name: "value",
    message: "Select an option",
    choices: [
      { title: "Location information", value: "location" },
      { title: "Current condition", value: "current" },
      { title: "Current condition (detailed)", value: "currentdetailed" },
      { title: "Forecast", value: "forecast" },
    ],
  });
  switch (menu.value) {
    case "location":
      console.log(chalk.blue("Location information:"));
      console.log(chalk.magenta("Name: " + chalk.cyan(response.location.name)));
      console.log(chalk.magenta("Region: " + chalk.cyan(response.location.region)));
      console.log(chalk.magenta("Country: " + chalk.cyan(response.location.country)));
      console.log(chalk.magenta("Latitude: " + chalk.cyan(response.location.lat)));
      console.log(chalk.magenta("Longitude: " + chalk.cyan(response.location.lon)));
      console.log(chalk.magenta("Timezone: " + chalk.cyan(response.location.tz_id)));
      console.log(chalk.magenta("Local time: " + chalk.cyan(response.location.localtime)));
      break;
    case "current":
      console.log(chalk.blue("Current condition (last updated: " + chalk.cyan(response.current.last_updated) + "):"));
      console.log(chalk.magenta("Condition: " + chalk.cyan(response.current.condition.text)));
      console.log(chalk.magenta("Temperature: " + chalk.cyan(response.current.temp_c + "°C")));
      break;
    case "currentdetailed":
      console.log(chalk.blue("Current condition (detailed):"));
      console.log(chalk.blue("Current condition (last updated: " + chalk.cyan(response.current.last_updated) + "):"));
      console.log(chalk.magenta("Condition: " + chalk.cyan(response.current.condition.text)));
      console.log(chalk.magenta("Temperature: " + chalk.cyan(response.current.temp_c + "°C")));
      console.log(
        chalk.magenta(
          "Wind Speed | Direction: " + chalk.cyan(response.current.wind_kph + " km/h | " + response.current.wind_dir),
        ),
      );
      console.log(chalk.magenta("Precipitation ammount: " + chalk.cyan(response.current.precip_mm + " mm")));
      console.log(chalk.magenta("Humidity: " + chalk.cyan(response.current.humidity + " %")));
      console.log(chalk.magenta("Cloud cover: " + chalk.cyan(response.current.cloud + " %")));
      console.log(chalk.magenta("UV Index: " + chalk.cyan(response.current.uv)));
      console.log(chalk.magenta("Visibility Distance: " + chalk.cyan(response.current.vis_km + " km")));
      console.log(chalk.magenta("Pressure Amount: " + chalk.cyan(response.current.pressure_mb + " mb")));
      break;
    case "forecast": {
      console.log(chalk.blue("Forecast:"));
      console.log(
        chalk.bold.yellow(
          "Forecast API currently supports only up to a maximum of 14 days. Depending on the location, the forecast data may only be available for a shorter period.",
        ),
      );
      const showForecast = await prompts({
        type: "confirm",
        name: "value",
        message: "Do you wish to continue?",
        initial: true,
      });
      if (showForecast.value) {
        const days = await prompts({
          type: "number",
          name: "value",
          message: "How many days do you wish to see (1-14)?",
          initial: 1,
          min: 1,
          max: 14,
        });
        const forecast = await got(API_URL_FORECAST + response.location.name + "&days=" + days.value + "&aqi=no&alerts=no").json().then(response => {
          console.log(chalk.blue("Forecast for " + chalk.cyan(response.location.name) + ":"));
          console.log(chalk.yellow("Data has been fetched for " + chalk.cyan(response.forecast.forecastday.length) + " days."));
          // Let user select a day
        });
      } else {
        console.log(chalk.red("Forecast cancelled."));
      }
      break;
    }
    default:
      console.log(chalk.red("Error: " + menu.value + " is not a valid option."));
      break;
  }
};
