class MetingRadioJSElement extends HTMLElement {

    connectedCallback() {
        if (window.APlayer && window.fetch) {
			const djplaylist = []
            this._init()
            this._parse()
			console.log(djplaylist)
        }
    }

    disconnectedCallback() {
        if (!this.lock) {
            this.aplayer.destroy()
        }
    }

    _camelize(str) {
        return str
        .replace(/^[_.\- ]+/, '')
        .toLowerCase()
        .replace(/[_.\- ]+(\w|$)/g, (m, p1) => p1.toUpperCase())
    }

    _init() {
        let config = {}
        for (let i = 0; i < this.attributes.length; i += 1) {
            config[this._camelize(this.attributes[i].name)] = this.attributes[i].value
        }
        let keys = [
            'server', 'type', 'id', 'api', 'auth',
            'auto', 'lock',
            'name', 'title', 'artist', 'author', 'url', 'cover', 'pic', 'lyric', 'lrc',
        ]
        this.meta = {}
        for (let key of keys) {
            this.meta[key] = config[key]
                delete config[key]
        }
        this.config = config

            this.pllstapi = 'https://netease.project.ac.cn/dj/:type?rid=:id&r=:r'
    }

    _parse() {
        let pllsturl = this.pllstapi
            .replace(':type', this.meta.type)
            .replace(':id', this.meta.id)
            .replace(':r', Math.random())

            fetch(pllsturl)
            .then((response) => response.json())
            .then((data) => {
                for (var i = 0; i <= data.programs.length - 1; i++) {
                    let count = {}
                    console.log(data.programs.length)
                    count.author = data.programs[i].dj.nickname
                        count.lrc = '[00:00.00]' + data.programs[i].radio.desc
                        count.pic = data.programs[i].radio.picUrl
                        count.title = data.programs[i].name
                        let rid = data.programs[i].mainTrackId
                        console.log(rid)
                        let songurl = 'https://netease.project.ac.cn/song/url?id=:rid&r=:r'
                        .replace(':rid', rid)
                        .replace(':r', Math.random())
                        console.log(songurl)
                        fetch(songurl)
                        .then((response1) => response1.json())
                        .then((data1) => {
                            count.url = data1.data[0].url
                                djplaylist.push(count)
                        })
                }
            })
            this._loadPlayer(djplaylist)
    }

    _loadPlayer(data) {

        let defaultOption = {
            audio: data,
            mutex: true,
            lrcType: this.meta.lrcType || 3,
            storageName: 'metingjsradio'
        }

        if (!data.length)
            return

            let options = {
                ...defaultOption,
                ...this.config,
            }
        for (let optkey in options) {
            if (options[optkey] === 'true' || options[optkey] === 'false') {
                options[optkey] = (options[optkey] === 'true')
            }
        }

        let div = document.createElement('div')
            options.container = div
            this.appendChild(div)
            console.log(options)
            this.aplayer = new APlayer(options)
    }

}

console.log('\n %c MetingJS v2.0.1 %c https://github.com/metowolf/MetingJS \n', 'color: #fadfa3; background: #030307; padding:5px 0;', 'background: #fadfa3; padding:5px 0;')

if (window.customElements && !window.customElements.get('meting-js')) {
    window.MetingRadioJSElement = MetingRadioJSElement
        window.customElements.define('meting-js', MetingRadioJSElement)
}