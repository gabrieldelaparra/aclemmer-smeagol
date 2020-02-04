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
smeagol.Sparql = function() {
  ////////////////////////
  // private vars
  var that = this;
  var variables = [];
	var varCtr = 0;
	var numSel = 0;


  ////////////////////////
  // public vars


  ////////////////////////
  // public functions
  this.buildSparqlFromGraph = buildSparqlFromGraph;
	this.isRunnable = isRunnable;
	this.getBindingList = getBindingList;
	this.getNumSel = getNumSel;
	this.getVarCnt = getVarCnt;


  init();


  ////////////////////////
  // function definitions
  function init() {
  }
  
  function getBindingList() {
  	return variables;
  }
  
  function getNumSel() {
  	return numSel;
  }
  
  function getVarCnt() {
  	return varCtr;
  }
  
  function isRunnable() {
  	if (varCtr > 0 && numSel > 0)
  		return true;
  	return false;
  }
  
  function buildSparqlFromGraph(graph, centerNodeId) {
  	var triples = [];
  	variables = [];
  	varCtr = 0;
  	numSel = 0;
  	
		$jit.Graph.Util.eachBFS(graph, centerNodeId, function(node) {  
			$jit.Graph.Util.eachAdjacency(node, function(adj) {
				var adjRes = adj.data.resource;
				var direction = adj.data.$direction;
				if (direction && direction.length>1 && direction[0] != adj.nodeFrom.id) { // we're inverted
					var aRes = adj.nodeTo.data.resource;
					var bRes = node.data.resource;
				}
				else {
					var aRes = node.data.resource;
					var bRes = adj.nodeTo.data.resource;				
				}
				
				var addTriple = true;
				for (var i = 0; i < triples.length; i++) {
					if (   (aRes.getId() == triples[i].a.getId() && adjRes.getId() == triples[i].pred.getId() && bRes.getId() == triples[i].b.getId())
					    || (aRes.getId() == triples[i].b.getId() && adjRes.getId() == triples[i].pred.getId() && bRes.getId() == triples[i].a.getId())) {
					  addTriple = false;
					  break;
					}
				}
				
				if (addTriple) {
					triples.push({a: aRes, pred: adjRes, b: bRes});
				}
			});
			
    });

		triples.sort(function(a, b) {
			var as = a.a.getId() + a.pred.getId() + a.b.getId();
			var bs = b.a.getId() + b.pred.getId() + b.b.getId();
			
			if (as < bs) {
				return -1;
			}
			else if (as > bs) {
				return 1;
			}
			return 0;
		});

  	var body = "";
		for (var i = 0; i < triples.length; i++) {
			body += getBinding(triples[i].a) + " " + getBinding(triples[i].pred) + " " + getBinding(triples[i].b) + " . \n";
		}
		var cachekey = hex_md5(body);

		//console.log(body);
		//console.log(hex_md5(body));
		
		var vbindings = "";
		for (var key in variables) {
			if (variables[key].show) {
				vbindings += variables[key].binding + " ";
				numSel++;
			}
		}
  	
  	var query = "SELECT DISTINCT " + vbindings + " WHERE {";
  	query += body;
  	query += " }";
  	
  	//console.log(query);
  	return {'cachekey': hex_md5(cachekey), 'query': query};
  }
  
  
	function getBinding(res) {
		var binding = "";
		
		if (res.getWildcard()) {
			if (variables[res.getId()]) {
				binding = variables[res.getId()].binding;
			}
			else {
				binding = "?x" + varCtr;
				variables[res.getId()] = {"binding": binding, "name": res.getName(), "show": res.getShowInResults()};
				varCtr++;
			}
		}
		else {
			binding = res.getWrappedValue();
		}

		return binding;
	}  	
  
}