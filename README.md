# Torre Networker
## Disclaimer
This project is only a demo using torre open data and tecnologies, but is not affiliated to Torre Inc or any of it's associates
### Envoirment variables
This project need the following properties in a ```.env``` file or be accesible in the system envoirment. This are the properties that i will be using for this demo
```
app_port = 5000
bio_profile_url = https://torre.bio/api/bios
search_people_url = https://search.torre.co/people/_search
```

### PostgreSQL
The schema name used is `networker`, the setup of the database is done automatically on server start
```
networker_database_host
networker_database_port
networker_database_user
networker_database_password
networker_database_mantainence
networker_database_schema = networker
```
### Run in development
```sh
npm run dev
```

### Run for staging
```sh
npm start
```