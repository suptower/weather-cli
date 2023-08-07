# weather-cli

Retrieve weather information directly from your terminal.

![terminal example usage](terminal.gif)

# Install
via `npm`
```
npm install -g @suptower/weather-cli
```

# Usage
```
Usage: 
        $ weather [options]
        $ weather [location]
        $ weather [options] [location]

    Options:
        -h, --help              output usage information
        -v, --version           output the version number
        -a, --api               set api key
        -c, --config            show config
        -d, --delete_config     clear config
        -e, --env               set api key from environment variable API_KEY
        -f , --fast [loc]       fast mode, no prompt, location as arg
        -t, --three_day [loc]   show three day forecast
        -i, --info              show project related info

    Examples:
        $ weather Munich
        $ weather --api
        $ weather -v
        $ weather --config
        $ weather --info
        $ weather -f Munich
        $ weather -t Munich
        $ weather
```

# API Key
The used API is [Weather API](https://www.weatherapi.com) (free). A registration is needed to retrieve the API key.

You have two ways to specifiy your key.

## 1. API Key via .env
Create a `.env` file in the repository and paste the following:
```
API_KEY="<your-api-key-goes-here>"
```
Then execute following command:
```
weather -e
# output
API key from dotenv has been set.
```

## 2. API Key via terminal
Enter following command:
```
weather -a
# output
? Enter your API key » <your-api-key-goes-here>
```

# Fast Mode
If you want to retrieve the weather information directly without any prompt, you can use the fast mode.
```
weather -f Munich
# output
The weather in Munich is currently Partly cloudy with a temperature of 8.0°C.
```

# Config
You can show the current config with following command:
```
weather -c
```
The config allows you to change the temperature unit.
```
weather -c
# output
? Select config option » - Use arrow-keys. Return to submit.
    Show API key
    Delete API key
>   Set temperature unit
    Cancel
    ---
    √ Select config option » Set temperature unit
    ---
? Select temperature unit » - Use arrow-keys. Return to submit.
>   Celsius
    Fahrenheit
    ---
    √ Select temperature unit » Celsius
    ---
Temperature unit is saved as metric.
```