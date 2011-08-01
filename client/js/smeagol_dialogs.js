smeagol.Dialogs = function() {

  init();


  function init() {
		$j("#save-dialog").dialog({
			autoOpen: false,
			height: 210,
			width: 275,
			modal: true,
			resizable: false,
			buttons: {
				'Save': function() {
					var saveName = $j("#save-dialog-name"),
					    saveTips = $j("#save-dialog-tips");

					var bValid = true;
					saveName.removeClass('ui-state-error');
	
					bValid = bValid && checkLength(saveTips, saveName,"username",1,32);
					bValid = bValid && checkRegexp(saveTips, saveName,/^[a-zA-Z]([0-9A-Za-z_ ])+$/i,"Save names may consist of a-z, 0-9, spaces, underscores, begin with a letter.");
					
					if (bValid) {
						var state = smeagol.graph.serialize();				
						var url = smeagol.settings.proxyURL + escape(smeagol.settings.baseEndpointURL + "savestate" + "?clientId=" + smeagol.clientId + "&name=" + saveName.val());
				
						req = $j.ajax({
						   type: "POST",
						   url: url,
						   contentType: "application/json",
						   dataType: "json",
						   data: JSON.stringify(state),
						   processData: false,
						   error: function(xhr, status, thrown) {  },
						   success: function(resp) {  }
						});
		
						$j(this).dialog('close');
					}
				},
				Cancel: function() {
					$j(this).dialog('close');
				}
			},
			close: function() {
				$j("#save-dialog-name").val('').removeClass('ui-state-error');
			}
		});

	
	$j("#saveState").click(function() {
		$j('#save-dialog').dialog('open');
	});


/*
		var url = smeagol.settings.proxyURL + escape(smeagol.settings.baseEndpointURL + "liststates" + "?clientId=1");

		req = $j.ajax({
		   type: "GET",
		   url: url,
		   dataType: "json",
		   error: function(xhr, status, thrown) {  },
		   success: function(resp) {  }
		});
*/


    var selectedTab = 0;
		$j("#load-tabs").tabs({
      select: function(event, ui) {
      	selectedTab = ui.index;
     	}
    });

		$j("#load-dialog").dialog({
			autoOpen: false,
			height: 300,
			width: 500,
			modal: true,
			resizable: false,
			buttons: {
				'Load': function() {
					var stateId = 0;
					if (selectedTab == 0) {
						stateId = $j("#load-dialog-list-packet").val();
					}
					else if (selectedTab == 1) {
						stateId = $j("#load-dialog-list-user").val();
					}

		
					if (true) {
						var url = smeagol.settings.proxyURL + escape(smeagol.settings.baseEndpointURL + "loadstate" + "?clientId=" + smeagol.clientId + "&stateId=" + stateId);

						req = $j.ajax({
							type: "GET",
							url: url,
							dataType: "json",
							error: function(xhr, status, thrown) {  },
							success: function(resp) {  
								var graph = JSON.parse(resp.data.payload);
								smeagol.graph.loadFromSerialization(graph);
								smeagol.results.updateGrid();
							}
						});
		
						$j(this).dialog('close');
					}
				},
				Cancel: function() {
					$j(this).dialog('close');
				}
			},
			open: function() {
				loadListbox('load-dialog-list-packet', smeagol.packetId);
				loadListbox('load-dialog-list-user', smeagol.clientId);
			},
			close: function() {
//				$j("#load-dialog-name").val('').removeClass('ui-state-error');
			}
		});	
	


	$j("#loadState").click(function() {
		$j('#load-dialog').dialog('open');
	});

  }


  function loadListbox(listBoxId, clientId) {
		var url = smeagol.settings.proxyURL + escape(smeagol.settings.baseEndpointURL + "liststates" + "?clientId=" + clientId);

		req = $j.ajax({
			type: "GET",
			url: url,
			dataType: "json",
			error: function(xhr, status, thrown) {  },
			success: function(resp) {  
				var data = JSON.parse(resp.data.payload);
				var html = "";
				
				for (var i = 0; i < data.length; i++) {
					html += '<option value="' + data[i].id + '">' + data[i].name + "</option>\n";
				}

				$j("#" + listBoxId).html(html);
			}
		});				
  }


	function updateTips(tips, t) {
		tips
			.text(t)
			.addClass('ui-state-highlight');
		setTimeout(function() {
			tips.removeClass('ui-state-highlight', 1500);
		}, 500);
	}

	function checkLength(tips, o,n,min,max) {

		if ( o.val().length > max || o.val().length < min ) {
			o.addClass('ui-state-error');
			updateTips(tips, "Length of " + n + " must be between "+min+" and "+max+".");
			return false;
		} else {
			return true;
		}

	}

	function checkRegexp(tips, o,regexp,n) {

		if ( !( regexp.test( o.val() ) ) ) {
			o.addClass('ui-state-error');
			updateTips(tips, n);
			return false;
		} else {
			return true;
		}

	}
	
	
	
}