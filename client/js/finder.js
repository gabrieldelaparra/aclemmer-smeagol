
$j(document).ready(function() {
    smeagol.finder = new smeagol.Finder('#findGrid');
    document.getElementById('searchBox').focus();
});

smeagol.find = function() {
    var keyword = document.getElementById('searchBox').value;
    smeagol.finder.createGrid(keyword);
    return false;
}

smeagol.Finder = function(containerId) {
    var that = this;
    this.containerId = containerId;
    this.endpoint= smeagol.settings.baseEndpointURL + "finder";
    this.createGrid = createGrid;

    init();

    function init() {
        that.columns = [
            {id:"label", name:"Label", field:"label", formatter:labelFormatter, width:250 },
            {id:"description", name:"Description", field:"description", formatter:descFormatter, width:550 },
            {id:"classes", name:"Classes", field:"classes", formatter:classFormatter, width:200 }
//            {id:"categories", name:"Categories", field:"categories", formatter:catFormatter, width:300 }
        ];
        that.options = {
            enableCellNavigation: true,
            enableColumnReorder: false,
            rowHeight: 130
        };
    }

    function createGrid(keyword) {
        if (that.grid != null) {
            that.grid.destroy();
        }
        that.loader = null;
        that.grid = null;
        that.data = null;

        that.loader = new Slick.Data.RemoteModel(smeagol.settings.proxyURL, that.endpoint);
        that.loader.setParameter("keyword", keyword);
				that.loader.setParameter("clientId", smeagol.clientId);
        that.grid = new Slick.Grid($j(that.containerId), that.loader.data, that.columns, that.options);

        that.loading = new smeagol.LoadingIndicator(that.grid, that.loader, "#findGrid", "Loading...");
        that.grid.onViewportChanged = function() {
            var vp = that.grid.getViewport();
            that.loader.ensureData(vp.top, vp.bottom);
            that.loading.showIndicator();
        };

        that.grid.onClick = function(event, row, cell) {
            var resource = that.loader.getCell(row, that.columns[cell].field);
        }

        that.loader.onDataLoaded.subscribe(function(args) {
            for (var i = args.from; i <= args.to; i++) {
                that.grid.removeRow(i);
            }
            that.grid.updateRowCount();
            that.grid.render();
        });

        that.grid.onViewportChanged();
    }

    return this;
}

function labelFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
        return "";
    }
    else {
        var link = '<a class="label" href="' + smeagol.settings.discovererURL
            + "?uri="
            + escape(dataContext.uri) + '">'
            + dataContext.label + '</a>';
        return '<div class="result finderCell">' + link + "</div>";
    }
}

function descFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
        return "";
    }
    else {
        return "<div class='description finderCell'>" + dataContext.description + "</div>";
    }
}

function classFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
        return "";
    }
    else {
        var classes = "";
        var numClasses = dataContext.classes.length;
        for (var i = 0; i < numClasses; i++) {
            if (i > 0) {
                classes += ", ";
            }
            classes += dataContext.classes[i];
        }
        return "<div class='classes finderCell'>" + classes + "</div>";
    }
}

function catFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
        return "";
    }
    else {
        var categories = "";
        var numCategories = dataContext.categories.length;
        for (var i = 0; i < numCategories; i++) {
            if (i > 0) {
                categories += ", ";
            }
            categories += dataContext.categories[i];
        }
        return "<div class='categories finderCell'>" + categories + "</div>";
    }
}
