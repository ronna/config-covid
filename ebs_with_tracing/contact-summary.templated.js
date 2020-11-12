const thisContact = contact;
const thisLineage = lineage;
const allReports = reports;


const getField = (report, fieldPath) => [...(fieldPath || '').split('.')]
    .reduce((prev, fieldName) => {
      if (prev === undefined) { return undefined; }
      return prev[fieldName];
    }, report);

const isPositive = () => { return getField(thisContact, 'role') === 'covid_patient'; };

const isReportValid = function (report) {
  if (report.form && report.fields && report.reported_date) { return true; }
  return false;
};

const hasReport = function (form) {
  return allReports && allReports.some((report) => report.form === form);
};

const context = {
  //isPassenger: isTraveler(),
  hasFormA0Form: hasReport('form_a0'),
  hasDeclarationForm: hasReport('declaration'),
  hasLocatorForm: hasReport('locator'),
  hasQuarantineForm: hasReport('quarantine'),
  hasHbcFollowupForm: hasReport('hbc_followup'),
};

const fields = [
  { appliesToType: 'person', label: 'patient_id', value: thisContact.patient_id, width: 4 },
  { appliesToType: 'person', label: 'contact.age', value: thisContact.date_of_birth, width: 4, filter: 'age' },
  { appliesToType: 'person', label: 'contact.sex', value: 'contact.sex.' + thisContact.sex, translate: true, width: 4 },
  { appliesToType: 'person', label: 'person.field.phone', value: thisContact.phone, width: 4 },
  { appliesToType: 'person', label: 'person.field.alternate_phone', value: thisContact.phone_alternate, width: 4 },
  { appliesToType: 'person', appliesIf: isPositive, label: 'days.since.symptoms.onset', value: thisContact.days_since_symptoms_onset, width: 4 },
  //{ appliesToType: 'person', appliesIf: isTraveler, label: 'contact.passport', value: getField(thisContact, 'traveler.passport'), width: 4 },
  { appliesToType: 'person', label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: '!person', label: 'contact', value: thisContact.contact && thisContact.contact.name, width: 4 },
  { appliesToType: '!person', label: 'contact.phone', value: thisContact.contact && thisContact.contact.phone, width: 4 },
  { appliesToType: '!person', label: 'External ID', value: thisContact.external_id, width: 4 },
  { appliesToType: '!person', appliesIf: function () { return thisContact.parent && thisLineage[0]; }, label: 'contact.parent', value: thisLineage, filter: 'lineage' },
  { appliesToType: 'person', label: 'contact.notes', value: thisContact.notes, width: 12 },
  { appliesToType: '!person', label: 'contact.notes', value: thisContact.notes, width: 12 }
];

const cards = [
  {
    label: 'contact.profile.symptoms',
    appliesToType: 'person',
    appliesIf: function () {
      return isPositive() && !!getNewestReport(allReports, 'form_a0');
    },
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'form_a0');
            if (report) {
        fields.push(
            { label: 'contact.profile.symptoms.fever', value: 'contact.profile.symptoms.fever.' + getField(report, 'fields.patient_symptoms.fever'), translate: true, width: 6 },
		    { label: 'contact.profile.symptoms.temperature', value: 'contact.profile.symptoms.temperature.' + getField(report, 'fields.patient_symptoms.temperature'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.cough', value: 'contact.profile.symptoms.cough.' + getField(report, 'fields.patient_symptoms.cough'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.difficulty_breathing', value: 'contact.profile.symptoms.difficulty_breathing.' + getField(report, 'fields.patient_symptoms.difficulty_breathing'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.chest_pain', value: 'contact.profile.symptoms.chest_pain.' + getField(report, 'fields.patient_symptoms.difficulty_breathing'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.confusion', value: 'contact.profile.symptoms.confusion.' + getField(report, 'fields.patient_symptoms.confusion'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.body_aches', value: 'contact.profile.symptoms.body_aches.' + getField(report, 'fields.patient_symptoms.body_aches'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.sore_throat', value: 'contact.profile.symptoms.sore_throat.' + getField(report, 'fields.patient_symptoms.sore_throat'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.loss_tate', value: 'contact.profile.symptoms.loss_tate.' + getField(report, 'fields.patient_symptoms.loss_tate'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.diarrhea', value: 'contact.profile.symptoms.diarrhea.' + getField(report, 'fields.patient_symptoms.diarrhea'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.headache', value: 'contact.profile.symptoms.headache.' + getField(report, 'fields.patient_symptoms.headache'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.nausea', value: 'contact.profile.symptoms.nausea.' + getField(report, 'fields.patient_symptoms.nausea'), translate: true, width: 6 },
			{ label: 'contact.profile.symptoms.conjunctivitis', value: 'contact.profile.symptoms.conjunctivitis.' + getField(report, 'fields.patient_symptoms.conjunctivitis'), translate: true, width: 6 }
        );
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.comorbidities',
    appliesToType: 'person',
    appliesIf: isPositive,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'form_a0');
      if (report) {
        fields.push(
            { label: 'contact.profile.comorbidities.hiv', value: 'contact.profile.comorbidities.hiv.' + getField(report, 'fields.existing_conditions.hiv'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.diabetes', value: 'contact.profile.comorbidities.diabetes.' + getField(report, 'fields.existing_conditions.diabetes'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.tb', value: 'contact.profile.comorbidities.tb.' + getField(report, 'fields.existing_conditions.tb'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.ckd', value: 'contact.profile.comorbidities.ckd.' + getField(report, 'fields.existing_conditions.ckd'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.clc', value: 'contact.profile.comorbidities.clc.' + getField(report, 'fields.existing_conditions.clc'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.liver_disease', value: 'contact.profile.comorbidities.liver_disease' + getField(report, 'fields.existing_conditions.liver_disease'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.pregnant', value: 'contact.profile.comorbidities.pregnant' + getField(report, 'fields.existing_conditions.pregnant'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.obesity', value: 'contact.profile.comorbidities.obesity' + getField(report, 'fields.existing_conditions.obesity'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.bp', value: 'contact.profile.comorbidities.bp' + getField(report, 'fields.existing_conditions.bp'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.tumor', value: 'contact.profile.comorbidities.tumor' + getField(report, 'fields.existing_conditions.tumor'), translate: true, width: 4 },
			{ label: 'contact.profile.comorbidities.metabolic', value: 'contact.profile.comorbidities.metabolic' + getField(report, 'fields.existing_conditions.metabolic'), translate: true, width: 4 }
        );
      }
      else {
        fields.push({ label: 'contact.profile.comorbidities.none' });
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.declaration.form',
    appliesToType: 'person',
    appliesIf: isPositive,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'declaration');
      if (report) {
        const contactRiskFactors = getRiskFactors(getField(report, 'fields.contact_info'));
        const healthRiskFactors = getRiskFactors(getField(report, 'fields.health'));

        if (contactRiskFactors && contactRiskFactors.length > 0) {
          fields.push({ label: 'risk.contact.found', width: 12, icon: 'icon-risk' });
          contactRiskFactors.forEach(function (risk) {
            fields.push({ value: 'risk.contact.' + risk, translate: true, width: 12 });
          });
        }

        else {
          fields.push({ label: 'risk.contact.none' });
        }

        if (healthRiskFactors && healthRiskFactors.length > 0) {
          fields.push({ label: 'risk.health.found', width: 12, icon: 'icon-risk' });
          healthRiskFactors.forEach(function (risk) {
            fields.push({ value: 'risk.health.' + risk, translate: true, width: 12 });
          });
        }

        else {
          fields.push({ label: 'risk.health.none' });
        }

      }
      else {
        fields.push({ label: 'contact.profile.declaration.form.none' });
      }

      return fields;
    }
  },

  {
    label: 'contact.profile.isolation',
    appliesToType: 'person',
    appliesIf: isPositive,
    fields: function () {
      const fields = [];
      const report = getNewestReport(allReports, 'form_a0');
      if (report) {
        fields.push(
            { label: 'contact.profile.isolation.date', value: getField(report, 'fields.isolation.isolation_date'), filter: 'simpleDate', width: 4 },
            { label: 'contact.profile.isolation.area', value: getField(report, 'fields.isolation.isolation_area'), width: 4 },

        );
      }
      else {
        fields.push({ label: 'contact.profile.isolation.none' });
      }

      return fields;
    }
  }

];

function getRiskFactors(group) {
  if (!group) return false;
  const riskFactors = [];
  Object.keys(group).forEach(function (key) {
    if (group[key] === 'true' && key.indexOf('_risk') < 0) {
      riskFactors.push(key);
    }
  });
  return riskFactors;
}

function getNewestReport(allReports, forms) {
  let result;
  allReports && allReports.forEach(function (report) {
    if (!isReportValid(report) || !forms.includes(report.form)) { return; }
    if (!result || report.reported_date > result.reported_date) {
      result = report;
    }
  });
  return result;
}


module.exports = {
  context: context,
  cards: cards,
  fields: fields
};
