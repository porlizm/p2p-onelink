export class DistributeAssetDto {
  to_bu_id: string;
  allocated_qty: number;
  allocation_type: string; // 'Distribution' | 'Rental'
  rental_rate?: number;
  start_date?: string;
  end_date?: string;
}
