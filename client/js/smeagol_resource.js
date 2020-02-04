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

/*
  {
    uri: {uri: "", label: ""},
    literal: {literal: "", type: ""}
  }
*/
smeagol.Resource = function(data) {
	var that = this;
	var wildcard = false;
  var showInResults = true;
  var truncAt = 8;

	if (data.uri) {
		var type = "URI";
		var uri = data.uri.uri;
		var uri_label = data.uri.label;
		var id = uri;
	}
	else if (data.literal) {
		var type = "LITERAL";
		var literal = data.literal.literal;
		var literal_type = data.literal.literal_type;	
		var literal_lang = data.literal.literal_lang;	
		var id = makeUUID();
	}


  // MIT, http://www.broofa.com/Tools/Math.uuid.js   
  function makeUUID() {
  	var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split(''); 
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
      if (i==8 || i==13 ||  i==18 || i==23) {
        uuid[i] = '-';
      } else if (i==14) {
        uuid[i] = '4';
      } else {
        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
    return uuid.join('');
  };

	return {
		getType: function() { return type; },
		getURI: function() { return uri; },
		getLabel: function() { return uri_label; },
		getLiteral: function() { return literal; },
		getLiteralType: function() { return literal_type; },
		getLiteralLang: function() { return literal_lang; },
		
		getWildcard: function() { return wildcard; },
		setWildcard: function(state) { wildcard = state; },

		getShowInResults: function() { return showInResults; },
		setShowInResults: function(state) { showInResults = state; },

    setId: function(newId) { if (type == "LITERAL") id = newId; },
		getId: function() { return id; },

		getName: function(hideURIs) {
			hideURIs = typeof(hideURIs) != 'undefined' ? hideURIs : true;

			if (type == "URI") {
				if (hideURIs) {
					return uri_label;
				}
			  else {
			  	return uri;
			  }
			}
			else if (type == "LITERAL") {
				return literal;
			}
		},
		
		getShortName: function() {
			var name = unescape(this.getName(true));
			
  	  if (name.length > truncAt) {
  	  	name = name.substr(0, truncAt) + "...";
  	  }
  	  
  	  return name;
		},

		getWrappedValue: function() {
				if (type == "URI") {
					return "<" + uri + ">";
				}
				else if (type == "LITERAL") {
					var val = "\"" + literal + "\"";
					
					if (literal_lang) {
						val += "@" + literal_lang;
					}
					else if (literal_type) {
						val += "^^<" + literal_type + ">";
					}

					return val;
  			}			
  			return "";
		}
	};
}