const { MessageQueue } = require("./MessageQueue");
var messageQueue = new MessageQueue();

//���
var thisYear = new Date().getFullYear()
// ������
duration = (60*60*1000)*24 // 1 day

setInterval(function () {
    // ����Ƿ��Ѿ�������һ��
    thisYear = new Date().getFullYear()
    var fs = require('fs')
    const lastFetch = parseInt(fs.readFileSync('./controllers/holiday/scripts/lastFetch.dat'))//·��Ҫ��

    if (lastFetch != thisYear) {
        const spawn = require('child_process').spawn;
        //C: /Users/yyq / Desktop / code / mastt - news - feed / controllers / holiday / scripts / htmlParser.py
        const ls = spawn('python', ['./controllers/holiday/scripts/holidayFetch.py', 'arg1', 'arg2']); // ����ܰ�dir��·������ȥ

        ls.stdout.on('data', (data) => {
            fs.writeFileSync('./controllers/holiday/scripts/lastFetch.dat', thisYear.toString())
        });

        ls.stderr.on('data', (data) => {
            console.log(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            //console.log(`child process exited with code ${code}`);
        });
    }
}, duration) //�᲻�������һ��������û����


/** Concurrency Issues  �������� */

// ����ʱ��
const spawn = require('child_process').spawn;
//C: /Users/yyq / Desktop / code / mastt - news - feed / controllers / holiday / scripts / htmlParser.py
const ls = spawn('python', ['./controllers/holiday/scripts/htmlParser.py', 'arg1', 'arg2']);

ls.stdout.on('data', (data) => {
    retrunedData = `${data}`

    var arr = (retrunedData.substring(
        retrunedData.indexOf('(')+1,
        retrunedData.lastIndexOf(')')
    )).split('), (')
    for (var index = 0; index < arr.length; index++) {
        var temp = arr[index].split(",")
        var month =-1
        var day =0
        // ����try�������ݴ���
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
            day = parseInt(temp[2].substring(6,8))
        }

        var dateString1 = ""
        var dateString2 = ""
        if (month == -1) {
            dateString = "error"
        } else {
            dateString1 = new Date(thisYear, month, day).toDateString()
            dateString2 = new Date(thisYear, month, day+1).toDateString()
        }


        var str = "{" 
            + "\"id\" :" + index + ","
            + "\"title\": \"" + temp[0] + ":" + temp[1].replace(/\"/g, '') + "\","
            + "\"image\":" + "\"A URL\","
            + "\"start_date\": \"" + dateString1 + "\","
            + "\"end_date\": \"" + dateString2 + "\","
            + "\"category\": \"holiday\","
            + "\"summary\": \"" + temp[3].replace(/\"/g, '').replace("\\xa0", "") + "\""
            + "}"
        messageQueue.addMessage(JSON.parse(str))
    }
});

ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
    //console.log(`child process exited with code ${code}`);
});

module.exports.getHolidays = function () {
    return messageQueue.getQueue();
}