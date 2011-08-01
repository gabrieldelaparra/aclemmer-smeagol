smeagol.inspector = null;
smeagol.results = null;
smeagol.graph = null;
smeagol.dialogs = null;
smeagol.initialResource = null;

smeagol.btnStartOverHandler = function() {
	var uri = $j("#inpURI").val();
	$j(document).trigger("SM_RESTART", [uri]);
};
	
smeagol.stemURI = function(uri) {
	var part = [];
	for (var i = uri.length - 1; i >= 0; i--) {
		if (uri[i] == '#' || uri[i] == '/') break;
		part.unshift(uri[i]);
	}
	
	return part.join("");
}

// Because I'm lazy.  http://stackoverflow.com/questions/901115/get-querystring-with-jquery
smeagol.getParameterByName = function( name ) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}
	
var outerLayout = null;
var centerLayout = null;

$j(document).ready(function() {
		outerLayout = $j('body').layout({
				minSize:			0	// ALL panes
			,	slidable:     false
			, togglerLength_open:         50
			, togglerLength_closed:       "100%"
		  , north__size:   'auto'
		  , north__closable: false
		  , north__resizable: false
			,	west__size:		400
			,	useStateCookie:		true
			, west__onresize: function() {
				centerLayout.resizeAll();
				$j(document).trigger("SM_LAYOUT_RESIZE");
			}
		});

		centerLayout = $j('div.ui-layout-center').layout({
				minSize:				50	// ALL panes
			, togglerLength_open:         50
			, togglerLength_closed:       "100%"
			,	center__paneSelector:	".center-center"
			,	south__paneSelector:	".center-south"
			,	south__size:			250
			, center__onresize: function() {
				$j(document).trigger("SM_LAYOUT_RESIZE");
			}
		});	


  var uri = smeagol.getParameterByName("uri");
  var stem = smeagol.stemURI(uri);  
	smeagol.initialResource = new smeagol.Resource({"uri": {"uri": uri, "label": stem}});

	smeagol.inspector = new smeagol.Inspector('#infoGrid');
	smeagol.results = new smeagol.Results('#resultsGrid');
	smeagol.graph = new smeagol.Graph('infovisContainer');
	smeagol.dialogs = new smeagol.Dialogs();


	$j("#hideURIs").change(function() {
		var val = $j('#hideURIs').is(':checked');
		$j(document).trigger("SM_TOOLBAR_HIDEURI", [val]);
  });



	smeagol.clip = new ZeroClipboard.Client();
  smeagol.clip.setText('');
  smeagol.clip.setCSSEffects(true);
  smeagol.clip.addEventListener('mouseDown', function(client) {
  	var text = smeagol.results.getResultsText();
		smeagol.clip.setText(text);
	});
 	smeagol.clip.glue('d_clip_button', 'd_clip_container');
});

