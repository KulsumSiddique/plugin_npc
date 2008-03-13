// reference local blank image
Ext.BLANK_IMAGE_URL = 'js/ext/resources/images/default/s.gif';
 
// create namespace
Ext.namespace('npc');
 
// create application module
npc.app = function() {

    /* Private Variables */
	
    var viewport;
    var msgCt;

    // create some portlet tools using built in Ext tool ids
    var tools = [{
//        id:'gear',
//        handler: function(){
//            Ext.Msg.alert('Message', 'The Settings tool was clicked.');
//        }
//    },{
        id:'close',
        handler: function(e, target, panel){
            panel.hide();
        }
    }];

    /* Private Functions */
    // Override Ext.data.Store to add an auto refresh option
    Ext.override(Ext.data.Store, {
        startAutoRefresh : function(interval, params, callback, refreshNow){
            if(refreshNow){
                this.reload({callback:callback});
            }
            if(this.autoRefreshProcId){
                clearInterval(this.autoRefreshProcId);
            }
            this.autoRefreshProcId = setInterval(this.reload.createDelegate(this, [{callback:callback}]), interval*1000);
        },
        stopAutoRefresh : function(){
            if(this.autoRefreshProcId){
                clearInterval(this.autoRefreshProcId);
            }
        }        
    });

    Ext.ux.IFrameComponent = Ext.extend(Ext.BoxComponent, {
        onRender : function(ct, position){
            this.el = ct.createChild({tag: 'iframe', id: 'iframe-'+ this.id, frameBorder: 0, src: this.url});
        }
    });


    /** 
     * createBox returns a formatted box for displaying
     * messages to the end user.
     * 
     * @private
     * @param (String)  t   The title 
     * @param (String)  s   The message 
     * @return 
     */
    function createBox(t, s) {
        return ['<div class="msg">',
                '<div class="x-box-tl"><div class="x-box-tr"><div class="x-box-tc"></div></div></div>',
                '<div class="x-box-ml"><div class="x-box-mr"><div class="x-box-mc"><h3>', t, '</h3>', s, '</div></div></div>',
                '<div class="x-box-bl"><div class="x-box-br"><div class="x-box-bc"></div></div></div>',
                '</div>'].join('');
    };

    /* Public Space */
    return {

        // public properties, e.g. strings to translate
        params: new Array(),
        portlet: {},

        // public methods

        serviceGridClick: function(grid, rowIndex, e) {
            npc.app.serviceDetail(grid.getStore().getAt(rowIndex));
        },

        hostGridClick: function(grid, rowIndex, e) {
            npc.app.hostDetail(grid.getStore().getAt(rowIndex));
        },

        addHostComment: function(host) {

            var form = new Ext.FormPanel({
                labelWidth: 75,
                url:'npc.php?module=nagios&action=command',
                frame:true,
                bodyStyle:'padding:5px 5px 0',
                width: 525,
                defaults: {width: 175},
                defaultType: 'textfield',
                    items: [
                    {
                        name: 'p_command',
                        value:'ADD_HOST_COMMENT',
                        xtype: 'hidden'
                    },{
                        fieldLabel: 'Host Name',
                        name: 'p_host_name',
                        value: host,
                        allowBlank:false
                    },{
                        fieldLabel: 'Persistent',
                        name: 'p_persistent',
                        xtype: 'xcheckbox',
                        checked:true
                    },{
                        name: 'p_author',
                        value: npc.app.params.userName,
                        xtype: 'hidden'
                    },{
                        fieldLabel: 'Comment',
                        name: 'p_comment',
                        xtype: 'htmleditor',
                        width: 500
                    },{
                        xtype: 'panel',
                        html: '<br /><span style="font-size:10px;"><b>Note:</b> It may take a while before Nagios processes the comment.</span>',
                        width: 400
                    }
                ],
                buttons: [{
                    text: 'Submit',
                    handler: function(){
                        form.getForm().submit({
                            success: function(f, a) {
                                win.close();
                            },
                            failure: function(f, a) {
                                Ext.Msg.alert('Error', a.result.msg);
                            } 
                        });
                    }
                },{
                    text: 'Cancel',
                    handler: function(){
                        win.close();
                    }
                }]
            });

            var win = new Ext.Window({ 
                title:'New Comment', 
                layout:'fit', 
                modal:true, 
                closable: true, 
                width:650, 
                height:400, 
                bodyStyle:'padding:5px;', 
                items: form 
            }); 
            win.show(); 

        },

        addServiceComment: function(host, service) {

            var form = new Ext.FormPanel({
                labelWidth: 75,
                url:'npc.php?module=nagios&action=command',
                frame:true,
                bodyStyle:'padding:5px 5px 0',
                width: 525,
                defaults: {width: 175},
                defaultType: 'textfield',
                    items: [
                    {
                        name: 'p_command',
                        value:'ADD_SVC_COMMENT',
                        xtype: 'hidden'
                    },{
                        fieldLabel: 'Host Name',
                        name: 'p_host_name',
                        value: host,
                        allowBlank:false
                    },{
                        fieldLabel: 'Service',
                        name: 'p_service_description',
                        value: service,
                        allowBlank:false
                    },{
                        fieldLabel: 'Persistent',
                        name: 'p_persistent',
                        xtype: 'xcheckbox',
                        checked:true
                    },{
                        name: 'p_author',
                        value: npc.app.params.userName,
                        xtype: 'hidden'
                    },{
                        fieldLabel: 'Comment',
                        name: 'p_comment',
                        xtype: 'htmleditor',
                        width: 550
                    },{
                        xtype: 'panel',
                        html: '<br /><span style="font-size:10px;"><b>Note:</b> It may take a while before Nagios processes the comment.</span>',
                        width: 400
                    }
                ],
                buttons: [{
                    text: 'Submit',
                    handler: function(){
                        form.getForm().submit({
                            success: function(f, a) {
                                win.close();
                            },
                            failure: function(f, a) {
                                Ext.Msg.alert('Error', a.result.msg);
                            } 
                        });
                    }
                },{
                    text: 'Cancel',
                    handler: function(){
                        win.close();
                    }
                }]
            });

            var win = new Ext.Window({ 
                title:'New Comment', 
                layout:'fit', 
                modal:true, 
                closable: true, 
                width:650, 
                height:500, 
                bodyStyle:'padding:5px;', 
                items: form 
            }); 
            win.show(); 

        },

        // A simple ajax post
        aPost: function(args) {
            Ext.Ajax.request({
                url : 'npc.php' ,
                params : args,
                callback: function (o, s, r) {
                    var o = Ext.util.JSON.decode(r.responseText)
                    if(!o.success) {
                        Ext.Msg.alert('Error', o.msg);
                    }
                }
            });
        },

        renderStatusBg: function(val, meta){
            if(val > 0){
                if (meta.id.match('UP')) {
                        bg = '33FF00';
                } else if  (meta.id.match('DOWN')) {
                        bg = 'F83838';
                } else if  (meta.id.match('UNREACHABLE')) {
                        bg = 'F83838';
                } else if  (meta.id.match('PENDING')) {
                        bg = '0099FF';
                } else if  (meta.id.match('OK')) {
                        bg = '33FF00';
                } else if  (meta.id.match('CRITICAL')) {
                        bg = 'F83838';
                } else if  (meta.id.match('WARNING')) {
                        bg = 'FFFF00';
                } else if  (meta.id.match('UNKNOWN')) {
                        bg = 'FF9900';
                }
                meta.attr = 'style="background-color: #' + bg + ';"';
                return String.format('<b>{0}</b>', val);
            }
            return('0');
        },

        renderEventIcon: function(val){
            if (val.match(/SERVICE ALERT:/) && val.match(/WARNING/)) {
                return String.format('<img src="images/icons/error.png">');
            } else if (val.match(/SERVICE ALERT:/) && val.match(/OK/)) {
                return String.format('<img src="images/icons/accept.png">');
            } else if (val.match(/SERVICE ALERT:/) && val.match(/CRITICAL/)) {
                return String.format('<img src="images/icons/exclamation.png">');
            } else if (val.match(/LOG ROTATION:/)) {
                return String.format('<img src="images/icons/arrow_rotate_clockwise.png">');
            } else if (val.match(/ NOTIFICATION:/)) {
                return String.format('<img src="images/icons/transmit.png">');
            } else if (val.match(/HOST ALERT:/) && (val.match(/;RECOVERY;/) || val.match(/;UP;/))) {
                return String.format('<img src="images/icons/accept.png">');
            } else if (val.match(/Finished daemonizing.../)) {
                return String.format('<img src="images/icons/arrow_up.png">');
            } else if (val.match(/ shutting down.../)) {
                return String.format('<img src="images/icons/cancel.png">');
            } else if (val.match(/Successfully shutdown/)) {
                return String.format('<img src="images/icons/stop.png">');
            } else if (val.match(/ restarting.../)) {
                return String.format('<img src="images/icons/arrow_refresh.png">');
            } else if (val.match(/EXTERNAL COMMAND/)) {
                return String.format('<img src="images/icons/resultset_next.png">');
            }

            return String.format('<img src="images/icons/information.png">');
        },

        hostStatusImage: function(val){
            var img;
            var state;
            if (val == 0) {
                img = 'greendot.gif';
                state = "UP";
            } else if (val == 1) {
                img = 'reddot.gif';
                state = "DOWN";
            } else if (val == 2) {
                img = 'reddot.gif';
                state = "UNREACHABLE";
            } else if (val == -1) {
                img = 'bluedot.gif';
                state = "PENDING";
            }
            return String.format('<p align="center"><img ext:qtip="{0}" src="images/icons/{1}"></p>', state, img);
        },

        serviceStatusImage: function(val){
            var img;
            var state;
            if (val == 0) {
                img = 'greendot.gif';
                state = "OK";
            } else if (val == 1) {
                img = 'yellowdot.gif';
                state = "WARNING";
            } else if (val == 2) {
                img = 'reddot.gif';
                state = "CRITICAL";
            } else if (val == 3) {
                img = 'orangedot.gif';
                state = "UNKNOWN";
            } else if (val == -1) {
                img = 'bluedot.gif';
                state = "PENDING";
            }
            return String.format('<p align="center"><img ext:qtip="{0}" src="images/icons/{1}"></p>', state, img);
        },

        renderExtraIcons: function(val, p, record) {
            var img = '';
            if (record.data.problem_has_been_acknowledged == 1) {
                var ack = record.data.acknowledgement.split("*|*");
                var by = '';
                if (ack[0]) {
                    by = 'by ' + ack[0];
                }
                img = String.format('&nbsp;<img ext:qtip="This problem has been acknowledged {0}" src="images/icons/wrench.png">', by);
            }
            if (record.data.notifications_enabled == 0) {
                img = String.format('&nbsp;<img ext:qtip="Notifications have been disabled." src="images/icons/sound_mute.png">') + img;
            }
            if (record.data.comment) {
                //var c = record.data.comment.split("*|*");
                img = String.format('&nbsp;<img ext:qtip="There are comments for this item" src="images/icons/comment.png">') + img;
            }
            if (record.data.is_flapping) {
                img = String.format('&nbsp;<img ext:qtip="This service is flapping between states" src="images/icons/link_error.png">') + img;
            }
            if (!record.data.active_checks_enabled && !record.data.passive_checks_enabled) {
                img = String.format('&nbsp;<img ext:qtip="Active and passive checks have been disabled" src="images/icons/cross.png">') + img;
            } else if (!record.data.active_checks_enabled) {
                img = String.format('&nbsp;<img qtitle="Active checks disabled" ext:qtip="Passive checks are being accepted" src="images/nagios/passiveonly.gif">') + img;
            }
            return String.format('<div><div style="float: left;">{0}</div><div style="float: right;">{1}</div></div>', val, img);
        },

        renderCommentType: function(val) {
            var s;
            switch(val) {
                case '1':
                    s = 'User';
                    break;
                case '2':
                    s = 'Scheduled Downtime';
                    break;
                case '3':
                    s = 'Flap Detection';
                    break;
                case '4':
                    s = 'Acknowledgement';
                    break;
            }
            return String.format('{0}', s);
        },

        renderPersistent: function(val) {
            var s;
            switch(val) {
                case '0':
                    s = 'No';
                    break;
                case '1':
                    s = 'Yes';
                    break;
            }
            return String.format('{0}', s);
        },

        renderCommentExpires: function(val, p, record) {
            if (record.data.is_persistent == 1) {
                return String.format('NA');
            }
            if(typeof val == "object") {
                if(val.getYear() == '69') {
                    return String.format('NA');
                } else {
                    return String.format(val.dateFormat(npc.app.params.npc_date_format + ' ' + npc.app.params.npc_time_format));
                }
            }
            return val;
        },

        getDuration: function(val) {
            var d = new Date();
            var t = d.dateFormat('U') - val.dateFormat('U');

            var one_day = 86400;
            var one_hour = 3600;
            var one_min = 60;
    
            var days = Math.floor(t / one_day);
            var hours = Math.floor((t % one_day) / one_hour);
            var minutes = Math.floor(((t % one_day) % one_hour) / one_min);
            var seconds = Math.floor((((t % one_day) % one_hour) % one_min));

            return String.format('{0}d {1}h {2}m {3}s', days, hours, minutes, seconds);
        },

        formatDate: function(val) {
            if(typeof val == "object") {
                if(val.getYear() == '69') {
                    return String.format('NA');
                } else {
                    return String.format(val.dateFormat(npc.app.params.npc_date_format + ' ' + npc.app.params.npc_time_format));
                }
            }
            return val;
        },

        toggleRegion: function(region, link){
            var r = Ext.getCmp(region);
            if (r.isVisible()) {
                r.collapse();
            } else {
                r.expand();
            }
        },

        msg: function(title, format){
            if(!msgCt){
                msgCt = Ext.DomHelper.insertFirst(document.body, {id:'msg-div'}, true);
            }
            msgCt.alignTo(document, 't-t');
            var s = String.format.apply(String, Array.prototype.slice.call(arguments, 1));
            var m = Ext.DomHelper.append(msgCt, {html:createBox(title, s)}, true);
            m.slideIn('t').pause(5).ghost("t", {remove:true});
        },

        addTabExt: function(id, title, url) {
            var tabPanel = Ext.getCmp('centerTabPanel');
            var tab = (Ext.getCmp(id));
            if(!tab) {
                tabPanel.add({
                    title: title,
                    id:id,
                    layout:'fit',
                    closable: true,
                    scripts: true,
                    items: [ new Ext.ux.IFrameComponent({ 
                        url: url 
                    })]
                }).show();
                tabPanel.doLayout();
            }
            tabPanel.setActiveTab(tab);
        },
    
        addCenterNestedTab: function(id, title) {
            var tabPanel = Ext.getCmp('centerTabPanel');
            var tab = Ext.getCmp(id);
            if (tab)  {
                tabPanel.setActiveTab(tab);
            } else {
                tabPanel.add({
                    id: id, 
                    title: title,
                    closable: true,
                    autoScroll: true,
                    layout:'fit',
                    containerScroll: true,
                    items: [
                        new Ext.TabPanel({
                            id: id + '-inner-panel',
                            style:'padding:10px 0 10px 10px',
                            deferredRender:false,
                            autoHeight:true,
                            autoWidth:true,
                            plain:true,
                            defaults:{autoScroll: true}
                        })
                    ] 
                }).show();
                tabPanel.doLayout();
                tabPanel.setActiveTab(id);
            }
        },

        initPortlets: function() {
            var o = this.portlet;
            var portlets = [];
            var c = 0;
            
            var a = 0;
            for (x in o) {
                if (!Ext.state.Manager.get(x).dt) {
                    portlets[a] = [x,0];
                } else {
                    portlets[a] = [x,Ext.state.Manager.get(x).dt];
                }
                a++;
            }

            // Sort portlets by position 1 which holds an integer value
            portlets.sort(function(a, b) { return b[1] - a[1] });

            // Launch the portlets in order
            for (var i = 0; i < portlets.length; i++) {
                for (x in portlets) {
                    if (typeof portlets[x][0] == 'string') {
                        if (Ext.state.Manager.get(portlets[x][0]).index == i) {
                            o[portlets[x][0]]();
                        }
                    }
                }
            }
        },

        addPortlet: function(id, title, column) {
            if(!Ext.getCmp(id)) {
                panel = new Ext.ux.Portlet({
                    id: id,
                    title: title,
                    index: 0,
                    layout:'fit',
                    stateEvents: ["hide","show","collapse","expand"],
                    stateful:true,
                    getState: function(){

                        var dt = new Date();
                        var d = 0;
                        var column;
                        var index;

                        // Find the new column and index
                        if (this.ownerCt) {
                            column = this.ownerCt.id;
                            var a = this.ownerCt.items.keys;
                            for (var i in a) {
                                if (a[i] == id) {
                                    index = i;
                                    break;
                                }
                            }
                        }

                        // Rare case to make sure column has a value
                        if (!column) { column = Ext.state.Manager.get(id).column; }

                        // Rare case to make sure index has a value
                        if (!index) { index = Ext.state.Manager.get(id).index; }

                        // d is used to track if portlets have moved up or down. This 
                        // is needed because the first time a portlet is moved it will 
                        // have the same index value as another portlet.
                        if (index < this.index) {
                            d = dt.format('U');    
                        } else if (index > this.index) {
                            d = -1
                        }

                        // A place holder for the current index value
                        this.index = index;
                        return {collapsed:this.collapsed, hidden:this.hidden, column:column, index:index, dt:d};
                    },
                    tools: tools
                });
                Ext.getCmp(panel.column).items.add(panel);

                Ext.getCmp('centerTabPanel').doLayout();
            }
        },

        init: function() {
    
            var viewport = new Ext.Viewport({
                layout:'border',
                items:[{
                        region:'west',
                        id:'west-panel',
                        split:true,
                        title: 'Navigation',
                        collapsible:true,
                        width: 220,
                        minSize: 220,
                        maxSize: 400,
                        margins:'0 0 0 5',
                        items: [
                            new Ext.tree.TreePanel({
                                id:'nav-tree',
                                loader: new Ext.tree.TreeLoader(),
                                rootVisible:false,
                                border:false,
                                lines:true,
                                autoScroll:false,
                                root: new Ext.tree.AsyncTreeNode({
                                    text:'root',
                                    children:[{
                                        text:'Monitoring',
                                        iconCls:'tnode',
                                        expanded:true,
                                        children:[{
                                            text:'Hosts',
                                            iconCls:'tnode',
                                            expanded:true,
                                            children:[{
                                                text:'Hosts',
                                                iconCls:'tleaf',
                                                leaf:true,
                                                listeners: {
                                                    click: function() {
                                                        npc.app.hosts('Hosts', 'any');
                                                    }
                                                }
                                            },{
                                                text:'Host Problems',
                                                iconCls:'tleaf',
                                                leaf:true,
                                                listeners: {
                                                    click: function() {
                                                        npc.app.hosts('Host Problems', 'not_ok');
                                                    }
                                                }
                                            },{
                                                text:'Hostgroup Overview',
                                                iconCls:'tleaf',
                                                leaf:true,
                                                listeners: {
                                                    click: function() {
                                                        npc.app.hostgroupOverview();
                                                    }
                                                }
                                            },{
                                                text:'Hostgroup Grid',
                                                iconCls:'tleaf',
                                                leaf:true,
                                                listeners: {
                                                    click: function() {
                                                        npc.app.hostgroupGrid();
                                                    }
                                                }
                                            }]
                                        },{
                                            text:'Services',
                                            iconCls:'tnode',
                                            expanded:true,
                                            children:[{
                                                text:'Services',
                                                iconCls:'tleaf',
                                                leaf:true,
                                                listeners: {
                                                    click: function() {
                                                        npc.app.services('Services', 'any');
                                                    }
                                                }
                                            },{
                                                text:'Service Problems',
                                                iconCls:'tleaf',
                                                leaf:true,
                                                listeners: {
                                                    click: function() {
                                                        npc.app.services('Service Problems', 'not_ok');
                                                    }
                                                }
                                            },{
                                                text:'Servicegroup Overview',
                                                iconCls:'tleaf',
                                                leaf:true,
                                                listeners: {
                                                    click: function() {
                                                        npc.app.servicegroupOverview();
                                                    }
                                                }
                                            },{
                                                text:'Servicegroup Grid',
                                                iconCls:'tleaf',
                                                leaf:true,
                                                listeners: {
                                                    click: function() {
                                                        npc.app.servicegroupGrid();
                                                    }
                                                }
                                            }]
                                        },{
                                            text:'Status Map',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.addTabExt('StatusMap','Status Map',npc.app.params.npc_nagios_url+'/cgi-bin/statusmap.cgi?host=all');
                                                }
                                            }
                                        },{
                                            text:'Comments',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.comments();
                                                }
                                            }
                                        },{
                                            text:'Scheduled Downtime',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.downtime();
                                                }
                                            }
                                        },{
                                            text:'Process Information',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.processInfo();
                                                }
                                            }
                                        },{
                                            text:'Event Log',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.eventLog();
                                                }
                                            }
                                        }]
                                    },{
                                        text:'Reporting',
                                        iconCls:'tnode',
                                        expanded:false,
                                        children:[{
                                            text:'Trends',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.reporting('Trends',npc.app.params.npc_nagios_url+'/cgi-bin/trends.cgi');
                                                }
                                            }
                                        },{
                                            text:'Availability',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.reporting('Availability',npc.app.params.npc_nagios_url+'/cgi-bin/avail.cgi');
                                                }
                                            }
                                        },{
                                            text:'Alert Histogram',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.reporting('Alert Histogram',npc.app.params.npc_nagios_url+'/cgi-bin/histogram.cgi');
                                                }
                                            }
                                        },{
                                            text:'Alert History',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.reporting('Alert History',npc.app.params.npc_nagios_url+'/cgi-bin/history.cgi?host=all');
                                                }
                                            }
                                        },{
                                            text:'Alert Summary',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.reporting('Alert Summary',npc.app.params.npc_nagios_url+'/cgi-bin/summary.cgi');
                                                }
                                            }
                                        },{
                                            text:'Notifications',
                                            iconCls:'tleaf',
                                            leaf:true,
                                            listeners: {
                                                click: function() {
                                                    npc.app.reporting('Notifications',npc.app.params.npc_nagios_url+'/cgi-bin/notifications.cgi?contact=all');
                                                }
                                            }
                                        }]
                                    },{
                                        text:'Nagios',
                                        iconCls:'tleaf',
                                        leaf:true,
                                        listeners: {
                                            click: function() {
                                                npc.app.addTabExt('Nagios','Nagios',npc.app.params.npc_nagios_url);
                                            }
                                        }
                                    },{
                                        text:'N2C',
                                        iconCls:'tleaf',
                                        leaf:true,
                                        listeners: {
                                            click: function() {
                                                npc.app.n2c();
                                            }
                                        }
                                    }]
                                })
                            })
                        ]
                    },
                    new Ext.TabPanel({
                        region:'center',
                        id: 'centerTabPanel',
                        enableTabScroll:true,
                        autowidth:true,
                        deferredRender: false,
                        activeTab: 0,
                        items:[{
                            id:'dashboard',
                            title:'Dashboard',
                            iconCls:'layout',
                            autoScroll: true,
                            xtype:'portal',
                            margins:'35 5 5 0',
                            tbar: [],
                            items:[{
                                id:'dashcol1',
                                columnWidth:.50,
                                style:'padding:10px 0 10px 10px'
                            },{
                                id:'dashcol2',
                                columnWidth:.50,
                                style:'padding:10px 0 10px 10px'
                            }]
                        }]

                    })
                ]
            }); // End viewport

            // Add the portlets button to the dashboard toolbar:
            Ext.getCmp('dashboard').getTopToolbar().add('->', {
                text: 'Portlets',
                handler: function() {

                    var eL = Ext.getCmp('eventLog');
                    var eLC = eL.isVisible();

                    var hS = Ext.getCmp('hostSummary')
                    var hSC = hS.isVisible();

                    var sS = Ext.getCmp('serviceSummary');
                    var sSC = sS.isVisible();

                    var sP = Ext.getCmp('serviceProblems');
                    var sPC = sP.isVisible();

                    var mP = Ext.getCmp('monitoringPerf');
                    var mPC = mP.isVisible();

                    var sgSS = Ext.getCmp('servicegroupServiceStatus');
                    var sgSSC = sgSS.isVisible();

                    var sgHS = Ext.getCmp('servicegroupHostStatus');
                    var sgHSC = sgHS.isVisible();

                    var hgSS = Ext.getCmp('hostgroupServiceStatus');
                    var hgSSC = hgSS.isVisible();

                    var hgHS = Ext.getCmp('hostgroupHostStatus');
                    var hgHSC = hgHS.isVisible();

                    var form = new Ext.form.FormPanel({
                        //title: 'Show/hide portlets',
                        bodyStyle:'padding:5px 5px 0',
                        layout: 'form',
                        frame:true,
                        xtype:'fieldset',
                        items: [{
                            boxLabel: 'Event Log',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: eLC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        eL.show();
                                    } else {
                                        eL.hide();
                                    }
                                }
                            }
                        },{
                            boxLabel: 'Host Status Summary',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: hSC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        hS.show();
                                    } else {
                                        hS.hide();
                                    }
                                }
                            }
                        },{
                            boxLabel: 'Service Status Summary',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: sSC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        sS.show();
                                    } else {
                                        sS.hide();
                                    }
                                }
                            }
                        },{
                            boxLabel: 'Service Problems',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: sPC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        sP.show();
                                    } else {
                                        sP.hide();
                                    }
                                }
                            }
                        },{
                            boxLabel: 'Monitoring Performance',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: mPC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        mP.show();
                                    } else {
                                        mP.hide();
                                    }
                                }
                            }
                        },{
                            boxLabel: 'Hostgroup: Service Status',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: sgSSC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        hgSS.show();
                                    } else {
                                        hgSS.hide();
                                    }
                                }
                            }
                        },{
                            boxLabel: 'Hostgroup: Host Status',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: sgHSC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        hgHS.show();
                                    } else {
                                        hgHS.hide();
                                    }
                                }
                            }
                        },{
                            boxLabel: 'Servicegroup: Service Status',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: sgSSC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        sgSS.show();
                                    } else {
                                        sgSS.hide();
                                    }
                                }
                            }
                        },{
                            boxLabel: 'Servicegroup: Host Status',
                            hideLabel: true,
                            xtype:'checkbox',
                            checked: sgHSC,
                            listeners: {
                                check: function(cb, checked) {
                                    if (checked) {
                                        sgHS.show();
                                    } else {
                                        sgHS.hide();
                                    }
                                }
                            }
                        }]
                    });

                    var window = new Ext.Window({
                        title:'Portlets',
                        modal:true,
                        closable: true,
                        width:300,
                        height:300,
                        layout:'fit',
                        plain:true,
                        bodyStyle:'padding:5px;',
                        items:form
                    });
                    window.show();
                }
            });

        } // End init
    };
}();
