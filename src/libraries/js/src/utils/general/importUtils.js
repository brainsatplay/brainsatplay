import {appletManifest} from '../../../../../platform/appletManifest'
import {Application} from '../../Application'

export let dynamicImport = async (url) => {
    let module = await import(url);
    return module;
}

export let getAppletSettings = async (AppletFolderUrl) => {
    let config = await dynamicImport(AppletFolderUrl+"/settings.js");
    //let image = await dynamicImport(AppletFolderUrl+"/"+config.settings.image);
    return config.settings;
}

export let getApplet = async (settings) => {
    if (settings.module){
        let module = await dynamicImport(appletManifest[settings.name].folderUrl+"/"+settings.module + '.js');
        return module[settings.module];
    } else {
        return Application
    }
}

export let generateSettings = (appletManifest=appletManifest, from=0, to='end', category=undefined, onload=(url,result)=>{}) => {
    let settings = new Map();
    let appletKeys = Object.keys(appletManifest)
    if(to === 'end') to = appletKeys.length;

    appletKeys.forEach(async (key,i) => {
        if(i >= from && i < to) {
            let result = await getAppletSettings(appletManifest[key].folderUrl);
            if(category === undefined)
                settings.set(result.name,result); 
            else if (result.settings.categories.indexOf(category) > -1) 
                settings.set(result.name,result);

            onload(appletManifest[key].folderUrl,result);
        }
    });

    return settings;
}

export function parseContent(url, type='image') {
    let setHTMLcontent;
    if (type === 'image')
    {
        setHTMLcontent = '<img src="' + url + '">';
    }
    else if (type === 'youtube')
    {
        //Get Youtube Video Id for Embed
        var videoId = youtube_parser(url);
        setHTMLcontent = '<iframe width="400" height="300" src="https://www.youtube.com/embed/' + videoId + '?controls=1"></iframe>';
    }
    else if (type === 'youtube-playlist') {
        var playlistId = youtube_playlist_parser(url);
        setHTMLcontent = '<iframe width="400" height="300" src="https://www.youtube.com/embed/playlist?list=' + playlistId + '?controls=1"></iframe>';
    }
    else if (type === 'reddit')
    {
        if(!document.getElementById('redditscript')) {
            document.head.insertAdjacentHTML('before-end','<script id="redditscript" async src="//embed.redditmedia.com/widgets/platform.js" charset="UTF-8"></script>')
        }
        setHTMLcontent = '<blockquote class="reddit-card" data-card-preview="1"><a href="' + url + '"></blockquote>';
    }
    else if (type === 'vimeo')
    {
        var vimId = vimeo_parser(url);
        setHTMLcontent = '<iframe src="https://player.vimeo.com/video/'+vimId+'" width="640" height="338" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></iframe>';

    }
    else if (type === 'soundcloud')
    {
        var scId = soundcloud_parser(url);
        setHTMLcontent = '<iframe width="100%" height="300" scrolling="no" frameborder="no" src="embedUrlBase'+scId+'"></iframe>';
    }
    // Add a bunch more of these using correct JS script. These are mostly php scripts: https://github.com/mmkjony/awesome-regex-1#vimeo
    return setHTMLcontent;
}

function youtube_parser(url) {
    var regExp = /^.*(youtu.be\/|v\/|embed\/|watch\?|youtube.com\/user\/[^#]*#([^\/]*?\/)*)\??v?=?([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[3].length == 11) {
        return match[3];
    } else {
        return false;
    }
}

function youtube_playlist_parser(url) {
    var regExp = /^.*(youtu\.be\/|list=)([^#\&\?]*).*/;
    var match = url.match(regExp);
    if (match && match[2].length == 12) {
        return match[2];
    }
    return null;
}

function vimeo_parser(url) {
    var regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
    var match = url.match(regExp);
    if (match && match[4]) {
        return match[4];
    }
    return null;
}

function soundcloud_parser(url) {
    var regExp; // Need to find correct regExp (cannot be for the PhP regexp script)
    var match = url.match(regExp);
    if (match && match[2]) {
        return match[2];
    }
    return null;
}

