import { DataSource } from 'typeorm';
import { CustomLogger } from '../../logger/logger.service';
import {
  VehicleFaxReport,
  VehicleFaxReportStatus,
} from '../entities/vehicle-fax-report.entity';
import { User } from '../../user/entities/user.entity';
import { VehicleFaxReportDetails } from '../entities/vehicle-fax-report-details.entity';
import { VehicleFaxReportDetailsAccident } from '../entities/vehicle-fax-report-details-accident.entity';
import { VehicleFaxReportDetailsServiceRecord } from '../entities/vehicle-fax-report-details-service-record.entity';
import { VehicleFaxReportDetailsRecall } from '../entities/vehicle-fax-report-details-recall.entity';
import { VehicleFaxReportDetailsDetailedHistory } from '../entities/vehicle-fax-report-details-detailed-record.entity';
import { CarfaxData } from 'src/grpc/types/pdf-service/pdf-service.pb';
import { isValidCarfaxData } from 'src/app/common/utils/carfax.parser';
import { FileUploaderService } from '../../uploads/file-uploader.service';
import { VehicleVins } from '../entities/vehicle-vins.entity';

export class GenerateCarfaxReport {
  private readonly logger = new CustomLogger(GenerateCarfaxReport.name);
  constructor(
    private readonly fileUploaderService: FileUploaderService,
    private readonly dataSource: DataSource,
    private readonly data: {
      user: User;
      vehicleFaxReport: VehicleFaxReport;
      carfaxData: CarfaxData;
    },
  ) {}

  async save(): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { vehicleFaxReport, carfaxData } = this.data;
      if (!isValidCarfaxData(carfaxData)) {
        this.logger.error(`Error: Invalid carfax got`);
        this.logger.error(JSON.stringify(carfaxData, null, 2));
        await this.fileUploaderService.deleteFile(
          vehicleFaxReport.attachment as string,
        );
        // Merge vehicle Fax report with new fax file attachment
        const updateVehicleFaxReport = queryRunner.manager.merge(
          VehicleFaxReport,
          vehicleFaxReport,
          {
            attachment: null,
            status: VehicleFaxReportStatus.CARFAX_REPORT_GENERATION_FAILED,
          },
        );
        await queryRunner.manager.save(
          VehicleFaxReport,
          updateVehicleFaxReport,
        );
        await queryRunner.commitTransaction();

        // Early return
        return;
      }

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
      if (carfaxData.accidents && carfaxData.accidents.length > 0) {
        for (const accident of carfaxData.accidents) {
          await queryRunner.manager.insert(VehicleFaxReportDetailsAccident, {
            vehicleFaxReportDetails_id: savedDetails.id,
            date: accident.date,
            location: accident.location,
            amounts: accident.amount,
            details: accident.details,
          });
        }
      }

      // Save service records
      if (carfaxData.serviceRecords && carfaxData.serviceRecords.length > 0) {
        for (const record of carfaxData.serviceRecords) {
          await queryRunner.manager.insert(
            VehicleFaxReportDetailsServiceRecord,
            {
              vehicleFaxReportDetails_id: savedDetails.id,
              date: record.date,
              odometer: record.odometer,
              source: record.source,
              details: {
                vehicle_serviced: record.details
                  ? record.details['Vehicle serviced']
                  : [],
              },
            },
          );
        }
      }

      // Save detailed history
      if (carfaxData.detailedHistory && carfaxData.detailedHistory.length > 0) {
        for (const history of carfaxData.detailedHistory) {
          const detailedRecord = queryRunner.manager.create(
            VehicleFaxReportDetailsDetailedHistory,
            {
              vehicleFaxReportDetails_id: details.id,
              date: history.date,
              odometer: history.odometer,
              source: history.source,
              record_type: history.recordType,
              details:
                typeof history.details === 'object'
                  ? { vehicle_serviced: history.details['Vehicle serviced'] }
                  : history.details,
            },
          );
          await queryRunner.manager.save(detailedRecord);
        }
      }

      // Save recalls
      if (carfaxData.recalls && carfaxData.recalls.length > 0) {
        for (const recall of carfaxData.recalls) {
          await queryRunner.manager.insert(VehicleFaxReportDetailsRecall, {
            vehicleFaxReportDetails_id: savedDetails.id,
            recall_number: recall.recallNumber,
            recall_date: recall.recallDate,
          });
        }
      }

      // Update vehicle vin status
      // Update vehicle vin inspection status
      let vehicleVin = await queryRunner.manager.findOne(VehicleVins, {
        where: {
          vehicle: {
            id: vehicleFaxReport.vehicle_id,
          },
        },
      });

      if (vehicleVin) {
        vehicleVin = queryRunner.manager.merge(VehicleVins, vehicleVin, {
          is_report: true,
        });
        await queryRunner.manager.save(VehicleVins, vehicleVin);
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
