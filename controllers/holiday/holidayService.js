
// ������
duration = (60*60*1000)*24 // 1 day

setInterval(function () {
    // ����Ƿ��Ѿ�������һ��
    var thisYear = new Date().getFullYear()
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


let date = new Date(2019, 5, 11, 5, 23, 59);
var holidays = [
    {
        "id": 1,
        "title": "New Year Festival",
        "image": "a URL",
        "start_date": new Date(2008, 9, 7),
        "end_date": new Date(2008, 10),
        "catagory": "holiday",
        "summary": "to be added",
    },
    {
        "id": 2,
        "title": "Moon Festival",
        "image": "a URL",
        "start_date": new Date(),
        "end_date": date,
        "catagory": "holiday",
        "summary": "to be added"
    }
]


/** Concurrency Issues  �������� */

// ����ʱ��
const spawn = require('child_process').spawn;
//C: /Users/yyq / Desktop / code / mastt - news - feed / controllers / holiday / scripts / htmlParser.py
const ls = spawn('python', ['./controllers/holiday/scripts/htmlParser.py', 'arg1', 'arg2']);

ls.stdout.on('data', (data) => {
    holidays = `${data}`;
    //console.log(holidays)

});

ls.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
    //console.log(`child process exited with code ${code}`);
});

module.exports.getHolidays = function () {
    stat = eval(holidays.replace(/[\r\n]/g, ""));
    return stat
}
