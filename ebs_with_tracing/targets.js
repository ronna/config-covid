const extras = require('./nools-extras');
const {
  isAlive,
  getField
} = extras;

const isPositive = (contact) => { return getField(contact.contact, 'role') === 'covid_patient'; };

const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

const isHbcFollowupForm = (report) => { return report.form === 'hbc_followup'; };

module.exports = [

    {
        id: 'deaths-this-month',
        type: 'count',
        icon: 'icon-death-general',
        goal: 0,
        translation_key: 'targets.death_reporting.deaths.title',
        subtitle_translation_key: 'targets.this_month.subtitle',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: function (contact) {
          return !isAlive(contact);
    },
    date: (contact) => contact.contact.date_of_death
  },

    {
        id: 'patients-registered-this-month',
        type: 'count',
        icon: 'icon-person',
        goal: 0,
        translation_key: 'targets.patients.count',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "chw"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: isPositive,
        date: 'reported'
    },

    {
        id: 'patients-registered-today',
        type: 'count',
        icon: 'icon-person',
        goal: 0,
        translation_key: 'targets.patients.count',
        subtitle_translation_key: 'targets.today.subtitle',
        context:'user.role === "chw"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: function (contact) { return isPositive(contact) && isToday(new Date(contact.contact.reported_date)); },
        date: 'reported'
    },

    {
        id: 'patients-isolated-this-month',
        type: 'count',
        icon: 'icon-risk',
        goal: 0,
        translation_key: 'targets.isolation.count',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "chw_supervisor"',
        appliesTo: 'reports',
        appliesToType: ['form_a0'],
        idType: 'contact',
        appliesIf: function (contact, report) {
            return getField(report, 'fields.case_isolation') === 'true';
        },
        date: 'reported'
    },


    {
        id: 'travellers-with-quarantine-today',
        type: 'count',
        icon: 'icon-calendar',
        goal: 0,
        translation_key: 'targets.quarantine.count',
        subtitle_translation_key: 'targets.today.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'reports',
        appliesToType: ['quarantine'],
        idType: 'contact',
        appliesIf: function (contact, report) {
            return isToday(new Date(report.reported_date));
        },
        date: 'reported'
    },


    {
        id: 'patients-with-home-based-care-this-month',
        type: 'count',
        icon: 'icon-hospital',
        goal: 0,
        translation_key: 'targets.home.based.care.count',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: function (contact) {
            return isPositive(contact) && contact.reports.some((report) => { return isHbcFollowupForm(report); });
        },
        date: 'reported'
    }

];
