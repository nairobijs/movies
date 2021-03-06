﻿
;

//Example JavaScript Module based on the jQuery pattern
//It is wrapped within an anymous enclosure
(function (window, undefined) {

    "use strict";

    //this is ultimately the object used to create the global variable
    //it is set at the end of the module
    //I use RottenTomatoes as an example name, you can do a replace all to name it 
    //what every suites your needs.
    var RottenTomatoes = function (customSettings) {

        var that = new RottenTomatoes.fn.init(customSettings);

        that.settings = $.extend({}, that.settings, customSettings);


        //for a lightweight library with an extend method see my dollarbill repository
        //https://github.com/docluv/dollarbill

        that.data = that.settings.data || rqData();

        return that;
    };


    //Create an alias to the module's prototype
    //create the object's members in the protype definition.
    RottenTomatoes.fn = RottenTomatoes.prototype = {

        //hmm what is this for?
        //well combined with the following init definition we 
        constructor: RottenTomatoes,


        //gets everything started and returns a reference to the object.
        //notice it was called from the RottenTomatoes function definition above.
        init: function (customSettings) {
            //return a reference to itself so you can chain things later!
            return this;
        },


        //I think this is just good practice ;)
        version: "0.0.1",

        rtRoot: "http://api.rottentomatoes.com/api/public/v1.0/",
        apiKey: "fghr8zjnazt4w7fuza4se7wp",
        defaultPageLimit: 12,

        data: undefined,

        TopBoxOfficeMovies: function (pageLimit, page, callback) {

            return this.getRottenTomatoesList("box_office", pageLimit, page, callback);
        },

        OpeningMovies: function (pageLimit, page, callback) {

            return this.getRottenTomatoesList("opening", pageLimit, page, callback);
        },

        InTheatersMovies: function (pageLimit, page, callback) {

            return this.getRottenTomatoesList("in_theaters", pageLimit, page, callback);
        },

        ComingSoonMovies: function (pageLimit, page, callback) {

            return this.getRottenTomatoesList("upcoming", pageLimit, page, callback);

        },

        SearchMovies: function (pageLimit, page, q, callback) {

            page = page || 1;
            pageLimit = pageLimit || this.defaultPageLimit;

            var that = this,
                url = that.rtRoot + "movies.json?apikey=" + this.apiKey +
                        "&q=" + q + "&page_limit=" +
                        pageLimit + "&page=" + page;

            return that.data.getJSONP(url, {
                success: function (data) {
                    that.MoviesCallback.call(that, data, callback);
                }
            });

        },

        loadMovieDetails: function (id, callback) {

            var that = this,
                url = that.rtRoot + "movies/" + id + ".json?apikey=" + that.apiKey,
                    success = function(movie){
                    
                        if (callback) {

                            movie = that.setMoviePoster(movie)[0];

                            callback(movie);
                        }
                    
                    };

            return that.data.getJSONP(url, {
                success: success
            });

        },

        storeMoviesInStorage: function (movies) {

            if (!movies || !movies.length) {
                return;
            }

            var movie,
                that = this,
                i = 0,
                cacheKey = "",
                ls = window.localStorage;

            for (i = 0; i < movies.length; i++) {

                movie = movies[i];

                //build the cacheKey to reference in localStorage. Must add jsonp as the preFilter does this when it stored the result
                cacheKey = that.rtRoot + "movies/" + movie.id + ".json?apikey=" +
                            that.apiKey + "jsonp";

                ls.setItem(cacheKey, JSON.stringify(movie));
                ls.setItem(cacheKey + '-cachettl', +new Date() //forces it to return ticks
                            + 1000 * 60 * 60 * 72); //ms * seconds * minutes * hours to add to current time in ticks
                //72 represents 3 days, which is a magic #
                //you can adjust this number to suit your needs, but movie information rarely changes so a long
                //period is more desireable. 
            }

        },

        setMoviePoster: function (movies) {

            if (!movies.length) {  //rude detection for nodeList
                //    movies = movies;
                //} else {
                movies = [movies];
            }

            for (var i = 0; i < movies.length; i++) {

                movies[i].poster = movies[i].posters.profile;

            }

            return movies;
        },

        MoviesCallback: function (data, callback) {

            var that = this;

            if (data.total > 0 || data.movies.length > 1) {
                data.movies = that.setMoviePoster(data.movies);
            }

            if (callback) {
                callback.call(that, data);
            }

            that.storeMoviesInStorage(data.movies);

        },

        getRottenTomatoesList: function (listName, pageLimit, page, callback) {

            var that = this;

            return this.getRottenTomatoes(listName, pageLimit, page, function (data) {
                that.MoviesCallback.call(that, data, callback);
            });

        },

        getRottenTomatoes: function (listName, pageLimit, page, callback) {

            //might want to duck type to make the methods overloaded.

            var that = this,
                url = that.rtRoot + "lists/movies/" + listName + ".json?apikey=" +
                    that.apiKey + "&page_limit=" +
                        (pageLimit || that.defaultPageLimit) + "&page=" + (page || 1);

            return that.data.getJSONP(url, {
                success: callback
            });

        }


    };


    // Give the init function the RottenTomatoes prototype for later instantiation
    RottenTomatoes.fn.init.prototype = RottenTomatoes.fn;


    //create the global object used to create new instances of RottenTomatoes
    return (window.RottenTomatoes = RottenTomatoes);


})(window);


