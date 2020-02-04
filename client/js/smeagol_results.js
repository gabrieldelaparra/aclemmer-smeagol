/******************************************************************************
    Smeagol
    Copyright (C) 2010-2011  Aaron Clemmer, Stephen Davies

    This file is part of Smeagol.

    Smeagol is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
******************************************************************************/
smeagol.Results = function(containerId) {
  ////////////////////////
  // private vars
  var that = this;
  var hideURIs = true;
  var colResized = false;


  ////////////////////////
  // public vars
  this.containerId = containerId;
  this.endpoint = smeagol.settings.baseEndpointURL + "sparql";


  ////////////////////////
  // public functions
	this.createGrid = createGrid;
  this.updateGrid = updateGrid;
  this.rowSelectHandler = rowSelectHandler;
  this.evt_layout_resize = evt_layout_resize;
  this.evt_toolbar_hideuri = evt_toolbar_hideuri;
  this.getResultsText = getResultsText;

  init();


  ////////////////////////
  // function definitions
  function init() {
	  $j(document).bind("SM_GRAPH_NODE_ADDED", that.updateGrid);
	  $j(document).bind("SM_GRAPH_NODE_REMOVED", that.updateGrid);
	  $j(document).bind("SM_GRAPH_WILDCARD_CHANGED", that.updateGrid);
	  $j(document).bind("SM_GRAPH_SHOWINRESULTS_CHANGED", that.updateGrid);
    $j(document).bind("SM_GRAPH_REPLACED_NODE", that.updateGrid);
    $j(document).bind("SM_LAYOUT_RESIZE", that.evt_layout_resize);
		$j(document).bind("SM_TOOLBAR_HIDEURI", that.evt_toolbar_hideuri);

	  $j("#resultsColumnPopupClose").click(function() {
	    $j("#resultsColumnPopup").hide('scale', {'percent': 0}, 250);
	    return false;
	  });
	  
	  $j("#resultsColumnPopupHide").click(colHideHandler);

		that.columns = [
			{id:"foo", name:"Foo", field:"foo"},
			{id:"bar", name:"Bar", field:"bar"},
			{id:"baz", name:"Baz", field:"baz"},
		];
	
		that.options = {
			enableCellNavigation: true,
	    enableColumnReorder: false
		};
  }


	function createGrid(query) {
		if (that.grid != null) {
			that.grid.destroy();
		}
		that.loader = null;
		that.grid = null;
		that.data = [];


    that.loader = new Slick.Data.RemoteModel(smeagol.settings.proxyURL, that.endpoint);	
		that.loader.setParameter("sparql", query.query);
		that.loader.setParameter("cachekey", query.cachekey);	
		that.loader.setParameter("clientId", smeagol.clientId);
		that.grid = new Slick.Grid($j(that.containerId), that.loader.data, that.columns, that.options);
		that.grid.autosizeColumns();

    that.loadingIndicator = new smeagol.LoadingIndicator(that.grid, that.loader, that.containerId, "Loading...");

    that.loader.onDataError.subscribe(function(args) {
      var retry = confirm("There was an error loading Results data.  Do you wish to retry?");
      if (retry) {
        that.grid.onViewportChanged();
      }
    });

		that.grid.onViewportChanged = function() {
			var vp = that.grid.getViewport();
			that.loader.ensureData(vp.top, vp.bottom);
      //that.loadingIndicator.showIndicator();
		};

		that.grid.onClick = function(event, row, cell) {
			var resource = that.loader.getCell(row, that.columns[cell].field);
			$j(document).trigger("SM_RESULTS_CELL_SELECTED", [that.columns[cell].field, resource]);
		};
		
		that.grid.onColumnsResized = function() {
			// after doing a resize, sometimes slickgrid lets the click event propogate
			// and sometimes it doesn't.  so this is our ugly hack to stop our popup
			// from appearing on a col resize, while not preventing a subsequent intentional
			// click to open the popup. :(
			colResized = true;
			setTimeout(function() { colResized = false; }, 100);
		}

		that.loader.onDataLoaded.subscribe(function(args) {
			for (var i = args.from; i <= args.to; i++) {
				that.grid.removeRow(i);
			}
			
			that.grid.updateRowCount();
			that.grid.render();
		});
		
		// load the first page
		that.grid.onViewportChanged();
	}
	
	
	function updateGrid() {
		var sparql = new smeagol.Sparql();
		var query = sparql.buildSparqlFromGraph(smeagol.graph.getGraphData(), smeagol.graph.getCenterNodeId());
		if (!sparql.isRunnable()) {
			if (sparql.getVarCnt() > 0 && sparql.getNumSel() == 0) { // if all bound vars are hidden from results, we can fix that...
				for (var i = 0; i < that.columns.length; i++) {
					var col = that.columns[i];
					if (col.key == undefined) continue;
					
					var node = smeagol.graph.getGraphData().getNode(col.key);
					if (node && node.data.resource.getShowInResults() == false) {
						node.data.resource.setShowInResults(true);
						query = sparql.buildSparqlFromGraph(smeagol.graph.getGraphData(), smeagol.graph.getCenterNodeId());
						break;
					}
				}
			}
			else {
				if (that.grid)
					that.grid.destroy();
				return;
		  }
		}
		
		that.columns = [];
		
		var bindings = sparql.getBindingList();
		var rowSelWidth = 70;
		var hiddenWidth = 14;

		that.columns.push({id:"row_select", "name":"Update All", "width":rowSelWidth, "minWidth":rowSelWidth, "maxWidth":rowSelWidth, field: "row_select", formatter:RowSelectFormatter});

		for (var key in bindings) {
			var binding = bindings[key].binding.substring(1); // remove the ?
			var bindingNum = bindings[key].binding.substring(2);
			var name = bindings[key].name;
			var width = 80;
			var maxW = 10000;
			var isHidden = false;

			var node = smeagol.graph.getGraphData().getNode(key);
			if (node && node.data.resource.getShowInResults() == false) {
				width = hiddenWidth;
				maxW = hiddenWidth;
				isHidden = true;
			}
			
			that.columns.push({id:binding, "name":bindingNum, field:binding, "width":width, "maxWidth":maxW, formatter:RDFFormatter, "key":key, "x-hidden":isHidden});
			$j(document).trigger("SM_RESULTS_ANNOUNCE_BINDING", [{"id": key, "binding": binding}]);
		}		
		
		createGrid(query);
		
		for (var key in bindings) {
			var rawColId = bindings[key].binding.substring(1);
			var colId = "#" + rawColId;

			// magic mojo: http://stackoverflow.com/questions/1331769/access-outside-variable-in-loop-from-javascript-closure
			$j(colId).hover(
			  ( function(id) { // in
			  	  return function() { $j(document).trigger("SM_RESULTS_COLUMN_HOVER_IN", [id]); };
			    })(key),
			  ( function(id) { // out
			  	  return function() { $j(document).trigger("SM_RESULTS_COLUMN_HOVER_OUT", [id]); };
			    })(key)
			);
			
			$j(colId).click(
			  ( function(c, id) {
			    return function(e) { 
			    	colClickHandler(e, c, id); 
			    }
			  })(rawColId, key)
			);
		}
	}
	
	
	function rowSelectHandler(row) {
		var rowData = that.loader.getRowByIndex(row);
		var colData = [];
		
		for (var i = 1; i < that.columns.length; i++) { // we're skipping the calculated column
			colData.push(that.columns[i].field);
		}
		
	  $j(document).trigger("SM_RESULTS_ROW_SELECTED", [colData, rowData]);
	}


  function colClickHandler(e, colId, id) {
  	if (colResized) {
  		colResized = false;
  		return;
  	}
  				
    setTimeout(function(){
    	  var node = smeagol.graph.getGraphData().getNode(id);
    	
        if (node.data.resource.getShowInResults()) {
        	$j("#resultsColumnPopupHide").html("Hide from results");
        }
        else {
        	$j("#resultsColumnPopupHide").html("Show in results");
				}
				
				var popup = document.getElementById("resultsColumnPopup");
				popup.setAttribute("node", id);
        popup.style.left = e.pageX;
        popup.style.top = e.pageY;
        $j('#resultsColumnPopup').show('scale',{'percent': 100},250);
      }, 100);
	}
	
	
	function colHideHandler() {
		var id = document.getElementById("resultsColumnPopup").getAttribute("node");
		var node = smeagol.graph.getGraphData().getNode(id);
		node.data.resource.setShowInResults(!node.data.resource.getShowInResults());
		$j("#resultsColumnPopup").hide('scale', {'percent': 0}, 250);
		updateGrid();
	}
	
	function evt_layout_resize() {
		that.grid.invalidate();
		//$j('#resultsGrid').trigger('resize');
		//that.grid.resizeCanvas();
	}
  

  function RDFFormatter(row, cell, value, columnDef, dataContext) {
  	if (value == null || value === "") {
  		return "";
  	}
  	else {
  		return "<span uri=\"" + value.getId() + "\">" + unescape(value.getName(hideURIs)) + "</span>";
  	}
  }
  
  function RowSelectFormatter(row, cell, value, columnDef, dataContext) {
  	return "<button onclick=\"smeagol.results.rowSelectHandler(" + row + ");\">*</button>";
  }
  
  
  function evt_toolbar_hideuri(event, state) {
  	hideURIs = state;
  	that.grid.invalidate();
  }


  function getResultsText() {
  	var results = "";
  	
  	for (var i = 1; i < that.columns.length; i++) {
  		if (!that.columns[i]['x-hidden'])
  			results += that.columns[i].name + "\t";
  	}
  	results += "\n";

  	var count = that.loader.getRowCount();
  	for (var i = 0; i < count; i++) {
  		var row = that.loader.getRowByIndex(i);
  		if (row) {
  			for (var j = 1; j < that.columns.length; j++) {	
  				if (!that.columns[j]['x-hidden'])
  					results += row[that.columns[j].id].getLabel() + "\t";
  			}
  			results += "\n";
  		}
  	}
  	
  	return results;
  }
}
