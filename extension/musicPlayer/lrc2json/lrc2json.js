var json_out = {
    name : "",
    artist : "",
    original_lrc_lang : "en",
    translated_lrc_lang : "zh",
    song_duration_ms : 0,
    song_lyrics : [],
    file_path : ""
}

function convert() {
    // SET BASIC VALUES
    json_out.name = document.getElementById("name").value;
    json_out.artist = document.getElementById("artist").value;
    json_out.original_lrc_lang = document.getElementById("orgLang").value;
    json_out.translated_lrc_lang = document.getElementById("trnLang").value;
    json_out.file_path = document.getElementById("songPath").value;

    // LYRICS
    var cnt = document.getElementById("org").value;

    var lined_cnt = cnt.split("\n");
    for (var line_count = 0; line_count < lined_cnt.length; ++line_count) {
        const current_line_str = lined_cnt[line_count];

        var start_character_index = current_line_str.indexOf("[");
        var end_character_index = current_line_str.indexOf("]");
        if (end_character_index < 0 || start_character_index < 0) continue;
        
        var line_info = current_line_str.substring(start_character_index, end_character_index + 1);
        line_info = line_info.substring(1, line_info.length - 1);

        // GET TIME INFO (NOT SECURE)
        var line_minutes, line_seconds, line_milli;
        line_minutes = parseInt(line_info.substring(0, line_info.indexOf(":")));
        line_seconds = parseInt(line_info.substring(line_info.indexOf(":") + 1, line_info.indexOf(".")));
        line_milli = parseInt(line_info.substring(line_info.indexOf(".") + 1, line_info.length - 1)) * 10;

        var line_appear_time = line_milli + line_seconds * 1000 + line_minutes * 60000;
        var line_lyric = current_line_str.substring(end_character_index + 1);

        var line_lyric_original, line_lyric_translated;
        if (line_lyric.indexOf("^") > -1) {
            line_lyric_original = line_lyric.substring(0, line_lyric.indexOf("^"));
            line_lyric_translated = line_lyric.substring(line_lyric.indexOf("^") + 1);
        } else {
            line_lyric_original = line_lyric;
            line_lyric_translated = "";
        }

        console.log(line_info);

        json_out.song_lyrics.push({
            org : line_lyric_original,
            trn : line_lyric_translated,
            show : line_appear_time
        });
    }

    document.getElementById("cvt").innerText = JSON.stringify(json_out);
}