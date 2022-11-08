/**
 * Name       ：cos-album.js
 * Version    : 1.1.6
 * Description: Cosalbum 基於騰訊云COS桶的“動態”相冊抽象類
 * Updated on : 2021/2/11 13:14
 * Author     : Lruihao http://lruihao.cn
 */

CosAlbum = function CosAlbum() {
    /**
     * 渲染DOM
     * @param {String} cosAlbum.xmlLink 需要解析的騰訊云COS桶XML鏈接
     * @param {String} [cosAlbum.prependTo='body'] 可選解析相冊到某個節點,e.g. '.myalbum','#myalbum'
     * @param {Number} [cosAlbum.viewNum=4] 每個相冊顯示的照片數目
     * @param {String} [option.imgType] 图片類型
     * @param {String} [option.videoType] 音/視頻類型
     * @param {Object} cosAlbum CosAlbum.prototype
     */
    var render_dom = function (cosAlbum) {
        let album_tree = get_cos_album(cosAlbum, cosAlbum.xmlLink);
        let $cosAlbumEle = document.createElement('div');
        let $insert = document.querySelector(cosAlbum.prependTo || 'body');
        $cosAlbumEle.className = 'cos-album';


        let render_fold = function (cosAlbum, album) {
            let $photoBox = document.createElement('div');
            let $title = document.createElement('div');
            $title.innerHTML = album.name;
            $title.className = 'title';
            $photoBox.className = 'photoBox';
            $cosAlbumEle.appendChild($photoBox);

            for (let index = 0, count = 0; index < album.children.length /*&& count <= cosAlbum.viewNum*/; index++) {
                const child = album.children[index];

                if (!cosAlbum.showCover && child.is_cover())
                    continue;
                let $photo = document.createElement('div');
                let $desc = document.createElement('span');
                let $upDate = document.createElement('span');
                let $media;
                $photo.className = 'photo';
                if (cosAlbum.imgType.includes(child.type)) {
                    $media = document.createElement('img');
                    $media.setAttribute('alt', child.filename);
                    $media.setAttribute('src', `${cosAlbum.xmlLink}/${child.path}`);
                    $media.classList.add('photo-img');
                    $photo.classList.add('photo-img-wrapper');
                }
                else if (cosAlbum.videoType.includes(child.type)) {
                    $media = document.createElement('video');
                    $media.setAttribute('controls', 'controls');
                    $media.setAttribute('src', `${cosAlbum.xmlLink}/${child.path}`);
                    $media.classList.add('photo-video');
                    $photo.classList.add('photo-video-wrapper');
                }
                else if (child.fold) {
                    $media = document.createElement('img');
                    $media.setAttribute('alt', child.name);
                    $media.setAttribute('src', `${cosAlbum.xmlLink}/${child.cover.path}`);
                    $media.classList.add('photo-album');
                    $photo.classList.add('photo-album-wrapper');
                    // todo view album inner
                }
                else {
                    continue;
                }
                $upDate.innerHTML = timeSince(child.date);
                $upDate.title = child.date;
                $upDate.classList.add('upload-desc')
                $media.setAttribute('loading', 'lazy');
                $desc.innerHTML = $desc.title = child.filename;
                $photo.appendChild($media);
                $photo.appendChild($desc);
                child.date && $photo.appendChild($upDate);
                $photoBox.appendChild($photo);
                ++count;
            }

            //插入指定元素第一个子元素
            $insert.insertBefore($cosAlbumEle, $insert.firstChild);
        }

        album_tree.children.forEach(album => {
            render_fold(cosAlbum, album);
        });
    };

    /**
    * 生成文件夹结构
     * @param {Object} cosAlbum CosAlbum.prototype
    * @param {Array<String>} urls 路径数组
    * @param {Array<String>} dates 时间数组
    * @param {Array<int>} sizes 大小数组
    * @return {Object} tree 存储相册树形结构的对象
    */
    function make_album_tree(cosAlbum, urls, dates, sizes) {
        let get_filename_and_ext = pathfilename => {

            var filenameextension = pathfilename.replace(/^.*[\\\/]/, '');
            var filename = filenameextension.substring(0, filenameextension.lastIndexOf('.'));
            var ext = filenameextension.split('.').pop();

            if (filename == '' && !pathfilename.startsWith('.')) {
                filename = ext;
                ext = '';
            }

            return [filename, ext];

        }

        let make_node = (name, fold, date, size) => {
            let node = {};
            node.name = name;
            node.parent = null;
            node.path = '';
            node.fold = fold;
            [node.filename, node.type] = get_filename_and_ext(name);
            node.children = fold ? [] : null;
            node.date = date;
            node.size = parseInt(size);
            node.is_root = () => { return (node.parent ?? null) == null; };
            node.is_root_album = () => { return (node.parent?.parent ?? null) == null; };
            node.get_child = (child_name) => {
                let child = node?.children?.find(n => n.name == child_name) ?? null;
                return child;
            }
            node.is_cover = () => {
                return !node.fold && node?.parent?.cover == node;
            }
            node.insert_child = fold ? (child) => {
                child.parent = node;
                child.path = node.path + child.name + (child.fold ? '/' : '');
                node.children.push(child);
            } : null;

            return node;
        };

        let tree = make_node('', true, null, 0);

        for (let index = 0; index < urls.length; index++) {
            const path = urls[index];
            const date = dates[index];
            const size = sizes[index];

            [, ext] = get_filename_and_ext(path);
            if (!cosAlbum.imgType.includes(ext) && !cosAlbum.videoType.includes(ext))
                continue;
            if (path.endsWith('/'))
                continue;
            if (cosAlbum.album_regex != '' && !RegExp(cosAlbum.album_regex).test(path))
                continue;

            let node_ptr = tree;
            let node_arr = path.split('/').filter(item => item.trim() != '');

            // process fold
            for (let node_index = 0; node_index < node_arr.length - 1; node_index++) {
                const node_name = node_arr[node_index];
                let ptr = node_ptr.get_child(node_name);
                if (ptr != null) {
                    node_ptr = ptr;
                    continue;
                }

                // construct
                let node = make_node(node_name, true, null, 0);
                node_ptr.insert_child(node);
                node_ptr = node;
            }
            // process file
            const file_name = node_arr[node_arr.length - 1];
            let file_node = make_node(file_name, false, date, size);
            node_ptr.insert_child(file_node);
        }

        // choose cover

        let set_album_cover_r = function (album) {
            if (!album.fold)
                return;

            album.cover = album.children.find(e => {
                return !e.fold && cosAlbum.imgType.includes(e.type) && e.filename.endsWith('cover');
            }) ?? album.children.find(e => {
                return !e.fold && cosAlbum.imgType.includes(e.type);
            }) ?? null;

            album.children.forEach(album => set_album_cover_r(album));
        }
        tree.children.forEach(album => set_album_cover_r(album));

        return tree;
    }


    /**
     * 獲取圖片的名稱和上傳日期
     * @param {String} xmlLink 需要解析的騰訊云COS桶XML鏈接
     * @param {Object} cosAlbum CosAlbum.prototype
     * @return {Object} album_tree 包含名稱和日期、大小的相册树
     */
    var get_cos_album = function (cosAlbum, xmlLink) {
        cosAlbum.xmlDoc = load_xml_doc(xmlLink);
        let urls = Array.from(cosAlbum.xmlDoc.querySelectorAll('Key')).map(ele => { return ele.innerHTML; });
        let dates = Array.from(cosAlbum.xmlDoc.querySelectorAll('LastModified')).map(ele => { return ele.innerHTML.slice(0, 19).replace(/T/g, ' '); });
        let sizes = Array.from(cosAlbum.xmlDoc.querySelectorAll('Size')).map(ele => { return parseInt(ele.innerHTML); });
        let album_tree = make_album_tree(cosAlbum, urls, dates, sizes);
        return album_tree;
    };
    /**
     * 加載XML
     * @param {String} xmlLink 需要解析的騰訊云COS桶XML鏈接
     * @return {Object} xmlDoc XML文檔節點對象
     */
    var load_xml_doc = function (xmlUrl) {
        let xmlDoc = {};
        try {
            //Internet Explorer
            xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
        } catch (e) {
            try {
                //Firefox, Mozilla, Opera, etc.
                xmlDoc = document.implementation.createDocument('', '', null);
            } catch (e) {
                console.error(e.message);
            }
        }
        try {
            xmlDoc.async = false;
            xmlDoc.load(xmlUrl);
        } catch (e) {
            try {
                //Google Chrome
                let chromeXml = new XMLHttpRequest();
                chromeXml.open('GET', xmlUrl, false);
                chromeXml.send(null);
                xmlDoc = chromeXml.responseXML.documentElement;
            } catch (e) {
                console.error(e.message);
            }
        }
        return xmlDoc;
    };
    /**
     * 將時間字串轉換為時間差距字串，如：1小時之前、50秒之前等
     * @param {String} date 時間字串
     * @returns {String} 時間差距字串
     * @function
     */
    var timeSince = (date) => {
        if (!date) {
            return;
        }
        let dateTS = new Date(date.replace(/-/g, '/'));
        let seconds = Math.floor((new Date() - dateTS) / 1000 - 8 * 3600);
        let interval = Math.floor(seconds / (30 * 24 * 3600));
        if (interval >= 4) {
            return date.slice(0, -3);
        }
        if (interval >= 1) {
            return interval + " months ago";
        }
        interval = Math.floor(seconds / (7 * 24 * 3600));
        if (interval >= 1) {
            return interval + " weeks ago";
        }
        interval = Math.floor(seconds / (24 * 3600));
        if (interval >= 1) {
            return interval + " days ago";
        }
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval + " hours ago";
        }
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval + " minutes ago";
        }
        return "just now";
    };
    /**
     * 创建 Powered By cos-album
     * @param {String} version 版本号
     */
    var createPowerElement = (version) => {
        let $cosAlbumEle = document.querySelector('.cos-album');
        let $caPowerEle = document.createElement('div');
        let $caPowerLink = document.createElement('a');
        $caPowerLink.href = 'https://github.com/Ohto-Ai';
        $caPowerLink.target = '_blank';
        $caPowerLink.innerHTML = 'Ohto-Ai';
        $caPowerEle.className = 'capower';
        $caPowerEle.innerHTML = 'Powered By ';
        $caPowerEle.appendChild($caPowerLink);
        $caPowerEle.innerHTML += `<br/>v${version}`;
        $cosAlbumEle.appendChild($caPowerEle);
    };
    /**
     * 把字符串的文件後綴轉成數組
     * @param {String} str 待轉化字符串
     * @returns {Array|null} 轉化后的數組
     */
    var _str2Array = (str) => {
        if (typeof (str) !== String && !Array.isArray(str)) {
            return null;
        }
        if (!Array.isArray(str)) {
            return str.split(',');
        }
    };

    /**
     * Cosalbum 基於騰訊云COS桶的“動態”相冊
     * @param {Object} option 
     * @param {String} option.xmlLink 需要解析的騰訊云COS桶XML鏈接
     * @param {Array} option.album_regex 添加到相册的路径
     * @param {String} [option.prependTo='body'] 可選解析相冊到某個節點,e.g. '.myalbum','#myalbum'
     * @param {Number} [option.viewNum=4] 每個相冊顯示的照片數目
     * @param {String} [option.imgType] 图片類型
     * @param {String} [option.videoType] 音/視頻類型
     * @namespace Cosalbum
     * @class Cosalbum
     * @author Lruihao http://lruihao.cn
     */
    function CosAlbum(option) {
        var _proto = CosAlbum.prototype;
        this.version = '1.0.0';
        this.option = option || {};
        this.xmlLink = this.option.xmlLink || '';
        this.album_regex = this.option.album_regex || '';
        this.prependTo = this.option.prependTo || 'body';
        this.showCover = this.option.showCover || true;
        this.viewNum = this.option.viewNum || 4;
        this.imgType = _str2Array(this.option.imgType) || ['jpg', 'jpeg', 'png', 'gif', 'svg'];
        this.videoType = _str2Array(this.option.videoType) || ['mp4', 'mp3', 'avi', 'mov', 'qt'];

        render_dom(this);
        createPowerElement(this.version);
    }
    return CosAlbum;
}();