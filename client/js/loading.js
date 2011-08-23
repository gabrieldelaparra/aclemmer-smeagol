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
//Create a loading indicator and attach it to a grid and loader.
//To use: add this constructor to the function that initializes the grid
//and the loader, and add LoadingIndicator.showIndicator() to the
//grid's onViewportChanged function.
smeagol.LoadingIndicator = function(grid, loader, containerID, text) {
    this.indicator = null;
    this.from = -1;
    this.to = -1;
    this.loading = false;
    this.gridEl = $j(containerID);
    this.text = text;

    var that = this;

    init();

    function init() {

        loader.onDataLoading.subscribe(function(args) {
            if (!that.indicator) {
                that.indicator = $j("<span class='loading-indicator'><label>" + that.text + "</label></span>");
                that.indicator.appendTo(document.body);
                var pos = that.gridEl.offset();
                that.indicator.css("position", "absolute")
                    .css("top", pos.top + that.gridEl.height() / 2 - that.indicator.height() / 2)
                    .css("left", pos.left + that.gridEl.width() / 2 - that.indicator.width() / 2);
            }

            that.from = args.from;
            that.to = args.to;
            that.loading = true;

            //console.log("onDataLoading, loading=true, showing indicator");

            that.showIndicator();
        });

        loader.onDataLoaded.subscribe(function(args) {
            that.loading = false;
            that.indicator.hide();
            //console.log("onDataLoaded, loading=false, indicator=fadeout");
        });

        loader.onDataError.subscribe(function(args) {
            that.loading = false;
            that.indicator.hide();
            //console.log("onDataError, loading=false, indicator=fadeout");
        });
    }

    this.showIndicator = function() {
        //Check that we should show the indicator, then show it
        var vp = grid.getViewport();
        //console.log("showIndicator, indicator=" + that.indicator + ", loading=" + that.loading + ", top: " + vp.top + "<=" +that.to + ", bottom: " + vp.bottom + " >= " + that.from);
        if (that.indicator) {
            if (that.loading
                    && vp.top <= that.to && vp.bottom >= that.from) {
              that.indicator.show();
              //console.log("showIndicator, showed indicator");
            }
            else {
                that.indicator.hide();
                //console.log("showIndicator, hid indicator");
            }
        }
    }

    return this;
}
