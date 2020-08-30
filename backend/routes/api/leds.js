const express = require("express");
const router = express.Router()
const leds = require("../../Leds");
const querystring = require('querystring');
const http = require('http');
const request = require('request');

router.get('/', (req, res) => res.json(leds));

router.get('/ping', (req, res)=>{
    return res.status(200).json({ msg: `Pong`});
})

router.get('/:id', (req, res)=>{
    const found = leds.some(led => led.id == req.params.id)

    if(found){
        res.json(leds.filter(led => led.id == req.params.id)[0])
    } else {
        res.status(400).json({ msg: `Led w/ id ${req.params.id} not found`})
    }
})


router.post('/', (req, res)=> {

    if(!req.body.hex && !req.body.brightness){
        return res.status(400).json({ msg: `No data sent`})
    }
    if(req.body.hex && !/^#([0-9A-F]{3}){1,2}$/i.test(req.body.hex)){
        return res.status(400).json({ msg: `Not a valid hex`})
    }
    if(req.body.brightness && (req.body.brightness < 0 || req.body.brightness > 1)){
        return res.status(400).json({ msg: `Not a valid brightness`})
    }


    request.post(
        '10.0.0.169/ping',
        { json: { key: 'value' } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log("yay", body);
            } else {
                console.log("there was an error", error);
            }
        }
    )
    for(i = 0; i < leds.length; i++){
        // let data = querystring.stringify({

        // })


        if(req.body.hex)
            leds[i].hex = req.body.hex
        if(req.body.brightness)
            leds[i].brightness = req.body.brightness
    }

    return res.json(leds)
})

router.post('/:id', (req, res)=> {
    const found = leds.some(led => led.id == req.params.id)

    if(!found){
        return res.status(400).json({ msg: `Member w/ id ${req.params.id} not found`})
    }
    if(!req.body.hex){
        return res.status(400).json({ msg: `No hex sent`})
    }
    if(!req.body.hex || !/^#([0-9A-F]{3}){1,2}$/i.test(req.body.hex)){
        return res.status(400).json({ msg: `Not a valid hex`})
    }

    var led = leds.filter(led => led.id == req.params.id)[0]
    led.hex = req.body.hex

    return res.json(leds)
})



module.exports = router