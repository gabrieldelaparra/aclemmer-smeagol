
smeagol.Graph = function(containerId) {
  ////////////////////////
  // private vars
  var that = this;

  ////////////////////////
  // public vars
  this.containerId = containerId;
  this.labelDeleteList = [];


  ////////////////////////
  // public functions
	this.createGraph = createGraph;
	this.evt_inspector_added_resource = evt_inspector_added_resource;
	this.evt_inspector_removed_resource = evt_inspector_removed_resource;
  this.evt_layout_resize = evt_layout_resize;
  this.evt_results_announce_binding = evt_results_announce_binding;
  this.evt_results_column_hover_in = evt_results_column_hover_in;
  this.evt_results_column_hover_out = evt_results_column_hover_out;
  this.evt_results_cell_selected = evt_results_cell_selected;
  this.evt_results_row_selected = evt_results_row_selected;
  this.wildcardHandler = wildcardHandler;
  this.removeNodeHandler = removeNodeHandler;
  this.getGraphData = function() { return that.rgraph.graph; };
  this.getCenterNodeId = function() { return that.rgraph.root; }
  this.makeLabelId = makeLabelId;
  this.serialize = serialize;
  this.loadFromSerialization = loadFromSerialization;
  
  init();


  ////////////////////////
  // function definitions
  function init() {
	  $j(document).bind("SM_INSPECTOR_ADDED_RESOURCE", that.evt_inspector_added_resource);
	  $j(document).bind("SM_INSPECTOR_REMOVED_RESOURCE", that.evt_inspector_removed_resource);
    $j(document).bind("SM_LAYOUT_RESIZE", that.evt_layout_resize);
		$j(document).bind("SM_RESULTS_ANNOUNCE_BINDING", that.evt_results_announce_binding);
		$j(document).bind("SM_RESULTS_COLUMN_HOVER_IN", that.evt_results_column_hover_in);
		$j(document).bind("SM_RESULTS_COLUMN_HOVER_OUT", that.evt_results_column_hover_out);
		$j(document).bind("SM_RESULTS_CELL_SELECTED", that.evt_results_cell_selected);
    $j(document).bind("SM_RESULTS_ROW_SELECTED", that.evt_results_row_selected);

  	$jit();
  	RGraph.Plot.EdgeTypes.implement({'custom-line': smeagol.Graph.prototype.edgeRenderer});
	
	  $j("#infovisPopupClose").click(function() {
	    $j("#infovisPopup").hide('scale', {'percent': 0}, 250);
	    return false;
	  });
	  
	  $j("#infovisPopupWildcard").click(wildcardHandler);
	  $j("#infovisPopupRemove").click(removeNodeHandler);
	  
	  createGraph(smeagol.initialResource);
  }
  

  function createGraph(resource, loadData) {
  	if (resource && resource.getType() != "URI") { alert("bad initial resource"); return; }

		var json = [];
		if (loadData) {
			json = loadData;
		}
		else {
	  	json = [ 
	      {
	        "id": resource.getId(),
	        "name": resource.getName(),
	        "data": {"resource": resource},
	        "adjacencies": []
	      }
	    ];
		}

  	
  	that.infovisContainer = document.getElementById(that.containerId);
  	var w = that.infovisContainer.offsetWidth, h = that.infovisContainer.offsetHeight;

	  //init RGraph
	  that.rgraph = new RGraph({
	      //Where to append the visualization
	      'injectInto': 'infovis',
	      /*'width': w,
	      'height': h,*/
	      //Optional: create a background canvas that plots
	      //concentric circles.
	      'background': {
	        'CanvasStyles': {
	          'strokeStyle': '#555'
	        }
	      },
	      duration:500,
	      Navigation: {
	        enable:true,
	        panning:true,
	        zooming:0.5
	      },
	      //Set Node and Edge colors.
	      Node: {
	        overridable:true,
	        color: '#ccddee',
	        dim: 5,
	      },     
	      Edge: {
	        'overridable': true, 
	        color: '#772277',
	        type: 'custom-line'
	      },
	      NodeStyles: {
	        enable:true,
	        stylesHover: {
	          dim:10,
	          color:'#f00'
	        },
	        /*stylesClick: {
	          dim:30,
	          color:'#ff0'
	        }*/
	      },
	      Tips: {
	        enable: false,
	        onShow: function(tip, elem, contains) {
	          tip.innerHTML = elem.id;
	        }
	      },
	
	      onBeforeCompute: function(node){
     			$j(document).trigger("SM_GRAPH_NODE_SELECTED", [node.data.resource]);
	      },
	      
	      onAfterCompute: function(){
	      	recomputeLabels();
	      },
	      //Add the name of the node in the correponding label
	      //and a click handler to move the graph.
	      //This method is called once, on label creation.
	      onCreateLabel: function(domElement, node){
					var sName = node.data.resource.getShortName();
					var name = unescape(node.data.resource.getName());

      	  node.data.name = name;
     	  	node.data.shortName = sName;
	      	
          domElement.innerHTML = name;
          domElement.onclick = function(){
              that.rgraph.onClick(node.id);
          };
          domElement.className = "node graphLabel";
	      },
	      //Change some label dom properties.
	      //This method is called each time a label is plotted.
	      onPlaceLabel: function(domElement, node){
	          var style = domElement.style;
	          style.display = '';
	          style.cursor = 'pointer';
	
	          if (node._depth <= 1) {
	              style.fontSize = "0.8em";
	              style.color = "#000";
	          
	          } else if(node._depth == 2){
	              style.fontSize = "0.7em";
	              style.color = "#494949";
	          
	          } else {
	              style.fontSize = "0.6em";
	              style.color = "#494949";
	          }
	
	          var left = parseInt(style.left);
	          var w = domElement.offsetWidth;
	          style.left = (left - w / 2) + 'px';
	      },
	
	      Events: {
	        enable: true,

					onMouseEnter: function(node, eventInfo, e) {
						if (node && node.data.isOverlap && node.data.name && !node.data.resource.getWildcard()) {							
							var el = document.getElementById(node.id);
							if (el) {
								el.innerHTML = node.data.name;
  							el.style.backgroundColor = "#DDDDDD";
							}
						}
					},

					onMouseLeave: function(node, eventInfo, e) {
						if (node && node.data.isOverlap && node.data.shortName && !node.data.resource.getWildcard()) {
							var el = document.getElementById(node.id);
							if (el) {
								el.innerHTML = node.data.shortName;
  							el.style.backgroundColor = "transparent";
							}
						}
					},

	        onRightClick: function(node, eventInfo, e) {
	          if (!node) return;
	
	          setTimeout(function(){
							$j("#infovisPopupName").attr("resourceId", node.data.resource.getId());
	            
	            if (node.data.resource.getWildcard()) {
	            	$j("#infovisPopupWildcard").html("Clear Wildcard");
	            	$j("#infovisPopupName").html("Wildcard Label:" + node.name);
	            }
	            else {
	            	$j("#infovisPopupWildcard").html("Set Wildcard");
	            	$j("#infovisPopupName").html(
	            	  "<span title=\"" + unescape(node.data.resource.getName()) + "\">" + node.data.resource.getShortName() + "</span>"
	            	);
							}
							
				      var pos = node.pos.getc(true), 
				          canvas = that.rgraph.canvas,
				          ox = canvas.translateOffsetX,
				          oy = canvas.translateOffsetY,
				          sx = canvas.scaleOffsetX,
				          sy = canvas.scaleOffsetY,
				          radius = canvas.getSize();
				      var nodePos = {
				        x: Math.round(pos.x * sx + ox + radius.width / 2 + 50),
				        y: Math.round(pos.y * sy + oy + radius.height / 2)
				      };

	            document.getElementById("infovisPopup").style.left = nodePos.x;
	            document.getElementById("infovisPopup").style.top = nodePos.y;
	            $j('#infovisPopup').show('scale',{'percent': 100},250);
	          }, 100);
	        },
	    },        
	  });
	
	  that.rgraph.loadJSON(json);
	  that.rgraph.refresh();

		$j(document).trigger("SM_GRAPH_CREATED");
  }

  function evt_layout_resize(event, data) {
  	var w = that.infovisContainer.offsetWidth, h = that.infovisContainer.offsetHeight;  	
  	that.rgraph.canvas.resize(w, h);
  	that.rgraph.refresh();
  }

  function evt_inspector_added_resource(event, args) {  
  	addNode(args.existing, args.edge, args.newr, args.invertArrow);
		$j(document).trigger("SM_GRAPH_NODE_ADDED", [args]);
  }

  function addNode(existingResource, edgeResource, newResource, invertArrow) {
  	if (invertArrow) {
  	  var dir = [newResource.getId(), existingResource.getId()];
  	}
  	else {
  	  var dir = [existingResource.getId(), newResource.getId()];
  	}
  	
    var json = [
    {"id": existingResource.getId(), "adjacencies":[newResource.getId()]},    
    {
      "id": newResource.getId(),
      "name": newResource.getName(),
      "data": {"resource": newResource},
      "adjacencies": [{
        "nodeTo": existingResource.getId(),
        "data": {
          "labeltext": edgeResource.getName(),
          "labelid": edgeResource.getId(),
          "resource": edgeResource,
          "$direction": dir
        }
      }]
    }
    ];
    
    that.rgraph.op.sum(json, {  
			type: 'fade:seq',  
			duration: 500,  
			hideLabels: true,  
			transition: Trans.Quart.easeOut  
		});  	
  }


  function evt_inspector_removed_resource(event, args) {  
		doNodeRemoval(args.delr.getId());
  }


  function removeNodeHandler() {
		var resId = $j("#infovisPopupName").attr("resourceId");
  	var node = that.rgraph.graph.getNode(resId);
  	if (node == null) return;

		doNodeRemoval(node.id);
				
		$j("#infovisPopupClose").click();  	
  }

  
  function doNodeRemoval(id) {
    ensureCenter(id);
  	removeEdgeLabels(id);
  	removeNode(id);
  	removeOrphans();
  	that.rgraph.labels.clearLabels();
  	that.rgraph.refresh();
  	recomputeLabels();
  }

  
  function removeNode(id) {
  	var resource = that.rgraph.graph.getNode(id).data.resource;

		that.rgraph.op.removeNode(id, {  
			type: 'replot',  
			hideLabels: false
		});

		$j(document).trigger("SM_GRAPH_NODE_REMOVED", [resource]);
  }


  function removeEdgeLabels(id) {
		var node = that.rgraph.graph.getNode(id);
		if (node == null) return;
		
		$jit.Graph.Util.eachAdjacency(node, function(adj) {  
		  removeEdgeLabel(adj);
		});
  }

  
  function removeEdgeLabel(adj) {
    var labelId = that.makeLabelId(adj);
		var lbl = document.getElementById(labelId);
		if (lbl) {
			var prnt = document.getElementById("infovis-label");
			prnt.removeChild(lbl);
			that.labelDeleteList.push(labelId);
		}
  }

  
  function removeOrphans() {
  	var orphanList = [];

    $jit.Graph.Util.eachNode(that.rgraph.graph, function(node) {  
    	if (!$jit.Graph.Util.isDescendantOf(node, that.rgraph.root)) {
    		orphanList.push(node.id);
    	}
    });  
    
    for (var i = 0; i < orphanList.length; i++) {
	  	removeEdgeLabels(orphanList[i]);
    }

	  that.rgraph.op.removeNode(orphanList, { type: 'nothing' });
  }
   

  function ensureCenter(id) {
  	// rgraph gets screwed up if we remove the center node.... so recenter it if necessary
  	// we center on the other node in this node's first adjacency.
  	if (that.rgraph.root == id) {
			var node = that.rgraph.graph.getNode(id);
			var adjid = null;
			for (adjid in node.adjacencies) {
				break;
			}

			var adj = node.adjacencies[adjid];
			var newNodeId = null;
			if (adj.nodeFrom.id == id) {
				newNodeId = adj.nodeTo.id;
			}
			else {
				newNodeId = adj.nodeFrom.id;
			}
  		
			that.rgraph.onClick(newNodeId);
		}
  }
  

  function evt_results_column_hover_in(event, id) {
		var label = document.getElementById(id);  	
    var node = that.rgraph.graph.getNode(label.id);
    if(node.selected) return;
    that.rgraph.nodestyles.hoveredNode = node;
    that.rgraph.nodestyles.toggleStylesOnHover(that.rgraph.nodestyles.hoveredNode, true);
  }

  
  function evt_results_column_hover_out(event, id) {
		that.rgraph.nodestyles.toggleStylesOnHover(that.rgraph.nodestyles.hoveredNode, false);
  }
  
  
  function evt_results_row_selected(event, cols, row) {
  	var eventData = [];
  	
  	for (var i = 0; i < cols.length; i++) {
  		var binding = cols[i];
  		var resource = row[cols[i]];
  		
  		if (!resource) continue;

			var boundNode = lookupNodeByBinding(binding);  	
	  	if (boundNode == null) return;
	
	    var oldId = boundNode.data.resource.getId();  	
	    var replaceRoot = (that.rgraph.root == oldId);
	
	    replaceNodeResource(boundNode, resource);		
			
			eventData.push([oldId, resource, replaceRoot]);
  	}

		that.rgraph.refresh();

		for (var i = 0; i < eventData.length; i++) {
			$j(document).trigger("SM_GRAPH_REPLACED_NODE", eventData[i]);
		}
  }
  
  
  function evt_results_cell_selected(event, binding, resource) {
  	if (!resource) return;
  	
		var boundNode = lookupNodeByBinding(binding);  	
  	if (boundNode == null) return;

    var oldId = boundNode.data.resource.getId();  	
    var replaceRoot = (that.rgraph.root == oldId);

    replaceNodeResource(boundNode, resource);		
		that.rgraph.refresh();
		
		$j(document).trigger("SM_GRAPH_REPLACED_NODE", [oldId, resource, replaceRoot]);
  }
  
  function lookupNodeByBinding(binding) {
  	var bindingNum = binding.substring(1);
    var boundNode = null;

    $jit.Graph.Util.eachNode(that.rgraph.graph, function(node) {  
    	if (node.data.resource.getWildcard() == true && node.name == bindingNum) {
    		boundNode = node;
    	}
    });  
    
    return boundNode;
  }
  
  function replaceNodeResource(oldNode, resource) {
  	if (oldNode.data.resource.getId() == resource.getId()) {
	    oldNode.data.resource.setWildcard(false);
			var label = document.getElementById(oldNode.id);
			if (label) label.innerHTML = oldNode.data.resource.getShortName();
			return;
  	}
  	
  	
		that.rgraph.graph.addNode({ "id": resource.getId(),
			                          "name": resource.getName(),
			                        "data": { "resource": resource } });

    var newNode = that.rgraph.graph.getNode(resource.getId());    
    newNode.data.resource.setWildcard(false);
		var label = document.getElementById(newNode.id);
		if (label) label.innerHTML = newNode.name;

  	if (that.rgraph.root == oldNode.id) {
  		that.rgraph.root = newNode.id;
    }

		$jit.Graph.Util.eachAdjacency(oldNode, function(adj) {  
			if (adj.nodeFrom.id == adj.data.$direction[0]) {
				var from = newNode.id;
				var to = adj.nodeTo.id;
			}
			else {
				var from = adj.nodeTo.id;
				var to = resource.getId();
			}
			
			that.rgraph.graph.addAdjacence(newNode, adj.nodeTo,
			                     { "$direction": [from, to],
			                     	 "labelid": adj.data.labelid,
			                     	 "labeltext": adj.data.labeltext,
			                     	"resource": adj.data.resource });
			removeEdgeLabel(adj);
		});

		that.rgraph.graph.removeNode(oldNode.id);
    that.rgraph.labels.clearLabels();
  }

  
  function evt_results_announce_binding(event, args) {
  	var node = that.rgraph.graph.getNode(args.id);
  	if (node == null) return;
  	var bindingNum = args.binding.substring(1);
  	
			node.name = bindingNum;

			var label = document.getElementById(node.id);
			if (label) label.innerHTML = node.name;
  		that.rgraph.refresh();
  }

  
  function wildcardHandler() {
  	var resId = $j("#infovisPopupName").attr("resourceId");
  	var node = that.rgraph.graph.getNode(resId); // TODO: we really need to account for edges too
  	if (node == null) return;

		toggleWildcard(node);  	
    
    $j("#infovisPopupClose").click();  	
		$j(document).trigger("SM_GRAPH_WILDCARD_CHANGED", [node.data.resource]);
		
		if (that.rgraph.root == resId) {
			$j(document).trigger("SM_GRAPH_ROOT_WILDCARD_CHANGED", [node.data.resource]);
		}
  }
  
  function toggleWildcard(node) {
  	var resource = node.data.resource;

  	if (resource.getWildcard()) {
	  	resource.setWildcard(false);

			node.name = resource.getName();
			var label = document.getElementById(node.id);
			if (label) label.innerHTML = node.name;
  		that.rgraph.refresh();
    }
    else {
	  	resource.setWildcard(true);
    }
  }


  function makeLabelId(adj) {
		if (adj.nodeFrom.id == adj.data.$direction[0]) {
			var from = adj.nodeFrom.id;
			var to = adj.nodeTo.id;
		}
		else {
			var from = adj.nodeTo.id;
			var to = adj.nodeFrom.id;
		}
	  return from + "_" + adj.data.labelid + "_" + to;
  }
  
  function recomputeLabels() {
  	$j('.graphLabel').each(function(index) {
			var node = that.rgraph.graph.getNode($j(this).attr("id"));
			var name = node.data.name;
			if (node.data.resource.getWildcard()) {
				  name = node.name;
			}
			
			if (node && name) {
				$j(this).html(name);
				node.data.isOverlap = false;
			}	      		
  	});
  	
		$j('.graphLabel').overlaps().each(function(index) {
			var node = that.rgraph.graph.getNode($j(this).attr("id"));

			if (node && node.data.shortName && !node.data.resource.getWildcard()) {
				$j(this).html(node.data.shortName);
				node.data.isOverlap = true;
			}
		});
		
		that.rgraph.plot();
  }
  
  
  function removeAllEdgeLabels() {
  	$j("#infovis-label > div[class != graphLabel]").remove();
  	that.labelDeleteList = [];
  }
  
  
  function loadFromSerialization(save) {
  	var data = save.graph;
  	for (var i = 0; i < data.length; i++) {
  		if (data[i].data.resource_raw.type == "URI") {	
		    data[i].data.resource = new smeagol.Resource({
		    	uri: {
		    		uri: data[i].data.resource_raw.uri,
		    		label: data[i].data.resource_raw.label
		    	}
		    });
  		}
  		else {
    		data[i].data.resource = new smeagol.Resource({
    			literal: {
    				literal: data[i].data.resource_raw.literal,
    				literal_type: data[i].data.resource_raw.literal_type,
    				literal_lang: data[i].data.resource_raw.literal_lang
    			}
    		});
    		
    		data[i].data.resource.setId(data[i].data.resource_raw.id);
  		}
  		
  		data[i].data.resource.setWildcard(data[i].data.resource_raw.wildcard);
  		data[i].data.resource.setShowInResults(data[i].data.resource_raw.showInResults);

			delete data[i].data.resource_raw;  		
  		
  		for (var j = 0; j < data[i].adjacencies.length; j++) {
  			var edgeResource = new smeagol.Resource({
  				uri: {
  					uri: data[i].adjacencies[j].data.resource_raw.uri, 
  					label: data[i].adjacencies[j].data.resource_raw.label
  				}
  			});

        data[i].adjacencies[j].data.labeltext = edgeResource.getName();
        data[i].adjacencies[j].data.labelid = edgeResource.getId();

				data[i].adjacencies[j].data.resource = edgeResource;
				
  			delete data[i].adjacencies[j].data.resource_raw;   			
  		}
  	}
  	
  	
  	removeAllEdgeLabels();
  	
  	// update graph
	  that.rgraph.loadJSON(data);
	  that.rgraph.root = save.root;
	  that.rgraph.refresh();

    // update results
		for (var i = 0; i < data.length; i++) {
			var resource = data[i].data.resource;
			
			if (resource.getWildcard()) {	    
				if (that.rgraph.root == resource.getId()) {
					$j(document).trigger("SM_GRAPH_ROOT_WILDCARD_CHANGED", [resource]);
				}
				else {
					$j(document).trigger("SM_GRAPH_WILDCARD_CHANGED", [resource]);
				}
			}
		}

    // update inspector
  	var selections = [];
		$jit.Graph.Util.eachBFS(that.rgraph.graph, that.rgraph.root, function(node) {  
			$jit.Graph.Util.eachAdjacency(node, function(adj) {
				if (adj.data.$direction[0] == node.data.resource.getId()) {
					var resFrom = node.data.resource;
					var resTo = adj.nodeTo.data.resource;
			  }
			  else {
			  	var resFrom = adj.nodeTo.data.resource;
			  	var resTo = node.data.resource;
			  }

				var addSel = true;
				for (var i = 0; i < selections.length; i++) {				
					if (selections[i].subject.getId() == resFrom.getId()
					    && selections[i].predicate.getId() == adj.data.resource.getId()
					    && selections[i].object.getId() == resTo.getId()) {
					  addSel = false;
						break;
					}
				}
				
				if (addSel) {
					selections.push({subject: resFrom, predicate: adj.data.resource, object: resTo});
				}

	    });
	  });
	  
	  smeagol.inspector.resetSelections(selections);   
	  
		$j(document).trigger("SM_GRAPH_NODE_SELECTED", [(that.rgraph.graph.getNode(that.rgraph.root)).data.resource]);	  
  }

  
  function serialize() {
  	var json = {
  		"root": that.rgraph.root,
  		"graph": []
  	};
  	
  	
  	
		$jit.Graph.Util.eachBFS(that.rgraph.graph, that.rgraph.root, function(node) {  
			var item = {
				"id": node.data.resource.getId(),
				"name": node.data.resource.getName(),
				"data": {
					"resource_raw": {
						"id": node.data.resource.getId(),
						"type": node.data.resource.getType(),
						"wildcard":  node.data.resource.getWildcard(),
						"showInResults": node.data.resource.getShowInResults(),
					}
				},
				"adjacencies": []
			};
			
			if (node.data.resource.getType() == "URI") {
			  item.data.resource_raw.uri = node.data.resource.getURI();
			  item.data.resource_raw.label = node.data.resource.getLabel();
			}
			else {
			  item.data.resource_raw.literal = node.data.resource.getLiteral();
			  item.data.resource_raw.literal_type = node.data.resource.getLiteralType();
			  item.data.resource_raw.literal_lang = node.data.resource.getLiteralLang();
			}
			
			$jit.Graph.Util.eachAdjacency(node, function(adj) {
				item.adjacencies.push({
					"nodeTo": adj.nodeTo.data.resource.getId(),
					"data": {
						"resource_raw": {
							"uri": adj.data.resource.getURI(),
							"label": adj.data.resource.getLabel()
						},
						"$direction": adj.data.$direction						
					}
				});

			});
			
			json.graph.push(item);
    }); 
    
    return json;

  }
}


smeagol.Graph.prototype.edgeRenderer = function(adj, canvas) {
  //plot arrow edge
  this.edgeTypes.arrow.call(this, adj, canvas);

  //check for edge label in data
  var data = adj.data;
	var labelId = smeagol.graph.makeLabelId(adj);  
  
  if(data.labelid && data.labeltext) {
  	for(var i = 0; i < smeagol.graph.labelDeleteList.length; i++){
	    if(smeagol.graph.labelDeleteList[i] == labelId) {
		  	// we don't want to recreate labels that were just deleted
	  		delete smeagol.graph.labelDeleteList[i];
	  		return;
	  	}
    }
  	
    var domlabel = document.getElementById(labelId);

    //if the label doesn't exist create it and append it
    //to the label container
    if(!domlabel) {
      domlabel= document.createElement('div');
      domlabel.id = labelId;
      domlabel.innerHTML = data.labeltext;

      //add some custom style
      var style = domlabel.style;
      style.position = 'absolute';
      style.color = '#000';
      style.fontSize = '9px';
      
      domlabel.onmouseup = function(e) {
        var rightclick;
        	if (!e) var e = window.event;
        	if (e.which) rightclick = (e.which == 3);
        	else if (e.button) rightclick = (e.button == 2);
        	if (!rightclick) return;
      };

      //append the label to the labelcontainer 
      this.labels.getLabelContainer().appendChild(domlabel);
    }

    //get nodes cartesian coordinates
	  var pos = adj.nodeFrom.pos.getc(true);
	  var posChild = adj.nodeTo.pos.getc(true);

		//now adjust the label placement
	  var ox = canvas.translateOffsetX,
	      oy = canvas.translateOffsetY,
	      sx = canvas.scaleOffsetX,
	      sy = canvas.scaleOffsetY,
	      radius = canvas.getSize();
	  var labelPos = {
	    x: Math.round( (pos.x + posChild.x) / 2 + (radius.width / 2) + ox - (domlabel.offsetWidth/2)),
	    y: Math.round( (pos.y + posChild.y) / 2 + (radius.height / 2) + oy )
	  };

    domlabel.style.left = labelPos.x + 'px';
    domlabel.style.top = labelPos.y + 'px';
    //domlabel.display = this.fitsInCanvas(labelPos, canvas)? '' : 'none';
  }
}
