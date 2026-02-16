Ext.define('lk.store.Beer', {
    extend: 'Ext.data.Store',

    alias: 'store.beer',

    model: 'lk.model.Beer',


    proxy: {
        type: 'direct',
        api: {
            read: 'QueryDatabase.getBeer'
        }
    },

    autoLoad: true
});
