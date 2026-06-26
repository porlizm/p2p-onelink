export class CreateAssetDto {
  asset_name: string;
  asset_type: string; // 'Goods' | 'Service' | 'Rental' | 'License'
  item_id?: string;
  unit_price: number;
  total_qty: number;
  owner_bu_id: string;
  acquisition_date?: string;
  license_key?: string;
  expiry_date?: string;
  po_id?: string;
}
