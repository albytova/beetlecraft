Ext.define('lk.view.main.admin.Present', {
    extend: 'Ext.panel.Panel',
    xtype: 'present',
    reference: 'present',
    controller: 'present',
    name: 'present',

    title: 'Призы',

    flex: 1,
    autoScroll: true,

    items: [
        {
            xtype: 'panel',
            bodyPadding: 2,
            items: [
                {
                    xtype: 'button',
                    text: 'Использовать',
                    handler: 'onUse',
                    margin: 2
                },
                {
                    xtype: 'button',
                    text: 'Обновить',
                    handler: 'onReload',
                    margin: 2
                }
            ]
        },
        {
            xtype: 'grid',
            name: 'gridPresent',
            store: {
                fields: ["id", "name_present", "code"]
            },
            columns: [
                {
                    dataIndex: 'name_present',
                    width: 500
                },
                {
                    dataIndex: 'code',
                    width: 100
                }
            ]
        }
    ],

    initComponent: function() {
        this.callParent(arguments);
        this.getController().load();
    }
});