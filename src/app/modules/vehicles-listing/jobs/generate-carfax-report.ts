import { DataSource } from 'typeorm';
import { CustomLogger } from '../../logger/logger.service';
import {
  VehicleFaxReport,
  VehicleFaxReportStatus,
} from '../entities/vehicle-fax-report.entity';
import { CarfaxData } from 'src/app/common/utils/carfax.parser';
import { User } from '../../user/entities/user.entity';
import { VehicleFaxReportDetails } from '../entities/vehicle-fax-report-details.entity';
import { VehicleFaxReportDetailsAccident } from '../entities/vehicle-fax-report-details-accident.entity';
import { VehicleFaxReportDetailsServiceRecord } from '../entities/vehicle-fax-report-details-service-record.entity';
import { VehicleFaxReportDetailsRecall } from '../entities/vehicle-fax-report-details-recall.entity';
import { VehicleFaxReportDetailsDetailedHistory } from '../entities/vehicle-fax-report-details-detailed-record.entity';

export class GenerateCarfaxReport {
  private readonly logger = new CustomLogger(GenerateCarfaxReport.name);
  constructor(
    private readonly dataSource: DataSource,
    private readonly data: {
      user: User;
      vehicleFaxReport: VehicleFaxReport;
      carfaxData: CarfaxData;
    },
  ) {}

  //   async save(): Promise<any> {
  //     const queryRunner = this.dataSource.createQueryRunner();
  //     await queryRunner.connect();
  //     await queryRunner.startTransaction();

  //     try {
  //       const { carfaxData, vehicleFaxReport } = this.data;

  //       const details = queryRunner.manager.create(VehicleFaxReportDetails, {
  //         vin: carfaxData.vin,
  //         model: carfaxData.model,
  //         odometer: carfaxData.odometer,
  //         country: carfaxData.country,
  //         registration: carfaxData.registration,
  //         is_stolen: carfaxData.isStolen ? 'true' : 'false',
  //         vehicle_fax_report_id: vehicleFaxReport.id,
  //       });
  //       await queryRunner.manager.save(details);

  //       for (const accident of carfaxData.accidents) {
  //         const accidentRecord = queryRunner.manager.create(
  //           VehicleFaxReportDetailsAccident,
  //           {
  //             vehicleFaxReportDetails_id: details.id,
  //             date: accident.date,
  //             location: accident.location,
  //             amounts: accident.amount,
  //             details: accident.details,
  //           },
  //         );
  //         await queryRunner.manager.save(accidentRecord);
  //       }

  //       for (const service of carfaxData.service_records) {
  //         const serviceRecord = queryRunner.manager.create(
  //           VehicleFaxReportDetailsServiceRecord,
  //           {
  //             vehicleFaxReportDetails_id: details.id,
  //             date: service.date,
  //             odometer: service.odometer,
  //             source: service.source,
  //             details: {
  //               vehicle_serviced: service.details['Vehicle serviced'],
  //             },
  //           },
  //         );
  //         await queryRunner.manager.save(serviceRecord);
  //       }

  //       for (const recall of carfaxData.recalls) {
  //         const recallRecord = queryRunner.manager.create(
  //           VehicleFaxReportDetailsRecall,
  //           {
  //             vehicleFaxReportDetails_id: details.id,
  //             recall_number: recall.recallNumber,
  //             recall_date: recall.recallDate,
  //           },
  //         );
  //         await queryRunner.manager.save(recallRecord);
  //       }

  //       for (const history of carfaxData.detailed_history) {
  //         const detailedRecord = queryRunner.manager.create(
  //           VehicleFaxReportDetailsDetailedHistory,
  //           {
  //             vehicleFaxReportDetails_id: details.id,
  //             date: history.date,
  //             odometer: history.odometer,
  //             source: history.source,
  //             record_type: history.record_type,
  //             details:
  //               typeof history.details === 'object'
  //                 ? { vehicle_serviced: history.details['Vehicle serviced'] }
  //                 : history.details,
  //           },
  //         );
  //         await queryRunner.manager.save(detailedRecord);
  //       }

  //       await queryRunner.commitTransaction();
  //       this.logger.log('Carfax report saved successfully');
  //       return { success: true, detailsId: details.id };
  //     } catch (error) {
  //       await queryRunner.rollbackTransaction();
  //       this.logger.error('Failed to save carfax report', error);
  //       throw error;
  //     } finally {
  //       await queryRunner.release();
  //     }
  //   }

  async save(): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { user, vehicleFaxReport, carfaxData } = this.data;

      // Remove old details if they exist
      const existingDetails = await queryRunner.manager.findOne(
        VehicleFaxReportDetails,
        {
          where: {
            vehicle_fax_report_id: vehicleFaxReport.id,
          },
        },
      );

      if (existingDetails) {
        await queryRunner.manager.delete(VehicleFaxReportDetailsAccident, {
          vehicleFaxReportDetails_id: existingDetails.id,
        });

        await queryRunner.manager.delete(VehicleFaxReportDetailsServiceRecord, {
          vehicleFaxReportDetails_id: existingDetails.id,
        });

        await queryRunner.manager.delete(
          VehicleFaxReportDetailsDetailedHistory,
          {
            vehicleFaxReportDetails_id: existingDetails.id,
          },
        );

        await queryRunner.manager.delete(VehicleFaxReportDetailsRecall, {
          vehicleFaxReportDetails_id: existingDetails.id,
        });

        await queryRunner.manager.delete(VehicleFaxReportDetails, {
          id: existingDetails.id,
        });
      }

      // Create new details
      const details = queryRunner.manager.create(VehicleFaxReportDetails, {
        vin: carfaxData.vin,
        model: carfaxData.model,
        odometer: carfaxData.odometer,
        country: carfaxData.country,
        registration: carfaxData.registration,
        is_stolen: carfaxData.isStolen ? 'true' : 'false',
        vehicle_fax_report_id: vehicleFaxReport.id,
      });

      const savedDetails = await queryRunner.manager.save(details);

      // Save accidents
      for (const accident of carfaxData.accidents) {
        await queryRunner.manager.insert(VehicleFaxReportDetailsAccident, {
          vehicleFaxReportDetails_id: savedDetails.id,
          date: accident.date,
          location: accident.location,
          amounts: accident.amount,
          details: accident.details,
        });
      }

      // Save service records
      for (const record of carfaxData.service_records) {
        await queryRunner.manager.insert(VehicleFaxReportDetailsServiceRecord, {
          vehicleFaxReportDetails_id: savedDetails.id,
          date: record.date,
          odometer: record.odometer,
          source: record.source,
          details: {
            vehicle_serviced: record.details['Vehicle serviced'],
          },
        });
      }

      // Save detailed history
      for (const history of carfaxData.detailed_history) {
        const detailedRecord = queryRunner.manager.create(
          VehicleFaxReportDetailsDetailedHistory,
          {
            vehicleFaxReportDetails_id: details.id,
            date: history.date,
            odometer: history.odometer,
            source: history.source,
            record_type: history.record_type,
            details:
              typeof history.details === 'object'
                ? { vehicle_serviced: history.details['Vehicle serviced'] }
                : history.details,
          },
        );
        await queryRunner.manager.save(detailedRecord);
      }

      // Save recalls
      for (const recall of carfaxData.recalls) {
        await queryRunner.manager.insert(VehicleFaxReportDetailsRecall, {
          vehicleFaxReportDetails_id: savedDetails.id,
          recall_number: recall.recallNumber,
          recall_date: recall.recallDate,
        });
      }

      // update report fax status
      await queryRunner.manager.update(VehicleFaxReport, vehicleFaxReport.id, {
        status: VehicleFaxReportStatus.COMPLETED,
      });

      await queryRunner.commitTransaction();

      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Failed to generate Carfax report', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
