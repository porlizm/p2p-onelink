import { DataSource } from 'typeorm';

export async function setupRLSPolicies(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  const tables = [
    'cost_center',
    'doa_rule',
    'user_role',
    'vendor_company_mapping',
    'item_company_mapping'
  ];

  for (const table of tables) {
    try {
      await queryRunner.query(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      await queryRunner.query(`DROP POLICY IF EXISTS "${table}_tenant_policy" ON "${table}";`);
      await queryRunner.query(`
        CREATE POLICY "${table}_tenant_policy" ON "${table}"
        FOR ALL
        USING (company_id = NULLIF(current_setting('app.current_company_id', true), '')::uuid);
      `);
      console.log(`RLS Policy enabled on table: ${table}`);
    } catch (err) {
      console.warn(`Failed to enable RLS on table ${table}: ${err.message}`);
    }
  }

  await queryRunner.release();
}
