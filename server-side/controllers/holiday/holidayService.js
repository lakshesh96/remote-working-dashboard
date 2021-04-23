const { MessageQueue } = require("./MessageQueue");
var messageQueue = new MessageQueue();


var thisYear = new Date().getFullYear()
duration = (60*60*1000)*24 // 1 day

async function update() {
    let r1 = await checkForUpdate()
    if (r1 == "Valid") {
    } else if (r1 == "Updated") {
        await updateData()
    } else {
        throw new Error("Failed to fetch last update date")
    }
    await extractInfo()
}

function checkForUpdate() {
    return new Promise(function (resolve, reject) {
        thisYear = new Date().getFullYear()
        var fs = require('fs')
        const lastFetch = parseInt(fs.readFileSync('./controllers/holiday/scripts/lastFetch.dat'))


        if (lastFetch == thisYear) {
            resolve("Valid")
        } else {
            resolve("Updated")
        }
    })
}

function updateData() {
    return new Promise(function (resolve, reject) {
        var fs = require('fs')
        const spawn = require('child_process').spawn;
        const ls = spawn('python', ['./controllers/holiday/scripts/holidayFetch.py', 'arg1', 'arg2']);

        ls.stdout.on('data', (data) => {
            fs.writeFileSync('./controllers/holiday/scripts/lastFetch.dat', thisYear.toString())
            resolve("Updated")
        });

        ls.stderr.on('data', (data) => {
            reject("Failed to download data" + `${data}`);
        });

        ls.on('close', (code) => {
        });
    })
}

function extractInfo() {
    return new Promise(function (resolve, reject) {
        const spawn = require('child_process').spawn;
        const ls = spawn('python', ['./controllers/holiday/scripts/htmlParser.py', 'arg1', 'arg2']);

        ls.stdout.on('data', (data) => {
            retrunedData = `${data}`

            var arr = (retrunedData.substring(
                retrunedData.indexOf('(') + 1,
                retrunedData.lastIndexOf(')')
            )).split('), (')
            for (var index = 0; index < arr.length; index++) {
                var temp = arr[index].split(",")
                var month = -1
                var day = 0
                if (temp[2].length == 9) {
                    switch (temp[2].substring(2, 5)) {
                        case "Jan":
                            month = 0
                            break
                        case "Feb":
                            month = 1
                            break
                        case "Mar":
                            month = 2
                            break
                        case "Apr":
                            month = 3
                            break
                        case "May":
                            month = 4
                            break
                        case "Jun":
                            month = 5
                            break
                        case "Jul":
                            month = 6
                            break
                        case "Aug":
                            month = 7
                            break
                        case "Sep":
                            month = 8
                            break
                        case "Oct":
                            month = 9
                            break
                        case "Nov":
                            month = 10
                            break
                        case "Dec":
                            month = 11
                            break
                    }
                    day = parseInt(temp[2].substring(6, 8))
                }

                var dateString1 = ""
                var dateString2 = ""
                if (month == -1) {
                    dateString = "error"
                } else {
                    dateString1 = new Date(thisYear, month, day).toDateString()
                    dateString2 = new Date(thisYear, month, day + 1).toDateString()
                }


                var str = "{"
                    + "\"id\" :" + index + ","
                    + "\"city\": \"" + temp[0] + "\","
                    + "\"title\": \""+ temp[1].replace(/\"/g, '') + "\","
                    + "\"image\":" + "\"A URL\","
                    + "\"start_date\": \"" + dateString1 + "\","
                    + "\"end_date\": \"" + dateString2 + "\","
                    + "\"category\": \"holiday\","
                    + "\"summary\": \"" + temp[3].replace(/\"/g, '').replace("\\xa0", "") + "\""
                    + "}"
                messageQueue.addMessage(JSON.parse(str))
                resolve("Updated")
            }
        });

        ls.stderr.on('data', (data) => {
            reject("Failed to extract data" + ` ${data}`);
        });

        ls.on('close', (code) => {
        });
    })
}

module.exports.initialize = function () {
    update()

    setInterval(function () {
        update()
    }, duration)
}

module.exports.getAllHolidays = function () {
    return messageQueue.getQueue();
}

module.exports.getHolidays = function () {
    var array = new Array()
    var cities = new Array()

    for (index = 0, len = messageQueue.getSize(); index < len; index++) {
        let city = messageQueue.getQueue()[index].city
        let date = new Date(messageQueue.getQueue()[index].start_date).getTime()
        let now = new Date().getTime()
        if (now > date) {
            continue
        } else {
            if (cities.indexOf(city) == -1) {
                cities.push(city)
                array.push(messageQueue.getQueue()[index])
            }
        }
    }
    return array;
}