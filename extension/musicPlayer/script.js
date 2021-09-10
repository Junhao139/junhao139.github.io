var global_SongInfo;

init();

function init() {
    var wholeURL = window.location.search;
    var urlParameters = new URLSearchParams(wholeURL);
    var directingSongFile = urlParameters.get("songid");
    //var directingTextFile = urlParameters.get("cnt");

    getSongInfo("https://blog.zminutes.com/resources/songs/" + directingSongFile + ".json", defineLyricFile);
}

function getSongInfo(url, callback_func) {
    $.get(
        url,
        function (callback, status) {
            global_SongInfo = callback;
            callback_func();
        }
    );
}

function defineLyricFile() {
    var lyrics_length = global_SongInfo.song_lyrics.length;
    for (var i = 0; i < lyrics_length; ++i) {
        var elem = createLyricLineElement(
            global_SongInfo.song_lyrics[i].org,
            global_SongInfo.song_lyrics[i].trn
        );

        document.getElementById("lyrics_container").appendChild(elem);
    }
}

function createLyricLineElement( orgLrc, trnLrc ) {
    var orgLrc_Elem = document.createElement("span");
        orgLrc_Elem.setAttribute("class", "lyric_line_original");

    var trnLrc_Elem = document.createElement("span");
        trnLrc_Elem.setAttribute("class", "lyric_line_translated");
    
    var container_Elem = document.createElement("div");
        container_Elem.setAttribute("class", "lyric_line");

    container_Elem.appendChild(orgLrc_Elem);
    container_Elem.appendChild(trnLrc_Elem);

    return container_Elem;
}