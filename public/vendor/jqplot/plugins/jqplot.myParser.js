/**
 * Jason edit in 201608.04 
 * source jpplot.ciParser.js
 * 
 */
(function($) {
    
    $.jqplot.myParser = function (data, plot) {
        var ret = [],
            line,
            temp,
            i, j, k, kk;
    
         if (typeof(data) == "string") {
             data =  $.jqplot.JSON.parse(data, handleStrings);
         }
 
         else if (typeof(data) == "object") {
             for (k in data) {
                 for (i=0; i<data[k].length; i++) {
                     for (kk in data[k][i]) {
                         data[k][i][kk] = handleStrings(kk, data[k][i][kk]);
                     }
                 }
             }
         }
 
         else {
             return null;
         }
 
         function handleStrings(key, value) {
			
            if (value != null) {
                return value;
            }
         }
 
        for (var prop in data) {
            line = [];
            temp = data[prop];
            switch (prop) {
                case "tem1":
                    for (i=0; i<temp.length; i++) {
                        line.push([temp[i]['date'], temp[i]['temperature']]);
                    }
                    break;
				case "tem2":
                    for (i=0; i<temp.length; i++) {
                        line.push([temp[i]['date'], temp[i]['temperature']]);
                    }
                    break;
					case "hum1":
                    for (i=0; i<temp.length; i++) {
                        line.push([temp[i]['date'], temp[i]['humidity']]);
                    }
                    break;
				case "hum2":
                    for (i=0; i<temp.length; i++) {
                        line.push([temp[i]['date'], temp[i]['humidity']]);
                    }
                    break;
            }
            ret.push(line);
        }
        return ret;
    };
})(jQuery);