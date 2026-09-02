/**
 * Smart School System Portal - Notification Template Dispatch Engine
 * Generates context-aware, localized alerts for SMS and email clients.
 */

// 1. FINANCE & PAYMENT RECEIPT TEMPLATE GENERATOR
export function generatePaymentReceipt({ studentName, studentId, feeType, amountPaid, paymentStatus }) {
  const dateString = new Date().toLocaleDateString('en-US', { dateStyle: 'medium' });
  
  return {
    // Clean, high-impact block for telecom SMS gateways
    smsText: `[SHEEK BAKRI SECONDARY] Payment Alert: ETB ${amountPaid} received for ${studentName} (${studentId}) on ${feeType}. Status: ${paymentStatus}. Date: ${dateString}. Thank you.`,
    
    // Fully styled HTML template layer matching your dark brand Navy palette
    htmlEmail: `
      <div style="background-color: #0a0f1d; padding: 30px; font-family: monospace; color: #cbd5e1; max-width: 500px; margin: auto; border: 1px solid #1e293b; border-radius: 8px;">
        <h2 style="color: #ffffff; border-bottom: 2px solid #1d4ed8; padding-bottom: 8px; margin-top: 0; text-transform: uppercase; font-size: 18px;">Payment Transaction Receipt</h2>
        <p style="font-size: 12px; color: #e2b714; font-weight: bold; margin-bottom: 20px;">SHEEK BAKRI SECONDARY SCHOOL - CLOUD LEDGER NODES</p>
        
        <table style="width: 100%; font-size: 13px; line-height: 2;">
          <tr><td style="color: #94a3b8;">Student Name:</td><td style="text-align: right; color: #ffffff; font-weight: bold;">${studentName}</td></tr>
          <tr><td style="color: #94a3b8;">Identifier ID:</td><td style="text-align: right; color: #3b82f6; font-weight: bold;">${studentId}</td></tr>
          <tr><td style="color: #94a3b8;">Fee Category:</td><td style="text-align: right;">${feeType}</td></tr>
          <tr><td style="color: #94a3b8;">Amount Settled:</td><td style="text-align: right; color: #10b981; font-weight: bold;">ETB ${amountPaid}</td></tr>
          <tr><td style="color: #94a3b8;">Ledger Status:</td><td style="text-align: right;"><span style="background-color: #064e3b; color: #34d399; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 11px;">${paymentStatus}</span></td></tr>
          <tr><td style="color: #94a3b8;">System Date:</td><td style="text-align: right;">${dateString}</td></tr>
        </table>
        
        <div style="border-top: 1px dashed #334155; margin-top: 25px; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
          This is an automated systemic verification receipt. For balance reconciliations, please check the Central Terminal matrix.
        </div>
      </div>
    `
  };
}

// 2. ACADEMIC PERFORMANCE & GRADE UPDATE ALERT GENERATOR
export function generateGradeAlert({ studentName, studentId, subject, fieldName, newScore }) {
  const displayFieldName = fieldName === 'finalExam' ? 'Final Examination' : fieldName.toUpperCase();
  
  return {
    smsText: `[SHEEK BAKRI SECONDARY] Grade Alert: ${studentName} (${studentId}) metrics updated in ${subject}. ${displayFieldName} set to ${newScore}. Check student portal for details.`,
    
    htmlEmail: `
      <div style="background-color: #0a0f1d; padding: 30px; font-family: monospace; color: #cbd5e1; max-width: 500px; margin: auto; border: 1px solid #1e293b; border-radius: 8px;">
        <h2 style="color: #ffffff; border-bottom: 2px solid #1d4ed8; padding-bottom: 8px; margin-top: 0; text-transform: uppercase; font-size: 18px;">Academic Record Alert</h2>
        <p style="font-size: 12px; color: #e2b714; font-weight: bold; margin-bottom: 20px;">SHEEK BAKRI SECONDARY SCHOOL - CA MATRIX NODES</p>
        
        <p style="font-size: 13px; line-height: 1.6;">
          An academic performance metrics modification has been logged into the relational grade tables.
        </p>
        
        <table style="width: 100%; font-size: 13px; line-height: 2; margin-top: 15px; background-color: #111827; padding: 10px; border-radius: 6px;">
          <tr><td style="color: #94a3b8;">Student Roster:</td><td style="text-align: right; color: #ffffff;">${studentName} (${studentId})</td></tr>
          <tr><td style="color: #94a3b8;">Subject Branch:</td><td style="text-align: right; color: #3b82f6; font-weight: bold;">${subject}</td></tr>
          <tr><td style="color: #94a3b8;">Assessment Field:</td><td style="text-align: right;">${displayFieldName}</td></tr>
          <tr><td style="color: #94a3b8;">Recorded Score:</td><td style="text-align: right; color: #e2b714; font-weight: bold;">${newScore} points</td></tr>
        </table>
        
        <div style="border-top: 1px dashed #334155; margin-top: 25px; padding-top: 15px; font-size: 11px; color: #64748b; text-align: center;">
          Academic modifications must comply with authorized grading parameters. Secure encryption layer active.
        </div>
      </div>
    `
  };
}
