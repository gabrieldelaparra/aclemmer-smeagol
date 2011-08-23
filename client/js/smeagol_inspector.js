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

smeagol.Inspector = function(containerId) {
  ////////////////////////
  // private vars
  var that = this; // we'd like to be able to reference "this" from the inner functions
  var hideURIs = true;

  ////////////////////////
  // public vars
  this.containerId = containerId;
  this.endpoint = smeagol.settings.baseEndpointURL + "sparql";
  this.subjectResource = smeagol.initialResource;
  this.selectedTriples = [];


  ////////////////////////
  // public functions
	this.createGrid = createGrid;
	this.evt_sm_restart = evt_sm_restart;
  this.evt_graph_node_selected = evt_graph_node_selected;
  this.evt_toolbar_hideuri = evt_toolbar_hideuri;
  this.evt_graph_node_removed = evt_graph_node_removed;
  this.evt_graph_replaced_node = evt_graph_replaced_node;
  this.resetSelections = resetSelections;

  init();


  ////////////////////////
  // function definitions
  function init() {
	  $j(document).bind("SM_RESTART", that.evt_sm_restart);
	  $j(document).bind("SM_GRAPH_NODE_SELECTED", that.evt_graph_node_selected);
		$j(document).bind("SM_TOOLBAR_HIDEURI", that.evt_toolbar_hideuri);
		$j(document).bind("SM_GRAPH_NODE_REMOVED", that.evt_graph_node_removed);
		$j(document).bind("SM_GRAPH_REPLACED_NODE", that.evt_graph_replaced_node);
		$j(document).bind("SM_GRAPH_ROOT_WILDCARD_CHANGED", that.evt_graph_node_selected);
		

		that.columns = [
			{id:"subject", name:"Subject", field:"subject", width:150, behavior:"select", formatter:RDFFormatter},
			{id:"predicate", name:"Predicate", field:"predicate",  width:60,  behavior:"select", formatter:RDFFormatter},
			{id:"object", name:"Object", field:"object", width:150, behavior:"select", formatter:RDFFormatter}
		];
	
		that.options = {
			enableCellNavigation: true,
	    enableColumnReorder: false
		};

  	updateTitle(that.subjectResource);	
	  that.createGrid(that.subjectResource);
  }

  function RDFFormatter(row, cell, value, columnDef, dataContext) {
  	if (value == null || value === "") {
  		if ((columnDef.id == "subject" || columnDef.id == "object") && that.subjectResource != null) {
  			return "<span uri=\"" + that.subjectResource.getId() + "\">" + unescape(that.subjectResource.getName(hideURIs)) + "</span>"
  		}

  		return "";
  	}
  	else {
  		return "<span uri=\"" + value.getId() + "\">" + unescape(value.getName(hideURIs)) + "</span>"
  	}
  }

	function createGrid(resource) {
		if (that.grid != null) {
			that.grid.destroy();
		}
		that.loader = null;
		that.grid = null;

		if (resource.getType() != "URI") return;
    var query = "select distinct ?subject ?predicate ?object where { "
      + "{<" + resource.getURI() + "> ?predicate ?object} "
      + "UNION " 
      + "{?subject ?predicate <" + resource.getURI() + ">} "
      + ". FILTER (lang(?object) = \"en\" || lang(?object) = \"\") "
      + "} ORDER BY ?predicate ?subject ";
		var cachekey = hex_md5(query);

    that.loader = new Slick.Data.RemoteModel(smeagol.settings.proxyURL, that.endpoint);	    
		that.loader.setParameter("sparql", query);
		that.loader.setParameter("cachekey", cachekey);
		that.loader.setParameter("clientId", smeagol.clientId);

		that.grid = new Slick.Grid($j(that.containerId), that.loader.data, that.columns, that.options);
		
    that.loadingIndicator = new smeagol.LoadingIndicator(that.grid, that.loader, that.containerId, "Loading...");
    
    that.loader.onDataError.subscribe(function(args) {
      var retry = confirm("There was an error loading Inspector data.  Do you wish to retry?");
      if (retry) {
        that.grid.onViewportChanged();
      }
    });

		that.grid.onViewportChanged = function() {
			var vp = that.grid.getViewport();
			that.loader.ensureData(vp.top, vp.bottom);
      //that.loadingIndicator.showIndicator();
		};

		that.grid.onSelectedRowsChanged = function(selection) {
			if (selection.add) {
				var row = that.loader.getRowByIndex(selection.add);

				if (row.subject) { // inspector resource is the object
					var inv = true;
					var newres = row.subject;
					that.selectedTriples.push({subject: row.subject, predicate: row.predicate, object: that.subjectResource});
				}
				else { // inspector resource is the subject
					var inv = false;
					var newres = row.object;
					that.selectedTriples.push({subject: that.subjectResource, predicate: row.predicate, object: row.object});
			  }

  		  $j(document).trigger("SM_INSPECTOR_ADDED_RESOURCE", [{existing: that.subjectResource, edge: row.predicate, newr: newres, invertArrow:inv}]);
			}
			else if (selection.remove) {
				var row = that.loader.getRowByIndex(selection.remove);
				if (row.subject) {
					removeSelectedTriple({subject: row.subject, predicate: row.predicate, object: that.subjectResource});
				  $j(document).trigger("SM_INSPECTOR_REMOVED_RESOURCE", [{existing: that.subjectResource, edge: row.predicate, delr: row.subject}]);				
				}
				else {
					removeSelectedTriple({subject: that.subjectResource, predicate: row.predicate, object: row.object});
				  $j(document).trigger("SM_INSPECTOR_REMOVED_RESOURCE", [{existing: that.subjectResource, edge: row.predicate, delr: row.object}]);				
			  }
			}			
		}

    //TODO: if we're loading rows in the background, and we then wildcard the center node... how do we handle that here?
		that.loader.onDataLoaded.subscribe(function(args) {
			// we need to check these new rows against our cache of selected rows, so we can set them as selected if needed.
			// this is for the situation where you navigate away from a resource, lose its selection data, and then navigate back to it.
			refreshSelectedRows(resource);

			for (var i = args.from; i <= args.to; i++) {
				that.grid.removeRow(i);
			}
			
			that.grid.updateRowCount();
			that.grid.render();
		});
		
		// load the first page
		that.grid.onViewportChanged();
  }
  
  
  function refreshSelectedRows(resource) {
  	// if we're not currently inspecting a resource (eg center node is a wildcard), we don't need to refresh.
  	if (resource == null) { 
  		return;
  	}
  	
		var selections = [];
    var triples = getSelectedTriples(resource);
	  
		for (var i = 0; i < that.loader.data.length; i++) {
			if (that.loader.data[i]) {
				for (var j = 0; j < triples.length; j++) {
					if (triples[j] == null || triples[j] == undefined) continue;						
					if (that.loader.data[i].subject == null || that.loader.data[i].subject == undefined) {
						var subjectMatches = (that.subjectResource.getId() == triples[j].subject.getId());
						var objectMatches = (    (triples[j].object.getType() == "URI" && that.loader.data[i].object.getId() == triples[j].object.getId())
							                    || (triples[j].object.getType() == "LITERAL" && that.loader.data[i].object.getLiteral() == triples[j].object.getLiteral())) 
					}
					else if (that.loader.data[i].object == null || that.loader.data[i].object == undefined) {
						var subjectMatches = (that.loader.data[i].subject.getId() == triples[j].subject.getId());
						var objectMatches = (that.subjectResource.getId() == triples[j].object.getId());
					}
					var predicateMatches = that.loader.data[i].predicate.getId() == triples[j].predicate.getId();
					
					if (subjectMatches && predicateMatches && objectMatches) {						
							if (that.loader.data[i].object && triples[j].object.getType() == "LITERAL") {
								that.loader.data[i].object.setId(triples[j].object.getId());  // we want to retain the original UUID
							}
							selections.push(i);
							break;
					}
							
			  }
			}
		}
		that.grid.setSelectedRows(selections);
  }


  function removeSelectedTriple(triple) {
  	for (var i = 0; i < that.selectedTriples.length; i++) {
  		if (   that.selectedTriples[i]
  		    && that.selectedTriples[i].subject.getId() == triple.subject.getId()
  		    && that.selectedTriples[i].predicate.getId() == triple.predicate.getId()
  		    && that.selectedTriples[i].object.getId() == triple.object.getId()) {
  		  delete that.selectedTriples[i];
  		  return;
  		}
  	}
  }

  function getSelectedTriples(resource) {
  	var results = [];
  	for (var i = 0; i < that.selectedTriples.length; i++) {
  		if (   that.selectedTriples[i]
  		    && (   that.selectedTriples[i].subject.getId() == resource.getId()
  		        || that.selectedTriples[i].object.getId() == resource.getId())) {
  		  results.push(that.selectedTriples[i]);
  		}
  	}
  	return results;
  }
  
  
  function resetSelections(selections) {
  	that.selectedTriples = selections;
		refreshSelectedRows(that.subjectResource);
		that.grid.render();
  }


	function evt_sm_restart(event, resource) {
		//that.subjectResource = new smeagol.Resource({uri: {uri: arg, label: arg.la}});	
  	//that.createGrid( );
	}  
	
  function evt_graph_node_selected(event, resource) {
  	/*if (resource.getWildcard()) {
		  that.subjectResource = null;
			if (that.grid)
				that.grid.destroy();
			updateTitle(null);		  
  	}
  	else {*/
	  	that.subjectResource = resource;
	  	updateTitle(resource);
	  	that.createGrid(that.subjectResource);
	  //}
  }
  
  function evt_graph_node_removed(event, resource) {
  	var triples = getSelectedTriples(resource);
  	var refresh = false;

  	for (var i = 0; i < triples.length; i++) {
  		removeSelectedTriple(triples[i]);

  		if (that.subjectResource != null &&
  		    (  triples[i].subject.getId() == that.subjectResource.getId()
  		    || triples[i].object.getId() == that.subjectResource.getId()) ) {
  		  refresh = true;
  		}
  	}

		if (refresh) {
			refreshSelectedRows(that.subjectResource);
			that.grid.render();
		}
	}
	
	function evt_graph_replaced_node(event, oldId, newResource, replaceRoot) {
  	for (var i = 0; i < that.selectedTriples.length; i++) {
  		if (that.selectedTriples[i]) {
  			if (that.selectedTriples[i].subject && that.selectedTriples[i].subject.getId() == oldId) {
  				that.selectedTriples[i].subject = newResource;
  			}
  			else if (that.selectedTriples[i].object && that.selectedTriples[i].object.getId() == oldId) {
  				that.selectedTriples[i].object = newResource;
  			}
  		}
  	}

		
		if (replaceRoot) {
			evt_graph_node_selected(null, newResource);
		}

		if (that.subjectResource != null) {
			refreshSelectedRows(that.subjectResource);
			that.grid.render();
	  }
	}
  
  function evt_toolbar_hideuri(event, state) {
  	hideURIs = state;
  	that.grid.invalidate();
  }
  
  function updateTitle(resource) {
  	var name = "";
  	if (resource != null) {
  		name = unescape(resource.getName());
  	}
  	$j("#info_subject").text(name);	
  }

}



