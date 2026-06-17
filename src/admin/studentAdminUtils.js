export const TICKET_PRICE_LKR = 50;

export const DEFAULT_DEPARTMENTS = ['Project management', 'Accountacy', 'English', 'IT', 'Other'];

export function normalizeParticipant(documentSnapshot) {
  const data = documentSnapshot.data() || {};

  return {
    uid: String(data.uid || documentSnapshot.id || '').padStart(4, '0'),
    name: data.name || '',
    telephone: data.telephone || '',
    department: data.department || 'Other',
    registeredAt: data.registeredAt || null
  };
}

export function formatLkr(value) {
  return `${new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 }).format(value)} LKR`;
}

export function sortParticipants(participants, sortMode) {
  const sortedParticipants = [...participants];

  const compareText = (left, right) => left.localeCompare(right, undefined, { sensitivity: 'base' });

  sortedParticipants.sort((left, right) => {
    const departmentCompare = compareText(left.department, right.department);
    const nameCompare = compareText(left.name || left.uid, right.name || right.uid);
    const uidCompare = compareText(left.uid, right.uid);

    switch (sortMode) {
      case 'department-desc':
        return departmentCompare * -1 || nameCompare * -1 || uidCompare * -1;
      case 'name-asc':
        return nameCompare || departmentCompare || uidCompare;
      case 'uid-asc':
        return uidCompare || departmentCompare || nameCompare;
      default:
        return departmentCompare || nameCompare || uidCompare;
    }
  });

  return sortedParticipants;
}

export function buildDepartmentSummary(participants) {
  return participants.reduce((summary, participant) => {
    const departmentName = participant.department || 'Other';
    const current = summary.get(departmentName) || { department: departmentName, count: 0, income: 0 };

    current.count += 1;
    current.income += TICKET_PRICE_LKR;
    summary.set(departmentName, current);

    return summary;
  }, new Map());
}
