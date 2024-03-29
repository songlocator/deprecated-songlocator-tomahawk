define(function(require, exports, module) {
var tomahawkShim = require('./songlocator-tomahawk-shim');
var Tomahawk = tomahawkShim.Tomahawk;
var TomahawkResolver = tomahawkShim.TomahawkResolver;
var window = tomahawkShim.window;
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var OfficialfmResolver = Tomahawk.extend(TomahawkResolver, {
    settings: {
        name: 'Official.fm',
        icon: 'officialfm-icon.png',
        weight: 70,
        timeout: 5
    },
    
    spell: function(a){magic=function(b){return(b=(b)?b:this).split("").map(function(d){if(!d.match(/[A-Za-z]/)){return d}c=d.charCodeAt(0)>=96;k=(d.toLowerCase().charCodeAt(0)-96+12)%26+1;return String.fromCharCode(k+(c?96:64))}).join("")};return magic(a)},

    init: function () {
        this.secret = this.spell("yptuKlFHC3azLLcBNYoCHW6t30I1M5uy");
    },
    
    asyncRequest: function (url, callback) {
        var xmlHttpRequest = new XMLHttpRequest();
        xmlHttpRequest.open('GET', url, true);
        xmlHttpRequest.setRequestHeader('X-Api-Version', 2.0);
	Tomahawk.log("Doing API call: " + url);
        xmlHttpRequest.onreadystatechange = function () {
            if (xmlHttpRequest.readyState == 4 && xmlHttpRequest.status == 200) {
                callback.call(window, xmlHttpRequest);
            } else if (xmlHttpRequest.readyState === 4) {
                Tomahawk.log("Failed to do GET request: to: " + url);
                Tomahawk.log("Status Code was: " + xmlHttpRequest.status);
            }
        }
        xmlHttpRequest.send(null);
    },

    resolve: function (qid, artist, album, title) {
        if (artist !== "") {
            query = encodeURIComponent(artist) + "+";
        }
        if (title !== "") {
            query += encodeURIComponent(title);
        }
        var apiQuery = "http://api.official.fm/tracks/search?api_key=" + this.secret + "&fields=streaming&api_version=2.0&q=" + query;
        var that = this;
        var resultObj = {
            results: [],
            qid: qid
        };
        that.asyncRequest(apiQuery, function (xhr) {
            var resp = JSON.parse(xhr.responseText);
            if (resp.total_entries !== 0) {
                for (var i = 0; i < Math.min(3, resp.total_entries); i++) {
                    if (resp.tracks[i] === undefined || resp.tracks[i].track === undefined) {
                        continue;
                    }
                    var track = resp.tracks[i].track;

                    Tomahawk.log("Result: " + JSON.stringify(track));
                    if (track.streaming === undefined || track.streaming.http === undefined) {
                        Tomahawk.log("Found result from Official.fm but no streaming url...");
                        continue;
                    }

                    var result = {
                        track: track.title,
                        artist: track.artist
                    };

                    result.source = that.settings.name;
                    result.mimetype = "audio/mpeg";
                    result.bitrate = 160;
                    result.duration = track.duration;
                    result.score = 0.85;
                    result.url = track.streaming.http;

                    resultObj.results.push(result);
                }
            }
            ((typeof that === 'undefined')?this:that).addTrackResults(resultObj);
        });
    },

    search: function (qid, searchString) {
        var apiQuery = "http://api.official.fm/tracks/search?api_key=" + this.secret + "&api_version=2.0&fields=streaming&q=" + encodeURIComponent(searchString.replace('"', '').replace("'", ""));
        var that = this;
        var resultObj = {
            results: [],
            qid: qid
        };
        this.asyncRequest(apiQuery, function (xhr) {
            var resp = JSON.parse(xhr.responseText);
            if (resp.total_entries !== 0) {
                for (var i = 0; i < resp.total_entries; i++) {
                    if (resp.tracks[i] === undefined || resp.tracks[i].track === undefined) {
                        continue;
                    }
                    var track = resp.tracks[i].track;

                    Tomahawk.log("Result: " + JSON.stringify(track));
                    if (track.streaming === undefined || track.streaming.http === undefined) {
                        Tomahawk.log("Found result from Official.fm but no streaming url...");
                        continue;
                    }

                    var result = {
                        track: track.title,
                        artist: track.artist
                    };

                    result.source = that.settings.name;
                    result.mimetype = "audio/mpeg";
                    result.bitrate = 160;
                    result.duration = track.duration;
                    result.score = 0.85;
                    result.url = track.streaming.http;

                    resultObj.results.push(result);
                }
            }
            ((typeof that === 'undefined')?this:that).addTrackResults(resultObj);

        });
    }
});

Tomahawk.resolver.instance = OfficialfmResolver;
exports.Resolver = Tomahawk.resolver.instance;
if (window !== undefined) {
  window.SongLocator = window.SongLocator || {};
  window.SongLocator.Tomahawk = window.SongLocator.Tomahawk || {};
  window.SongLocator.Tomahawk.officialfm = {Resolver: exports.Resolver};
}
});
