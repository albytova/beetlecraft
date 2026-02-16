Ext.define('beetlecraft.view.main.Purshace.WinPurchases', {
    extend: 'Ext.window.Window',
    xtype: 'winpurchases',

    controller: "winpurchases",

    maximizable: true,

    bodyPadding: 10,
    width: 900,
    height: 700,
    fullscreen: true,

    items: [
        {
            xtype: 'grid',
            reference: 'grid_purchase',
            flex : 1,
            height: '100%',
            plugins: {
                cellediting: true,
                gridcellediting: {
                    triggerEvent: 'click', // edit on one click/tap
                    selectOnEdit: true
                }
            },
            store: {
                fields: [
                    "ID", "beer_name", "bottle_cost", "brewery_name", "cost", "cost_liter", "id_beer", "id_brewery", "id_parent", "id_tare", "parent_record_id", "tare_cost", "tare_name", "type_tare"
                ]
            }
        }
    ],

    buttons: {
        close: "closeWin"//,
        //save: "saveBeer"
    },
    listeners: {
        show: "onShow"
    }
});
