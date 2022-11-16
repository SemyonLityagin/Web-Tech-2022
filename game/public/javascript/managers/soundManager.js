import gameManager from "./gameManager.js";
import MapManager from "./mapManager.js";
let instance = null

export default class SoundManager {
    constructor() {
        if(!instance) {
            instance = this
            instance.clips = {}
            instance.context = null
            instance.gainNode = null
            instance.loaded = false

            instance.mapManager = new MapManager()
        }
    }
    init(){
        instance.context = new AudioContext()
        if(instance.gainNode) instance.gainNode.disconnect()
        instance.gainNode = instance.context.createGain ? instance.context.createGain() : instance.context.createGainNode()
        instance.gainNode.connect(instance.context.destination)
    }
    load(path, callback){
        if(instance.clips[path]){
            callback(instance.clips[path])
            return
        }
        let clip = {path: path, buffer: null, loaded: false}
        clip.play = (volume, loop) => {
            instance.play(clip.path, {looping: loop ? loop : false, volume: volume ? volume : 1})
        }
        this.clips[path] = clip
        let request = new XMLHttpRequest()
        request.open("GET", path, true)
        request.responseType = 'arraybuffer'
        request.onload = () => {
            instance.context.decodeAudioData(request.response, (buffer) => {
                clip.buffer = buffer
                clip.loaded = true
                callback(clip)
            })
        }
        request.send()
    }
    loadArray(array){
        for (let i = 0; i < array.length; i++) {
            instance.load(array[i], () => {
                if(array.length === Object.keys(instance.clips).length) {
                    for (const clip in instance.clips) {
                        if(!instance.clips[clip].loaded) return
                    instance.loaded = true
                    }
                }
            })
        }
    }

    play(path, settings){
        if(!instance.loaded){
            setTimeout(() => { instance.play(path, settings)}, 1000)
            return
        }

        let loop = false
        let volume = 1
        if(settings){
            loop = (settings.looping) ? settings.looping : loop
            volume = (settings.volume) ? settings.volume : volume
        }

        let clip = instance.clips[path]
        if(clip === undefined){
            return false;
        }

        let sound = instance.context.createBufferSource()
        sound.buffer = clip.buffer
        sound.connect(instance.gainNode)
        sound.loop = loop
        instance.gainNode.gain.value = volume
        sound.start(0)
        return true;
    }

    playWithDist(path, x, y){
        if(gameManager.player === null) {
            return
        }
        let viewSize = Math.max(instance.mapManager.view.w, instance.mapManager.view.h) * 0.8

        let dx = Math.abs(gameManager.player.pos_x - x)
        let dy = Math.abs(gameManager.player.pos_y - y)
        let distance = Math.sqrt(dx*dx + dy*dy)
        let norm = distance/viewSize
        if(norm > 1) norm = 1
        let volume = 1 - norm
        if(!volume) {
            return;
        }
        instance.play(path, {looping: false, volume: volume/5})
    }

    pauseSounds() {
        if(this.gainNode.gain.value > 0) this.gainNode.gain.value = 0
        else this.gainNode.gain.value = 1
    }
}