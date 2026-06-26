import { Injectable } from '@nestjs/common';

@Injectable()
export class OcrService {
  async extractInvoiceData(fileUrl: string) {
    // Simulated OCR extraction logic based on invoice image/PDF fileUrl
    const mockInvoiceNo = `INV-OCR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const mockDate = new Date().toISOString().split('T')[0];
    // Generate a random amount that looks like a real invoice total
    const mockTotalAmount = Math.floor(Math.random() * 45000) + 5000;

    return {
      success: true,
      extracted_data: {
        invoice_no: mockInvoiceNo,
        invoice_date: mockDate,
        total_amount: mockTotalAmount,
        vendor_name: 'บริษัท ดิจิทัล โซลูชั่น ซัพพลาย จำกัด',
        confidence_score: 0.98,
        file_url: fileUrl,
      },
    };
  }
}
