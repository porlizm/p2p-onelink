async function runVerification() {
  console.log('=== STARTING END-TO-END VERIFICATION: SPRINT 3-6 (CONSOLIDATED) ===');
  
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

  // 1. Get tokens for different roles
  console.log('Logging in as users...');
  const adminToken = await login('nantaporn.s@scgjwd.com');
  const requesterToken = await login('napas.s@scgjwd.com');
  const buyerToken = await login('teerapat.c@scgjwd.com');
  console.log('✔ Logged in successfully.');

  // Fetch cost centers to get a valid cost_center_id
  console.log('Fetching cost centers...');
  const ccRes = await fetch(`${baseUrl}/pr/cost-centers`, {
    headers: { 'Authorization': `Bearer ${requesterToken}` },
  });
  if (!ccRes.ok) throw new Error('Failed to fetch cost centers');
  const costCenters = await ccRes.json() as any[];
  const ccId = costCenters[0]?.cost_center_id;
  if (!ccId) throw new Error('No cost centers found');
  console.log(`Using Cost Center: ${ccId}`);

  // ==========================================
  // MODULE A: PLANNING & CONTROL (UNPLANNED PR)
  // ==========================================
  console.log('\n--- Testing Module A: Planning & Control ---');
  
  // Upload Annual Plan
  console.log('Uploading Annual Plan for 2026...');
  const planRes = await fetch(`${baseUrl}/planning/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      year: 2026,
      items: [
        { business_category: 'อุปกรณ์ไอที', budget_limit: 100000 },
      ],
    }),
  });
  if (!planRes.ok) throw new Error('Failed to upload Annual Plan');
  console.log('✔ Annual Plan uploaded successfully.');

  // Create PR that exceeds budget (120,000 > 100,000 limit)
  console.log('Creating PR exceeding budget...');
  const prExceedRes = await fetch(`${baseUrl}/pr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${requesterToken}`,
    },
    body: JSON.stringify({
      description: 'PR อุปกรณ์ไอทีเกินวงเงินแผน',
      lines: [
        {
          item_name: 'อุปกรณ์ไอที (High-End Laptops)',
          quantity: 2,
          uom: 'เครื่อง',
          unit_price: 60000, // Total = 120,000
          cost_center_id: ccId,
        },
      ],
    }),
  });
  if (!prExceedRes.ok) {
    const text = await prExceedRes.text();
    throw new Error(`Failed to create exceeding PR: ${text}`);
  }
  const prExceed = await prExceedRes.json() as any;
  console.log(`PR Created. PR No: ${prExceed.pr_no}, Unplanned Flag: ${prExceed.is_unplanned}`);
  if (prExceed.is_unplanned !== true) {
    throw new Error('PR should be marked as is_unplanned = true!');
  }
  console.log('✔ Unplanned purchase detection warning verified.');

  // ==========================================
  // MODULE B: CONTRACTS & RECONCILIATION
  // ==========================================
  console.log('\n--- Testing Module B: Contracts & Reconciliation ---');
  
  // Create Contract
  console.log('Creating contract...');
  const contractRes = await fetch(`${baseUrl}/api/contract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      vendor_id: '00000008-0000-0000-0000-000000000001',
      title: 'สัญญาเช่าเหมาบริการไอทีรายปี 2026',
      start_date: '2026-01-01',
      end_date: '2026-12-31',
      total_amount: 100000,
    }),
  });
  if (!contractRes.ok) {
    const errorText = await contractRes.text();
    throw new Error(`Failed to create contract: ${contractRes.status} ${errorText}`);
  }
  let contract = await contractRes.json() as any;
  console.log(`Contract Created: ${contract.contract_id}, Status: ${contract.status}`);

  // Sign contract (buyer)
  console.log('Signing contract as buyer...');
  await fetch(`${baseUrl}/api/contract/${contract.contract_id}/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ role: 'buyer', name: 'Nantaporn S.' }),
  });

  // Sign contract (vendor)
  console.log('Signing contract as vendor...');
  const signRes = await fetch(`${baseUrl}/api/contract/${contract.contract_id}/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ role: 'vendor', name: 'Vendor CEO' }),
  });
  contract = await signRes.json();
  console.log(`Signed Contract Status: ${contract.status}`);
  if (contract.status !== 'Signed') throw new Error('Contract should be Signed');

  // Create PR linked to this contract (85% of total amount to trigger 80% notification threshold)
  console.log('Creating PR linked to contract (85,000 THB)...');
  const prContractRes = await fetch(`${baseUrl}/pr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${requesterToken}`,
    },
    body: JSON.stringify({
      description: 'บริการไอทีผูกสัญญากลาง',
      contract_id: contract.contract_id,
      lines: [
        {
          item_name: 'บริการดูแลระบบ Cloud',
          quantity: 1,
          uom: 'งวด',
          unit_price: 85000,
          cost_center_id: ccId,
        },
      ],
    }),
  });
  if (!prContractRes.ok) throw new Error('Failed to create PR linked to contract');
  const prContract = await prContractRes.json() as any;

  // Convert PR to PO (Deducts contract remaining_amount and triggers alert)
  console.log('Converting PR to PO...');
  const convertRes = await fetch(`${baseUrl}/po/convert/${prContract.pr_id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${buyerToken}`,
    },
  });
  if (!convertRes.ok) {
    const text = await convertRes.text();
    throw new Error(`Failed to convert PR to PO: ${text}`);
  }
  const po = await convertRes.json() as any;
  console.log(`PO Created: ${po.po_no}`);

  // Fetch updated contract details
  const getContractsRes = await fetch(`${baseUrl}/api/contract`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  const contracts = await getContractsRes.json() as any[];
  const updatedContract = contracts.find(c => c.contract_id === contract.contract_id);
  console.log(`Updated Contract Remaining Amount: ${updatedContract?.remaining_amount}`);
  if (Number(updatedContract?.remaining_amount) !== 15000) {
    throw new Error(`Contract remaining budget should be 15000, but got ${updatedContract?.remaining_amount}`);
  }

  // Fetch notifications to verify 80% warning
  console.log('Checking notifications for contract threshold warnings...');
  const notifRes = await fetch(`${baseUrl}/vendor-notifications`, {
    headers: { 'Authorization': `Bearer ${buyerToken}` },
  });
  if (!notifRes.ok) throw new Error('Failed to fetch notifications');
  const notifications = await notifRes.json() as any[];
  const warningNotif = notifications.find(n => n.trigger_event === 'CONTRACT_LIMIT_WARNING');
  if (!warningNotif) {
    throw new Error('No CONTRACT_LIMIT_WARNING notification found!');
  }
  console.log(`✔ Found warning notification: "${warningNotif.message}"`);

  // ==========================================
  // MODULE C: WMS QC & ASSETS
  // ==========================================
  console.log('\n--- Testing Module C: WMS QC & Asset Lifecycle ---');

  // Submit Goods Receipt (GR) with QC Failure (qc_failed_qty > 0)
  console.log('Creating Goods Receipt with QC failure...');
  const grRes = await fetch(`${baseUrl}/gr`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`, // warehouse/buyer role
    },
    body: JSON.stringify({
      po_id: po.po_id,
      receive_type: 'GoodsReceipt',
      receive_date: new Date().toISOString(),
      quality_score: 3.5,
      lines: [
        {
          po_line_id: po.lines[0].po_line_id,
          qty_received: 1,
          qc_passed_qty: 0,
          qc_failed_qty: 1,
          qc_status: 'Failed',
          bin_location: 'BIN-A1-03',
          qc_remarks: 'พบรอยแตกร้าวภายนอกอุปกรณ์ ไม่สามารถเปิดเครื่องได้',
        },
      ],
    }),
  });
  if (!grRes.ok) {
    const text = await grRes.text();
    throw new Error(`Failed to create GR: ${text}`);
  }
  const gr = await grRes.json() as any;
  console.log(`GR Created: ${gr.gr_no}, Status: ${gr.status}`);
  if (gr.status !== 'ClaimRaised') {
    throw new Error(`GR status should be ClaimRaised, but got ${gr.status}`);
  }
  console.log('✔ Goods Receipt QC failure automatic Claim and Return Note flow verified.');

  // ==========================================
  // MODULE D: AI & OCR INTEGRATIONS
  // ==========================================
  console.log('\n--- Testing Module D: AI & OCR Integrations ---');

  // OCR Invoice Extraction API test
  console.log('Calling OCR invoice upload API...');
  const ocrRes = await fetch(`${baseUrl}/invoice/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${requesterToken}`,
    },
    body: JSON.stringify({
      file_url: '/uploads/invoices/vendor_inv_test.pdf',
    }),
  });
  if (!ocrRes.ok) throw new Error('OCR API call failed');
  const ocrData = await ocrRes.json() as any;
  console.log('OCR Extracted Data:', ocrData.extracted_data);
  if (!ocrData.success || !ocrData.extracted_data.invoice_no) {
    throw new Error('OCR API did not return valid extracted invoice fields!');
  }
  console.log('✔ OCR invoice parser verified.');

  // AI Smart DOA Risk Auditor split PR detection
  console.log('Creating two small PRs within 7 days by the same requester to trigger split auditor...');
  const createSmallPR = async (desc: string, amount: number) => {
    const res = await fetch(`${baseUrl}/pr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${requesterToken}`,
      },
      body: JSON.stringify({
        description: desc,
        lines: [
          {
            item_name: 'แท็บเล็ตตรวจเช็คคลังสินค้า',
            quantity: 1,
            uom: 'เครื่อง',
            unit_price: amount,
            cost_center_id: ccId,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error('Failed to create small PR');
    return res.json() as Promise<any>;
  };

  const pr1 = await createSmallPR('จัดซื้ออุปกรณ์แท็บเล็ตชุดที่ 1', 30000);
  const pr2 = await createSmallPR('จัดซื้ออุปกรณ์แท็บเล็ตชุดที่ 2', 25000);
  console.log(`Created small PRs: ${pr1.pr_no} (30k) and ${pr2.pr_no} (25k)`);

  console.log('Running AI Split Purchase Auditor...');
  const auditRes = await fetch(`${baseUrl}/ai/audit-split`, {
    headers: { 'Authorization': `Bearer ${adminToken}` },
  });
  if (!auditRes.ok) throw new Error('Audit API call failed');
  const auditData = await auditRes.json() as any;
  console.log(`Audited results count: ${auditData.flagged_count}`);
  const splitGroup = auditData.results.find((r: any) => 
    r.pr_details.some((d: any) => d.pr_no === pr1.pr_no) &&
    r.pr_details.some((d: any) => d.pr_no === pr2.pr_no)
  );
  if (!splitGroup) {
    throw new Error('AI Auditor did not flag the split purchase behavior!');
  }
  console.log(`✔ AI Risk Auditor flagged split PRs successfully. Risk: ${splitGroup.risk_level}. Reason: "${splitGroup.reason}"`);

  console.log('\n=== ALL CONSOLIDATED SPRINTS 3-6 VERIFICATION STEPS PASSED SUCCESSFULLY! ===');
}

runVerification().catch((err) => {
  console.error('❌ VERIFICATION FAILED:', err.message);
  process.exit(1);
});
