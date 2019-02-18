# A REST API for a Video rental platform

Built with Node.js, Express, MongoDB.

# How to use?

First clone this repo on your local machine. Make sure you have Node.js v8 or greater installed. Also NPM v6 or greater installed.

```bash
git clone https://github.com/raikusy/mosh-vidly.git
```

Next install all the dependencies.

```bash
npm install
```

You need to export a environment variable to make this project work. To set environment variable on your mac os / linux machine type the bellow command in your terminal.

```bash
export vidly_jwtPrivateKey=secretKey
```

For windows open CMD and enter:

```bash
set vidly_jwtPrivateKey=secretKey
```

Next MongoDB needs to be installed and running in your machine.
If everythings setup, enter the following command to start the application.

```bash
node index.js
```

Or you can use nodemon:

```bash
npm install -g nodemon
nodemon index.js
```
