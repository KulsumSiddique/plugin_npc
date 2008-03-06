npc.app.portlet.servicegroupOverview = function(){

    // Portlet name
    var name = 'Servicegroup Overview';

    // Portlet ID
    var id = 'servicegroupOverview';

    // Portlet URL
    var url = 'npc.php?module=servicegroups&action=getOverview';

    // Default column
    var column = 'dashcol2';

    // Default # of events to display
    var pageSize = parseInt(npc.app.params.npc_portlet_rows);

    function renderHostStatus(val, meta){
        var state;
        var bg;
        switch(val) {
            case 0:
                state = 'Up';
                bg = '33FF00';
                break;
            case 1:
                state = 'Down';
                bg = 'F83838';
                break;
            case 2:
                state = 'Unreachable';
                bg = 'F83838';
                break;
            case -1:
                state = 'Pending';
                bg = '0099FF';
                break;
        }

        meta.attr = 'style="background-color: #' + bg + ';"';
        return String.format('<b>{0}</b>', state);
    }

    var store = new Ext.data.GroupingStore({
        url:url,
        autoload:true,
        sortInfo:{field: 'host_name', direction: "ASC"},
        reader: new Ext.data.JsonReader({
            totalProperty:'totalCount',
            root:'data'
        }, [
            {name: 'instance_id', type: 'int'},
            {name: 'servicegroup_object_id', type: 'int'},
            'alias',
            'host_name',
            {name: 'host_state', type: 'int'},
            {name: 'critical', type: 'int'},
            {name: 'warning', type: 'int'},
            {name: 'unknown', type: 'int'},
            {name: 'ok', type: 'int'},
            {name: 'pending', type: 'int'}
        ]),
        groupField:'alias'
    });

    var cm = new Ext.grid.ColumnModel([{
        header:"Servicegroup",
        dataIndex:'alias',
        hidden:true
    },{
        header:"Host",
        dataIndex:'host_name',
        sortable:true,
        width:100
    },{
        header:"Status",
        dataIndex:'host_state',
        align:'center',
        width:40,
        renderer:renderHostStatus
    },{
        id: 'sgHostTotalsCRITICAL',
        header:"Critical",
        dataIndex:'critical',
        align:'center',
        width:40,
        renderer: npc.app.renderStatusBg
    },{
        id: 'sgHostTotalsWARNING',
        header:"Warning",
        dataIndex:'warning',
        align:'center',
        width:45,
        renderer: npc.app.renderStatusBg
    },{
        id: 'sgHostTotalsUNKNOWN',
        header:"Unknown",
        dataIndex:'unknown',
        align:'center',
        width:45,
        renderer: npc.app.renderStatusBg
    },{
        id: 'sgHostTotalsOK',
        header:"Ok",
        dataIndex:'ok',
        align:'center',
        width:25,
        renderer: npc.app.renderStatusBg
    },{
        id: 'sgHostTotalsPENDING',
        header:"Pending",
        dataIndex:'pending',
        align:'center',
        width:45,
        renderer: npc.app.renderStatusBg
    }]);


    var grid = new Ext.grid.GridPanel({
        id: 'servicegroup-overview-portlet-grid',
        autoHeight:true,
        autoExpandColumn: 'host_name',
        store:store,
        cm:cm,
        sm: new Ext.grid.RowSelectionModel({singleSelect:true}),
        stripeRows: true,
        view: new Ext.grid.GroupingView({
            forceFit:true,
            autoFill:true,
            hideGroupedColumn: true,
            enableGroupingMenu: false,
            enableNoGroups: true,
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "Hosts" : "Host"]})',
            scrollOffset:0
        }),
        bbar: new Ext.PagingToolbar({
            pageSize: pageSize,
            store: store,
            displayInfo: true,
            displayMsg: ''
        })
    });

    // Create a portlet to hold the grid
    npc.app.addPortlet(id, name, column);

    // Add the grid to the portlet
    Ext.getCmp(id).items.add(grid);

    // Refresh the dashboard
    Ext.getCmp('centerTabPanel').doLayout();

    // Render the grid
    grid.render();

    // Load the data store
    //grid.store.load({params:{start:0, limit:pageSize}});
    store.load({params:{start:0, limit:10}});

    // Start auto refresh of the grid
    if (Ext.getCmp(id).isVisible()) {
        doAutoRefresh();
    }

    // Add listeners to the portlet to stop and start auto refresh
    // depending on wether or not the portlet is visible.
    var listeners = {
        hide: function() {
            store.stopAutoRefresh();
        },
        show: function() {
            doAutoRefresh();
        },
        collapse: function() {
            store.stopAutoRefresh();
        },
        expand: function() {
            doAutoRefresh();
        }
    };

    Ext.getCmp(id).addListener(listeners);

    function doAutoRefresh() {
        store.startAutoRefresh(npc.app.params.npc_portlet_refresh);
    }

    grid.on('rowclick', sgOverviewClick);

    function sgOverviewClick(grid, rowIndex, e) {
        //console.log(grid.getStore().getAt(rowIndex).json.servicegroup_object_id);
        var soi = grid.getStore().getAt(rowIndex).json.servicegroup_object_id;
        var name = grid.getStore().getAt(rowIndex).json.alias;
        npc.app.serviceGroupGrid('serviceGroupGrid-'+soi, 'Servicegroup: '+name, soi);
    }
};
