import { Interface } from 'node:readline';
import { question } from '@c2pa-mcnl/shared/utils';

export async function collectCredentialData(
  rl?: Interface,
  options: Record<string, string> = {},
) {
  let name = options['name'];
  let role = options['role'];
  let department = options['department'];
  let employeeId = options['employeeId'];
  let company = options['company'];
  let startDate = options['startDate'];
  let subjectDID = options['subjectDid'];

  // Interactive prompts for missing values
  if (rl) {
    if (!name) name = await question(rl, 'Employee name: ');
    if (!role) role = await question(rl, 'Role/Job title: ');
    if (!department) department = await question(rl, 'Department: ');
    if (!employeeId) employeeId = await question(rl, 'Employee ID: ');
    if (!company) company = await question(rl, 'Company name: ');
    if (!startDate) {
      startDate =
        (await question(
          rl,
          'Start date (YYYY-MM-DD) [press Enter for today]: ',
        )) || new Date().toISOString().split('T')[0];
    }
    if (!subjectDID) {
      subjectDID = await question(
        rl,
        'Employee DID (optional, press Enter to auto-generate): ',
      );
    }
  }

  return {
    name: name || 'John Doe',
    role: role || 'Software Engineer',
    department: department || 'Engineering',
    employeeId: employeeId || 'EMP001',
    company: company || 'Your Company Inc',
    startDate: startDate || new Date().toISOString().split('T')[0],
    subjectDID: subjectDID || null,
  };
}
