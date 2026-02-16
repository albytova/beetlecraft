Ext.define('lk.model.Users', {
    extend: 'lk.model.Base',

    fields: [
        'num', 'name', 'surname', 'phone',
        {
            name: 'birthday',
            type: 'date'
        },
        {
            name: 'is_reg',
            type: 'boolean'
        }, 'untuppd', 'in1c', 'rights'
    ]
});
