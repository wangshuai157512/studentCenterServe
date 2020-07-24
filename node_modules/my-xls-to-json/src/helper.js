var XLSX = require('xlsx');
var path = require('path');

module.exports = {
    // fileName is the absolute path.
    read: function (fileName) {
        try {
            return XLSX.readFile(fileName);
        } catch (e) {
            return e;
        }
    },
    convert: function (fileName, callback) {
        var workbook = this.read(fileName);
        if (!workbook) {
            return callback(new Error("WorkBook 不能为空!"));
        }
        if (workbook instanceof Error) {
            return callback(new Error("读取文件失败!"));
        }
        var sheet_name_list = workbook.SheetNames;
        var output = {};
        sheet_name_list.forEach(function (y) {
            var worksheet = workbook.Sheets[y];
            var headers = {};
            var data = [];
            for (z in worksheet) {
                if (z[0] === '!') continue;
                //parse out the column, row, and value
                var col = z.substring(0, 1);
                var row = parseInt(z.substring(1));
                var value = worksheet[z].v;

                //store header names
                if (row == 1) {
                    headers[col] = value;
                    continue;
                }

                if (!data[row]) data[row] = {};
                data[row][headers[col]] = value;
            }
            //drop those first two rows which are empty
            data.shift();
            data.shift();
            output[y] = data;
        });
        return callback(null, output);
    }
};
