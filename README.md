#Required env variables : 

MONGO_URI=your_mongodb_connection_string
PORT=4000
SESSION_SECRET=your_secret_key

#Ports
React port : 5173
server port : 4000

To start the website : 
create and set up your mongoDB 
create .env file with names of variables as mentioned above, 

cd to server and type in the terminal
npm install (to install required packages)
then
nodemon ./server (to start the server)

cd to client/vite-project and type in the terminal 
npm install
npm start

