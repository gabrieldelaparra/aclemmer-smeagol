/***
 * A simple observer pattern implementation.
 */
function EventHelper() {
	this.handlers = [];

	this.subscribe = function(fn) {
        this.handlers.push(fn);
    };

	this.notify = function(args) {
        for (var i = 0; i < this.handlers.length; i++) {
            this.handlers[i].call(this, args);
        }
    };

	return this;
}


(function($) {
	/***
	 * AJAX data store implementation.
	 */
	function RemoteModel(px, ep) {
		// private
		var PAGESIZE = 200;
		var data = {length:0};
		var searchstr = "apple";
		var sortcol = null;
		var sortdir = 1;
		var h_request = null;
		var req = null; // ajax request
		var req_page;
		var parameters = [];
		var endpoint = ep;
		var proxy = px;


		// events
		var onDataLoading = new EventHelper();
		var onDataLoaded = new EventHelper();
		var onDataError = new EventHelper();

                //When not otherwise busy, load a new page, if there are any
                //left to load.
                function lookahead() {
                    //Check the first item of each page to see if they've all
                    //been loaded. If all have been loaded, do nothing. 
                    var next = -1;
                    var numPages = Math.ceil(data.length / PAGESIZE);
                    for (var i = 0; i < data.length; i += PAGESIZE) {
                        if (data[i] == undefined) {
                            next = i;
                            break;
                        }
                    }
                    if (next >= 0) {
                        ensureData(next, next + PAGESIZE - 1);
                    }
                }

		function init() {
                    //When we load data, go on to load more in the
                    //background.
                    /*onDataLoaded.subscribe(function(args) {
                        lookahead();
                    });*/
		}


		function isDataLoaded(from,to) {
			for (var i=from; i<=to; i++) {
				if (data[i] == undefined || data[i] == null)
					return false;
			}

			return true;
		}


		function clear() {
			for (var key in data) {
				delete data[key];
			}
			data.length = 0;
		}

		function ensureData(from,to) {
			if (req) {
				req.abort();
				for (var i=req.fromPage; i<=req.toPage; i++)
					data[i*PAGESIZE] = undefined;
			}

			if (from < 0)
				from = 0;

			var fromPage = Math.floor(from / PAGESIZE);
			var toPage = Math.floor(to / PAGESIZE);

			while (data[fromPage * PAGESIZE] !== undefined && fromPage < toPage)
				fromPage++;

			while (data[toPage * PAGESIZE] !== undefined && fromPage < toPage)
				toPage--;

			if (fromPage > toPage || ((fromPage == toPage) && data[fromPage*PAGESIZE] !== undefined)) {
                            //lookahead();
                            return;
			}
			
			var param = "";
			if (parameters["sparql"]) {
				param += "sparql=" + escape(parameters["sparql"]);
				param += "&cachekey=" + escape(parameters["cachekey"]);
			}
      else if (parameters["keyword"]) {
          param += "keyword=" + escape(parameters["keyword"]);
      }

      if (parameters["clientId"]) {
      	param += "&clientId=" + parameters["clientId"];
      }

			var url = proxy + escape(endpoint + "?" + param + "&offset=" + (fromPage * PAGESIZE) + "&count=" + (((toPage - fromPage) * PAGESIZE) + PAGESIZE));


/*			switch (sortcol) {
				case "diggs":
					url += ("&sort=" + ((sortdir>0)?"digg_count-asc":"digg_count-desc"));
					break;
			}*/

/*			if (h_request != null)
				clearTimeout(h_request);

			h_request = setTimeout(function() {*/
				for (var i=fromPage; i<=toPage; i++)
					data[i*PAGESIZE] = null; // null indicates a 'requested but not available yet'

				onDataLoading.notify({from:from, to:to});

				req = $.ajax({
				   type: "GET",
				   url: url,
				   contentType: "application/json",
				   dataType: "json",
				   timeout: 20*1000,
				   error: function(xhr, status, thrown) { onError(fromPage, toPage); },
				   success: onSuccess
				});

				req.fromPage = fromPage;
				req.toPage = toPage;
			//}, 50);
		}


		function onError(fromPage,toPage) {
			onDataError.notify({fromPage:fromPage, toPage:toPage});
		}

		function onSuccess(resp) {
			if (resp == null) {
				return;
			}
			
			var from = resp.meta.page.offset, to = resp.meta.page.offset + resp.meta.page.count;
			if (resp.meta.page.total >= 0) {
				data.length = Math.min(131000, parseInt(resp.meta.page.total));
			}
			else {
				data.length = 131000;
			}

                        if (resp.meta.service && resp.meta.service == "finder") {
                            for (var i = 0; i < resp.data.results.length; i++) {
                                var result = resp.data.results[i];
                                data[from + i] = result;
                                data[from + i].index = from + i;
                            }
                        }

                        else {
                            for (var i = 0; i < resp.data.results.length; i++) {
                                    var rr = resp.data.results[i].rowResults;				
                                    var row = [];

                                    for (var j = 0; j < rr.length; j++) {
                                            if (rr[j].uri) {
                                              var lab = smeagol.stemURI(rr[j].uri);
                                            row[rr[j].name] = new smeagol.Resource({uri: {uri: rr[j].uri, label: lab}});
                                            }
                                            else if (rr[j].literal) {
                                            row[rr[j].name] = new smeagol.Resource({literal: {literal: rr[j].literal.content, literal_type: rr[j].literal.datatype, literal_lang: rr[j].literal.lang}});
                                            }
                                    }
                                    data[from + i] = row;
                                    data[from + i].index = from + i;
                            }
			}

			req = null;

			onDataLoaded.notify({from:from, to:to});
		}

		function reloadData(from,to) {
			for (var i=from; i<=to; i++)
				delete data[i];

			ensureData(from,to);
		}


		function setSort(column,dir) {
			sortcol = column;
			sortdir = dir;
			clear();
		}

		function setSearch(str) {
			searchstr = str;
			clear();
		}
		
		function setParameter(key, value) {
			parameters[key] = value;
		}
		
		
		function getRowCount() {
			return data.length;
		}
		
		
		function getRowByIndex(idx) {
			if (idx > data.length || idx < 0) { return null; }
			return data[idx];
		}
		
		function getCell(row, colName) {
			if (row > data.length || row < 0) { return null; }
			return data[row][colName];
		}


		init();

		return {
			// properties
			"data": data,

			// methods
			"clear": clear,
			"isDataLoaded": isDataLoaded,
			"ensureData": ensureData,
			"reloadData": reloadData,
			"setSort": setSort,
			"setSearch": setSearch,
			"setParameter": setParameter,
			"getRowCount": getRowCount,
			"getRowByIndex": getRowByIndex,
			"getCell": getCell,

			// events
			"onDataLoading": onDataLoading,
			"onDataLoaded": onDataLoaded,
                        "onDataError": onDataError
		};
	}

	// Slick.Data.RemoteModel
	$.extend(true, window, { Slick: { Data: { RemoteModel: RemoteModel }}});
})(jQuery);
