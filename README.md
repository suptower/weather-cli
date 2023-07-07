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
        -h, --help          output usage information
        -v, --version       output the version number
        -a, --api           set api key
        -e, --env           set api key from environment variable API_KEY
        -f , --fast         fast mode, no prompt, locations as arg

    Examples:
        $ weather Munich
        $ weather --api
        $ weather -v
        $ weather -f Munich
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