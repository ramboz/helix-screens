function pre(context) {
    try {
        context.content.json = {
            "device": {
                "timestamp":1570090037795,
                "title":"",
                "description":null,
                "model":"Browser",
                "type":null,
                "resolution":null,
                "offsetLeft":0,
                "offsetTop":0,
                "id":"screens-we-retail-aj7drttqf52skbsrvqzebywsf37pbdyira0e",
                "path":"/home/users/screens/we-retail/devices/kcu40ywAtosv3fPKtmii",
                "pingFrequency":5,
                "analytics": {"analyticsURL":"","analyticsAPIKey":"","analyticsProject":"","analyticsEnvironment":"stage","analyticsSendFrequency":15},
                "offlineIndicator":"",
                "heartbeat":1570090037776,
                "zoneTemplate":"",
                "configPath":"/content/screens/we-retail/locations/demo/flagship/single/device-config",
                "lastModified":1570089976315
            },
            "display":{
                "path":"/content/screens/we-retail/locations/demo/flagship/single",
                "title":"Single Screen Display",
                "description":"Demo location of a single screen display.",
                "activeChannel":null,
                "resolution":"2560x1440",
                "layout":{"numCols":1,"numRows":1},
                "data":{},
                "lastModified":1569914427409,
                "lastModifiedBy":"admin",
                "idleTitle":"Interactive Experience",
                "idleText":"Touch anywhere to begin",
                "idleTimeout":300,
                "strategy":"normal",
                "transition":"normal",
                "channels": [
                    {
                        "path":"/content/screens/we-retail/channels/idle",
                        "role":"idle",
                        "name":"idle",
                        "title":"Idle Channel",
                        "priority":1,
                        "events":["load","idle","timer"],
                        "schedule":"after 6:00 and before 18:00",
                        "startDate":null,
                        "endDate":null,
                        "lastModified": 1569914427409
                    },
                    {
                        "path":"/content/screens/we-retail/channels/idle-night",
                        "role":"idle-night",
                        "name":"idle-night",
                        "title":"Idle Channel - Night",
                        "priority":1,
                        "events":["load","idle","timer"],
                        "schedule":"before 6:00 and also after 18:00",
                        "startDate":null,
                        "endDate":null,
                        "lastModified": 1569914427409
                    }
                ]
            }
        }
    }
    catch (e) {
        context.content.json = {}
    }
}

module.exports.pre = pre