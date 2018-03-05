require("dotenv").config();

var fs = require("fs");
var Spotify = require("node-spotify-api");
var Twitter = require("twitter");
var request = require("request");
var keys = require("./keys");

//Setting global variables

// empty string to store song and movie search input
var searchItem = "";
// captures the song and search input that gets pushed to the above string
var userInput = process.argv;
// used in switch case to capture user command
var command = process.argv[2];

//Switch case to trigger different functions depending on user command

switch (command) {

    case "movie-this":
        movieInfo();
        break;

    case "my-tweets":
        getMyTweets();
        break;

    case "spotify-this-song":
        spotifySongInfo();
        break;

    case "do-what-it-says":
        doWhatItSays();
        break;

}

//Get movie info function

function movieInfo() {
    // captures the movie title the user inputs
    for (var i = 3; i < userInput.length; i++) {
        searchItem += userInput[i] + "+";
    }
    // if the user does not input any movie title, it will default to searching for Mr. Nobody
    if (searchItem === "") {
        searchItem = "Mr.+Nobody";
    }
    // the users movie title input is placed into the search URL
    var queryURLIMDB = "http://www.omdbapi.com/?t=" + searchItem + "&y=&plot=short&apikey=trilogy";
    // a request is sent to IMDB for it to send us the movie information back
    request(queryURLIMDB, function (error, response, body) {
        // if the movie information comes back succesfully, we display the below information
        if (!error && response.statusCode === 200) {

            var responseIMDBObject = JSON.parse(body);
            console.log("Movie Title: " + responseIMDBObject.Title);
            console.log("Year: " + responseIMDBObject.Year);
            console.log("Rated: " + responseIMDBObject.Rated);
            console.log("Rotten Tomatoes: " + responseIMDBObject.Ratings[1].Value);
            console.log("Made In: " + responseIMDBObject.Country);
            console.log("Language: " + responseIMDBObject.Language);
            console.log("Plot: " + responseIMDBObject.Plot);
            console.log("Cast: " + responseIMDBObject.Actors);
        } else {
            console.log("I am sorry that is not a movie!");
        }
    })
}

//Get tweets function

function getMyTweets() {
    // link twitter key and token information
    var twitterKey = new Twitter(keys.twitter);
    // make request to twitter for my tweet information
    twitterKey.get("statuses/user_timeline", "petersona78", function (error, tweets, response) {
        // if the information comes back without any errors 
        if (!error && response.statusCode === 200) {
            // this runs if my profile has 20 or more tweets and displays 20 tweets
            if (tweets.length > 20) {
                for (var i = 0; i < 20; i++) {
                    console.log("\n" + tweets[i].text);
                    console.log("Tweeted at: " + tweets[i].created_at + "\n");
                }
                // this runs if my profile has less than 20 tweets and displays all of the tweets I have
            } else {
                for (var i = 0; i < tweets.length; i++) {
                    console.log("\n" + tweets[i].text);
                    console.log("Tweeted at: " + tweets[i].created_at + "\n");
                }
            }
            // If we do not get any response back from twitter this runs
        } else {
            console.log("I am sorry we could not find any tweets!");
            console.log(error);
        }
    });
}


//Spotify search function
 
function spotifySongInfo() {
    // link up spotify ID and secret information
    var spotifyKey = new Spotify(keys.spotify);
    // captures song title input
    for (var i = 3; i < userInput.length; i++) {
        searchItem += userInput[i] + " ";
    }
    // inputs song title into function and sends a request to spotify for information
    spotifyKey.search({ type: 'track', query: searchItem, limit: 1 }, function (err, data) {
        // if there is an error log the error  
        if (err) {
            console.log(err);
        }
        // displays information about the song the user input
        console.log("\nArtist: " + data.tracks.items[0].artists[0].name);
        console.log("\nSong Name: " + data.tracks.items[0].name);
        console.log("\nPreview Link: " + data.tracks.items[0].external_urls.spotify);
        console.log("\nAlbum: " + data.tracks.items[0].album.name);
    });
}

//Do what it says Function

function doWhatItSays() {
    // search in my computers file storage for my random.txt file and capture the text
    fs.readFile("./random.txt", "utf8", function (err, data) {
        // split the text information we recieved from random.txt into and array sub strings 
        var splitString = data.split(",");
        // set searchItem global variable to the song name we captured from the above variable
        searchItem = splitString[1];
        // feed this song name into the spotifyThisSong() function
        spotifySongInfo();
    })
}