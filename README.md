
<h3 align="center"><a href="https://github.com/shaheen2013/carvu_backend.git" target="_blank">CarVU</a></h3>

  <p align="center">Buying car made simple <a href="https://github.com/shaheen2013/carvu_backend.git" target="_blank">CarVU</a> You can now easily manage your car business. You can view reports yearly, monthly, weekly, even daily easily.</p>
    <p align="center">


## Project setup

>First, clone this repository for command:<br/>
<code>$ git clone https://github.com/shaheen2013/carvu_backend.git</code>

>Second change the directory this command:<br/>
<code>$ cd carvu_backend/</code>

>Then copy the .env.example file to .env flowing command:<br/>
<code>$ cp .env.example .env</code>

> To set up the app URL in the .env file<br/>
<code>APP_URL=http://localhost:3000</code><br/>

> Connection the database in the .env file<br/>
<code>
DB_CONNECTION=pgsql<br/>
DB_HOST=app<br/>
DB_PORT=5432<br/>
DB_DATABASE=carvu<br/>
DB_USERNAME=root<br/>
DB_PASSWORD=<br/>
</code>

>Build & run a project on detached mode with "Docker" this command:<br/>
<code>$ docker-compose up -d --build</code>

>If you're done all stuff, then open your favorite browser hit localhost port 3000:<br/>
<code>http://localhost:3000</code>

>Enjoy this service.

#### Some important command:

>Enter php container:<br/>
<code>$ docker exec -it app bash</code>

>Build Front-end assets:<br/>
<code>$ yarn install && yarn build</code>

## Stay in touch

- Author - [Arya Niggeh](https://twitter.com/arya)
- Website - [https://carvu.com](https://carvu.com/)

