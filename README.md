<img style="display: block; margin: auto; width: 100%" alt="Version" src="readme_docs/images/banner.png" />
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-0.0.1-blue.svg?cacheSeconds=2592000" />
  <a href="https://opensource.org/licenses/ISC" target="_blank">
    <img alt="License: ISC" src="https://img.shields.io/badge/License-ISC-green.svg" />
  </a>
</p>

## Description
> #### This is a service to controls headless browser by json requests
> This MVP project, which is in continues development, allows you to control and manager most of the important features
> of a headless browser through a server
> that receive requests in json and are translated it to Puppeteer actions.

## Preparing the environment

#### MongoDb
>Download mongodb [here](https://www.mongodb.com/try/download/community-kubernetes-operator) and install it.
>
>Create a database with the name you want

#### Redis
>Download redis [here](https://redis.io/download/) and install it.



#### Configuring .env file 
Create an .env file and add the next values with your data:

~~~
APP_HOST=http://localhost
APP_PORT=3000

MONGODB_URI=mongodb://127.0.0.1:27017/your_database_name

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

IMAGES_PATH=./files/screenshots/
LOGS_PATH=./files/logs/
PDF_PATH=./files/pdfs/ 

ANTICAPTCHA_API_KEY=YOUR_ANTICAPTCHA_API_KEY
SECRET_TOKEN=YOUR_SECRET_TOKEN

NODE_ENV=development
~~~

####

### Installation

```sh
npm install
```

### Usage

```sh
npm run start
```

### Run tests

```sh
npm run test
```

## How to use it
A full request execution json is divided by 4 jsons:
* request_description (An small description of the request for easy understand later) Example:
~~~
"request_description": YOUR_DESCRIPTION
~~~
* send_in_request (It is what you send to the server to perform actions) Example:
~~~
"send_in_request": {
    "url": "YOUR_URL",
    "options": {"waitUntil": "networkidle0"},
    "instructions": [
        {"command": "click", "params": ["#loginbutton"], "options": {}},
        {"command": "wait_for_navigation", "params": [], "options": {"waitUntil": "networkidle0"}}
    ]
}
~~~
* get_in_response (It is what you need the server to send you once the execution is finished) Example:
~~~ 
"get_in_response": {
    "cookies": True,
    "headers": True,
    "logs": {"active": True, "full_logs": False},
    "screenshot": {"active": True, "full_logs": False},
    "source_page": True
}
~~~
* request_config (It is the way in which you configure your request according to your use case.) Example:
~~~
"request_config": {
    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
    "block_resources": ["media", "images"]
    "cookies": YOUR_COOKIES
    "headers": YOUR_HEADERS
}
~~~

## Documentation
- Api-Docs endpoint => http://localhost:3000/api-docs
- See all documentation [here](https://)


## Author

👤 **Jose E Cortes**

* Website: https://cortestudios-portfolio.netlify.app/
* Twitter: [@Joshecm94](https://twitter.com/Joshecm94)
* Github: [@jecortes2304](https://github.com/jecortes2304)
* LinkedIn: [@josé-ernesto-cortes-mendez-7bb8671b6](https://linkedin.com/in/josé-ernesto-cortes-mendez-7bb8671b6)

## 📝 License

This project is [ISC](https://opensource.org/licenses/ISC) licensed.

## Show your support

Give a ⭐ if this project helped you!