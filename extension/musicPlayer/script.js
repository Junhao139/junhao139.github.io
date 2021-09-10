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

    document.getElementById("main_audio_src").setAttribute("src", global_SongInfo.file_path);
    document.getElementById("main_audio").load();
}

function createLyricLineElement( orgLrc, trnLrc ) {
    var orgLrc_Elem = document.createElement("span");
        orgLrc_Elem.setAttribute("class", "lyric_line_original");
        orgLrc_Elem.innerText = orgLrc;

    var trnLrc_Elem = document.createElement("span");
        trnLrc_Elem.setAttribute("class", "lyric_line_translated");
        trnLrc_Elem.innerText = trnLrc;
    
    var container_Elem = document.createElement("div");
        container_Elem.setAttribute("class", "lyric_line");

    container_Elem.appendChild(orgLrc_Elem);
    container_Elem.appendChild(trnLrc_Elem);

    return container_Elem;
}

var static_play_state = "paused";
var startUNIXTime = 0;
var interval;
function play_pause() {
    var audio_element = document.getElementById("main_audio");

    switch (static_play_state) {
    case "paused":
        document.getElementById("control_music_state_trigger").innerHTML = "replay";
        audio_element.play();
        static_play_state = "playing";

        startUNIXTime = Date.now();
        interval = setInterval(lyrics_check, 10);
        $("#lyrics_container").animate({ scrollTop : 0 }, 200);
        break;

    case "playing":
        document.getElementById("control_music_state_trigger").innerHTML = "play_arrow";
        audio_element.load();
        static_play_state = "paused";

        startUNIXTime = 0;
        break;
    }
}

function lyrics_check() {
    var lyric_playing_index = 0;
    var current_time = Date.now();
    var time_offset = current_time - startUNIXTime;

    for (var i = global_SongInfo.song_lyrics.length - 1; i >= 0; --i) {
        if (time_offset >= global_SongInfo.song_lyrics[i].show) {
            lyric_playing_index = i;
            break;
        }
    }

    if (startUNIXTime == 0) {
        var lyric_line_elements = document.getElementsByClassName("lyric_line");
        for (var i = 0; i < lyric_line_elements.length; ++i) {
            var line_element = lyric_line_elements[i];
            line_element.style.filter = "blur(0px)";
            line_element.style.opacity = "1";
        }
            
        clearInterval(interval);
        return;
    }

    var lyric_line_elements = document.getElementsByClassName("lyric_line");
    for (var i = 0; i < lyric_line_elements.length; ++i) {
        var difference = Math.abs(lyric_playing_index - i);

        var line_element = lyric_line_elements[i];
        switch (difference) {
            case 0:
                line_element.style.filter = "blur(0px)";
                line_element.style.opacity = "1";

                //$("#lyrics_container").animate({ scrollTop : $(".lyric_line")[i].position().top }, 200);
                break;
            case 1:
                line_element.style.filter = "blur(1px)";
                line_element.style.opacity = "0.4";
                break;
            case 2:
                line_element.style.filter = "blur(3px)";
                line_element.style.opacity = "0.2";
                break;
            case 3:
                line_element.style.filter = "blur(6px)";
                line_element.style.opacity = "0.1";
                break;
            case 4:
                line_element.style.filter = "blur(10px)";
                line_element.style.opacity = "0.05";
                break;
            default:
                line_element.style.filter = "blur(20px)";
                line_element.style.opacity = "0";
                break;
        }
    }
}

setInterval(ui_adjust, 100);
function ui_adjust() {
    document.getElementById("lyrics_container").style.height = window.innerHeight - 0 + "px";
}