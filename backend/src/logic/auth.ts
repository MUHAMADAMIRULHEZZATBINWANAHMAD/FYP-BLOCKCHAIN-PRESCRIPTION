import { supabase } from '../utils/supabase-client.js';
import crypto from 'crypto';

// Types for your registration logic
export interface WaitingListPayload {
  name: string;
  email: string;
  company_name: string;
  company_type: 'clinic' | 'pharmacy';
  certification: string; // The URL/path to the PDF in Supabase storage
}

//function helper - generate a 6-character alphanumeric secret code 6 alphanumeric
//this only generated if approved

function generateSecretCode(): string {

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomBytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    result += chars[randomBytes[i]! % chars.length];
  }
  return result;
}


//User submits the form to enter the waiting list
 
export async function submitToWaitingList(payload: WaitingListPayload) {
  const { data, error } = await supabase
    .from('auth_scanning')
    .insert([
      {
        name: payload.name,
        email: payload.email,
        company_name: payload.company_name,
        company_type: payload.company_type,
        certification: payload.certification,
        status: 'pending',
        secret_code: null
      }
    ])
    .select();

  if (error) {
    throw new Error(`Failed to submit to waiting list: ${error.message}`);
  }

  return { success: true, message: 'Successfully added to waiting list. Waiting for admin approval.', data };
}

//Admin approves or rejects the registration

export async function processAdminDecision(email: string, decision: 'approve' | 'reject') {
  let status = '';
  let secretCode = null;

  if (decision === 'approve') {
    status = 'approved';
    secretCode = generateSecretCode();
  } else if (decision === 'reject') {
    status = 'rejected';
    secretCode = null;
  } else {
    throw new Error("Invalid decision. Must be 'approve' or 'reject'.");
  }

  // Update the database
  const { data, error } = await supabase
    .from('auth_scanning')
    .update({ 
      status: status, 
      secret_code: secretCode 
    })
    .eq('email', email)
    .select();

  if (error) {
    throw new Error(`Failed to process admin decision: ${error.message}`);
  }

  if (data === null || data === undefined || data.length === 0) {
    throw new Error('User not found in waiting list.');
}

  return { 
    success: true, 
    message: `User registration ${decision}d successfully.`, 
    secret_code: secretCode,
    data 
  };
}