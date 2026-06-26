
async function runVerification() {
  console.log('=== STARTING END-TO-END VERIFICATION: SPRINT 2 ===');
  
  const baseUrl = 'http://localhost:3001/api';

  // Helper to log in a user and get token
  async function login(email: string, password = 'password123'): Promise<string> {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      throw new Error(`Failed to login as ${email}: ${res.statusText}`);
    }
    const data = await res.json() as any;
    return data.access_token;
  }

  // 1. Verify Vendor Recommendation API
  console.log('Testing Vendor Recommendation API...');
  const recRes = await fetch(`${baseUrl}/bidding/recommend-vendors?category=อุปกรณ์ไอที`, {
    headers: {
      'Authorization': 'Bearer mock-admin-token-123456',
    }
  });
  if (!recRes.ok) {
    throw new Error(`Failed to fetch recommended vendors: ${recRes.statusText}`);
  }
  const recommended = await recRes.json() as any[];
  console.log(`Received ${recommended.length} recommended vendors.`);
  
  // Verify that all returned vendors are Active
  for (const vendor of recommended) {
    if (vendor.status !== 'Active') {
      throw new Error(`Found non-active recommended vendor: ${vendor.vendor_name} (status: ${vendor.status})`);
    }
    const categoryLower = vendor.business_category.toLowerCase();
    const blacklistWords = ['blacklisted', 'blocked', 'suspended'];
    if (blacklistWords.some(w => categoryLower.includes(w) || vendor.status.toLowerCase().includes(w))) {
      throw new Error(`Found blacklisted or blocked vendor in recommendations: ${vendor.vendor_name}`);
    }
  }
  console.log('✔ Vendor Recommendation criteria checked successfully.');

  // 2. Fetch Committee Candidates to find a Shortlist Approver
  console.log('Fetching Committee Candidates...');
  const candidatesRes = await fetch(`${baseUrl}/bidding/committee-candidates`, {
    headers: {
      'Authorization': 'Bearer mock-admin-token-123456',
    }
  });
  if (!candidatesRes.ok) {
    throw new Error(`Failed to fetch committee candidates: ${candidatesRes.statusText}`);
  }
  const candidates = await candidatesRes.json() as any[];
  const approver = candidates.find(c => c.role === 'Approver' || c.role === 'Admin');
  if (!approver) {
    throw new Error('No Approver/Admin candidate found to act as Shortlist Approver!');
  }
  console.log(`Using ${approver.username} (ID: ${approver.user_id}) as Shortlist Approver.`);

  // 3. Create RFP bidding event with Shortlist Approver
  console.log('Creating RFP Bidding Event requiring Shortlist Approval...');
  const createRes = await fetch(`${baseUrl}/bidding/rfq`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-admin-token-123456',
    },
    body: JSON.stringify({
      title: 'โครงการจ้างออกแบบระบบโครงข่าย IT เชิงกลยุทธ์ (RFP)',
      description: 'โครงการแบบ RFP ต้องขอคำอธิบายทางเทคนิคและสเปก โดยต้องการการอนุมัติ Shortlist ก่อนเปิดให้คู่ค้า',
      close_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days out
      bid_type: 'RFP',
      shortlist_approver_id: approver.user_id,
      vendor_ids: [
        '00000008-0000-0000-0000-000000000001',
        '00000008-0000-0000-0000-000000000002',
        '00000008-0000-0000-0000-000000000003',
      ],
      items: [
        {
          item_name: 'ระบบสลับสัญญาณเครือข่าย Core Switch 10G',
          quantity: 2,
          uom: 'ชุด',
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create RFQ: ${createRes.status} ${errorText}`);
  }
  const rfq = await createRes.json() as any;
  console.log(`Created RFQ successfully. RFQ ID: ${rfq.rfq_id}, RFQ No: ${rfq.rfq_no}`);
  console.log(`RFQ Shortlist Approved: ${rfq.shortlist_approved}, Status: ${rfq.status}`);
  
  if (rfq.shortlist_approved !== false || rfq.status !== 'PendingCommitteeApproval') {
    throw new Error('RFQ should be locked with shortlist_approved = false and status = PendingCommitteeApproval!');
  }
  console.log('✔ RFQ lock & pending status verified.');

  // 4. Log in as Shortlist Approver and Approve
  console.log(`Logging in as Shortlist Approver: ${approver.email}...`);
  const approverToken = await login(approver.email);
  
  console.log('Approving Shortlist...');
  const approveRes = await fetch(`${baseUrl}/bidding/rfq/${rfq.rfq_id}/shortlist/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${approverToken}`,
    },
    body: JSON.stringify({ approved: true }),
  });
  if (!approveRes.ok) {
    const errorText = await approveRes.text();
    throw new Error(`Failed to approve shortlist: ${approveRes.status} ${errorText}`);
  }
  const approvedRfq = await approveRes.json() as any;
  console.log(`Shortlist Approved: ${approvedRfq.shortlist_approved}, Status: ${approvedRfq.status}`);
  
  if (approvedRfq.shortlist_approved !== true || approvedRfq.status !== 'OpenForQuotation') {
    throw new Error('Shortlist was not approved successfully!');
  }
  console.log('✔ Shortlist approval flow verified.');

  // 5. Submit RFP Proposal as Vendor with qualitative comments
  console.log('Submitting RFP proposal from vendor...');
  const rfqItemId = rfq.items[0].rfq_item_id || approvedRfq.items?.[0]?.rfq_item_id;
  if (!rfqItemId) {
    throw new Error('Could not find item ID to submit proposal!');
  }
  
  const submitRes = await fetch(`${baseUrl}/bidding/quote`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-vendor-jwt-token-123456',
    },
    body: JSON.stringify({
      rfq_id: rfq.rfq_id,
      lines: [
        {
          rfq_item_id: rfqItemId,
          unit_price: 185000,
          delivery_days: 15,
          quotation_url: 'http://localhost:3000/uploads/proposals/core-switch-specs.pdf',
          vendor_remarks: 'รุ่น IT-10G-Core รองรับสแต็คกิ้งสูงสุด 4 ยูนิต พร้อมพาวเวอร์ซัพพลายสำรองแบบ Redundant',
        }
      ]
    }),
  });

  if (!submitRes.ok) {
    const errorText = await submitRes.text();
    throw new Error(`Failed to submit quote: ${submitRes.status} ${errorText}`);
  }
  const quote = await submitRes.json() as any;
  console.log('Quotation submitted successfully. Line details:', quote.lines[0]);
  
  if (quote.lines[0].vendor_remarks !== 'รุ่น IT-10G-Core รองรับสแต็คกิ้งสูงสุด 4 ยูนิต พร้อมพาวเวอร์ซัพพลายสำรองแบบ Redundant') {
    throw new Error('vendor_remarks was not saved correctly!');
  }
  if (!quote.lines[0].file_hash) {
    throw new Error('file_hash was not generated for line upload!');
  }
  console.log('✔ Vendor proposal remarks and line-level checksum verified.');

  // 6. Fetch Comparison Sheet and check qualitative remarks
  console.log('Fetching comparison details to verify qualitative remarks...');
  const compRes = await fetch(`${baseUrl}/bidding/rfq/${rfq.rfq_id}/comparison`, {
    headers: {
      'Authorization': 'Bearer mock-admin-token-123456',
    }
  });
  if (!compRes.ok) {
    throw new Error(`Failed to fetch comparison: ${compRes.statusText}`);
  }
  const comp = await compRes.json() as any;
  const quoteInComp = comp.quotations[0];
  console.log('Quotation remarks in comparison:', quoteInComp.lines[0].vendor_remarks);
  if (quoteInComp.lines[0].vendor_remarks !== 'รุ่น IT-10G-Core รองรับสแต็คกิ้งสูงสุด 4 ยูนิต พร้อมพาวเวอร์ซัพพลายสำรองแบบ Redundant') {
    throw new Error('Remarks not found or mismatch in comparison sheet response!');
  }
  console.log('✔ Comparison sheet qualitative response verified.');

  console.log('=== ALL SPRINT 2 VERIFICATION STEPS PASSED SUCCESSFULLY! ===');
}

runVerification().catch((err) => {
  console.error('❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
