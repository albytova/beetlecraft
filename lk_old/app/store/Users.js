Ext.define('lk.store.Users', {
    extend: 'Ext.data.Store',

    alias: 'store.users',

    model: 'lk.model.Users',


    proxy: {
        type: 'direct',
        api: {
            read: 'QueryDatabase.getUserCard'
        }
    },

    autoLoad: true
});
