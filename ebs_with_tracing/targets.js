const extras = require('./nools-extras');
const {
  isAlive,
  getSubsequentFollowUps,
  isActiveCovid,
  getField
} = extras;

const isPositive = (contact) => { return getField(contact.contact, 'role') === 'covid_patient'; };

const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
        someDate.getMonth() === today.getMonth() &&
        someDate.getFullYear() === today.getFullYear();
};

const isRegistrationForm = (report) => { return report.form === 'form_a0'; };
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
        id: 'travellers-with-declaration-this-month',
        type: 'percent',
        icon: 'icon-form-general',
        goal: 100,
        translation_key: 'targets.declaration.percent',
        subtitle_translation_key: 'targets.this_month.subtitle',
        percentage_count_translation_key: 'targets.traveller.percent',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: isTraveler,
        passesIf: function (contact) {
            return contact.reports.some((report) => { return isDeclarationForm(report); });
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
        id: 'travellers-with-quarantine-this-month',
        type: 'percent',
        icon: 'icon-calendar',
        goal: 100,
        translation_key: 'targets.quarantine.percent',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: isTraveler,
        passesIf: function (contact) {
            return contact.reports.some((report) => { return isQuarantineForm(report); });
        },
        date: 'reported'
    },

    {
        id: 'travellers-with-locator-this-month',
        type: 'percent',
        icon: 'icon-service-rating',
        goal: 100,
        translation_key: 'targets.locator.percent',
        subtitle_translation_key: 'targets.this_month.subtitle',
        context:'user.role === "inputter"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: isTraveler,
        passesIf: function (contact) {
            return contact.reports.some((report) => { return isLocatorForm(report); });
        },
        date: 'reported'
    },

    {
        id: 'travellers-with-referral-today',
        type: 'count',
        icon: 'icon-hospital',
        goal: 0,
        translation_key: 'targets.referral.count',
        subtitle_translation_key: 'targets.today.subtitle',
        context:'user.role === "chw_supervisor"',
        appliesTo: 'contacts',
        appliesToType: ['person'],
        appliesIf: function (contact) {
            return isPositive(contact) &&
                contact.reports.some((report) => { return isToday(new Date(report.reported_date)) && isReferralForm(report); });
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
            return isTraveler(contact) && contact.reports.some((report) => { return isHbcFollowupForm(report); });
        },
        date: 'reported'
    }

];
