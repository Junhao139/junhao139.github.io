var global_SongInfo;

init();

function init() {
    var wholeURL = window.location.search;
    var urlParameters = new URLSearchParams(wholeURL);
    var directingSongFile = urlParameters.get("songid");
    //var directingTextFile = urlParameters.get("cnt");

    getSongInfo("https://raw.githubusercontent.com/Junhao139/junhao139.github.io/master/resources/songs/" + directingSongFile + ".json", defineLyricFile);
}

function getSongInfo(url, callback_func) {
    $.get(
        url,
        function (callback, status) {
            global_SongInfo = JSON.parse(callback) || callback;
            callback_func();
        }
    );
}

var lyrics_check_function;
function defineLyricFile() {
    var lyrics_length = global_SongInfo.song_lyrics.length;

    if (global_SongInfo.version == 1 || global_SongInfo.version == undefined || global_SongInfo.version == null) {
        lyrics_check_function = lyrics_check;
        for (var i = 0; i < lyrics_length; ++i) {
            var elem = createLyricLineElement(
                global_SongInfo.song_lyrics[i].org,
                global_SongInfo.song_lyrics[i].trn
            );

            document.getElementById("lyrics_container").appendChild(elem);
        }
    } else if (global_SongInfo.version == 2) {
        lyrics_check_function = lyrics_check_2;
        for (var i = 0; i < lyrics_length; ++i) {
            var elem = createLyricLineElement_2(
                global_SongInfo.song_lyrics[i].org,
                global_SongInfo.song_lyrics[i].trn,
                i
            );

            document.getElementById("lyrics_container").appendChild(elem);
        }
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

function createLyricLineElement_2( orgLrcArr, trnLrc, lineIndex ) {
    var orgLrc_Elem = document.createElement("div");
        orgLrc_Elem.setAttribute("class", "lyric_line_original_container");
    
    for (var i = 0; i < orgLrcArr.length; ++i) {
        var lrc_word_Elem = document.createElement("span");
        lrc_word_Elem.setAttribute("class", "lyric_word lyric_word_from_" + lineIndex.toString());
        lrc_word_Elem.innerText = orgLrcArr[i].lrc;

        orgLrc_Elem.appendChild(lrc_word_Elem);
    }

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
        document.getElementById("lyrics_container").style.overflowY = "hidden";
        lyrics_scroll_height_check();
        audio_element.play();
        static_play_state = "playing";

        startUNIXTime = Date.now();
        interval = setInterval(lyrics_check_function, 10);
        $("#lyrics_container").animate({ scrollTop : 0 }, 200);
        break;

    case "playing":
        document.getElementById("control_music_state_trigger").innerHTML = "play_arrow";
        document.getElementById("lyrics_container").style.overflowY = "scroll";
        audio_element.load();
        static_play_state = "paused";

        startUNIXTime = 0;
        break;
    }
}

var current_lyric_playing_index = -1;
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
            line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
        }
            
        clearInterval(interval);
        return;
    }

    if (lyric_playing_index == current_lyric_playing_index) return;
    else current_lyric_playing_index = lyric_playing_index;

    var lyric_line_elements = document.getElementsByClassName("lyric_line");
    for (var i = 0; i < lyric_line_elements.length; ++i) {
        var difference = Math.abs(lyric_playing_index - i);

        var line_element = lyric_line_elements[i];
        switch (difference) {
            case 0:
                //line_element.style.filter = "blur(0px)";
                line_element.style.opacity = "1";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 1)";
                $("#lyrics_container").animate({ scrollTop : global_SongInfo.song_lyrics[i].scrollY }, 350, "easeOutCubic");

                break;
            case 1:
                //line_element.style.filter = "blur(1px)";
                line_element.style.opacity = "0.4";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
            case 2:
                //line_element.style.filter = "blur(3px)";
                line_element.style.opacity = "0.2";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
            case 3:
                //line_element.style.filter = "blur(6px)";
                line_element.style.opacity = "0.1";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
            case 4:
                //line_element.style.filter = "blur(10px)";
                line_element.style.opacity = "0.05";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
            default:
                //line_element.style.filter = "blur(20px)";
                line_element.style.opacity = "0";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
        }
    }
}

function lyrics_check_2() {
    var lyric_playing_index = 0;
    var lyric_word_playing_index = 0;

    var current_time = Date.now();
    var time_offset = current_time - startUNIXTime;

    for (var i = global_SongInfo.song_lyrics.length - 1; i >= 0; --i) {
        if (time_offset >= global_SongInfo.song_lyrics[i].show) {
            lyric_playing_index = i;

            for (var j = global_SongInfo.song_lyrics[i].org.length - 1; j >= 0; --j) {
                if (time_offset >= global_SongInfo.song_lyrics[i].org[j].show) {
                    lyric_word_playing_index = j;
                    break;
                }
            }

            break;
        }
    }

    if (startUNIXTime == 0) {
        var lyric_line_elements = document.getElementsByClassName("lyric_line");
        for (var i = 0; i < lyric_line_elements.length; ++i) {
            var line_element = lyric_line_elements[i];
            line_element.style.filter = "blur(0px)";
            line_element.style.opacity = "1";
            line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
        }
            
        clearInterval(interval);
        return;
    }

    if (lyric_playing_index != current_lyric_playing_index) {
        current_lyric_playing_index = lyric_playing_index;
        $("#lyrics_container").animate({ scrollTop : global_SongInfo.song_lyrics[lyric_playing_index].scrollY }, 350, "easeOutCubic");
    }

    if (lyric_playing_index != 0) {
        for (var j = 0; j < global_SongInfo.song_lyrics[lyric_playing_index - 1].org.length; ++j) {
            document.getElementsByClassName("lyric_word_from_" + (lyric_playing_index - 1).toString())[j].style.opacity = "1";
        }
    }

    for (var j = 0; j < global_SongInfo.song_lyrics[lyric_playing_index].org.length; ++j) {
        document.getElementsByClassName("lyric_word_from_" + (lyric_playing_index).toString())[j].style.opacity = "0.6";
    }
    document.getElementsByClassName("lyric_word_from_" + lyric_playing_index.toString())[lyric_word_playing_index].style.opacity = "1";

    // EFFECT
    var lyric_line_elements = document.getElementsByClassName("lyric_line");
    for (var i = 0; i < lyric_line_elements.length; ++i) {
        var difference = Math.abs(lyric_playing_index - i);

        var line_element = lyric_line_elements[i];
        switch (difference) {
            case 0:
                //line_element.style.filter = "blur(0px)";
                line_element.style.opacity = "1";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 1)";
                break;
            case 1:
                //line_element.style.filter = "blur(1px)";
                line_element.style.opacity = "0.4";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
            case 2:
                //line_element.style.filter = "blur(3px)";
                line_element.style.opacity = "0.2";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
            case 3:
                //line_element.style.filter = "blur(6px)";
                line_element.style.opacity = "0.1";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
            case 4:
                //line_element.style.filter = "blur(10px)";
                line_element.style.opacity = "0.05";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
            default:
                //line_element.style.filter = "blur(20px)";
                line_element.style.opacity = "0";
                line_element.style.textShadow = "0px 0px 20px rgba(255, 255, 255, 0)";
                break;
        }
    }
}

setInterval(ui_adjust, 100);
function ui_adjust() {
    document.getElementById("lyrics_container").style.height = window.innerHeight - 0 + "px";
}

function lyrics_scroll_height_check() {
    var lyric_line_elements = document.getElementsByClassName("lyric_line");
    var height_sum = 0;
    for (var i = 0; i < lyric_line_elements.length; ++i) {
        global_SongInfo.song_lyrics[i].scrollY = height_sum;
        height_sum += $(lyric_line_elements[i]).height() + 60;
    }
}