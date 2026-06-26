import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as entities from './database/entities';
import { AuthModule } from './auth/auth.module';
import { VendorModule } from './vendor/vendor.module';
import { PrModule } from './pr/pr.module';
import { CatalogModule } from './catalog/catalog.module';
import { BiddingModule } from './bidding/bidding.module';
import { PoModule } from './po/po.module';
import { GrModule } from './gr/gr.module';
import { InvoiceModule } from './invoice/invoice.module';
import { PaymentModule } from './payment/payment.module';
import { ContractModule } from './contract/contract.module';
import { CatalogSubmissionModule } from './catalog-submission/catalog-submission.module';
import { BudgetModule } from './budget/budget.module';
import { NotificationModule } from './notification/notification.module';
import { AssetModule } from './asset/asset.module';
import { PlanningModule } from './planning/planning.module';
import { AiAuditModule } from './ai/ai-audit.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 5432),
        username: configService.get<string>('DATABASE_USER', 'postgres'),
        password: configService.get<string>('DATABASE_PASSWORD', 'password123'),
        database: configService.get<string>('DATABASE_NAME', 'p2p_onelink'),
        entities: Object.values(entities),
        synchronize: true,
        logging: false,
      }),
    }),
    AuthModule,
    VendorModule,
    PrModule,
    CatalogModule,
    BiddingModule,
    PoModule,
    GrModule,
    InvoiceModule,
    PaymentModule,
    ContractModule,
    CatalogSubmissionModule,
    BudgetModule,
    NotificationModule,
    AssetModule,
    PlanningModule,
    AiAuditModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
