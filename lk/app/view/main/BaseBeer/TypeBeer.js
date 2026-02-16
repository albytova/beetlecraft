Ext.define('beetlecraft.view.main.BaseBeer.TypeBeer', {
    extend: 'Ext.grid.Grid',
    xtype: 'typebeer',

    requires: [
        'Ext.grid.Grid'
    ],

    controller: "typebeer",

    flex: 1,

    store: {
        autoLoad: true,
        storeId: 'storeTypeBeer',
        proxy: {
            type: 'ajax',
            method: 'GET',
            url: './php/TypeBeer.php',
            extraParams: {
                'query': 'getTypeBeer'
            }
        }
    },

    columns: [{
        dataIndex: 'name',
        hideHeaders: true,
        flex: 1
    }],

    hideHeaders: true

});
